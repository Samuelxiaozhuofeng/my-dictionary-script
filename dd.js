/* global api */
class encn_QwenContextDict {
    constructor() {
        this.apiKey = 'sk-fwzctttjlftqmedzftdfvowpxpnchohlbxbmyompgspcyxeg';
        this.baseURL = 'https://api.siliconflow.cn/v1/chat/completions';
        this.word = '';
        this.context = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'Qwen1上下文英汉词典';
        if (locale.indexOf('TW') != -1) return 'Qwen1上下文英漢詞典';
        return 'Qwen Context EN->CN Dictionary';
    }

    setOptions(options) {
        this.options = options;
    }

    // 获取选中文本的上下文句子
    getContextSentence(text, word) {
        // 将整个文本按句子分割（考虑多种句号）
        const sentences = text.split(/(?<=[.!?。！？])\s+/);
        
        // 查找包含目标词的句子
        for (let sentence of sentences) {
            if (sentence.includes(word)) {
                return sentence.trim();
            }
        }
        
        return word; // 如果找不到上下文句子，返回单词本身
    }

    // 构建带上下文的API请求消息
    buildMessage(word, context) {
        return [
            {
                role: "system",
                content: `你是一个专业的英汉词典助手。我会给你一个英文单词和它所在的句子。
请你：
1. 给出单词的发音
2. 分析单词在句子中的词性
3. 给出单词在这个具体语境下最准确的中文含义
4. 解释为什么在这个语境下应该这样翻译
5. 提供这个单词的其他常见含义
6. 造一个相似语境的例句(中英对照)

请用markdown格式输出。`
            },
            {
                role: "user",
                content: `单词：${word}\n上下文句子：${context}`
            }
        ];
    }

    // 发送API请求
    async requestTranslation(word, context) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: "Qwen/Qwen2.5-72B-Instruct",
                messages: this.buildMessage(word, context),
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // 格式化API返回的内容
    formatContent(content) {
        // 将markdown转换为HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              // 斜体
            .replace(/\n\n/g, '<br><br>')                      // 段落
            .replace(/\n/g, '<br>')                            // 换行
            .replace(/#{1,6} (.*?)\n/g, '<div class="dict-header">$1</div>'); // 标题
    }

    // 主查询函数
    async findTerm(word) {
        this.word = word;
        
        return new Promise(async (resolve, reject) => {
            try {
                // 获取选中文本周围的上下文
                let selection = window.getSelection();
                let context = '';
                
                if (selection && selection.rangeCount > 0) {
                    // 获取选中文本所在的段落或更大的容器
                    let container = selection.getRangeAt(0).commonAncestorContainer;
                    while (container && container.nodeType !== Node.ELEMENT_NODE) {
                        container = container.parentNode;
                    }
                    
                    if (container) {
                        context = this.getContextSentence(container.textContent, word);
                    }
                }

                // 如果没有找到上下文，使用单词本身
                if (!context) {
                    context = word;
                }

                let content = await this.requestTranslation(word, context);
                content = this.formatContent(content);
                
                // 添加样式类以便于CSS定制
                content = `<div class="qwen-dict-content">${content}</div>`;
                
                resolve(content);
            } catch (error) {
                reject(error);
            }
        });
    }
}

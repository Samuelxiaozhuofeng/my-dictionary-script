/* global api */
class encn_QwenDictContext {
    constructor() {
        this.apiKey = 'sk-fwzctttjlftqmedzftdfvowpxpnchohlbxbmyompgspcyxeg';
        this.baseURL = 'https://api.siliconflow.com/v1/chat/completions';
        this.word = '';
        this.context = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'Qwen上下文词典';
        if (locale.indexOf('TW') != -1) return 'Qwen上下文詞典';
        return 'Qwen Context Dictionary';
    }

    setOptions(options) {
        this.options = options;
    }

    // 构建带上下文的API请求消息
    buildMessage(word, context) {
        return [
            {
                role: "system",
                content: `你是一个专业的英汉词典助手。我会给你一个英文单词和它所在的句子。
                请你：
                1. 给出单词的基本信息（发音、词性）
                2. 根据上下文解释这个单词在句子中的具体含义
                3. 给出单词的其他常见含义
                4. 提供2个相关的例句(中英对照)
                请按照以上顺序组织内容，使用分点的方式呈现。`
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

    // 格式化返回内容
    formatContent(content) {
        // 将换行转换为HTML换行
        content = content.replace(/\n/g, '<br>');
        
        // 为数字编号添加样式
        content = content.replace(/([1-4]\.)/g, '<strong>$1</strong>');
        
        // 为英文例句添加样式
        content = content.replace(/([^。\n]+?)\s*[\(（]([^）\)]+)[\)）]/g, 
            '<span class="example">$1</span><span class="translation">（$2）</span>');
        
        return `<div class="qwen-dict">${content}</div>`;
    }

    // 获取上下文句子
    extractContext(selection) {
        // 注意：这个函数应该由插件提供选中文本的完整句子
        // 这里仅作为示例
        return selection || this.word;
    }

    // 主查询函数
    async findTerm(word, selection) {
        this.word = word;
        this.context = this.extractContext(selection);
        
        return new Promise(async (resolve, reject) => {
            try {
                let content = await this.requestTranslation(this.word, this.context);
                content = this.formatContent(content);
                resolve(content);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 添加样式
    async getStyles() {
        return `
        .qwen-dict {
            font-family: Arial, sans-serif;
            line-height: 1.5;
        }
        .qwen-dict strong {
            color: #4a90e2;
        }
        .qwen-dict .example {
            color: #333;
            font-style: italic;
        }
        .qwen-dict .translation {
            color: #666;
            margin-left: 5px;
        }
        `;
    }
}

/* global api */
class escn_AIDict {
    constructor(options) {
        this.options = options;
        this.word = '';
        // OpenRouter API配置
        this.apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
        this.apiKey = options?.apiKey || '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';
        this.model = 'gpt-4o'; // 使用GPT-4模型
        
        // 添加必要的headers
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://github.com/ninja33/ODH', // OpenRouter需要referer
            'X-Title': 'ODH Plugin'  // OpenRouter建议的标题
        };
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'AI上下文翻译';
        if (locale.indexOf('TW') != -1) return 'AI上下文翻译';
        return 'AI Context Translation';
    }

    setOptions(options) {
        this.options = options;
        // 允许通过选项更新API密钥
        if (options?.apiKey) {
            this.apiKey = options.apiKey;
            this.headers.Authorization = `Bearer ${this.apiKey}`;
        }
    }

    // 获取选中词汇所在的句子
    extractSentence(word, text) {
        // 简单的句子提取逻辑，可以根据需要优化
        const sentences = text.split(/[.!?。！？]\s+/);
        for (let sentence of sentences) {
            if (sentence.includes(word)) {
                return sentence.trim();
            }
        }
        return word; // 如果找不到完整句子，则返回单词本身
    }

    // 调用AI API进行翻译
    async callAIAPI(word, context) {
        const prompt = `
请将以下西班牙语单词进行翻译，并提供分析。请按照以下格式返回：
词语：[西班牙语单词]
上下文：[所在句子]
释义：[中文翻译]
词性：[词性说明]
语境分析：[根据上下文解释该词在句子中的具体含义]
例句：[另外举一个例句]

单词: ${word}
上下文句子: ${context}
`;

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI API Error:', error);
            return null;
        }
    }

    // 格式化AI返回的结果
    formatResponse(aiResponse) {
        if (!aiResponse) return null;
        
        return `
            <div class="ai-translation">
                ${aiResponse.replace(/\n/g, '<br>')}
            </div>
        `;
    }

    async findTerm(word) {
        this.word = word;
        
        // 获取当前页面的选中文本上下文
        let context = '';
        try {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const paragraph = container.nodeType === Node.TEXT_NODE ? container.parentNode : container;
            context = this.extractSentence(word, paragraph.textContent);
        } catch (e) {
            context = word;
        }

        return new Promise(async (resolve, reject) => {
            try {
                const aiResponse = await this.callAIAPI(word, context);
                const formattedResponse = this.formatResponse(aiResponse);
                const css = this.renderCSS();
                resolve(formattedResponse ? css + formattedResponse : null);
            } catch (error) {
                reject(error);
            }
        });
    }

    renderCSS() {
        return `
            <style>
                .ai-translation {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                }
                .ai-translation br {
                    margin-bottom: 8px;
                }
            </style>
        `;
    }
}

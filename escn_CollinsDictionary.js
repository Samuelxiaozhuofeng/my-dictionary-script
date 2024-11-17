/* global api */
class escn_AIDict {
    constructor(options) {
        this.options = options;
        this.word = '';
        this.apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
        this.apiKey = options?.apiKey || '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';
        this.model = 'gpt-4';
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://github.com/ninja33/ODH',
            'X-Title': 'ODH Plugin'
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
        if (options?.apiKey) {
            this.apiKey = options.apiKey;
            this.headers.Authorization = `Bearer ${this.apiKey}`;
        }
    }

    async callAIAPI(word, context) {
        const prompt = `
请分析以下西班牙语中的词语。
目标词语是："${word}"
词语所在句子是："${context}"

请按照以下格式提供分析（务必保持格式统一）：

基本释义：[给出最符合上下文的中文释义]
词性：[标注词性]
句子翻译：[将整句翻译成中文]
重点分析：[分析该词在此语境中的具体含义和作用]
其他说明：[补充该词的其他常用含义或用法]
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
            return `翻译服务暂时不可用: ${error.message}`;
        }
    }

    formatResponse(aiResponse) {
        if (!aiResponse) return null;
        
        // 将格式化的响应转换为HTML
        const formattedResponse = aiResponse
            .replace(/(基本释义|词性|句子翻译|重点分析|其他说明)：/g, '<div class="section-title">$1：</div>')
            .replace(/\[([^\]]+)\]/g, '<div class="content">$1</div>')
            .replace(/\n/g, '<br>');
        
        return `
            <div class="ai-translation">
                ${formattedResponse}
            </div>
        `;
    }

    async findTerm(word, context) {  // 修改这里，接收context参数
        this.word = word;
        
        // 使用传入的context，如果没有则使用word本身
        const sentence = context || word;
        
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Processing word:', word);  // 调试日志
                console.log('Context:', sentence);      // 调试日志
                
                const aiResponse = await this.callAIAPI(word, sentence);
                const formattedResponse = this.formatResponse(aiResponse);
                const css = this.renderCSS();
                resolve(formattedResponse ? css + formattedResponse : null);
            } catch (error) {
                console.error('Processing error:', error);  // 调试日志
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
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .ai-translation .section-title {
                    color: #2c5282;
                    font-weight: 600;
                    margin-top: 10px;
                }
                .ai-translation .content {
                    color: #1a202c;
                    padding: 5px 0;
                }
                .ai-translation br {
                    margin-bottom: 4px;
                }
            </style>
        `;
    }
}

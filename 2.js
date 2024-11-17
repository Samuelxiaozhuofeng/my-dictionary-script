class escn_GPTDict {
    constructor(options) {
        this.options = options;
        this.apiKey = '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';
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
    }

    async displayName() {
        return 'GPT西中翻译词典';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(word) {
        if (!word) return null;
        return await this.queryGPT(word);
    }

    async queryGPT(text) {
        const prompt = `请针对以下西班牙语文本进行翻译和解释：
${text}

请按照以下格式回复：
- 中文翻译：
- 词性和语法说明：
- 详细解释：
- 例句：`;

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'http://localhost:3000', // 替换为实际的域名
                    'X-Title': 'Spanish-Chinese Dictionary'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // 添加样式并返回格式化的内容
            return this.renderContent(content);
        } catch (error) {
            console.error('GPT API Error:', error);
            return null;
        }
    }

    renderContent(content) {
        const css = this.renderCSS();
        const formattedContent = content.replace(/^- (.*?)：/gm, '<div class="section-title">$1：</div>');
        
        return `
            ${css}
            <div class="gpt-dictionary-container">
                ${formattedContent}
            </div>
        `;
    }

    renderCSS() {
        return `
            <style>
                .gpt-dictionary-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    padding: 12px;
                    background-color: #ffffff;
                    border-radius: 8px;
                }
                
                .section-title {
                    color: #2c5282;
                    font-weight: bold;
                    margin-top: 12px;
                    margin-bottom: 8px;
                }

                .gpt-dictionary-container p {
                    margin: 8px 0;
                    color: #2d3748;
                }
            </style>
        `;
    }
}

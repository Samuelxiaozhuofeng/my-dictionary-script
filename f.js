class escn_GPT4O {
    constructor(options) {
        this.options = options;
        this.api_key = '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';
        this.base_url = 'https://openrouter.ai/api/v1/chat/completions';
    }

    async displayName() {
        return 'GPT-4 西中翻译助手';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(text) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.queryGPT4(text);
                const formattedResult = this.formatResponse(response);
                resolve(this.renderCSS() + formattedResult);
            } catch (error) {
                reject(error);
            }
        });
    }

    async queryGPT4(text) {
        const headers = {
            'Authorization': `Bearer ${this.api_key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/ninja33/ODH',
        };

        const prompt = `请将以下西班牙语内容翻译成中文，并提供详细解释：\n${text}`;
        
        const body = {
            'model': 'gpt-4',
            'messages': [
                {'role': 'system', 'content': '你是一个专业的西班牙语-中文翻译助手。请提供准确的翻译和详细的语言学解释。'},
                {'role': 'user', 'content': prompt}
            ]
        };

        try {
            const response = await fetch(this.base_url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            throw new Error(`API请求失败: ${error.message}`);
        }
    }

    formatResponse(response) {
        return `
            <div class="gpt4-translation">
                <div class="translation-content">
                    ${response}
                </div>
            </div>
        `;
    }

    renderCSS() {
        return `
            <style>
                .gpt4-translation {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    padding: 15px;
                    line-height: 1.6;
                }
                .translation-content {
                    color: #333;
                    font-size: 14px;
                }
            </style>
        `;
    }
}

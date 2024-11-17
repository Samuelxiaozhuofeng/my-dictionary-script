class escn_GPTDict {
    constructor(options) {
        this.options = options;
        this.api_key = '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';
        this.model = 'gpt-4';
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'GPT西汉词典';
        if (locale.indexOf('TW') != -1) return 'GPT西漢詞典';
        return 'GPT Spanish-Chinese Dictionary';
    }

    async findTerm(word) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.queryGPT(word);
                const formattedResult = this.formatResult(result);
                resolve(this.renderResult(formattedResult));
            } catch (error) {
                reject(error);
            }
        });
    }

    async queryGPT(text) {
        const headers = {
            'Authorization': `Bearer ${this.api_key}`,
            'Content-Type': 'application/json'
        };

        const prompt = `请将以下西班牙语${text.length > 10 ? '句子' : '单词'}翻译成中文，并提供详细解释：
        "${text}"
        
        请按照以下格式回复：
        翻译：[中文翻译]
        解释：[详细解释，包括语法点、用法等]`;

        const body = {
            'model': this.model,
            'messages': [{
                'role': 'user',
                'content': prompt
            }]
        };

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            throw new Error(`GPT API Error: ${error.message}`);
        }
    }

    formatResult(gptResponse) {
        // 分离翻译和解释部分
        const translation = gptResponse.match(/翻译：([\s\S]*?)(?=解释：)/)?.[1]?.trim() || '';
        const explanation = gptResponse.match(/解释：([\s\S]*)/)?.[1]?.trim() || '';

        return {
            translation,
            explanation
        };
    }

    renderResult(result) {
        const css = this.renderCSS();
        const html = `
            <div class="gpt-result">
                <div class="translation">
                    <div class="title">翻译</div>
                    <div class="content">${result.translation}</div>
                </div>
                <div class="explanation">
                    <div class="title">解释</div>
                    <div class="content">${result.explanation}</div>
                </div>
            </div>
        `;

        return css + html;
    }

    renderCSS() {
        return `
            <style>
                .gpt-result {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    padding: 10px;
                    line-height: 1.5;
                }
                .translation, .explanation {
                    margin-bottom: 15px;
                }
                .title {
                    font-weight: bold;
                    color: #4a4a4a;
                    margin-bottom: 5px;
                }
                .content {
                    color: #2c3e50;
                    background: #f8f9fa;
                    padding: 8px;
                    border-radius: 4px;
                }
                .explanation .content {
                    white-space: pre-wrap;
                }
            </style>
        `;
    }
}

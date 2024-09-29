class AIDictionaryAssistant {
    constructor(options) {
        this.options = options;
        this.apiKey = 'sk-fquwhejllhrvmnssscizjyzswfjgrwxoihultvftuwahgjno';
        this.apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';
        this.model = 'Qwen/Qwen2.5-72B-Instruct';
    }

    async displayName() {
        return 'AI Dictionary Assistant';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(word) {
        if (!word) return null;

        try {
            const response = await this.queryAI(word);
            return this.formatResponse(word, response);
        } catch (error) {
            console.error('Error querying AI:', error);
            return null;
        }
    }

    async queryAI(query) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{
                    role: 'user',
                    content: `Please provide a detailed explanation of the word or sentence: "${query}". Include its meaning, sentence structure, grammar points, and vocabulary analysis.`
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    formatResponse(word, aiResponse) {
        const css = this.renderCSS();
        return [{
            css,
            expression: word,
            reading: '',
            extrainfo: '',
            definitions: [
                `<div class="ai-response">${aiResponse}</div>`
            ],
            audios: []
        }];
    }

    renderCSS() {
        return `
            <style>
            .ai-response {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .ai-response h3 {
                color: #2c3e50;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
            }
            .ai-response p {
                margin-bottom: 10px;
            }
            .ai-response .example {
                background-color: #f0f0f0;
                padding: 10px;
                border-left: 3px solid #2980b9;
                margin: 10px 0;
            }
            </style>
        `;
    }
}

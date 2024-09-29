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
                    content: `Please provide a detailed explanation of the word or sentence: "${query}". Include its meaning, sentence structure, grammar points, and vocabulary analysis. Format your response in HTML with the following sections: <h3>Meaning</h3>, <h3>Sentence Structure</h3>, <h3>Grammar Points</h3>, <h3>Vocabulary Analysis</h3>, and <h3>Example Usage</h3>.`
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
                `<div class="ai-response">
                    <h2 class="word-title">${word}</h2>
                    ${aiResponse}
                </div>`
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
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .ai-response .word-title {
                color: #2c3e50;
                text-align: center;
                font-size: 24px;
                margin-bottom: 20px;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }
            .ai-response h3 {
                color: #2980b9;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
                margin-top: 20px;
            }
            .ai-response p {
                margin-bottom: 15px;
                text-align: justify;
            }
            .ai-response .example {
                background-color: #e8f4f8;
                padding: 15px;
                border-left: 4px solid #3498db;
                margin: 15px 0;
                font-style: italic;
            }
            .ai-response ul, .ai-response ol {
                padding-left: 20px;
                margin-bottom: 15px;
            }
            .ai-response li {
                margin-bottom: 5px;
            }
            </style>
        `;
    }
}

/* global api */
class GPT4o_Dictionary {
    constructor(options) {
        this.options = options;
        this.word = '';
        this.apiKey = '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'; // 这里填写你的OpenRouter API密钥
        this.apiUrl = 'https://api.openrouter.ai/v1/completions'; // OpenRouter的API地址
    }

    async displayName() {
        return 'GPT-4o Dictionary (ES->EN)';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(word) {
        this.word = word;
        if (!word) return null;

        // 通过OpenRouter API查询单词
        let query = `Define the Spanish word "${word}" and provide synonyms.`;
        let response = await this.queryGPT4o(query);
        if (!response) return null;

        return this.formatResult(response);
    }

    async queryGPT4o(query) {
        try {
            let response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    prompt: query,
                    max_tokens: 150
                })
            });

            let data = await response.json();
            return data.choices[0].text.trim();
        } catch (err) {
            console.error("Error querying GPT-4o: ", err);
            return null;
        }
    }

    formatResult(response) {
        // 格式化从GPT-4o获得的结果以适合显示
        let definitions = response.split('\n').map(line => `<span class="exp">${line}</span>`);

        let css = this.renderCSS();
        return [{
            css,
            expression: this.word,
            definitions: definitions,
            audios: []  // GPT-4o没有语音功能，但可扩展
        }];
    }

    renderCSS() {
        return `
            <style>
            span.exp { display: block; color: #333; font-size: 1em; }
            </style>
        `;
    }
}

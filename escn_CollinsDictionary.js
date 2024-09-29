/* global api */
class AIDict {
    constructor(options) {
        this.options = options;
        this.apiKey = "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";
        this.model = "openai/gpt-4";
    }

    async displayName() {
        return 'AI Dictionary (GPT-4)';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(word) {
        if (!word) return null;

        try {
            let definition = await this.queryAI(word);
            return [this.createNote(word, definition)];
        } catch (err) {
            return null;
        }
    }

    async queryAI(word) {
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        const prompt = `请为词语"${word}"提供以下信息：
1. 简明定义
2. 词性
3. 两个使用示例
请用中文回答，并使用HTML格式化输出。`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            throw new Error('AI API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    createNote(word, definition) {
        return {
            css: this.renderCSS(),
            expression: word,
            reading: '',
            extrainfo: '',
            definitions: [definition],
            audios: []
        };
    }

    renderCSS() {
        return `
            <style>
            .ai-definition {
                font-size: 1em;
                line-height: 1.5;
            }
            .ai-definition h3 {
                color: #4a4a4a;
                margin-top: 10px;
                margin-bottom: 5px;
            }
            .ai-definition p {
                margin: 5px 0;
            }
            .ai-definition .example {
                color: #0077be;
                font-style: italic;
            }
            </style>
        `;
    }
}

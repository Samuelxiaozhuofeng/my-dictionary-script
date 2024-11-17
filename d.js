/* global api */
class escn_AIDictionary {
    constructor(options) {
        this.options = options;
        this.apiURL = 'https://api.siliconflow.com/v1/models/Qwen/Qwen2.5-72B-Instruct/completions';
        this.apiKey = 'sk-fwzctttjlftqmedzftdfvowpxpnchohlbxbmyompgspcyxeg';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'AI西汉词典';
        if (locale.indexOf('TW') != -1) return 'AI西汉词典';
        return 'AI ES->CN Dictionary';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(word, sentence) {
        if (!word || !sentence) return null;

        // 构造AI请求
        let prompt = `解释单词 "${word}" 在句子 "${sentence}" 中的含义，并提供详细的中文解释。`;
        let requestBody = {
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.7,
            top_p: 1.0,
            n: 1,
            stop: null
        };

        // 发送请求
        let response = null;
        try {
            response = await api.fetch(this.apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            response = await response.json();
        } catch (err) {
            console.error('AI请求失败:', err);
            return null;
        }

        // 解析AI返回的内容
        if (!response || !response.choices || response.choices.length === 0) {
            return null;
        }

        let aiResponse = response.choices[0].text.trim();
        let css = this.renderCSS();
        return aiResponse ? css + aiResponse : null;
    }

    renderCSS() {
        let css = `
            <style>
            .ai-response {
                line-height: 24px;
                font-family: -apple-system,system-ui,BlinkMacSystemFont,’Segoe UI’,Roboto,Ubuntu,’Helvetica Neue’,Arial,sans-serif;
                color: #333;
            }
            .ai-response strong {
                color: #1b85e5;
            }
            </style>
        `;
        return css;
    }
}

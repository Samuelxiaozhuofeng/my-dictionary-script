class eszh_GPT4Translator {
    constructor(options) {
        this.options = options;
        this.apiKey = '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';
        this.apiUrl = 'https://api.openrouter.ai/v1/completions';
        this.word = '';
        this.sentence = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'GPT-4o 西-中 词典';
        if (locale.indexOf('TW') != -1) return 'GPT-4o 西-中 词典';
        return 'GPT-4o ES->ZH Dictionary';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(word, sentence) {
        this.word = word;
        this.sentence = sentence;
        return await this.queryGPT4o(word, sentence);
    }

    async queryGPT4o(word, sentence) {
        if (!word) return null;
        
        // Prepare the prompt for GPT-4o
        const prompt = `请根据以下句子中的语境，解释并翻译其中的词汇 "${word}" 。句子："${sentence}"。`;
        
        // Setup request payload
        const payload = {
            model: 'gpt-4o',
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.7,
            top_p: 1.0
        };
        
        // Set up request headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        try {
            // Send the request to the API
            let response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            let data = await response.json();
            let explanation = data.choices && data.choices.length > 0 ? data.choices[0].text.trim() : null;

            if (!explanation) return null;

            // Return explanation as HTML content
            let css = this.renderCSS();
            return css + `<div class='gpt4-response'>${explanation}</div>`;
        } catch (err) {
            console.error('Error fetching from GPT-4o API:', err);
            return null;
        }
    }

    renderCSS() {
        let css = `
            <style>
            .gpt4-response {
                font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f9f9f9;
                padding: 10px;
                border-radius: 4px;
            }
            </style>`;
        return css;
    }
}

/*
使用说明：
1. 将此类保存到插件的词典目录下。
2. 在插件的选项中，启用此自定义词典以便使用GPT-4o进行西班牙语到中文的翻译。
3. 用户在网页中划词后，插件将会调用此脚本，通过GPT-4o提供结合上下文的翻译和解释。
*/

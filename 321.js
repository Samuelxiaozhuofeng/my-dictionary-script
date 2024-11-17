/* global api */
class eszh_GPT4ODH {
    constructor(options) {
        this.options = options;
        this.word = '';
        this.context = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'GPT-41 西班牙语->中文词典';
        if (locale.indexOf('TW') != -1) return 'GPT-41 西班牙语->中文词典';
        return 'GPT-4 ES->ZH Dictionary';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(word, sentence) {
        this.word = word;
        this.context = sentence;
        return await this.translateWithGPT4(word, sentence);
    }

    async translateWithGPT4(word, context) {
        if (!word || !context) return null;

        let apiKey = 'sk-6y6iAyxmasnogzfI1aUGbXA3yx1u3HVWx2t2O3QaIQ135uum';
        let endpoint = 'https://api.tu-zi.com/v1/completions';
        let prompt = `请将以下句子中的词汇 "${word}" 结合上下文翻译成中文：\n\n句子：${context}`;

        let payload = {
            "model": "gpt-4o",
            "prompt": prompt,
            "max_tokens": 100,
            "temperature": 0.7
        };

        try {
            let response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            let data = await response.json();
            if (data && data.choices && data.choices.length > 0) {
                return data.choices[0].text.trim();
            } else {
                return null;
            }
        } catch (error) {
            console.error('Translation error:', error);
            return null;
        }
    }
}

// 使用示例：
// const dictionary = new eszh_GPT4ODH();
// dictionary.findTerm('palabra', 'Esta es una frase con la palabra que necesitamos traducir.')
//     .then(result => console.log(result));

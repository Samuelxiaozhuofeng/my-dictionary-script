/* global api */
class encn_QwenDict {
    constructor() {
        this.apiKey = 'sk-fwzctttjlftqmedzftdfvowpxpnchohlbxbmyompgspcyxeg';
        this.baseURL = 'https://api.siliconflow.cn/v1/chat/completions';
        this.word = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'Qwen2英汉词典';
        if (locale.indexOf('TW') != -1) return 'Qwen2英漢詞典';
        return 'Qwen EN->CN Dictionary';
    }

    setOptions(options) {
        this.options = options;
    }

    buildMessage(expression, context) {
        return [
            {
                role: "system",
                content: "你是一个语言专家，能够识别词汇，并且根据上下文进行解释。"
            },
            {
                role: "user",
                content: context ? 
                    `词汇: ${expression}\n上下文: ${context}\n请解释这个词汇在当前上下文中的含义。` :
                    expression
            }
        ];
    }

    async requestTranslation(expression, context) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: "Qwen/Qwen2.5-72B-Instruct",
                messages: this.buildMessage(expression, context),
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    formatContent(content) {
        return content.replace(/\n/g, '<br>');
    }

    async findTerm(expression, context) {
        this.word = expression;
        
        return new Promise(async (resolve, reject) => {
            try {
                let content = await this.requestTranslation(expression, context);
                content = this.formatContent(content);
                
                resolve([{
                    expression: expression,
                    reading: '',
                    extrainfo: context ? '基于上下文的解释' : '',
                    definitions: [content],
                    audios: [],
                    css: ''
                }]);
            } catch (error) {
                reject(error);
            }
        });
    }
}

if (typeof(window.registerDict) == 'function') {
    window.registerDict('encn_QwenDict', encn_QwenDict);
}

/* global api */
class encn_QwenDict {
    constructor() {
        this.apiKey = 'sk-fwzctttjlftqmedzftdfvowpxpnchohlbxbmyompgspcyxeg';
        this.baseURL = 'https://api.siliconflow.cn/v1/chat/completions';
        this.word = '';
    }

    // 显示词典名称
    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return '测试1';
        if (locale.indexOf('TW') != -1) return '测试1';
        return 'Qwen EN->CN Dictionary';
    }

    // 设置选项
    setOptions(options) {
        this.options = options;
    }

    // 构建API请求消息
    buildMessage(word, context) {
        return [
            {
                role: "system",
                content: "你是一个语言专家，能够识别词汇，并且根据上下文进行解释。"
            },
            {
                role: "user",
                content: context ? `${word}\n上下文：${context}` : word
            }
        ];
    }

    // 发送API请求
    async requestTranslation(word, context) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: "Qwen/Qwen2.5-72B-Instruct",
                messages: this.buildMessage(word, context),
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

    // 格式化API返回的内容
    formatContent(content) {
        return content.replace(/\n/g, '<br>');
    }

    // 主查询函数
async findTerm(word, context) {
    this.word = word;
    
    return new Promise(async (resolve, reject) => {
        try {
            let content = await this.requestTranslation(word, context);
            content = this.formatContent(content);
            
            // 返回正确的数据结构格式
            resolve([{
                expression: word,
                reading: '',
                extrainfo: context ? '基于上下文的解释' : '',
                definitions: [content],
                sentence: context || '',
                url: '',
                audios: [],
                css: ''
            }]);
        } catch (error) {
            reject(error);
        }
    });
}
}

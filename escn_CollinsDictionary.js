/* global api */
class escn_AIDict {
    constructor(options) {
        this.options = options;
        this.word = '';
        this.apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
        this.apiKey = options?.apiKey || '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';
        this.model = 'gpt-4';
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://github.com/ninja33/ODH',
            'X-Title': 'ODH Plugin'
        };
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'AI上下文翻译';
        if (locale.indexOf('TW') != -1) return 'AI上下文翻译';
        return 'AI Context Translation';
    }

    setOptions(options) {
        this.options = options;
        if (options?.apiKey) {
            this.apiKey = options.apiKey;
            this.headers.Authorization = `Bearer ${this.apiKey}`;
        }
    }

    // 改进的上下文提取方法
    extractContext(word) {
        try {
            const selection = window.getSelection();
            if (!selection.rangeCount) return word;

            const range = selection.getRangeAt(0);
            let container = range.commonAncestorContainer;
            
            // 向上查找到最近的段落或标题元素
            while (container && 
                   container.nodeType !== Node.ELEMENT_NODE && 
                   !['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'ARTICLE'].includes(container.nodeName)) {
                container = container.parentNode;
            }

            // 如果没找到合适的容器，返回单词本身
            if (!container) return word;

            // 获取包含选中词的完整句子
            const text = container.textContent || container.innerText;
            const sentences = text.split(/([.!?。！？]+[\s\n]+|$)/g);
            
            for (let i = 0; i < sentences.length; i++) {
                if (sentences[i].includes(word)) {
                    // 获取前后句子进行拼接，提供更多上下文
                    const prevSentence = i > 0 ? sentences[i-1] : '';
                    const nextSentence = i < sentences.length - 1 ? sentences[i+1] : '';
                    return (prevSentence + sentences[i] + nextSentence).trim();
                }
            }
        } catch (e) {
            console.error('Context extraction error:', e);
        }
        return word;
    }

    async callAIAPI(word, context) {
        const prompt = `
请分析以下西班牙语中的词语。给出的上下文是：

"${context}"

需要分析的词语是："${word}"

请按照以下格式提供分析：
1. 基本释义：[给出最符合上下文的中文释义]
2. 词性：[说明词性]
3. 上下文分析：[分析该词在这句话中的具体含义和用法]
4. 常见用法：[列举1-2个这个词的其他常见用法]
5. 相关例句：[提供一个能体现相似用法的例句]
`;

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI API Error:', error);
            return null;
        }
    }

    formatResponse(aiResponse) {
        if (!aiResponse) return null;
        
        // 添加样式类以区分不同部分
        const formattedResponse = aiResponse
            .replace(/(\d+\.\s*[^：:]+[：:])/g, '<div class="section-title">$1</div>')
            .replace(/\[([^\]]+)\]/g, '<span class="content">$1</span>')
            .replace(/\n/g, '<br>');
        
        return `
            <div class="ai-translation">
                ${formattedResponse}
            </div>
        `;
    }

    async findTerm(word) {
        this.word = word;
        const context = this.extractContext(word);
        
        return new Promise(async (resolve, reject) => {
            try {
                const aiResponse = await this.callAIAPI(word, context);
                const formattedResponse = this.formatResponse(aiResponse);
                const css = this.renderCSS();
                resolve(formattedResponse ? css + formattedResponse : null);
            } catch (error) {
                reject(error);
            }
        });
    }

    renderCSS() {
        return `
            <style>
                .ai-translation {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .ai-translation .section-title {
                    color: #2c5282;
                    font-weight: 600;
                    margin-top: 10px;
                }
                .ai-translation .content {
                    color: #1a202c;
                    background-color: #edf2f7;
                    padding: 2px 5px;
                    border-radius: 4px;
                }
                .ai-translation br {
                    margin-bottom: 8px;
                }
            </style>
        `;
    }
}

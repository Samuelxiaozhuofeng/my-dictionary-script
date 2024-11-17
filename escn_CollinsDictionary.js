/* global api */
class escn_GPTDict {
    constructor(options) {
        this.options = options;
        this.word = '';
        this.apiKey = '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';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    }

    async displayName() {
        return 'GPT西汉智能词典';
    }

    setOptions(options) {
        this.options = options;
    }

    // 获取选中词汇所在的句子
    extractSentence(text, word) {
        const sentences = text.match(/[^.!?。！？]+[.!?。！？]+/g) || [text];
        return sentences.find(sentence => sentence.includes(word)) || word;
    }

    async findTerm(word) {
        this.word = word;
        
        // 获取当前页面的文本内容
        const pageText = document.body.innerText;
        const contextSentence = this.extractSentence(pageText, word);

        // 构建发送给GPT的提示
        const prompt = `
请你作为西班牙语翻译专家，解析以下句子中的"${word}"：

句子上下文：${contextSentence}

请按照以下格式提供分析：
1. 词性：
2. 基本含义：
3. 在此句中的具体含义：
4. 词形变化（如果有）：
5. 使用说明：

请用中文回答。
`;

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            const data = await response.json();
            if (!data.choices || !data.choices[0]) {
                throw new Error('No response from GPT');
            }

            const analysis = data.choices[0].message.content;
            return this.formatResponse(analysis);
        } catch (error) {
            console.error('GPT API Error:', error);
            return null;
        }
    }

    formatResponse(analysis) {
        // 添加样式
        const css = this.renderCSS();
        
        // 格式化GPT返回的内容
        const formattedContent = `
            <div class="gpt-dict-container">
                <div class="word-header">${this.word}</div>
                <div class="analysis-content">
                    ${analysis.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;

        return css + formattedContent;
    }

    renderCSS() {
        return `
            <style>
                .gpt-dict-container {
                    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
                    padding: 15px;
                    line-height: 1.5;
                }
                .word-header {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #3498db;
                }
                .analysis-content {
                    color: #34495e;
                }
                .analysis-content br {
                    margin: 5px 0;
                }
            </style>
        `;
    }
}

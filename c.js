class escn_AIDictionary {
    constructor(options) {
        this.options = options;
        this.word = '';
        this.context = '';
        this.apiKey = 'sk-fwzctttjlftqmedzftdfvowpxpnchohlbxbmyompgspcyxeg';
        this.apiEndpoint = 'https://api.siliconflow.com/v1/chat/completions';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return 'AI西汉助手';
        if (locale.indexOf('TW') != -1) return 'AI西漢助手';
        return 'AI Spanish-Chinese Assistant';
    }

    setOptions(options) {
        this.options = options;
    }

    // 提取单词所在的句子上下文
    extractContext(elem) {
        // 获取选中文本的父元素
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        
        // 向上查找到句子级别的元素
        while (container && 
               !['P', 'DIV', 'LI', 'TD', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(container.nodeName)) {
            container = container.parentNode;
        }
        
        return container ? container.innerText : '';
    }

    // 构建 AI 提示
    buildPrompt(word, context) {
        return `作为一个西班牙语-中文翻译助手，请分析以下内容：
        
单词：${word}
句子上下文：${context}

请提供：
1. 该单词的中文含义
2. 在当前句子语境下最准确的翻译
3. 语法说明（如果有特殊语法点）
4. 相关例句（西班牙语-中文对照）

请使用markdown格式输出。`;
    }

    // 调用 AI API
    async queryAI(prompt) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'Qwen/Qwen2.5-72B-Instruct',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error('AI API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI API Error:', error);
            throw error;
        }
    }

    // 渲染样式
    renderCSS() {
        return `
        <style>
            .ai-dict-container {
                font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                padding: 15px;
                max-width: 800px;
                margin: 0 auto;
            }
            .ai-dict-word {
                font-size: 1.2em;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .ai-dict-context {
                background-color: #f8f9fa;
                padding: 10px;
                border-left: 4px solid #4a90e2;
                margin: 10px 0;
            }
            .ai-dict-section {
                margin: 15px 0;
            }
            .ai-dict-section h3 {
                color: #2c3e50;
                font-size: 1.1em;
                margin-bottom: 8px;
            }
            .ai-dict-example {
                padding: 5px 0;
                border-bottom: 1px solid #eee;
            }
            .ai-dict-grammar {
                background-color: #fff3e0;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
            }
        </style>`;
    }

    // 主查询函数
    async findTerm(word) {
        this.word = word;
        
        try {
            // 获取上下文
            this.context = this.extractContext(document);
            
            // 构建提示
            const prompt = this.buildPrompt(word, this.context);
            
            // 调用 AI
            const aiResponse = await this.queryAI(prompt);
            
            // 组装最终展示内容
            const content = `
                ${this.renderCSS()}
                <div class="ai-dict-container">
                    <div class="ai-dict-word">${word}</div>
                    <div class="ai-dict-context">${this.context}</div>
                    ${aiResponse}
                </div>
            `;
            
            return content;
        } catch (error) {
            // 错误处理
            return `
                ${this.renderCSS()}
                <div class="ai-dict-container">
                    <div class="error-message">
                        抱歉，查询过程中出现错误：${error.message}
                    </div>
                </div>
            `;
        }
    }
}

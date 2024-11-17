class escn_AIDictionary {
    constructor(options) {
        this.options = options;
        this.word = '';
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

    // 构建 AI 提示
    buildPrompt(word) {
        return `作为一个西班牙语-中文翻译助手，请分析以下单词：
        
单词：${word}

请提供：
1. 该单词的中文含义（包括多个可能的含义）
2. 词形变化（如果是动词，请给出常用时态变化；如果是名词，请给出单复数形式；如果是形容词，请给出阳性阴性变化等）
3. 语法说明（词性、用法特点等）
4. 相关例句（3个西班牙语-中文对照例句）
5. 常见搭配用法

请使用以下格式输出：
### 基本含义
[填写内容]

### 词形变化
[填写内容]

### 语法说明
[填写内容]

### 例句
[填写内容]

### 常见搭配
[填写内容]`;
    }

    // 调用 AI API
    async queryAI(prompt) {
        try {
            console.log('Sending request to AI API...');
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
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('Received AI response:', data);
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
                color: #333;
            }
            .ai-dict-word {
                font-size: 1.4em;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 2px solid #4a90e2;
            }
            .ai-dict-section {
                margin: 15px 0;
                padding: 10px;
                background: #ffffff;
                border-radius: 5px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .ai-dict-section h3 {
                color: #2c3e50;
                margin: 0 0 10px 0;
                font-size: 1.1em;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
            }
            .ai-dict-examples {
                background-color: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
            }
            .ai-dict-example {
                padding: 5px 0;
                margin: 5px 0;
                border-bottom: 1px dashed #eee;
            }
            .ai-dict-example:last-child {
                border-bottom: none;
            }
            .error-message {
                color: #d32f2f;
                padding: 12px;
                background-color: #ffebee;
                border-radius: 4px;
                margin: 12px 0;
            }
            .loading {
                text-align: center;
                padding: 20px;
                color: #666;
            }
        </style>`;
    }

    // 格式化 Markdown
    formatMarkdown(text) {
        return text
            .replace(/### (.*?)\n/g, '<h3>$1</h3>')  // 标题
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')  // 斜体
            .replace(/`(.*?)`/g, '<code>$1</code>')  // 代码
            .split('\n').map(line => line.trim()).filter(Boolean)
            .join('</p><p>');  // 段落
    }

    // 主查询函数
    async findTerm(word) {
        if (!word) {
            return null;
        }

        try {
            console.log('Finding term:', word);
            
            // 显示加载状态
            const loadingContent = `
                ${this.renderCSS()}
                <div class="ai-dict-container">
                    <div class="loading">正在查询中，请稍候...</div>
                </div>
            `;
            
            // 构建提示
            const prompt = this.buildPrompt(word);
            
            // 调用 AI
            const aiResponse = await this.queryAI(prompt);
            
            // 组装最终展示内容
            const content = `
                ${this.renderCSS()}
                <div class="ai-dict-container">
                    <div class="ai-dict-word">${word}</div>
                    <div class="ai-dict-content">
                        ${this.formatMarkdown(aiResponse)}
                    </div>
                </div>
            `;
            
            return content;
        } catch (error) {
            console.error('Dictionary error:', error);
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

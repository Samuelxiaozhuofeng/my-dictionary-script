class escn_CollinsDictionary {
    constructor() {
        this.name = "Collins Spanish-English Dictionary";
        this.baseUrl = "https://www.collinsdictionary.com/dictionary/spanish-english/";
    }

    findTerm(word) {
        return new Promise((resolve, reject) => {
            let url = this.baseUrl + encodeURIComponent(word);
            
            fetch(url)
                .then(response => response.text())
                .then(html => {
                    let definition = this.extractDefinition(html);
                    resolve(definition);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    extractDefinition(html) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');
        
        let result = "";
        
        // 提取西班牙语单词
        let spanishWord = doc.querySelector('.h2_entry');
        if (spanishWord) {
            result += `西班牙语: ${spanishWord.textContent.trim()}\n\n`;
        }
        
        // 提取音标
        let pronunciation = doc.querySelector('.pron');
        if (pronunciation) {
            result += `发音: ${pronunciation.textContent.trim()}\n\n`;
        }
        
        // 提取定义
        let definitions = doc.querySelectorAll('.sense');
        if (definitions.length > 0) {
            result += "定义:\n";
            definitions.forEach((def, index) => {
                let spanishDef = def.querySelector('.cit.type-translation');
                let englishDef = def.querySelector('.cit.type-translation.quote');
                if (spanishDef && englishDef) {
                    result += `${index + 1}. ${spanishDef.textContent.trim()} - ${englishDef.textContent.trim()}\n`;
                }
            });
        }
        
        return result || "未找到定义";
    }
}

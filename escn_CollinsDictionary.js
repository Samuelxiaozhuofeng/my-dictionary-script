class escn_CollinsDictionary {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        return 'Collins ES->EN Dictionary';
    }

    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        if (!word) return null;

        let url = `https://www.collinsdictionary.com/dictionary/spanish-english/${encodeURIComponent(word)}`;
        try {
            let data = await api.fetch(url);
            let doc = new DOMParser().parseFromString(data, 'text/html');
            return this.processPage(doc);
        } catch (err) {
            return null;
        }
    }

    processPage(doc) {
        let notes = [];
        let expression = doc.querySelector('.h2_entry')?.textContent.trim();
        if (!expression) return null;

        let reading = doc.querySelector('.pron')?.textContent.trim();
        
        let audioElement = doc.querySelector('.sound');
        let audios = audioElement ? [`https://www.collinsdictionary.com${audioElement.getAttribute('data-src-mp3')}`] : [];

        let definitionElements = doc.querySelectorAll('.hom');
        let definitions = [];

        definitionElements.forEach((defElement, index) => {
            let definition = '';
            let sense = defElement.querySelector('.sense');
            if (sense) {
                let defText = sense.querySelector('.def')?.textContent.trim();
                let tranText = sense.querySelector('.trans')?.textContent.trim();
                let exampleText = sense.querySelector('.cit.type-example')?.textContent.trim();

                if (defText) definition += `<p><strong>Definition:</strong> ${defText}</p>`;
                if (tranText) definition += `<p><strong>Translation:</strong> ${tranText}</p>`;
                if (exampleText) definition += `<p><strong>Example:</strong> ${exampleText}</p>`;
            }
            if (definition) definitions.push(definition);
        });

        let css = this.renderCSS();
        notes.push({
            css,
            expression,
            reading,
            definitions,
            audios
        });

        return notes;
    }

    renderCSS() {
        return `
            <style>
            .collins-dict p {
                margin-bottom: 5px;
            }
            .collins-dict strong {
                color: #1C6FB8;
            }
            </style>
        `;
    }
}

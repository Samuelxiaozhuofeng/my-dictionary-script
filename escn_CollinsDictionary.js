/* global api */
class escn_CollinsDictionary {
    constructor(options) {
        this.options = options;
        this.baseUrl = 'https://www.collinsdictionary.com/dictionary/spanish-english/';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return '柯林斯西英词典';
        if (locale.indexOf('TW') != -1) return '柯林斯西英詞典';
        return 'Collins Spanish-English Dictionary';
    }

    setOptions(options) {
        this.options = options;
    }

    async findTerm(word) {
        if (!word) return null;

        let url = this.baseUrl + encodeURIComponent(word);
        try {
            let html = await api.fetch(url);
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            let definitions = this.parseDefinitions(doc);
            return definitions;
        } catch (err) {
            return null;
        }
    }

    parseDefinitions(doc) {
        let notes = [];

        function T(node) {
            if (!node) return '';
            return node.innerText.trim();
        }

        let headsection = doc.querySelector('.dictionary .entry');
        if (!headsection) return null;

        let expression = T(headsection.querySelector('.orth'));
        let reading = T(headsection.querySelector('.phon'));

        let definitions = [];
        let defElements = headsection.querySelectorAll('.sense');
        defElements.forEach(def => {
            let defText = T(def.querySelector('.def'));
            let examples = [];
            def.querySelectorAll('.quote').forEach(quote => {
                examples.push(T(quote));
            });
            definitions.push({
                definition: defText,
                examples: examples
            });
        });

        notes.push({
            expression,
            reading,
            definitions
        });

        return notes;
    }
}

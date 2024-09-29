/* global api */
class escn_Eudict {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') !== -1 || locale.indexOf('TW') !== -1) {
            return '欧路西语助手';
        }
        return 'Eudict ES->CN Dictionary';
    }

    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    /**
     * 尝试查找词条，包括前缀搜索、精确搜索和词形还原搜索
     * @param {string} word - 要查找的单词
     * @returns {Array|null} - 返回词条信息数组或 null
     */
    async findTerm(word) {
        this.word = word;
        if (!word) return null;

        const basePrefix = 'https://www.esdict.cn/dicts/prefix/';
        const baseExact = 'https://www.esdict.cn/dicts/es/';
        const urlPrefix = basePrefix + encodeURIComponent(word);
        let terms = [];

        try {
            // 尝试前缀搜索
            let prefixResponse = JSON.parse(await api.fetch(urlPrefix));
            if (Array.isArray(prefixResponse) && prefixResponse.length > 0) {
                terms = prefixResponse.filter(term => term.value && term.recordid && term.recordtype !== 'CG');
                terms = terms.slice(0, this.maxexample); // 最多返回指定数量的结果
            }

            // 如果前缀搜索没有结果，尝试精确搜索
            if (terms.length === 0) {
                const exactUrl = baseExact + encodeURIComponent(word);
                const exactResult = await this.findEudict(exactUrl);
                if (exactResult && exactResult.length > 0) {
                    return exactResult;
                }

                // 尝试词形还原后再搜索
                const baseForm = this.getBaseForm(word);
                if (baseForm && baseForm !== word) {
                    const baseUrlPrefix = basePrefix + encodeURIComponent(baseForm);
                    let basePrefixResponse = JSON.parse(await api.fetch(baseUrlPrefix));
                    if (Array.isArray(basePrefixResponse) && basePrefixResponse.length > 0) {
                        terms = basePrefixResponse.filter(term => term.value && term.recordid && term.recordtype !== 'CG');
                        terms = terms.slice(0, this.maxexample); // 最多返回指定数量的结果
                    }

                    if (terms.length > 0) {
                        const baseQueries = terms.map(term => this.findEudict(`https://www.esdict.cn/dicts/es/${term.value}?recordid=${term.recordid}`));
                        const baseResults = await Promise.all(baseQueries);
                        return [].concat(...baseResults).filter(x => x);
                    }
                }
            }

            if (terms.length === 0) return null;

            const queries = terms.map(term => this.findEudict(`https://www.esdict.cn/dicts/es/${term.value}?recordid=${term.recordid}`));
            const results = await Promise.all(queries);
            return [].concat(...results).filter(x => x);
        } catch (err) {
            console.error('Error in findTerm:', err);
            return null;
        }
    }

    /**
     * 从指定的元素中移除特定的HTML标签
     * @param {Element} elem - 要操作的元素
     * @param {string} selector - 要移除的标签选择器
     */
    removeTags(elem, selector) {
        let tags = elem.querySelectorAll(selector);
        tags.forEach(tag => {
            tag.outerHTML = '';
        });
    }

    /**
     * 获取词条的详细信息
     * @param {string} url - 词条页面的URL
     * @returns {Array} - 返回包含词条信息的数组
     */
    async findEudict(url) {
        let notes = [];

        function T(node) {
            return node ? node.innerText.trim() : '';
        }

        let doc = '';
        try {
            let data = await api.fetch(url);
            let parser = new DOMParser();
            doc = parser.parseFromString(data, 'text/html');
        } catch (err) {
            console.error('Error fetching or parsing the document:', err);
            return [];
        }

        let headsection = doc.querySelector('#dict-body>#exp-head');
        if (!headsection) return null;

        let expression = T(headsection.querySelector('.word'));
        if (!expression) return null;

        let reading = T(headsection.querySelector('.Phonitic'));

        let extrainfo = '';
        let cets = headsection.querySelectorAll('.tag');
        cets.forEach(cet => {
            extrainfo += `<span class="cet">${T(cet)}</span>`;
        });

        let audios = [];
        try {
            let voiceData = headsection.querySelector('.voice-js').dataset.rel;
            if (voiceData) {
                audios[0] = 'https://api.frdic.com/api/v2/speech/speakweb?' + voiceData;
            }
        } catch (err) {
            console.warn('Audio not found:', err);
        }

        let content = doc.querySelector('#ExpFCChild');
        if (!content) return [];

        this.removeTags(content, 'script');
        this.removeTags(content, '#word-thumbnail-image');
        this.removeTags(content, '[style]');
        this.removeTags(content.parentNode, '#ExpFCChild>br');

        let anchor = content.querySelector('a');
        if (anchor) {
            let href = anchor.getAttribute('href');
            if (href) {
                let link = 'https://www.esdict.cn' + href;
                anchor.setAttribute('href', link);
                anchor.setAttribute('target', '_blank');
            }
        }

        // 格式化内容
        content.innerHTML = content.innerHTML.replace(/<p class="exp">(.+?)<\/p>/gi, '<span class="exp">$1</span>');
        content.innerHTML = content.innerHTML.replace(/<span class="exp"><br>/gi, '<span class="exp">');
        content.innerHTML = content.innerHTML.replace(/<span class="eg"><br>/gi, '<span class="eg">');

        let css = this.renderCSS();
        notes.push({
            css,
            expression,
            reading,
            extrainfo,
            definitions: [content.innerHTML],
            audios
        });

        return notes;
    }

    /**
     * 渲染CSS样式
     * @returns {string} - 返回包含CSS的字符串
     */
    renderCSS() {
        return `
            <style>
                span.eg,
                span.exp,
                span.cara {
                    display: block;
                }
                .cara {
                    color: #1C6FB8;
                    font-weight: bold;
                }
                .eg {
                    color: #238E68;
                }
                #phrase I {
                    color: #009933;
                    font-weight: bold;
                }
                span.cet {
                    margin: 0 3px;
                    padding: 0 3px;
                    font-weight: normal;
                    font-size: 0.8em;
                    color: white;
                    background-color: #5cb85c;
                    border-radius: 3px;
                }
            </style>`;
    }

    /**
     * 词形还原函数，将动词变形形式还原为原型
     * @param {string} word - 要还原的单词
     * @returns {string} - 返回原型形式的单词
     */
    getBaseForm(word) {
        // 处理不规则动词
        const irregularVerbs = {
            'puede': 'poder',
            'pueden': 'poder',
            'pueda': 'poder',
            'tiene': 'tener',
            'tienen': 'tener',
            'quiera': 'querer',
            'quieren': 'querer',
            // 添加更多不规则动词
        };

        if (irregularVerbs[word]) {
            return irregularVerbs[word];
        }

        // 处理规则动词
        // 示例：hablo, hablas, habla, hablamos, habláis, hablan -> hablar
        const regex = /^(.*?)(o|as|a|amos|áis|an)$/;
        const match = word.match(regex);
        if (match) {
            return match[1] + 'ar'; // 假设是 -ar 结尾的动词
        }

        // 处理 -er 动词
        const regexEr = /^(.*?)(o|es|e|emos|éis|en)$/;
        const matchEr = word.match(regexEr);
        if (matchEr) {
            return matchEr[1] + 'er';
        }

        // 处理 -ir 动词
        const regexIr = /^(.*?)(o|es|e|imos|ís|en)$/;
        const matchIr = word.match(regexIr);
        if (matchIr) {
            return matchIr[1] + 'ir';
        }

        // 如果无法还原，返回原词
        return word;
    }
}

class ensp_CollinsDictionary {
  constructor(options) {
    this.options = options;
    this.maxexample = 2;
    this.word = '';
  }

  async displayName() {
    let locale = await api.locale();
    if (locale.indexOf('CN') != -1 || locale.indexOf('TW') != -1) return 'Collins英西词典';
    return 'Collins English-Spanish Dictionary';
  }

  setOptions(options) {
    this.options = options;
    this.maxexample = options.maxexample;
  }

  async findTerm(word) {
    this.word = word;
    return await this.findCollins(word);
  }

  async findCollins(word) {
    if (!word) return null;
    let base = 'https://www.collinsdictionary.com/dictionary/english-spanish/';
    let url = base + encodeURIComponent(word);
    let doc = '';
    try {
      let data = await api.fetch(url);
      let parser = new DOMParser();
      doc = parser.parseFromString(data, 'text/html');
    } catch (err) {
      return null;
    }

    // 根据 Collins 词典的 HTML 结构选择合适的选择器
    let contents = doc.querySelectorAll('.dictentry') || [];
    if (contents.length == 0) return null;

    let definition = '';
    for (const content of contents) {
      this.removeTags(content, '.copyright');
      this.removeLinks(content);
      definition += content.innerHTML;
    }

    let css = this.renderCSS();
    return definition ? css + definition : null;
  }

  removeTags(elem, selector) {
    let tags = elem.querySelectorAll(selector);
    tags.forEach(x => { x.outerHTML = ''; });
  }

  removeLinks(elem) {
    let tags = elem.querySelectorAll('a');
    tags.forEach(x => { x.outerHTML = `<span class='link'>${x.innerText}</span>`; });
  }

  renderCSS() {
    return `
      <style>
        .dictentry { font-family: Arial, sans-serif; line-height: 1.6; }
        .link { color: #1b85e5; }
        .hom { margin-bottom: 15px; }
        .sense { margin-left: 20px; }
        .type-translation { color: #006621; }
        .quote { font-style: italic; color: #666; }
      </style>
    `;
  }
}

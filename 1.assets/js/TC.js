/* -----------------------------------------
            Events Area Start
------------------------------------------ */
/* ------------- Tc Navs Start ------------- */
$(document).on("click", ".tc-nav .tc-nav-item", function (e) {
    e.preventDefault();
    let target = $(this).dataVal("target"),
        $parent = $(this).parents(".tc-nav").first();
    $parent.find(".tc-nav-item.active").removeClass("active");
    $parent.find(".tc-nav-panel.active").removeClass("active");
    $(this).addClass('active');
    $parent.find(target).addClass("active");
});
// Remove Tc Nav
$(document).on("click", ".tc-nav .tc-nav-item [data-detach='tc-nav']", function (e) {
    e.preventDefault();
    let $navItem = $(this).parents(".tc-nav-item"),
        target = $navItem.dataVal("target"),
        $parent = $(this).parents(".tc-nav").first();
    $navItem.remove();
    $parent.find(target).remove();
});
// Create New Nav
$(document).on("click", ".tc-nav .tc-nav-add-btn", function (e) {
    let $form = $(this).parents(".tc-nav-add-form").first(),
        $input = $form.find(".tc-nav-add-input"),
        $parent = $(this).parents(".tc-nav").frist(),
        $navItems = $parent.find(".nav-items");

});
/* ------------- Tc Navs End ------------- */
/* -----------------------------------------
            Events Area End
------------------------------------------ */
/* -----------------------------------------
            Functions Area Start
------------------------------------------ */
class TCElements {
    count = 0;
    constructor() {
    }
    parseHtml(html, data = {}) {
        for (let key in data) {
            let value = data[key];
            key = key.toUpperCase();
            html = html.replace(`_:TC.${key}:_`, value);
        }
        return html;
    }
    layout(type, data = {}) {
        let html = ``;
        switch (type) {
            // Nav item
            case "navItem": {
                let { settings, htmlData } = data;
                html = `
                <div class="tc-nav-item pull-away active">
                    <span>_:TC.NAME:_</span>
                    ${settings.removeNav ? `<i class="fas fa-times" data-detach="tc-nav"></i>` : ``}
                </div>`;
                if (htmlData.nav) {
                    let selector = htmlData.nav.selector;
                    if (selector) {
                        let $element = $(selector);
                        if (!$element.length) return logError(`nav selector "${selector}" not found!`);
                        $element = $element.clone();
                        html = $element.get(0).outerHTML;
                    }
                }
                data = data.data;
                html = this.parseHtml(html, data);
                let $elem = $(html);
                $elem.attr("data-target", `#${data.id}`);
                html = $elem.get(0).outerHTML;
                break;
            }
            // Panel item
            case "panelItem": {
                html = `<div> _:TC.CONTENT:_ </div>`;
                let { settings, htmlData } = data;
                if (htmlData.panel) {
                    let selector = htmlData.panel.selector;
                    if (selector) {
                        let $element = $(selector);
                        if (!$element.length) return logError(`nav panel selector "${selector}" not found!`);
                        $element = $element.clone();
                        $element.removeClass("d-none");
                        html = $element.get(0).outerHTML;
                    }
                }
                data = data.data;
                html = this.parseHtml(html, data);
                let $elem = $(html);
                html = $elem.get(0).outerHTML;
                html = `<div class="tc-nav-panel" id="${data.id}">${html}</div>`;
                break;
            }
            case "navItemAddBtn": {
                if (data) {
                    let selector = data.addBtnSelector;
                    if (selector) {
                        let $elem = $(selector);
                        if (!$elem.length) {
                            logError(`nav add btn selector ${selector} not found!`);
                            return ``;
                        }
                        return $elem.get(0).outerHTML;
                    }
                }
                html = `<div class="dropdown tc-nav-add-con">
                <div class="tc-nav-btn" data-toggle="dropdown">
                    <i class="fas fa-plus"></i>
                </div>
                <div class="dropdown-menu nc-bg-grey" nc-style="w-250">
                    <div class="p-3">
                        <div class="tc-input-group nc-nav-add-form">
                            <input class="form-control tc-nav-add-input" placeholder="Tab Name">
                            <span class="tc-input-group-txt">
                                <i class="fas fa-plus"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>`;
                break;
            }
        }
        return html;
    }
    createHtml($code) {
        if (!$code.hasAttr("tc-type")) return logError("tc-type attribute not found");
        let type = $code.attr("tc-type"),
            data = $code.text();
        if (!isJson(data)) return logError("data is not json");
        data = JSON.parse(data);
        let htmlCode = '';
        switch (type) {
            case "navs":
                let { navs, settings, html } = data,
                    navsHtml = ``,
                    tabsHtml = ``;
                navs ||= [];
                settings ||= {};
                html ||= {};
                settings = {
                    removeNav: false,
                    editableNav: false, ...settings
                };
                navs.forEach(item => {
                    this.count++;
                    let { nav, panel } = item,
                        id = "tcNavPanel" + this.count;
                    nav.id = id;
                    panel.id = id;
                    let itemData = {
                        settings: settings,
                        data: nav,
                        htmlData: html
                    };
                    let itemHtml = this.layout('navItem', itemData);
                    if (typeof itemHtml === 'string')
                        navsHtml += itemHtml;
                    itemData.data = panel;
                    itemHtml = this.layout("panelItem", itemData)
                    if (typeof itemHtml === 'string')
                        tabsHtml += itemHtml;
                });
                let navAddBtnHtml = settings.addNewNav ? this.layout("navItemAddBtn", html.nav) : '';
                htmlCode = `
                <div class="tc-nav">
                    <div class="tc-nav-items">
                        <div class="tc-nav-items-group">
                            ${navsHtml}
                        </div>
                        ${navAddBtnHtml}
                    </div>
                    <div class="tc-nav-panels">
                        ${tabsHtml}
                    </div>
                </div>`;
                break;
        }
        return htmlCode;
    }
    create(tagName) {
        let _this = this;
        $(tagName).each(function () {
            let html = _this.createHtml($(this));
            if (typeof html === 'string') {
                $(html).insertBefore($(this));
                $(this).remove();
            }
        })
    }
}
let TcElements = new TCElements();
/* -----------------------------------------
            Functions Area End
------------------------------------------ */
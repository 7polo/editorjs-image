/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName New Element tag name
 * @param  {Array|string} classNames List or name of CSS class
 * @param  {object} attributes Any attributes
 * @returns {Element}
 */
export const make = (tagName, classNames = null, attributes = {}) => {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
        el.classList.add(...classNames);
    } else if (classNames) {
        el.classList.add(classNames);
    }

    Object.keys(attributes).forEach((attrName) => {
        el[attrName] = attributes[attrName];
    });

    return el;
};

/**
 * 防抖
 * @param fn
 * @param wait
 * @param immediate
 * @returns {(function(...[*]=): void)|*}
 */
export const debounce = (fn, wait = 50, immediate) => {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        if (immediate && !timer) {
            fn.apply(this, args);
        }
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, wait);
    };
};

/**
 * Validates Url
 *
 * @param {string} url Url to validate
 * @returns {boolean} Valid Url
 */
export const isUrl = (url) => {
    const regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

    return regex.test(url);
};

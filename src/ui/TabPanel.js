import {make, isUrl} from '../utils';
import UnsplashTab from "./UnsplashTab";

export default class TabPanel {

    constructor({api, config, cssClasses, onSelectImage, readOnly}) {
        this.api = api;
        this.config = config;
        this.rendered = false;

        this.cssClasses = {
            ...cssClasses,

            tabPanel: 'inline-image__tab-panel',
            tabWrapper: 'inline-image__tab-wrapper',
            tabContent: 'inline-image__content',
            tab: 'inline-image__tab',
            active: 'active',
            show: 'show',

            embedButton: 'inline-image__embed-button',
            search: 'inline-image__search',
            imageGallery: 'inline-image__image-gallery',
            noResults: 'inline-image__no-results',
            imgWrapper: 'inline-image__img-wrapper',
            thumb: 'inline-image__thumb',
        };

        this.onSelectImage = (data) => {
            onSelectImage(data)
            this.destroy()
        };

        this.nodes = {
            el: null, // 顶层节点
            loader: null,
            imageGallery: null,
            searchInput: null,
        };
    }

    /**
     * tab配置
     */
    getTabConfig() {
        return [{
            name: 'URL',
            activated: true,
            content: this.renderEmbedUrlPanel()
        }, {
            name: 'Unsplash',
            content: this.renderUnsplashPanel()
        }]
    }

    render() {
        if (this.rendered) {
            this.focus()
            return
        }
        this.rendered = true
        const wrapper = make('div', this.cssClasses.tabPanel);
        const tabWrapper = make('div', this.cssClasses.tabWrapper);
        wrapper.appendChild(tabWrapper);

        // 渲染tab
        this.tabs = this.getTabConfig()
        this.tabs.forEach(tab => {
            const classNames = [this.cssClasses.tab]
            if (tab.activated) {
                classNames.push(this.cssClasses.active)
                tab.content.classList.add(this.cssClasses.show);
            }

            const tabHeader = make('span', classNames, {
                innerHTML: tab.name,
                onclick: () => this.showTab(tab),
            });
            tab.header = tabHeader
            tabWrapper.appendChild(tabHeader);
            wrapper.appendChild(tab.content);
        });
        wrapper.addEventListener('keyup', (e)=> {
            //此处填写你的业务逻辑即可
            if (e.keyCode == 27) {
                this.destroy()
            }
        })

        this.onDocumentClick = this.onDocumentClick.bind(this)
        document.removeEventListener('click', this.onDocumentClick)
        document.addEventListener('click', this.onDocumentClick, false)

        this.nodes.el = wrapper;
        setTimeout(() => this.focus(), 300)
        return this.nodes.el
    }

    onDocumentClick(event) {
        if (this.nodes.el.contains(event.target)) {
            return
        }
        this.destroy()
    }

    focus() {
        const tab = this.tabs.filter(tab => tab.activated)[0]
        if (!tab) {
            return
        }
        const input = tab.content.querySelector("[contenteditable]")
        input.focus()
    }

    showTab(tab) {
        if (tab === this.tabs.filter(tab => tab.activated)[0]) {
            return
        }
        this.tabs.forEach(item => {
            if (item !== tab) {
                item.activated = false
                item.header.classList.remove(this.cssClasses.active);
                item.content.classList.remove(this.cssClasses.show);
            }
        })
        tab.activated = true
        tab.header.classList.add(this.cssClasses.active);
        tab.content.classList.add(this.cssClasses.show);
        this.focus()
    }

    destroy() {
        if (!this.nodes.el) {
            return
        }
        this.nodes.el.remove()
        this.rendered = false
        document.removeEventListener('click', this.onDocumentClick)
    }

    /**
     * Creates "Embed Url" control panel
     *
     * @returns {HTMLDivElement}
     */
    renderEmbedUrlPanel() {
        const wrapper = make('div', [this.cssClasses.tabContent]);
        const urlInput = make('div', [this.cssClasses.input], {
            id: 'image-url',
            contentEditable: 'plaintext-only'
        });
        const embedImageButton = make('div', [this.cssClasses.embedButton, this.cssClasses.input], {
            id: 'embed-button',
            innerHTML: 'Embed Image',
            onclick: () => {
                const imageUrl = urlInput.innerHTML
                if (isUrl(imageUrl)) {
                    this.onSelectImage({url: imageUrl});
                } else {
                    this.api.notifier.show({
                        message: 'Please enter a valid url.',
                        style: 'error',
                    });
                }
            },
        });

        urlInput.dataset.placeholder = 'Enter image url...';
        wrapper.appendChild(urlInput);
        wrapper.appendChild(embedImageButton);

        return wrapper;
    }

    /**
     * Creates "Unsplash" control panel
     *
     * @returns {HTMLDivElement}
     */
    renderUnsplashPanel() {
        const cssClasses = this.cssClasses
        return new UnsplashTab({
            config: this.config,
            onSelectImage: this.onSelectImage,
            cssClasses
        }).render()
    }
}

import EmbedUrlTabPanel from './tabs/EmbedUrlTabPanel';
import UnsplashTabPanel from './tabs/UnsplashTabPanel';
import {make} from '../common/utils';
import UploadTabPanel from "./tabs/UploadTabPanel";

export default class TabPanel {

    constructor({api, config, onSelectImage}) {
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.rendered = false;
        const cssClasses = {
            tabPanel: 'inline-image__tab-panel',
            tabWrapper: 'inline-image__tab-wrapper',
            tab: 'inline-image__tab',
            tabContent: 'inline-image__content',
            active: 'active',
            show: 'show',

            embedButton: 'inline-image__embed-button',
            search: 'inline-image__search',
            imageGallery: 'inline-image__image-gallery',
            noResults: 'inline-image__no-results',
            imgWrapper: 'inline-image__img-wrapper',
            thumb: 'inline-image__thumb',
        };
        this.cssClasses = cssClasses;

        this.tabs = [{
            name: 'URL',
            activated: true,
            panel: new EmbedUrlTabPanel({api, config, cssClasses, onSelectImage})
        }];

        if (config.upload) {
            this.tabs.push({
                name: 'Upload',
                panel: new UploadTabPanel({api, config, cssClasses, onSelectImage})
            });
        }

        if (config.unsplash) {
            this.tabs.push({
                name: 'Unsplash',
                panel: new UnsplashTabPanel({api, config, cssClasses, onSelectImage})
            });
        }
    }


    render() {
        if (this.rendered) {
            return;
        }

        this.rendered = true;
        const wrapper = make('div', this.cssClasses.tabPanel);
        const tabWrapper = make('div', this.cssClasses.tabWrapper);
        wrapper.appendChild(tabWrapper);
        wrapper.dataset.mutationFree = 'true';

        // 渲染tab
        this.tabs.forEach(tab => {
            const headerClz = [this.cssClasses.tab];
            const contentClz = [this.cssClasses.tabContent];
            if (tab.activated) {
                headerClz.push(this.cssClasses.active);
                contentClz.push(this.cssClasses.show);
            }

            const tabHeader = make('span', headerClz, {
                innerHTML: tab.name,
                onclick: () => this.showTab(tab),
            });
            const tabContent = make('div', contentClz, {});

            tab.header = tabHeader;
            tab.content = tabContent;
            tabWrapper.appendChild(tabHeader);
            tabContent.appendChild(tab.panel.render());

            wrapper.appendChild(tab.content);
        });
        wrapper.addEventListener('keyup', (e) => {
            //此处填写你的业务逻辑即可
            if (e.keyCode === 27) {
                this.destroy();
            }
        });

        this.el = wrapper;
        setTimeout(() => {
            const tab = this.tabs.filter(tab => tab.activated);
            if (tab && tab.panel && tab.panel.focus) {
                tab.panel.focus();
            }
        }, 60);
        // document.body.appendChild(wrapper);
        // 点击事件
        setTimeout(() => {
            document.removeEventListener('click', this.onDocumentClick);
            document.addEventListener('click', this.onDocumentClick);
        }, 100);
        return wrapper;
    }

    showTab(tab) {
        if (tab === this.tabs.filter(tab => tab.activated)[0]) {
            return;
        }
        this.tabs.forEach(item => {
            if (item !== tab) {
                item.activated = false;
                item.header.classList.remove(this.cssClasses.active);
                item.content.classList.remove(this.cssClasses.show);
            }
        });
        tab.activated = true;
        tab.header.classList.add(this.cssClasses.active);
        tab.content.classList.add(this.cssClasses.show);
        if (tab.panel && tab.panel.focus) {
            tab.panel.focus();
        }
    }

    destroy() {
        this.rendered = false;
        document.removeEventListener('click', this.onDocumentClick);
        if (this.el) {
            this.el.remove();
        }
    }

    onDocumentClick(e) {
        if (e.path.indexOf(this.el) === -1) {
            this.destroy();
        }
    }
}

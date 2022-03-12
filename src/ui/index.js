import 'viewerjs/dist/viewer.css';
import {make} from '../common/utils';
import {ICON} from '../common/icon';
import Tunes from './tunes';
import Viewer from 'viewerjs';
import TabPanel from './Tab';

export default class Ui {

    constructor({api, config, readOnly, updateImageData, onTuneToggled,}) {
        this.api = api;
        this.readOnly = readOnly;
        this.updateImageData = updateImageData;

        this.CSS = {
            baseClass: this.api.styles.block,
            loading: this.api.styles.loader,
            input: this.api.styles.input,
            wrapper: 'inline-image',
            imageHolder: 'inline-image__picture',
        };

        this.settings = [
            {
                name: 'withBorder',
                icon: ICON.withBorder,
            },
            {
                name: 'stretched',
                icon: ICON.stretched,
            },
            {
                name: 'withBackground',
                icon: ICON.withBackground,
            },
        ];

        this.tunes = new Tunes({
            cssClasses: {
                settingsButton: this.api.styles.settingsButton,
                settingsButtonActive: this.api.styles.settingsButtonActive,
            },
            settings: this.settings,
            onTuneToggled,
        });

        // 选择面板
        this.tabPanel = new TabPanel({
            api,
            config,
            onSelectImage: (imageData) => this.selectImage(imageData)
        });

        this.nodes = {
            wrapper: null,
            imageHolder: null
        };
    }

    render(data) {
        this.nodes.wrapper = make('div', [this.CSS.baseClass, this.CSS.wrapper]);
        this.nodes.imageHolder = make('div', this.CSS.imageHolder);
        this.applySettings(data);
        this.nodes.wrapper.appendChild(this.nodes.imageHolder);
        if (!data.url) {
            this.showTabPanel();
        }
        this.loadImage(data);
        return this.nodes.wrapper;
    }

    renderSettings(data) {
        return this.tunes.render(data);
    }

    applyTune(tuneName, status) {
        // todo 当前是否存在有效图片
        this.nodes.imageHolder.classList.toggle(`${this.CSS.imageHolder}--${tuneName}`, status);

        if (tuneName === 'stretched') {
            Promise.resolve().then(() => {
                const blockIndex = this.api.blocks.getCurrentBlockIndex();
                this.api.blocks.stretchBlock(blockIndex, status);
            }).catch((err) => {
                console.error(err);
            });
        }
    }

    applySettings(data) {
        this.settings.forEach((tune) => {
            this.applyTune(tune.name, data[tune.name]);
        });
    }

    selectImage(data) {
        this.updateImageData(data);
        this.loadImage(data);
        this.tabPanel.destroy();
    }

    loadImage(data) {
        this.nodes.imageHolder.innerHTML = '';
        if (data.url) {
            const loader = make('div', this.CSS.loading);
            this.nodes.imageHolder.appendChild(loader);
            const imageEl = make('img', 'image__picture__data', {
                src: data.url,
                onload: () => {
                    loader.remove();
                },
                onerror: () => {
                    this.api.notifier.show({
                        message: 'Can not load the image, try again!',
                        style: 'error',
                    });
                    loader.remove();
                    this.showEmptyImage();
                },
                ondblclick: () => this.onImageClick()
            });

            this.nodes.imageHolder.appendChild(imageEl);
            return;
        }
        this.showEmptyImage();
    }

    onImageClick() {
        const viewer = new Viewer(this.nodes.imageHolder, {
            inline: false,
            navbar: false,
            title: false,
            toolbar: {
                zoomIn: 4,
                zoomOut: 4,
                oneToOne: 4,
                reset: 4,
                play: {
                    show: 4,
                    size: 'large',
                },
                rotateLeft: 4,
                rotateRight: 4,
                flipHorizontal: 4,
                flipVertical: 4,
            },
            hidden() {
                viewer.destroy();
            }
        });
        viewer.show();
    }

    showEmptyImage() {
        this.nodes.imageHolder.innerHTML = '';
        const emptyImg = make('div', 'images__empty', {
            contentEditable: true,
            onclick: () => {
                this.showTabPanel();
            }
        });
        emptyImg.innerHTML = `<span>${ICON.empty}</span> <span>添加图片</span>`;
        this.nodes.imageHolder.appendChild(emptyImg);
    }

    showTabPanel() {
        this.nodes.wrapper.appendChild(this.tabPanel.render());
    }
}

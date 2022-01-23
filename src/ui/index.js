import {make} from '../utils';
import {ICON} from '../icon'
import Tunes from './tunes';
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';
import TabPanel from "./TabPanel";

export default class Ui {

    constructor({api, config, readOnly, onAddImageData, onTuneToggled,}) {
        this.api = api;
        this.readOnly = readOnly;
        this.onAddImageData = onAddImageData;

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

        // 选择面板
        this.tabPanel = new TabPanel({
            api,
            config,
            readOnly,
            cssClasses: this.CSS,
            onSelectImage: (imageData) => this.selectImage(imageData),
        });

        this.tunes = new Tunes({
            cssClasses: {
                settingsButton: this.api.styles.settingsButton,
                settingsButtonActive: this.api.styles.settingsButtonActive,
            },
            settings: this.settings,
            onTuneToggled,
        });

        this.nodes = {
            wrapper: null,
            loader: null,
            imageHolder: null,
            image: null,
            empty: null
        };
    }

    render(data) {
        const wrapper = make('div', [this.CSS.baseClass, this.CSS.wrapper]);
        const loader = make('div', this.CSS.loading);
        const empty = make('div', 'images__empty', {
            contentEditable: true,
            onkeydown: (e) => {
                e.preventDefault()
            },
            onclick: (e) => this.emptyClick(e),
        });
        const image = make('img', '', {
            onload: () => this.onImageLoad(),
            onerror: () => this.onImageLoadError(),
            onclick: () => this.onImageClick()
        });

        this.nodes.imageHolder = make('div', this.CSS.imageHolder);

        this.nodes.wrapper = wrapper;
        this.nodes.loader = loader;
        this.nodes.image = image;
        this.nodes.empty = empty;

        this.showEmptyImage(false)
        this.applySettings(data);

        setTimeout(() => {
            this.loadImage(data)
            if (!data.url) {
                this.showTabPanel()
            }
        }, 60)

        return wrapper;
    }

    renderSettings(data) {
        return this.tunes.render(data);
    }

    applyTune(tuneName, status) {
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
        this.onAddImageData(data);
        this.loadImage(data)
    }

    loadImage(data) {
        if (data.url) {
            this.nodes.wrapper.appendChild(this.nodes.loader);
            this.nodes.empty.remove()
            this.nodes.image.src = data.url;
            return
        }
        this.showEmptyImage()
    }

    onImageLoad() {
        this.nodes.imageHolder.prepend(this.nodes.image);
        this.nodes.wrapper.appendChild(this.nodes.imageHolder);
        this.nodes.loader.remove();
    }

    onImageLoadError() {
        setTimeout(() => {
            this.api.notifier.show({
                message: 'Can not load the image, try again!',
                style: 'error',
            });
            this.nodes.loader.remove();
            this.showEmptyImage()
        }, 300)
    }

    // removeCurrentBlock() {
    //     Promise.resolve().then(() => {
    //         const blockIndex = this.api.blocks.getCurrentBlockIndex();
    //         this.api.blocks.delete(blockIndex);
    //     }).catch((err) => {
    //         console.error(err);
    //     });
    // }

    onImageClick() {
        const viewer = new Viewer(this.nodes.image, {
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
            hidden(event) {
                viewer.destroy()
            }
        });
        viewer.show()
    }

    showTabPanel() {
        const tabPanel = this.tabPanel.render();
        if (tabPanel) {
            this.nodes.wrapper.appendChild(tabPanel);
        }
    }

    showEmptyImage(rendered) {
        console.log("xxxx")
        this.nodes.empty.innerHTML = rendered !== false ? `${ICON.empty} <div>添加图片</div>` : `<div> </div>`
        this.nodes.wrapper.appendChild(this.nodes.empty)
    }

    emptyClick(event) {
        if (this.readOnly) {
            return
        }
        event.preventDefault();
        event.stopPropagation();
        this.showTabPanel()
    }
}

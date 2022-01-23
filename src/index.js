import './index.css';
import Ui from './ui';
import {ICON} from './icon'

export default class Image {
    static get toolbox() {
        return {
            title: 'Image',
            icon: ICON.icon
        };
    }

    static get sanitize() {
        return {
            url: {},
            withBorder: {},
            withBackground: {},
            stretched: {}
        };
    }

    static get isReadOnlySupported() {
        return true;
    }

    static get pasteConfig() {
        return {
            patterns: {
                image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png|webp)$/i,
            },
            tags: ['img'],
            files: {
                mimeTypes: ['image/*'],
            },
        };
    }

    /**
     *
     * @param data
     * @param api
     * @param config
     * @param readOnly
     */
    constructor({data, api, config, readOnly}) {
        this.readOnly = readOnly;

        this.data = {
            url: data.url || '',
            withBorder: data.withBorder !== undefined ? data.withBorder : false,
            withBackground: data.withBackground !== undefined ? data.withBackground : false,
            stretched: data.stretched !== undefined ? data.stretched : false
        };

        this.ui = new Ui({
            data,
            api,
            config,
            readOnly,
            onAddImageData: (imageData) => this.addImageData(imageData),
            onTuneToggled: (tuneName) => this.tuneToggled(tuneName),
        });
    }

    render() {
        return this.ui.render(this.data);
    }

    save() {
        return this.data;
    }

    validate(savedData) {
        if (!savedData.url.trim()) {
            return false;
        }
        return true;
    }

    /**
     * Read pasted image and convert it to base64
     *
     * @param {File} file Image file
     * @returns {Promise<InlineImageData>}
     */
    onDropHandler(file) {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        return new Promise((resolve) => {
            reader.onload = (event) => {
                resolve({
                    url: event.target.result
                });
            };
        });
    }

    /**
     * On paste callback that is fired from Editor.
     *
     * @param {PasteEvent} event - event with pasted config
     */
    onPaste(event) {
        // this.ui.showLoader();
        switch (event.type) {
            case 'tag':
                Object.assign(this.data, {
                    url: event.detail.data.src,
                })
                break;
            case 'pattern':
                Object.assign(this.data, {
                    url: event.detail.data,
                })
                break;
            case 'file':
                this.onDropHandler(event.detail.file)
                    .then((data) => {
                        Object.assign(this.data, data)
                    });
                break;
            default:
                break;
        }
    }

    /**
     * Callback for updating data when the image is embedded
     *
     * @param {object} imageData Image data
     */
    addImageData(imageData) {
        if (imageData.url) {
            Object.assign(this.data, imageData)
        }
    }

    /**
     * Makes buttons with tunes: add background, add border, stretch image
     *
     * @return {HTMLDivElement}
     */
    renderSettings() {
        return this.ui.renderSettings(this.data);
    }

    /**
     * Callback fired when Block Tune is activated
     *
     * @param {string} tuneName - tune that has been clicked
     * @returns {void}
     */
    tuneToggled(tuneName) {
        const value = !this.data[tuneName];
        Object.assign(this.data, {[tuneName]: value})
        this.ui.applyTune(tuneName, value);
    }
}
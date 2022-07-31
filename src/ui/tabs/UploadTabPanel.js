import {make} from '../../common/utils';

export default class UploadTabPanel {

    constructor({api, config, onSelectImage}) {
        this.api = api;
        this.config = config;
        this.onSelectImage = onSelectImage;
        this.nodes = {};
    }

    render() {
        const wrapper = make('div');
        this.nodes.input = make('input', ['cdx-input'], {
            type: 'file'
        });

        const embedImageButton = make('div', ['inline-image__embed-button', 'cdx-input'], {
            innerHTML: 'Embed Image',
            onclick: () => {
                const files =  this.nodes.input.files;
                this.config.upload.doUpload(files).then(({url}) => {
                    this.onSelectImage({url});
                });
            }
        });

        this.nodes.input.dataset.placeholder = 'Enter image url...';
        wrapper.appendChild(this.nodes.input);
        wrapper.appendChild(embedImageButton);
        return wrapper;
    }

    focus() {
        this.nodes.input.focus();
    }
}
import {isUrl, make} from '../../common/utils';

export default class EmbedUrlTabPanel {

    constructor({api, config, onSelectImage}) {
        this.api = api;
        this.onSelectImage = onSelectImage;
        this.nodes = {};
    }

    render() {
        const wrapper = make('div');
        this.nodes.input = make('div', ['cdx-input'], {
            contentEditable: 'plaintext-only',
            onkeydown: (e) => {
                e.stopPropagation();
                if (e.keyCode === 13) {
                    e.preventDefault();
                    this.choiceImage();
                    return false;
                }
            },
            onkeyup:(e)=> {
                e.stopPropagation();
            },
            input: (e)=> {
                e.stopPropagation();
            }
        });

        const embedImageButton = make('div', ['inline-image__embed-button', 'cdx-input'], {
            innerHTML: 'Embed Image',
            onclick: () => {
                this.choiceImage();
            }
        });

        this.nodes.input.dataset.placeholder = 'Enter image url...';
        wrapper.appendChild(this.nodes.input);
        wrapper.appendChild(embedImageButton);
        setTimeout(() => this.nodes.input.focus(), 60);
        return wrapper;
    }

    focus() {
        this.nodes.input.focus();
    }

    choiceImage() {
        const imageUrl = this.nodes.input.innerHTML;
        if (isUrl(imageUrl)) {
            this.onSelectImage({url: imageUrl});
        } else {
            this.api.notifier.show({
                message: 'Please enter a valid url.',
                style: 'error',
            });
        }
    }
}
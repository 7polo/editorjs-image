import {debounce, make} from '../../common/utils';

export default class UnsplashTabPanel {

    constructor({api, cssClasses, config, onSelectImage}) {

        this.cssClasses = cssClasses;
        // 只需要
        this.config = config.unsplash;
        this.onSelectImage = onSelectImage;

        this.nodes = {
            el: null,
            searchInput: null,
            imageGallery: null
        };

        this.performSearch = debounce(this.performSearch, 500);
    }

    render() {

        const wrapper = make('div', []);
        const imageGallery = make('div', this.cssClasses.imageGallery);
        const searchInput = make('div', ['cdx-input', this.cssClasses.search], {
            id: 'unsplash-search',
            contentEditable: true,
            oninput: () => this.searchInputHandler(),
        });

        searchInput.dataset.placeholder = 'Search for an image...';

        wrapper.appendChild(searchInput);
        wrapper.appendChild(imageGallery);

        this.nodes.searchInput = searchInput;
        this.nodes.imageGallery = imageGallery;
        this.nodes.el = wrapper;

        imageGallery.addEventListener('click', (e) => {
            if (e.target.classList.contains(this.cssClasses.thumb)) {
                const index = parseInt(e.target.attributes['data-index'].value);
                this.downloadUnsplashImage(this.dataList[index]);
            }
        });

        return wrapper;
    }

    focus() {
        this.nodes.searchInput.focus();
    }

    searchInputHandler() {
        this.showLoader();
        this.performSearch();
    }

    showLoader() {
        this.nodes.imageGallery.innerHTML = '';
        this.nodes.loader = make('div', this.cssClasses.loading);
        this.nodes.imageGallery.appendChild(this.nodes.loader);
    }

    performSearch() {
        if (!this.config.search) {
            return;
        }
        this.config.search(this.nodes.searchInput.innerText).then(results => {
            const dataList = results.data.results.map(image => {
                return {
                    url: image.urls.full,
                    thumb: image.urls.thumb,
                    downloadLocation: image.links.download_location,
                    author: image.user.name,
                    profileLink: image.user.links.html,
                };
            });
            this.appendImagesToGallery(dataList);
            this.dataList = dataList;
        });
    }

    appendImagesToGallery(results) {
        this.nodes.imageGallery.innerHTML = '';
        if (results && results.length) {
            results.forEach((image, index) => {
                this.createThumbImage(image, index);
            });
        } else {
            const noResults = make('div', this.cssClasses.noResults, {
                innerHTML: 'No images found',
            });
            this.nodes.imageGallery.appendChild(noResults);
        }
    }

    createThumbImage(image, index) {
        const imgWrapper = make('div', this.cssClasses.imgWrapper);
        const img = make('img', this.cssClasses.thumb, {src: image.thumb});
        img.dataset.index = index
        imgWrapper.appendChild(img);
        this.nodes.imageGallery.append(imgWrapper);
    }

    downloadUnsplashImage({url}) {
        this.onSelectImage({url});
    }
}
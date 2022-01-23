import {debounce, make} from "../utils";

export default class UnsplashTab {

    constructor({cssClasses, config, onSelectImage}) {
        this.cssClasses = cssClasses

        // 只需要
        this.config = config.unsplash
        this.onSelectImage = onSelectImage

        this.nodes = {
            el: null,
            searchInput: null,
            imageGallery: null
        }

        this.performSearch = debounce(this.performSearch, 500)
    }

    render() {
        const wrapper = make('div', [this.cssClasses.tabContent]);
        const imageGallery = make('div', this.cssClasses.imageGallery);
        const searchInput = make('div', [this.cssClasses.input, this.cssClasses.search], {
            id: 'unsplash-search',
            contentEditable: true,
            oninput: () => this.searchInputHandler(),
        });

        searchInput.dataset.placeholder = 'Search for an image...';

        wrapper.appendChild(searchInput);
        wrapper.appendChild(imageGallery);

        this.nodes.searchInput = searchInput;
        this.nodes.imageGallery = imageGallery;
        this.nodes.el = wrapper
        return wrapper;
    }

    searchInputHandler() {
        console.log("do search")
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
            return
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
            })
            this.appendImagesToGallery(dataList);
        })
    }

    appendImagesToGallery(results) {
        this.nodes.imageGallery.innerHTML = '';
        if (results && results.length) {
            results.forEach((image) => {
                this.createThumbImage(image);
            });
        } else {
            const noResults = make('div', this.cssClasses.noResults, {
                innerHTML: 'No images found',
            });
            this.nodes.imageGallery.appendChild(noResults);
        }
    }

    createThumbImage(image) {
        const imgWrapper = make('div', this.cssClasses.imgWrapper);
        const img = make('img', this.cssClasses.thumb, {
            src: image.thumb,
            onclick: () => this.downloadUnsplashImage(image),
        });

        imgWrapper.appendChild(img);
        this.nodes.imageGallery.append(imgWrapper);
    }

    downloadUnsplashImage({url, author, profileLink, downloadLocation}) {
        this.onSelectImage({
            url
        });
    }
}

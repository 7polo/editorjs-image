# Image
Image Tool for Editor.js 2.0

## Feature
- Embed Url ✌️ 
- Unsplash ✌️
- upload interface
- image viewer ✌️ (use by viewerjs)

embed url
![](./assert/url.png)

upsplash
![](./assert/upsplash.png)

view by click image
![](./assert/view.png)
## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```nodejs
npm i @7polo/editorjs-image
```

```javascript
var editor = EditorJS({
  ...
  tools: {
    ...
    image: {
        class: Image,
            config: {
                unsplash: {
                    search: searchImages
                }
        }
    }
  }
  ...
});
```

## Config Params
| Field          | Type      | Description                     |
| -------------- | --------- | ------------------------------- |
| unsplash.search | function | response from unsplash https://api.unsplash.com/search/photos|

unsplash.search like this
```js
export const searchImages = (query) => {
    console.log("search" + query)

    return axios.get(`https://api.unsplash.com/search/photos`, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': false,
            'Content-Type':'application/x-www-form-urlencoded'
        },
        params: {
            client_id: 'your client_id',
            query
        }
    })
}
```

## Output data

This Tool returns code.

```json
{
  "type" : "image",
  "data" : {
    "url" : "https://www.example.com/image.jpg",
    "withBorder" : false,
    "withBackground" : false,
    "stretched" : true
  }
}
```



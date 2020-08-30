let detectingTranslationBubble;
const detectTranslationBubble = (timesToTry, resolve) => {
  if (timesToTry <= 0) return;
  detectingTranslationBubble = setTimeout(() => {
    const bubble = document.querySelector('.jfk-bubble');
    if (bubble) {
      resolve(bubble);
    } else {
      detectTranslationBubble(timesToTry - 1, resolve);
    }
  }, 500);
};

const waitForTranslationBubble = () => new Promise(resolve => {
  clearTimeout(detectingTranslationBubble);
  detectTranslationBubble(10, resolve);
})

// const addWord = (word, definition) => {
//   chrome.storage.local.get(['words'], result => {
//     chrome.storage.local.set({ words: {
//       ...result.words,
//       [word]: definition,
//     }})
//   });
// }

let imageLink = 'https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_150.jpg';

const addWord = (word, definition, imageLink) => {
    chrome.storage.local.get(['words'], result => {
      chrome.storage.local.set(
          { 
              words: {
                  ...result.words,
                  [word]: {
                    imageLink: imageLink,
                    definition: definition,
                  },
                //   [word]: definition,
              },
          }
      );
    });
  }

const formTemplate = document.createElement('template');
formTemplate.innerHTML = `
  <style>
    hr {
      margin-top: 1.25rem;
    }
    input {
      margin: 0.25rem 0;
    }
    input[type=text] {
      width: 96%;
    }
    input[type=submit] {
      width: 100%;
    }
    img {
        width: 100%;
    }
  </style>
  <form>
    <img src=${imageLink} name='imageUrl' />
    <hr>
    <label>詞語:</label>
    <input type='text' name='word' placeholder='詞語'>
    <br>
    <label>定義:</label>
    <input type='text' name='definition' placeholder='請選取/輸入定義'>
    <br>
    <input type='submit' value='新增字卡'>
  </form>
`;

// ============================================================================
// https://pixabay.com/api/docs/
const imageUrl = "https://pixabay.com/api/";
const apiKey = '1721193-5394d2a2ae3701a0f13d87d72';
// ex https://codepen.io/tigerlen/pen/KVwbrm
// https://pixabay.com/api/?q=cat&image_type=photo&key=1721193-5394d2a2ae3701a0f13d87d72
const onChangeImage = async (keyword) => {
    await fetch(`${imageUrl}?q=${keyword}&image-type=photo&key=${apiKey}`, {
        method: 'GET',
        'Content-Type': 'application/json'
    })
    .then((response) => {
        return response.json();
    })
    .then((payload) => {
        const image = payload.hits[0];
        imageLink = image && image.previewURL;
    });
};

let formContainer;
document.addEventListener('click', async () => {
    const selected = window.getSelection().toString();
    if(!selected) return;
    const bubble = await waitForTranslationBubble();
    if(formContainer && formContainer.parentNode.isConnected) {
        await onChangeImage(selected);
        formContainer.shadowRoot.querySelector('input[name=definition]').value = selected;
        if(imageLink) {
            formContainer.shadowRoot.querySelector('img[name=imageUrl]').src = imageLink;
        }
    } else {
        await onChangeImage(selected);
        formContainer = document.createElement('div');
        const shadow = formContainer.attachShadow({ mode: 'open' });
        const templateCloned =  document.importNode(formTemplate.content, true);
        shadow.appendChild(templateCloned);
        bubble.appendChild(formContainer);

        const form = shadow.querySelector('form');
        form.querySelector('input[name=word]').value = selected;
        form.addEventListener('submit', event => {
            event.preventDefault();
            const word = form.querySelector('[name=word]').value;

            addWord(word, definition, imageLink);

            const submitBtn = form.querySelector('[type=submit]');
            submitBtn.disabled = true;
            submitBtn.value = '已新增';
        });
        if(imageLink) {
            form.querySelector('img[name=imageUrl]').src = imageLink;
        }    
    };
});

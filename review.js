const cardTemplate = document.createElement('template');
cardTemplate.innerHTML = `
<style>
img {
    width: 50%;
}
</style>
  <div class='card'>
    <button class='button button-delete'>X</button>
    <p class='word'></p>
    <p class='definition'></p>
    <img class='image-link' src='' />
  </div>
`;
{/* <img class='image-link' src=${imageLink} /> */}
// ============================================================================
// let imageLink = 'https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_150.jpg';
window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['words'],
    result => {
      console.log('result-->', result);
      if (!result.words)  return;
      const words = Object.keys(result.words || {});
      let wordCount = words.length;
      document.getElementById('words-count').textContent = wordCount;
      
      Object.entries(result.words || {}).forEach(pair => {
        console.log('pair->', pair);
        const cardDOM = document.importNode(cardTemplate.content, true);
        console.log('cardDOM-->', cardDOM);
        cardDOM.querySelector('.word').textContent = pair[0];
        // cardDOM.querySelector('.definition').textContent = pair[1];
        cardDOM.querySelector('.definition').textContent = pair[1].definition;
        cardDOM.querySelector('.image-link').src = pair[1].imageLink;
        imageLink.push(pair[1].imageLink);
        const cardDiv = cardDOM.querySelector('.card');

        cardDOM.querySelector('.button-delete').addEventListener('click', () => {
          delete result.words[pair[0]];
          chrome.storage.local.set({
            words: result.words,
          });
          cardDiv.remove();
          wordCount -= 1;
          document.getElementById('words-count').textContent = wordCount;
        })

        document.getElementById('cards').appendChild(cardDOM);
      });

      document.getElementById('clear').addEventListener('click', () => {
        chrome.storage.local.set({ words: {} });
        wordCount = 0;
        document.getElementById('words-count').textContent = wordCount;
        document.getElementById('cards').innerHTML = '';
      })


    }
  );
});

import axios from 'axios';

function ajaxHeart(e) {
  e.preventDefault();
  axios.post(this.action).then((res) => {
    const isHearted = this.heart.classList.toggle('heart__button--hearted');
    document.querySelector('.heart-count').textContent = res.data.hearts.length;
  }).catch((e) => {
    console.log(e);
  })
}

export default ajaxHeart;

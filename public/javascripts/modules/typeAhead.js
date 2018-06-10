import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(companies) {
  return companies.map(company => {
    const star = company.reviews.length ? '<span class="reviewStar">&#x2605;</span>' : '';
    return `
        <a href="/companies/${company.slug}" class="search__result">
          <span><strong>${company.name}</strong></span>
          <span>${star}Отзывы - ${company.reviews.length}</span>
        </a>
    `;
  }).join('');
};

function typeAhead(search) {
  if(!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.addEventListener('input', function() {
    // If there is no value - quit it!
    if(!this.value) {
      searchResults.style.display = 'none';
      return; // stop!
    };

    //Show the search results!
    searchResults.style.display = 'block';

    const companies = axios.get(`/api/companies/near?lat=55.7&lng=37.6`).then(res => {
      const findMatch = res.data.filter(res => {
        const regex = new RegExp(`${this.value}`, 'gi');
        return res.name.match(regex)
      }).slice(0, 11);
      if (findMatch.length > 0) {
        searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(findMatch));
        return;
      }
      searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">Результатов для ${this.value} не найдено!</div>`);
    }).catch(err => {
      console.log(err);
    });

  });

  // Handle Keyboard Inputs
  searchInput.addEventListener('keyup', (e) => {
    // If they aren't pressing up, down or enter - who cares?!
    if(![38, 40, 13].includes(e.keyCode)) {
      return; // skip it
    }

    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;

    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }

    if (current) {
      current.classList.remove(activeClass);
    }

    next.classList.add(activeClass);

  });
};

export default typeAhead;

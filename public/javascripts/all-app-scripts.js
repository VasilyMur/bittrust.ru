import '../sass/style.scss';

import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

//import calculator from './modules/calculator';
//import btcRate from './modules/btcRate';



autocomplete( document.querySelector('#address'), document.querySelector('#lat'), document.querySelector('#lng'));

typeAhead(document.querySelector('.search'));

makeMap(document.querySelector('#map'));

const heartForms = document.querySelectorAll('form.heart');
heartForms.forEach(form => {
  form.addEventListener('submit', ajaxHeart);
})


//calculator(document.querySelector('form.calculator'));

//btcRate(document.querySelector('.btcUsd'), document.querySelector('.btcRub'));







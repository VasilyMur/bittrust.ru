import axios from 'axios';

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

const btcRate = (fieldUsd, fieldRub) => {
    if (!fieldUsd || !fieldRub) return;

    axios.get('https://api.coindesk.com/v1/bpi/currentprice.json').then(object => {

            //const btcData = document.querySelector('.calculated__for--value');
            const { USD } = object.data.bpi;
            const btcPriceUsd = parseFloat(USD.rate.split(',').join('')).toFixed(2);

            const rub = axios.get('https://api.fixer.io/latest?base=USD').then(object => {
                const btcPriceRub = object.data.rates.RUB * btcPriceUsd;
                fieldRub.innerHTML = `BTC ₽ ${numberWithCommas(btcPriceRub.toFixed(2))}`;

                document.querySelector('.strong-rub').innerHTML = object.data.rates.RUB.toFixed(3);

                return;
            })

    fieldUsd.innerHTML = `BTC $ ${numberWithCommas(btcPriceUsd)}`;


    axios.get('https://blockexplorer.com/api/status?q=getDifficulty').then(object => {

    document.querySelector('input#difficulty').value = object.data.difficulty;

    return;

}).catch((e) => {
    console.log(e)
})

    return;
      
})
.catch((e) => {
    console.log(e);
})

}


export default btcRate;
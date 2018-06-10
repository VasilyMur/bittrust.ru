import axios from 'axios';


const sidebarBtc = (sidebar) => {
    if (!sidebar) return;

    const btcRateSelect = document.querySelector('sidebar .bitcoin .sidebar__currency__rate--usd');
    const ethRateSelect = document.querySelector('sidebar .etherium .sidebar__currency__rate--usd');
    const btcCashRateSelect = document.querySelector('sidebar .bitcoin-cash .sidebar__currency__rate--usd');
    const liteRateSelect = document.querySelector('sidebar .litecoin .sidebar__currency__rate--usd');
    const xrpRateSelect = document.querySelector('sidebar .xrp .sidebar__currency__rate--usd');

    const btcRateRubSelect = document.querySelector('sidebar .bitcoin .sidebar__currency__rate--rub');
    const ethRateRubSelect = document.querySelector('sidebar .etherium .sidebar__currency__rate--rub');
    const btcCashRateRubSelect = document.querySelector('sidebar .bitcoin-cash .sidebar__currency__rate--rub');
    const liteRateRubSelect = document.querySelector('sidebar .litecoin .sidebar__currency__rate--rub');
    const xrpRateRubSelect = document.querySelector('sidebar .xrp .sidebar__currency__rate--rub');


   
    const rates = axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,LTC,BCH,XRP&tsyms=USD').then(res => {
        const btcRate = res.data.BTC.USD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const ethRate = res.data.ETH.USD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const bchRate = res.data.BCH.USD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const ltcRate = res.data.LTC.USD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const xrpRate = res.data.XRP.USD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        btcRateSelect.innerHTML = btcRate;
        ethRateSelect.innerHTML = ethRate;
        btcCashRateSelect.innerHTML = bchRate;
        liteRateSelect.innerHTML = ltcRate;
        xrpRateSelect.innerHTML = xrpRate;

        const rub = axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,LTC,BCH,XRP&tsyms=RUB').then(res => {
            const btcRate = res.data.BTC.RUB;
            const ethRate = res.data.ETH.RUB;
            const bchRate = res.data.BCH.RUB;
            const ltcRate = res.data.LTC.RUB;
            const xrpRate = res.data.XRP.RUB;

            function numberWithCommas(x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }

            btcRateRubSelect.innerHTML = `₽${numberWithCommas(btcRate)}`;
            ethRateRubSelect.innerHTML = `₽${numberWithCommas(ethRate)}`;
            btcCashRateRubSelect.innerHTML = `₽${numberWithCommas(bchRate)}`;
            liteRateRubSelect.innerHTML = `₽${numberWithCommas(ltcRate)}`;
            xrpRateRubSelect.innerHTML = `₽${numberWithCommas(xrpRate)}`;

        }).catch(err => {
            console.log(err)
        })
        
        
    }).catch(err => {
        console.log(err);
    })

}












export default sidebarBtc;
import axios from 'axios';

function calculator(calculator) {

    if(!calculator) return;

    calculator.addEventListener('submit', calculate);

    function calculate(e) {

        e.preventDefault();
    
    
            // BITCOIN PRICE USD
            const btc = axios.get('https://api.coindesk.com/v1/bpi/currentprice.json').then(object => {

                
                const { USD } = object.data.bpi;

                
                const hash = document.querySelector('input#hashRate').value;
                const power =document.querySelector('input#watts').value;
                const cost = document.querySelector('input#powerCost').value;
                const difficulty = document.querySelector('input#difficulty').value;
                //const reward = document.querySelector('input#blockReward').value;
                
                const btcRateRaw = USD.rate;
                const btcRate = parseFloat(btcRateRaw.split(',').join('')).toFixed(2);

                //Coins Per Day
                const coinsPerDayRaw = 12.5 * (86400 / ( difficulty * (Math.pow(2, 32) / (hash * 1000000000))))
                const coinsPerDay = coinsPerDayRaw.toFixed(6);
            

                const powerCostDayRaw = power / 1000 * 24 * cost;
                const powerCostDay = powerCostDayRaw.toFixed(2);
                
        
                //Profit per Day
                const profitPerDayRaw =  coinsPerDay * btcRate - powerCostDay;
                const profitPerDay = profitPerDayRaw.toFixed(2);
                

                //Profit per Month
                const profitPerMonthRaw = profitPerDay * 30
                const profitPerMonth = profitPerMonthRaw.toFixed(2);

                const profitRatioPerDayRaw = profitPerDay / powerCostDay * 100;
                const profitRatioPerDay = profitRatioPerDayRaw.toFixed();

                
                function negative(value) {
                    const headerDiv = document.querySelectorAll('.header__values--details');
                    const headerLabel = document.querySelectorAll('.value__label');
                    const headerNum = document.querySelectorAll('.value__content');
                    const bodyMain = document.querySelectorAll('.firstone');
                    const periodName = document.querySelectorAll('.calculations__data--name');
                    const periodValue = document.querySelectorAll('.calculations__data--value');

                    if (value < 0 ) {

                        headerDiv.forEach(header => {
                            header.style.cssText = "border-color: #E29090; background: #FFE0E0";
                        });

                        headerLabel.forEach(label => {
                            label.style.cssText = "color: #B13737";
                        });
                        
                        headerNum.forEach(num => {
                            num.style.cssText = "color: #B13737";
                        });

                        bodyMain.forEach(body => {
                            body.style.cssText = "background: #F15C5C; border-color: #B13737";
                        });

                        periodName.forEach(name => {
                            name.style.cssText = "background: #C14848; border: 2px solid #C14848";
                        });

                        periodValue.forEach(value => {
                            value.style.cssText = "color: #B13737";
                        });

                    } else {
                        
                        headerDiv.forEach(header => {
                            header.style.cssText = "";
                        })

                        headerLabel.forEach(label => {
                            label.style.cssText = "";
                        })

                        headerNum.forEach(num => {
                            num.style.cssText = "";
                        });

                        bodyMain.forEach(body => {
                            body.style.cssText = "";
                        });

                        periodName.forEach(name => {
                            name.style.cssText = "";
                        });

                        periodValue.forEach(value => {
                            value.style.cssText = "";
                        });
             
                    }
                }

                negative(profitRatioPerDay);


                // DATA BODY PER WEEK
                const profitPerWeekRaw = profitPerDay * 7;
                const profitPerWeek= profitPerWeekRaw.toFixed(2);

                const powerCostPerWeekRaw = powerCostDay * 7;
                const powerCostPerWeek = powerCostPerWeekRaw.toFixed(2);

                const minedPerWeekRaw = coinsPerDay * 7;
                const minedPerWeek = minedPerWeekRaw.toFixed(6);

                 // DATA BODY PER MONTH
                 const minedPerMonthRaw = coinsPerDay * 30;
                 const minedPerMonth = minedPerMonthRaw.toFixed(6);

                 const powerCostPerMonthRaw = powerCostDay * 30;
                 const powerCostPerMonth = powerCostPerMonthRaw.toFixed(2);

                  // DATA BODY PER YEAR

                const profitPerYear = profitPerMonth * 12;
                const minedPerYear = minedPerMonth * 12;
                const powerCostPerYear = powerCostPerMonth * 12;

                // Data OutPut Header
                //Profit Costs Ratio
                document.querySelector('.profitRatio').innerHTML = `${profitRatioPerDay}%`;
                // Profit per Month
                document.querySelector('.profitMonth').innerHTML = `$${profitPerMonth}`;

                // Data OutPut Body - DAY
                document.querySelector('.profitPerDay').innerHTML = `$${profitPerDay}`;
                document.querySelector('.minedPerDay').innerHTML = `Ƀ ${coinsPerDay}`;
                document.querySelector('.costPerDay').innerHTML = `$${powerCostDay}`;

                 // Data OutPut Body - WEEK
                 document.querySelector('.profitPerWeek').innerHTML = `$${profitPerWeek}`;
                 document.querySelector('.minedPerWeek').innerHTML = `Ƀ ${minedPerWeek}`;
                 document.querySelector('.costPerWeek').innerHTML = `$${powerCostPerWeek}`;

                  // Data OutPut Body - MONTH
                  document.querySelector('.profitPerMonth').innerHTML = `$${profitPerMonth}`;
                  document.querySelector('.minedPerMonth').innerHTML = `Ƀ ${minedPerMonth}`;
                  document.querySelector('.costPerMonth').innerHTML = `$${powerCostPerMonth}`;

                 // Data OutPut Body - YEAR
                 document.querySelector('.profitPerYear').innerHTML = `$${profitPerYear.toFixed(2)}`;
                 document.querySelector('.minedPerYear').innerHTML = `Ƀ ${minedPerYear.toFixed(6)}`;
                 document.querySelector('.costPerYear').innerHTML = `$ ${powerCostPerYear.toFixed(2)}`;

                // RUB VALUES
                const usd = axios.get('http://data.fixer.io/api/latest?access_key=0d4ec61383a12922d78ca24bb4e74bb7&latest?base=USD').then(object => {
                    const profitPerDayRub = object.data.rates.RUB * profitPerDay;
                    const powerCostDayRub = object.data.rates.RUB * powerCostDay;
                    const profitMonthRub = object.data.rates.RUB * profitPerMonth;
                    const profitWeekRub = object.data.rates.RUB * profitPerWeek;
                    const powerCostPerWeekRub = object.data.rates.RUB * powerCostPerWeek;
                    const powerCostPerMonthRub = object.data.rates.RUB * powerCostPerMonth;
                    const profitPerYearRub = object.data.rates.RUB * profitPerYear;
                    const powerCostPerYearRub = object.data.rates.RUB * powerCostPerYear;


                    // Data OutPut Body - DAY RUB
                    document.querySelector('.profitPerDayRub').innerHTML = `₽${profitPerDayRub.toFixed(2)}`;
                    document.querySelector('.costPerDayRub').innerHTML = `₽${powerCostDayRub.toFixed()}`;
                    document.querySelector('.profitMonthRub').innerHTML = `₽${profitMonthRub.toFixed()}`;

                    // Data OutPut Body - WEEK RUB
                    document.querySelector('.profitPerWeekRub').innerHTML = `₽${profitWeekRub.toFixed(2)}`;
                    document.querySelector('.costPerWeekRub').innerHTML = `₽${powerCostPerWeekRub.toFixed()}`;

                    // MONTH
                    document.querySelector('.profitPerMonthRub').innerHTML = `₽${profitMonthRub.toFixed()}`;
                    document.querySelector('.costPerMonthRub').innerHTML = `₽${powerCostPerMonthRub.toFixed()}`;

                    //YEAR
                    document.querySelector('.profitPerYearRub').innerHTML = `₽${profitPerYearRub.toFixed()}`;
                    document.querySelector('.costPerYearRub').innerHTML = `₽${powerCostPerYearRub.toFixed()}`;


                    return;

                }).catch((e) => {
                    console.log(e);
                })

                return;

            }).catch((e) => {
                console.log(e);
            })


    }

}

export default calculator;
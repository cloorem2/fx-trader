const fs = require('fs');
const api_key = 'Bearer ' + fs.readFileSync('../oanda-api-key','utf8');
// const aid = '07afd98345dceef561b6951f1a5c3e58-145c1f41964b7111a60734171feb60b6';
// fs.writeFileSync('../oanda-api-key', aid);

const account_id = fs.readFileSync('../oanda-account-id','utf8');
// const aid = '001-001-9530466-002';
// fs.writeFileSync('../oanda-account-id', aid);

const base = 'https://api-fxtrade.oanda.com';
const accounts_url = base + '/v3/accounts/';
// const account_url = accounts_url + encodeURIComponent(account_id);
const account_url = accounts_url + account_id;
const pricing_url = account_url + '/pricing?instruments=EUR_USD';
const candle_url = account_url + '/instruments/EUR_USD/candles'
  + '?granularity=S5&count=2'
  ;

const inst_url = account_url + '/instruments';
const stream_base = 'https://stream-fxtrade.oanda.com';
const stream_url = stream_base + '/v3/accounts/' + account_id
  + '/pricing/stream?instruments=EUR_USD';
const fetch_opts = {
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  }
};

console.log(account_url);
async function doMain() {
  try {
    const res = await fetch(inst_url, fetch_opts);
    const result = await res.json();
    // console.log(result);
    var maxli = '',maxl = 0;
    var maxsi = '',maxs = 0;
    const tfin = {};
    for (var i in result.instruments) {
      const ii = result.instruments[i];
      /*
      const uname = ii.name.slice(0,3);
      const dname = ii.name.slice(4,7);
      // console.log(ii.name + ' ' + dname);
      if (typeof tfin[uname] == 'undefined')
        tfin[uname] = 0;
      if (typeof tfin[dname] == 'undefined')
        tfin[dname] = 0;
      tfin[uname] += Number(ii.financing.longRate);
      tfin[dname] -= Number(ii.financing.longRate);
      tfin[uname] -= Number(ii.financing.shortRate);
      tfin[dname] += Number(ii.financing.shortRate);
      */
      // console.log(tfin);
      // console.log(ii);
      // console.log(ii.financing);
      console.log(ii.name
        + ' ' + ii.financing.longRate
        + ' ' + ii.financing.shortRate
      );
      if (Number(ii.financing.longRate) > maxl) {
        maxl = Number(ii.financing.longRate);
        maxli = ii.name;
      }
      if (Number(ii.financing.shortRate) > maxs) {
        maxs = Number(ii.financing.shortRate);
        maxsi = ii.name;
      }
    }
    console.log('maxl ' + maxli + ' ' + maxl);
    console.log('maxs ' + maxsi + ' ' + maxs);
    /*
    maxl = 0; maxs = 0;
    for (var i in tfin) {
      if (tfin[i] > maxl) {
        maxl = tfin[i];
        maxli = i;
      }
      if (tfin[i] < maxs) {
        maxs = tfin[i];
        maxsi = i;
      }
    }
    console.log('maxl ' + maxli + ' ' + maxl);
    console.log('maxs ' + maxsi + ' ' + maxs);
    */
    // for (var i in result.candles) {
      // console.log(result.candles[i]);
    // }
  } catch (err) {
    console.error('Error: ', err);
  }
}

doMain();

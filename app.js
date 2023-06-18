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
    const res = await fetch(stream_url, fetch_opts);
    const result = await res.json();
    console.log(result);
    // for (var i in result.candles) {
      // console.log(result.candles[i]);
    // }
  } catch (err) {
    console.error('Error: ', err);
  }
}

doMain();

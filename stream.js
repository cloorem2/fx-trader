const fs = require('fs');
const https = require('https');
const api_key = 'Bearer ' + fs.readFileSync('../oanda-api-key','utf8');
const account_id = fs.readFileSync('../oanda-account-id','utf8');
const stream_path = '/v3/accounts/' + account_id
  + '/pricing/stream?instruments=EUR_USD';
var options = {
  host: 'stream-fxtrade.oanda.com',
  path: stream_path,
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  },
};

const transaction_path = '/v3/accounts/' + account_id + '/transactions/stream';
const transaction_options = {
  host: 'stream-fxtrade.oanda.com',
  path: transaction_path,
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  },
}

const summary_path = '/v3/accounts/' + account_id;
const sum_options = {
  host: 'api-fxtrade.oanda.com',
  path: summary_path,
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  },
};

const order_path = '/v3/accounts/' + account_id + '/orders';
const order_options = {
  host: 'api-fxtrade.oanda.com',
  path: order_path,
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  },
}
const get_order_options = {
  host: 'api-fxtrade.oanda.com',
  path: order_path,
  method: 'GET',
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  },
}

var maxb = Number(fs.readFileSync('maxb','utf8'));
var maxa = Number(fs.readFileSync('maxa','utf8'));
var maxb_short = Number(fs.readFileSync('maxb_short','utf8'));
var maxa_short = Number(fs.readFileSync('maxa_short','utf8'));
var maxb_long = Number(fs.readFileSync('maxb_long','utf8'));
var maxa_long = Number(fs.readFileSync('maxa_long','utf8'));
var maxb_mid = Number(fs.readFileSync('maxb_mid','utf8'));
var maxa_mid = Number(fs.readFileSync('maxa_mid','utf8'));
var aspread = Number(fs.readFileSync('aspread','utf8'));
var chunk_save = '';

var sdelay = 2; // Number(fs.readFileSync('sdelay','utf8'));
var oh0 = Number(fs.readFileSync('oh0','utf8'));
var om0 = Number(fs.readFileSync('om0','utf8'));
var os0 = Number(fs.readFileSync('os0','utf8'));
var oh1 = 0; // Number(fs.readFileSync('oh1','utf8'));
var om1 = 0; // Number(fs.readFileSync('om1','utf8'));
var os1 = 0; // Number(fs.readFileSync('os1','utf8'));
var oh2 = 0; // Number(fs.readFileSync('oh2','utf8'));
var om2 = 0; // Number(fs.readFileSync('om2','utf8'));
var os2 = 0; // Number(fs.readFileSync('os2','utf8'));

var linec = 0;
var dmid_brain = [0,0,0,0,0,0];
const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
const dmid_brain_lines = dmid_brain_data.split('\n');
for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

var fb_dmid_brain = [0,0,0,0,0,0];
const fb_dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
const fb_dmid_brain_lines = fb_dmid_brain_data.split('\n');
for (var i in fb_dmid_brain) fb_dmid_brain[i] = Number(fb_dmid_brain_lines[i]);

var pvar_brain = [0,0,0,0,0,0];
const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
const pvar_brain_lines = pvar_brain_data.split('\n');
for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);

var fb_pvar_brain = [0,0,0,0,0,0];
const fb_pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
const fb_pvar_brain_lines = fb_pvar_brain_data.split('\n');
for (var i in fb_pvar_brain) fb_pvar_brain[i] = Number(fb_pvar_brain_lines[i]);

var sell_brain = [0,0,0,0,0,0];
const sell_brain_data = fs.readFileSync('sell_brain','utf8');
const sell_brain_lines = sell_brain_data.split('\n');
for (var i in sell_brain) sell_brain[i] = Number(sell_brain_lines[i]);

var buy_brain = [0,0,0,0,0,0];
const buy_brain_data = fs.readFileSync('buy_brain','utf8');
const buy_brain_lines = buy_brain_data.split('\n');
for (var i in buy_brain) buy_brain[i] = Number(buy_brain_lines[i]);

var v = [1,1,1,1,1,1],nv = [0,0,0,0,0,0];
var latest_v = [1,1,1,1,1,1],latest_nv = [0,0,0,0,0,0];
try {
  const v_data = fs.readFileSync('main_vec','utf8');
  const v_lines = v_data.split('\n');
  for (var i in latest_v) latest_v[i] = Number(v_lines[i]);
} catch {}

var apvar = Number(fs.readFileSync('apvar','utf8'));
var my_apvar = Number(fs.readFileSync('apvar','utf8'));
var pvarp = apvar;
var aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
var my_aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
// var pdmidp = aadmidp;
var sellm = Number(fs.readFileSync('sellm','utf8'));
var sellf = Number(fs.readFileSync('sellf','utf8'));
var sellf2 = Number(fs.readFileSync('sellf2','utf8'));
var levx = Number(fs.readFileSync('opt_levx','utf8'));
// levx /= 5;
var pos = Number(fs.readFileSync('pos','utf8'));
var nav = Number(fs.readFileSync('nav','utf8'));

var nav_withdraw = 0;
try { nav_withdraw = Number(fs.readFileSync('nav_withdraw','utf8')); }
catch {}

var nav_mark = Number(fs.readFileSync('nav_mark','utf8'));
var withdraw_not_ready = Number(fs.readFileSync('withdraw_not_ready','utf8'));

var omidp = (maxa + maxb) / 2;
var current_ask = Number(fs.readFileSync('current_ask','utf8'));
var current_bid = Number(fs.readFileSync('current_bid','utf8'));

var order_id = 0;
// try { order_id = Number(fs.readFileSync('order_id','utf8')); } catch {}
var sell_order_id = Number(fs.readFileSync('sell_order_id','utf8'));
var buy_order_id = Number(fs.readFileSync('buy_order_id','utf8'));

var mutex = Promise.resolve();
var mutexc = 0;
var max_mutexc = 0;

var order_price = 0;
var order_size = 0;
var trade_str = '';

var buyp = 0,sellp = 0;
var buy_size = 0,sell_size = 0;
const miss_counts = [0,0,0,0];

var buy_order_touch = Number(fs.readFileSync('buy_order_touch','utf8'));
var sell_order_touch = Number(fs.readFileSync('sell_order_touch','utf8'));

var apdmidp = Number(fs.readFileSync('apdmidp','utf8'));
var apvarp = Number(fs.readFileSync('apvarp','utf8'));

// var nav_time = Number(fs.readFileSync('nav_time','utf8'));
var adnav = Number(fs.readFileSync('adnav','utf8'));
var onav = 0;

function doSummary() {
  console.log('doSummary');
  var clean_chunk = '';
  var req = https.request(sum_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      // console.log(clean_chunk);
      try {
        const data = JSON.parse(clean_chunk);
        pos = 0;
        nav = Number(data.account.NAV);
        nav -= nav_withdraw;
        const positions = data.account.positions;
        for (var ii in positions) {
          console.log(positions[ii]);
          if (positions[ii].instrument == 'EUR_USD') {
            pos += Number(positions[ii].long.units);
            nav -= Number(positions[ii].long.unrealizedPL);
            pos += Number(positions[ii].short.units);
            nav -= Number(positions[ii].short.unrealizedPL);
          }
        }
        fs.writeFileSync('nav',nav.toExponential(9) + '\n');
        fs.writeFileSync('pos',pos.toFixed() + '\n');
        if (nav_mark == 0) {
          nav_mark = nav;
          fs.writeFileSync('nav_mark',nav_mark.toExponential(9) + '\n');
        }
        // console.log('total pos ' + pos);
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write('data\n');
  req.end();
}

function doTransactions() {
  console.log('doTransactions');
  var req = https.request(transaction_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      var str_save = '';
      var lines = chunk.split('\n');
      for (var i in lines) {
        if (lines[i].length == 0) continue;
        try {
          const tstr = str_save + lines[i];
          const data = JSON.parse(tstr);
          str_save = '';
          mutexc++;
          if (mutexc <= 1) {
            // console.log('rejecting ' + gcount);
            // gcount = 0;
            Promise.reject(mutex).catch(() => {});
            // Promise.reject(mutex).catch((err) => { console.log(err); });
            // mutex = Promise.resolve();
          }
          // console.log('tran mutexc ' + mutexc);
          mutex = mutex.then(async () => {
            await doTransData(data);
            mutexc--;
          }, (err) => { console.log('caught tran mutex err here ' + err); }
          ).catch((err) => { console.log('caught trans mutex err ' + err);
          // }).finally(async () => {
            // if (mutexc > 0) console.log('got mutexc ' + mutexc);
          });
        } catch (err) {
          str_save += lines[i];
        }
      }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write('data\n');
  req.end();
}

async function doTransData(data) {
  clearTimeout(transTimeout);
  transTimeout = setTimeout(() => { doTransactions(); }, 100000);
  if (data.type == 'ORDER_FILL') {
    if (Number(data.orderID) == sell_order_id) {
      sell_order_id = 0;
      fs.writeFileSync('sell_order_id',sell_order_id + '\n');
    } else if (Number(data.orderID) == buy_order_id) {
      buy_order_id = 0;
      fs.writeFileSync('buy_order_id',buy_order_id + '\n');
    } else {
      console.log('so wtf is this');
      console.log(data);
    }

    if (withdraw_not_ready == 1) {
      console.log('withdraw ready');
      withdraw_not_ready = 0;
      fs.writeFileSync('withdraw_not_ready',withdraw_not_ready + '\n');
    }
    const tnav = Number(data.accountBalance) - nav_withdraw;
    /*
    if (tnav > nav) {
      const d = (tnav - nav) / nav / 10;
      sdelay /= 1 + d;
      fs.writeFileSync('sdelay',sdelay.toExponential(9) + '\n');
    } else {
      const d = (tnav - nav) / nav;
      sdelay /= 1 + d;
      fs.writeFileSync('sdelay',sdelay.toExponential(9) + '\n');
    }
    */
    nav = tnav;


    if (nav > 4 * nav_mark) {
      nav_withdraw += nav * 0.5;
      fs.writeFileSync('nav_withdraw',nav_withdraw.toExponential(4) + '\n');
      nav *= 0.5;
      nav_mark = nav;
      fs.writeFileSync('nav_mark',nav_mark.toExponential(9) + '\n');
      withdraw_not_ready = 1;
      fs.writeFileSync('withdraw_not_ready',withdraw_not_ready + '\n');
      console.log('withdrawing ' + (nav * 0.25).toFixed(2)
        + ' to new mark ' + nav_mark.toFixed(2));
    }
    fs.writeFileSync('nav',nav.toExponential(9) + '\n');
    pos += Number(data.units);
    if (Number(data.units) > 0)
      console.log('filled at ' + data.price + '  ' + data.units + ' pos ' + pos);
    else
      console.log('filled at ' + data.price + ' ' + data.units + ' pos ' + pos);
    // console.log('new pos ' + pos);
    fs.writeFileSync('pos',pos.toFixed() + '\n');
    fs.appendFileSync('last_order_fill',JSON.stringify(data) + '\n');
    // console.log('order fill data');
    // console.log(data);
    fs.appendFileSync('last_trans','------fill--\n');
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'HEARTBEAT') return;
  if (data.type == 'MARKET_IF_TOUCHED_ORDER') {
    if (Number(data.units) > 0) {
      if (buy_order_id == Number(data.id)) {
        // okay
      } else {
        buy_order_id = Number(data.id);
        fs.writeFileSync('buy_order_id',buy_order_id + '\n');
        buy_order_touch = 1;
        fs.writeFileSync('buy_order_touch',buy_order_touch + '\n');
        // console.log('catching buy_order_id ' + buy_order_id + ' in trans');
      }
    } else {
      if (sell_order_id == Number(data.id)) {
        // okay
      } else {
        sell_order_id = Number(data.id);
        fs.writeFileSync('sell_order_id',sell_order_id + '\n');
        sell_order_touch = 1;
        fs.writeFileSync('sell_order_touch',sell_order_touch + '\n');
        // console.log('catching sell_order_id ' + sell_order_id + ' in trans');
      }
    }
    fs.writeFileSync('last_touch_order',JSON.stringify(data) + '\n');
    fs.appendFileSync('last_trans','------touch-\n');
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'LIMIT_ORDER') {
    // order_id = Number(data.id);
    // fs.writeFileSync('order_id',order_id + '\n');
    if (Number(data.units) > 0) {
      if (buy_order_id == Number(data.id)) {
        // okay
      } else {
        buy_order_id = Number(data.id);
        fs.writeFileSync('buy_order_id',buy_order_id + '\n');
        buy_order_touch = 0;
        fs.writeFileSync('buy_order_touch',buy_order_touch + '\n');
        // console.log('catching buy_order_id ' + buy_order_id + ' in trans');
      }
    } else {
      if (sell_order_id == Number(data.id)) {
        // okay
      } else {
        sell_order_id = Number(data.id);
        fs.writeFileSync('sell_order_id',sell_order_id + '\n');
        sell_order_touch = 0;
        fs.writeFileSync('sell_order_touch',sell_order_touch + '\n');
        // console.log('catching sell_order_id ' + sell_order_id + ' in trans');
      }
    }
    fs.writeFileSync('last_limit_order',JSON.stringify(data) + '\n');
    fs.appendFileSync('last_trans','------limit-\n');
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'TRANSFER_FUNDS') {
    nav = Number(data.accountBalance);
    onav = nav;
    nav_withdraw = 0;
    nav_mark = nav;
    fs.writeFileSync('nav',nav.toExponential(9) + '\n');
    fs.writeFileSync('nav_withdraw',nav_withdraw.toExponential(4) + '\n');
    fs.writeFileSync('nav_mark',nav_mark.toExponential(9) + '\n');
    return;
  }
  if (data.type == 'DAILY_FINANCING') {
    console.log(data);
    return;
  }
  if (data.type == 'ORDER_CANCEL') {
    if (data.reason == 'CLIENT_REQUEST_REPLACED') {
    } else if (data.reason == 'CLIENT_REQUEST') {
      // console.log('got trans order cancel client request');
      // console.log(data);
    } else {
      console.log('here is the other cancel');
      console.log(data);
      doSummary();
      doShowOrders();
      /*
      if (Number(data.orderID) == buy_order_id) {
        console.log('should order the buy');
        doOrder(buyp,buy_size);
      }
      if (Number(data.orderID) == sell_order_id) {
        console.log('should order the sell');
        doOrder(sellp,-sell_size);
      }
      */
    }
    fs.writeFileSync('last_order_cancel',JSON.stringify(data) + '\n');
    fs.appendFileSync('last_trans','------cancel\n');
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'ORDER_CANCEL_REJECT') {
    // console.log('got trans cancel reject');
    // fs.writeFileSync('last_order_cancel_reject',JSON.stringify(data) + '\n');
    fs.appendFileSync('last_trans','------reject\n');
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'ORDER_CLIENT_EXTENSIONS_MODIFY') {
    // have not figured out why these are here now and weren't before
    return;
  }
  if (data.type == 'TRADE_CLIENT_EXTENSIONS_MODIFY') {
    // have not figured out why these are here now and weren't before
    return;
  }
  console.log('transactions data');
  console.log(data);
  fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
}

var main_json = '';
var gcount = 0;
function doMain() {
  console.log('doMain ' + new Date());
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      for (var i in lines) {
        if (lines[i].length == 0) continue;
        try {
          main_json += lines[i];
          const data = JSON.parse(main_json);
          main_json = '';
          mutexc++;
          if (mutexc <= 1) {
            // console.log('rejecting ' + gcount);
            // gcount = 0;
            Promise.reject(mutex).catch(() => {});
            // Promise.reject(mutex).catch();
            // mutex = Promise.resolve();
          }
          // console.log('main mutexc ' + mutexc);
          mutex = mutex.then(async () => {
            await doChunk(data);
            mutexc--;
          }, (err) => { console.log('caught main mutex err here ' + err); }
          ).catch((err) => { console.log('caught mains mutex err ' + err);
            console.log(data);
          // }).finally(async () => {
            // if (mutexc > 0) console.log('got mutexc ' + mutexc);
          });
        } catch (e) { console.log(e);
          console.log('doMain bad chunk ' + main_json);
          main_json = '';
        }
      }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write('data\n');
  req.end();
}

async function doChunk(data) {
  clearTimeout(mainTimeout);
  mainTimeout = setTimeout(() => { doMain(); }, 100000);
  if (data.type != 'PRICE') { return; }
  current_bid = Number(data.bids[0].price);
  current_ask = Number(data.asks[0].price);
  if (current_bid > maxb) maxb = current_bid;
  if (current_ask < maxa) maxa = current_ask;

  const [t0,t1] = data.time.split('T');
  const [t2] = t1.split('Z');
  const [h0,m0,s0] = t2.split(':');
  const [s1] = s0.split('.');

  const nh0 = Number(h0);
  const nm0 = Number(m0);
  const ns0 = Number(s0);
  const th0 = nh0 < oh0 ? nh0 + 24 - oh0 : nh0 - oh0;
  const tdelay = th0 * 60 * 60 + (nm0 - om0) * 60 + (ns0 - os0);
  if (tdelay >= sdelay) await doMadeDelay(nh0,nm0,ns0);

  if (current_bid > maxb_mid) maxb_mid = current_bid;
  if (current_ask < maxa_mid) maxa_mid = current_ask;
  const spread = 2 * (current_ask - current_bid) / (current_ask + current_bid);
  const pvar_mid = 2 * (maxb_mid - maxa_mid) / (maxb_mid + maxa_mid);
  if (pvar_mid >= 2 * spread) await doMadeMidDelay(nh0,nm0,ns0);

  if (current_bid > maxb_short) maxb_short = current_bid;
  if (current_ask < maxa_short) maxa_short = current_ask;
  const pvar_short = 2 * (maxb_short - maxa_short) / (maxb_short + maxa_short);
  if (pvar_short >= spread) await doMadeShortDelay(nh0,nm0,ns0);

  if (current_bid > maxb_long) maxb_long = current_bid;
  if (current_ask < maxa_long) maxa_long = current_ask;
  const pvar_long = 2 * (maxb_long - maxa_long) / (maxb_long + maxa_long);
  if (pvar_long >= 3 * spread) await doMadeLongDelay(nh0,nm0,ns0);

  fs.writeFileSync('current_ask',current_ask + '\n');
  fs.writeFileSync('current_bid',current_bid + '\n');
  fs.writeFileSync('maxa',maxa.toFixed(6) + '\n');
  fs.writeFileSync('maxb',maxb.toFixed(6) + '\n');
  fs.writeFileSync('maxa_short',maxa_short.toFixed(6) + '\n');
  fs.writeFileSync('maxb_short',maxb_short.toFixed(6) + '\n');
  fs.writeFileSync('maxa_long',maxa_long.toFixed(6) + '\n');
  fs.writeFileSync('maxb_long',maxb_long.toFixed(6) + '\n');
  fs.writeFileSync('maxa_mid',maxa_mid.toFixed(6) + '\n');
  fs.writeFileSync('maxb_mid',maxb_mid.toFixed(6) + '\n');

  var time_str = '';
  if (nh0 < 10) time_str += '0';
  time_str += nh0.toFixed() + ':';
  if (nm0 < 10) time_str += '0';
  time_str += nm0.toFixed() + ':';
  if (ns0 < 9.5) time_str += '0';
  time_str += ns0.toFixed();
  var new_pstr = time_str
    + ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + '\n';
  fs.appendFileSync('ticks',new_pstr);
}

async function doMadeMidDelay( nh0,nm0,ns0 ) {
  var time_str = '';
  if (nh0 < 10) time_str += '0';
  time_str += nh0.toFixed() + ':';
  if (nm0 < 10) time_str += '0';
  time_str += nm0.toFixed() + ':';
  if (ns0 < 9.5) time_str += '0';
  time_str += ns0.toFixed();
  var new_pstr = time_str
    + ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + ' ' + maxb_mid.toFixed(5)
    + ' ' + maxa_mid.toFixed(5)
    + '\n';
  fs.appendFileSync('plog_mid',new_pstr);
  oh2 = nh0; fs.writeFileSync('oh2',oh2.toFixed() + '\n');
  om2 = nm0; fs.writeFileSync('om2',om2.toFixed() + '\n');
  os2 = ns0; fs.writeFileSync('os2',os2.toFixed() + '\n');
  maxa_mid = current_ask;
  maxb_mid = current_bid;
}

async function doMadeLongDelay( nh0,nm0,ns0 ) {
  var time_str = '';
  if (nh0 < 10) time_str += '0';
  time_str += nh0.toFixed() + ':';
  if (nm0 < 10) time_str += '0';
  time_str += nm0.toFixed() + ':';
  if (ns0 < 9.5) time_str += '0';
  time_str += ns0.toFixed();
  var new_pstr = time_str
    + ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + ' ' + maxb_long.toFixed(5)
    + ' ' + maxa_long.toFixed(5)
    + '\n';
  fs.appendFileSync('plog_long',new_pstr);
  oh2 = nh0; fs.writeFileSync('oh2',oh2.toFixed() + '\n');
  om2 = nm0; fs.writeFileSync('om2',om2.toFixed() + '\n');
  os2 = ns0; fs.writeFileSync('os2',os2.toFixed() + '\n');
  maxa_long = current_ask;
  maxb_long = current_bid;
}

async function doMadeShortDelay( nh0,nm0,ns0 ) {
  var time_str = '';
  if (nh0 < 10) time_str += '0';
  time_str += nh0.toFixed() + ':';
  if (nm0 < 10) time_str += '0';
  time_str += nm0.toFixed() + ':';
  if (ns0 < 9.5) time_str += '0';
  time_str += ns0.toFixed();
  var new_pstr = time_str
    + ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + ' ' + maxb_short.toFixed(5)
    + ' ' + maxa_short.toFixed(5)
    + '\n';
  fs.appendFileSync('plog_short',new_pstr);
  oh1 = nh0; fs.writeFileSync('oh1',oh1.toFixed() + '\n');
  om1 = nm0; fs.writeFileSync('om1',om1.toFixed() + '\n');
  os1 = ns0; fs.writeFileSync('os1',os1.toFixed() + '\n');
  maxa_short = current_ask;
  maxb_short = current_bid;
}

var ordersTimeout;
var testp = 0;
async function doMadeDelay( nh0,nm0,ns0 ) {
  const spread = 2 * (current_ask - current_bid) / (current_ask + current_bid);
  const pvar = 2 * (maxb - maxa) / (maxb + maxa);
  if (pvar < 2 * aspread) return;
  const midp = (maxb + maxa) / 2;
  trade_str = '';
  // did we miss the last fill
  var miss_type = 0;
  if (pos > 0) {
    if (sell_size > 0) {
      if (sellp <= maxb)
        if (sellp >= maxa) {
          miss_counts[0]++;
          miss_type = 1;
        }
    } else miss_counts[3]++;
  } else {
    if (buy_size > 0) {
      if (buyp >= maxa)
        if (buyp <= maxb) {
          miss_counts[2]++;
          miss_type = 1;
        }
    } else miss_counts[1]++;
  }
  // await doTrade(midp,pvar);
  await doNewTrade(midp,pvar);

  // console.log('here');
  const pstr = midp.toFixed(6)
    + ' ' + pvar.toExponential(6)
    + ' ' + spread.toExponential(6)
    + '\n';
  fs.appendFileSync('plog',pstr);

  var time_str = '';
  if (nh0 < 10) time_str += '0';
  time_str += nh0.toFixed() + ':';
  if (nm0 < 10) time_str += '0';
  time_str += nm0.toFixed() + ':';
  if (ns0 < 9.5) time_str += '0';
  time_str += ns0.toFixed();
  var new_pstr = time_str
    + ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + ' ' + maxb.toFixed(5)
    + ' ' + maxa.toFixed(5);
  if (buy_size > 0) new_pstr += ' ' + buyp.toFixed(5);
  else new_pstr += ' 0';
  if (sell_size > 0) new_pstr += ' ' + sellp.toFixed(5) + '\n';
  else new_pstr += ' 0\n';
  fs.appendFileSync('new_plog',new_pstr);

  /*
  if (apvar < 2 * aspread) sdelay *= 1.0001;
  else sdelay *= 0.9999;
  fs.writeFileSync('sdelay',sdelay.toExponential(9) + '\n');
  */

  if (onav > 0) {
    const dnav = (nav - onav) / onav;
    adnav *= 0.999;
    adnav += dnav;
    fs.writeFileSync('adnav',adnav.toExponential(9) + '\n');
  }
  onav = nav;

  if (linec == 0) {
    console.log('    pvar    bids    asks     nav     adnav    profitp   finalp   utc');
  }
  linec++; if (linec == 19) linec = 0;
  const closep = (current_ask + current_bid) / 2;
  var tstr =
    pvar.toExponential(3)
    // + ' ' + sdelay.toExponential(3)
    + ' ' + maxb.toFixed(5)
    + ' ' + maxa.toFixed(5)
    // + ' ' + closep.toFixed(5)
    + ' ' + nav.toExponential(4)
    + ' ' + adnav.toExponential(3)
    + ' ' + profitp.toExponential(2)
    + ' ' + final_profit.toExponential(2)
    ;
  // if (pos > 0) tstr += ' ';
  // tstr += ' ' + pos.toFixed(0) + ' ';
  tstr += ' ' + time_str;
  tstr += ' --- ' + trade_str;
  // if (miss_type > 0) {
    // tstr += ' <- ' + miss_counts[0] + ' ' + miss_counts[2];
  // }
  fs.appendFileSync('log',tstr + '\n');
  if (pvar >= 0) tstr = ' ' + tstr;
  console.log(tstr);
  // await doTestLevels(midp);
  var tstr = '';
  for (var i in v) tstr += latest_v[i].toExponential(9) + '\n';
  fs.writeFileSync('latest_v',tstr);

  oh0 = nh0; fs.writeFileSync('oh0',oh0.toFixed() + '\n');
  om0 = nm0; fs.writeFileSync('om0',om0.toFixed() + '\n');
  os0 = ns0; fs.writeFileSync('os0',os0.toFixed() + '\n');
  maxa = current_ask;
  maxb = current_bid;

  await readFiles();
  // ordersTimeout = setTimeout(() => { doTrimOrders(); }, sdelay / 2 * 1000);
}

async function doNewTrade(midp,pvar) {
  const dmidp = (midp - omidp) / omidp;
  omidp = midp;

  apvar = Number(fs.readFileSync('test/apvar','utf8'));
  aadmidp = Number(fs.readFileSync('test/aadmidp','utf8'));
  latest_v[5] = latest_v[4];
  latest_v[4] = latest_v[3];
  latest_v[3] = pvar / apvar;
  latest_v[2] = 1;
  latest_v[1] = latest_v[0];
  latest_v[0] = dmidp / aadmidp;
  var vs = 0;
  for (var i in latest_v) vs += latest_v[i] * latest_v[i];
  vs = Math.sqrt(vs);
  for (var i in latest_v) latest_nv[i] = latest_v[i] / vs;

  final_profit = Number(fs.readFileSync('test/final_profit','utf8'));
  try {
    const profit_brain_data = fs.readFileSync('test/profit_brain','utf8');
    const profit_brain_lines = profit_brain_data.split('\n');
    for (var i in v) profit_brain[i] = Number(profit_brain_lines[i]);
  } catch {}
  profitp = 0;
  for (var i in v) profitp += profit_brain[i] * latest_nv[i];
  // if (final_profit <= 0) return;

  try {
    const dmid_t_brain_data = fs.readFileSync('test/dmid_t_brain','utf8');
    const dmid_t_brain_lines = dmid_t_brain_data.split('\n');
    for (var i in v) dmid_t_brain[i] = Number(dmid_t_brain_lines[i]);
  } catch {}

  try {
    const pvar_t_brain_data = fs.readFileSync('test/pvar_t_brain','utf8');
    const pvar_t_brain_lines = pvar_t_brain_data.split('\n');
    for (var i in v) pvar_t_brain[i] = Number(pvar_t_brain_lines[i]);
  } catch {}

  var dmidp_t = 0;
  for (var i in v) dmidp_t += dmid_t_brain[i] * latest_nv[i];
  var pvar_t = 0;
  for (var i in v) pvar_t += pvar_t_brain[i] * latest_nv[i];
  const midp_t = midp + midp * dmidp_t;
  sellp = midp_t + midp_t * pvar_t / 2;
  buyp = midp_t - midp_t * pvar_t / 2;

  buy_size = Number((levx * 50 * nav / midp).toFixed());
  sell_size = buy_size;
  if (pos > 0) { buy_size = 0; sell_size = pos; }
  else if (pos < 0) { sell_size = 0; buy_size = -pos; }
  else if (profitp <= 0) {
    if (sell_order_id > 0) await doCancelAll(sell_order_id);
    if (buy_order_id > 0) await doCancelAll(buy_order_id);
    return;
  }
  if (Math.abs(sellp - current_bid) < Math.abs(buyp - current_ask)) {
    if (sell_size > 0) {
      if (sell_order_id == 0) await doOrder(sellp,-sell_size);
      else await doUpdateOrder(sellp,-sell_size,sell_order_id,sell_order_touch);
    } else if (sell_order_id > 0) await doCancelAll(sell_order_id);
    if (buy_size > 0) {
      if (buy_order_id == 0) await doOrder(buyp,buy_size);
      else await doUpdateOrder(buyp,buy_size,buy_order_id,buy_order_touch);
    } else if (buy_order_id > 0) await doCancelAll(buy_order_id);
  } else {
    if (buy_size > 0) {
      if (buy_order_id == 0) await doOrder(buyp,buy_size);
      else await doUpdateOrder(buyp,buy_size,buy_order_id,buy_order_touch);
    } else if (buy_order_id > 0) await doCancelAll(buy_order_id);
    if (sell_size > 0) {
      if (sell_order_id == 0) await doOrder(sellp,-sell_size);
      else await doUpdateOrder(sellp,-sell_size,sell_order_id,sell_order_touch);
    } else if (sell_order_id > 0) await doCancelAll(sell_order_id);
  }
  fs.writeFileSync('omidp',omidp.toExponential(9) + '\n');
}

async function doTrade(midp,pvar) {
  const dmidp = (midp - omidp) / omidp;
  omidp = midp;

  latest_v[5] = latest_v[4];
  latest_v[4] = latest_v[3];
  latest_v[3] = pvar / apvar;
  latest_v[2] = 1;
  latest_v[1] = latest_v[0];
  latest_v[0] = dmidp / aadmidp;
  var vs = 0;
  for (var i in latest_v) vs += latest_v[i] * latest_v[i];
  vs = Math.sqrt(vs);
  for (var i in latest_v) latest_nv[i] = latest_v[i] / vs;

  await setSellp();
  await setBuyp();

  buy_size = Number((levx * 50 * nav / midp).toFixed());
  sell_size = buy_size;
  if (pos > 0) { buy_size = 0; sell_size = pos; }
  if (pos < 0) { sell_size = 0; buy_size = -pos; }
  if (sell_size > 0) {
    if (sell_order_id == 0) await doOrder(sellp,-sell_size);
    else await doUpdateOrder(sellp,-sell_size,sell_order_id,sell_order_touch);
  } else if (sell_order_id > 0) await doCancelAll(sell_order_id);
  if (buy_size > 0) {
    if (buy_order_id == 0) await doOrder(buyp,buy_size);
    else await doUpdateOrder(buyp,buy_size,buy_order_id,buy_order_touch);
  } else if (buy_order_id > 0) await doCancelAll(buy_order_id);

  fs.writeFileSync('omidp',omidp.toExponential(9) + '\n');
}

async function setSellp() {
  // sellp = tmidp
    // + omidp * pdmidp * sellf2
    // + tmidp * pvarp * sellf
    // + sellm;
  sellp = omidp;
  for (var i in latest_nv) sellp += sell_brain[i] * latest_nv[i];
  sellp = Number(sellp.toFixed(5));
}

async function setBuyp() {
  // sellp = tmidp
    // + omidp * pdmidp * sellf2
    // + tmidp * pvarp * sellf
    // + sellm;
  buyp = omidp;
  for (var i in latest_nv) buyp += buy_brain[i] * latest_nv[i];
  buyp = Number(buyp.toFixed(5));
}

async function doCancelAll(order_id) {
  const update_path = order_path + '/' + order_id;
  const update_options = {
    host: 'api-fxtrade.oanda.com',
    path: update_path,
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "Authorization": api_key,
    },
  };

  var clean_chunk = '';
  const cancel_path = update_path + '/cancel';
  update_options.path = cancel_path;
  var req = https.request(update_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      try {
        const data = JSON.parse(clean_chunk);
        // console.log('cancel all ' + order_id);
        // console.log(data);
        if (clean_chunk.indexOf('REJECT') >= 0) {
          // console.log('cancel all reject');
        }
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  // req.write('data\n');
  req.end();
}

async function doUpdateOrder(price,size,order_id,order_touch) {
  // console.log('doUpdateOrder ' + price + ' ' + size + ' ' + order_id + ' ' + order_touch);
  if (size == 0) return;
  const body = {
    order: {
      price: price.toFixed(5),
      instrument: "EUR_USD",
      units: size.toFixed(),
      type: "LIMIT",
    }
  }
  var torder_touch = 0;
  if (size > 0) {
    if (price >= current_ask) {
      torder_touch = 1;
      body.order.type = "MARKET_IF_TOUCHED";
    }
  } else {
    if (price <= current_bid) {
      torder_touch = 1;
      body.order.type = "MARKET_IF_TOUCHED";
    }
  }
  const update_path = order_path + '/' + order_id.toFixed();
  const update_options = {
    host: 'api-fxtrade.oanda.com',
    path: update_path,
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "Authorization": api_key,
    },
  };

  trade_str += ' ' + size.toFixed() + ' ' + price.toFixed(5);
  if (torder_touch == 1) trade_str += ' <--';
  var cancel_first = 0;
  var clean_chunk = '';
  if (order_touch != torder_touch) {
    const cancel_path = update_path + '/cancel';
    update_options.path = cancel_path;
    cancel_first = 1;
  }
  var req = https.request(update_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      // console.log(clean_chunk);
      try {
        const data = JSON.parse(clean_chunk);
        if (clean_chunk.indexOf('REJECT') >= 0) doOrder(price,size);
        else if (cancel_first == 1) doOrder(price,size);
        else {
          var id = Number(data.orderCreateTransaction.id);
          if (size > 0) {
            if (id == buy_order_id) {
              // okay
            } else {
              buy_order_id = id;
              fs.writeFileSync('buy_order_id',buy_order_id + '\n');
              buy_order_touch = torder_touch;
              fs.writeFileSync('buy_order_touch',buy_order_touch + '\n');
            }
          }
          if (size < 0) {
            if (id == sell_order_id) {
              // okay
            } else {
              sell_order_id = id;
              fs.writeFileSync('sell_order_id',sell_order_id + '\n');
              sell_order_touch = torder_touch;
              fs.writeFileSync('sell_order_touch',sell_order_touch + '\n');
            }
          }
        }
        // if (clean_chunk.indexOf('TOUCHED') >= 0) console.log(data);
        // if (body.order.type == "MARKET_IF_TOUCHED") console.log(data);
        fs.writeFileSync('last_do_update_order',clean_chunk + '\n');
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write(JSON.stringify(body) + '\n');
  req.end();
}

async function doOrder(price,size) {
  // console.log('doOrder ' + price + ' ' + size);
  if (size == 0) return;
  const body = {
    order: {
      price: price.toFixed(5),
      instrument: "EUR_USD",
      units: size.toFixed(),
      type: "LIMIT",
    }
  }
  var torder_touch = 0;
  if (size > 0) {
    if (price >= current_ask) {
      torder_touch = 1;
      body.order.type = "MARKET_IF_TOUCHED";
    }
  } else {
    if (price <= current_bid) {
      torder_touch = 1;
      body.order.type = "MARKET_IF_TOUCHED";
    }
  }
  trade_str += ' ' + size.toFixed() + ' ' + price.toFixed(5);
  if (torder_touch == 1) trade_str += ' <--';
  // console.log(order_options);
  var clean_chunk = '';
  var req = https.request(order_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      // console.log(clean_chunk);
      try {
        const data = JSON.parse(clean_chunk);
        if (clean_chunk.indexOf('REJECT') >= 0) console.log(data);
        else {
          var id = Number(data.orderCreateTransaction.id);
          if (size > 0) {
            if (id == buy_order_id) {
              // okay
            } else {
              buy_order_id = id;
              fs.writeFileSync('buy_order_id',buy_order_id + '\n');
              buy_order_touch = torder_touch;
              fs.writeFileSync('buy_order_touch',buy_order_touch + '\n');
            }
          }
          if (size < 0) {
            if (id == sell_order_id) {
              // okay
            } else {
              sell_order_id = id;
              fs.writeFileSync('sell_order_id',sell_order_id + '\n');
              sell_order_touch = torder_touch;
              fs.writeFileSync('sell_order_touch',sell_order_touch + '\n');
            }
          }
        }
        // if (clean_chunk.indexOf('TOUCHED') >= 0) console.log(data);
        // if (body.order.type == "MARKET_IF_TOUCHED") console.log(data);
        fs.writeFileSync('last_do_order',clean_chunk + '\n');
        // console.log('doOrder data ' + price + ' ' + size);
        // console.log(data);
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write(JSON.stringify(body) + '\n');
  req.end();
}

function doTrimOrders() {
  // console.log('get orders');
  var order_count = 0;
  var clean_chunk = '';
  var req = https.request(get_order_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      // console.log(clean_chunk);
      try {
        const data = JSON.parse(clean_chunk);
        // console.log(data);
        for (var i of data.orders) {
          if (Number(i.id) == buy_order_id) {
            // okay
          } else if (Number(i.id) == sell_order_id) {
            // okay
          } else {
            // console.log('why in the wholy hell is this');
            // console.log(i);
            doCancelAll(i.id);
            order_count++;
          }
        }
      } catch (e) { console.log(e); }
      if (order_count > 0) {
        console.log('cancelled ' + order_count + ' orders');
        if (order_count > 40)
          ordersTimeout = setTimeout(() => { doTrimOrders(); }, 1000);
      }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
}

function doShowOrders() {
  // console.log('show orders');
  var clean_chunk = '';
  var order_count = 0;
  var req = https.request(get_order_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      // console.log(clean_chunk);
      try {
        const data = JSON.parse(clean_chunk);
        // console.log(data);
        for (var i of data.orders) {
          order_count++;
          // console.log(i);
          // doCancelAll(i.id);
        }
        console.log('found ' + order_count + ' orders');
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
}


var profitp = 0;
var final_profit = 0;
// var test_sellp = 0;
// var test_buyp = 0;
const profit_brain = [ 0,0,0,0,0,0 ];
const dmid_t_brain = [ 0,0,0,0,0,0 ];
const dmid_c_brain = [ 0,0,0,0,0,0 ];
const pvar_t_brain = [ 0,0,0,0,0,0 ];
async function doTestLevels(midp)  {
  if (pos == 0) {
    try {
      const profit_brain_data = fs.readFileSync('test/profit_brain','utf8');
      const profit_brain_lines = profit_brain_data.split('\n');
      for (var i in v) profit_brain[i] = Number(profit_brain_lines[i]);
    } catch {}
    profitp = 0;
    for (var i in v) profitp += profit_brain[i] * latest_nv[i];
    if (profitp <= 0) return;

    try {
      const dmid_t_brain_data = fs.readFileSync('test/dmid_t_brain','utf8');
      const dmid_t_brain_lines = dmid_t_brain_data.split('\n');
      for (var i in v) dmid_t_brain[i] = Number(dmid_t_brain_lines[i]);
    } catch {}

    try {
      const pvar_t_brain_data = fs.readFileSync('test/pvar_t_brain','utf8');
      const pvar_t_brain_lines = pvar_t_brain_data.split('\n');
      for (var i in v) pvar_t_brain[i] = Number(pvar_t_brain_lines[i]);
    } catch {}

    var dmidp_t = 0;
    for (var i in v) dmidp_t += dmid_t_brain[i] * latest_nv[i];
    var pvar_t = 0;
    for (var i in v) pvar_t += pvar_t_brain[i] * latest_nv[i];
    const midp_t = midp + midp * dmidp_t;
    sellp = midp_t + midp_t * pvar_t / 2;
    buyp = midp_t - midp_t * pvar_t / 2;

    /*
    console.log('test levels trade at ' + sellp.toFixed(5)
      + ' ' + buyp.toFixed(5)
      + ' p ' + profitp.toExponential(5))
      ;
      */
    if (sellp !== sellp) {
      console.log('stupid nan');
      console.log(dmid_t_brain);
      console.log(pvar_t_brain);
    }
  } else {
    try {
      const dmid_c_brain_data = fs.readFileSync('test/dmid_c_brain','utf8');
      const dmid_c_brain_lines = dmid_c_brain_data.split('\n');
      for (var i in v) dmid_c_brain[i] = Number(dmid_c_brain_lines[i]);
    } catch {}
    if (pos > 0) {
      var dmidp_t = 0;
      for (var i in v) dmidp_t += dmid_t_brain[i] * latest_nv[i];
      var pvar_t = 0;
      for (var i in v) pvar_t += pvar_t_brain[i] * latest_nv[i];
      const midp_t = midp + midp * dmidp_t;
      sellp = midp_t + midp_t * pvar_t / 2;
      buyp = 0;

      // var dmidp_t = 0;
      // for (var i in v) dmidp_t += dmid_c_brain[i] * latest_nv[i];
      // sellp = midp + midp * dmidp_t;
      // buyp = 0;
    } else {
      var dmidp_t = 0;
      for (var i in v) dmidp_t += dmid_t_brain[i] * latest_nv[i];
      var pvar_t = 0;
      for (var i in v) pvar_t += pvar_t_brain[i] * latest_nv[i];
      const midp_t = midp + midp * dmidp_t;
      sellp = 0;
      buyp = midp_t - midp_t * pvar_t / 2;

      // var dmidp_t = 0;
      // for (var i in v) dmidp_t += dmid_c_brain[i] * latest_nv[i];
      // buyp = midp + midp * dmidp_t;
      // sellp = 0;
    }
  }

}

async function readFiles() {
  apvar = Number(fs.readFileSync('apvar','utf8'));
  aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
  sellm = Number(fs.readFileSync('sellm','utf8'));
  sellf = Number(fs.readFileSync('sellf','utf8'));
  sellf2 = Number(fs.readFileSync('sellf2','utf8'));
  levx = Number(fs.readFileSync('opt_levx','utf8'));
  // levx /= 5;

  aspread = Number(fs.readFileSync('aspread','utf8'));

  apdmidp = Number(fs.readFileSync('apdmidp','utf8'));
  apvarp = Number(fs.readFileSync('apvarp','utf8'));

  const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
  const dmid_brain_lines = dmid_brain_data.split('\n');
  for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

  const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
  const pvar_brain_lines = pvar_brain_data.split('\n');
  for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);

  const sell_brain_data = fs.readFileSync('sell_brain','utf8');
  const sell_brain_lines = sell_brain_data.split('\n');
  for (var i in sell_brain) sell_brain[i] = Number(sell_brain_lines[i]);

  const buy_brain_data = fs.readFileSync('buy_brain','utf8');
  const buy_brain_lines = buy_brain_data.split('\n');
  for (var i in buy_brain) buy_brain[i] = Number(buy_brain_lines[i]);

  var tstr = '';
  for (var i in latest_v) tstr += latest_v[i].toExponential(9) + '\n';
  fs.writeFileSync('main_vec',tstr);
}

readFiles();
doSummary();
doShowOrders();
doTrimOrders();
var mainTimeout = setTimeout(() => { doMain(); }, 9000);

doTransactions();
var transTimeout = setTimeout(() => { doTransactions(); }, 100000);

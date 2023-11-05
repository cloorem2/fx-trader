const fs = require('fs');
const https = require('https');
const api_key = 'Bearer ' + fs.readFileSync('../../oanda-api-key','utf8');
const account_id = fs.readFileSync('../../oanda-account-id','utf8');
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

const num_facets = 10;
const v_len = 17;
const id_nv = [];
for (var i = 0; i < num_facets; i++) {
  id_nv[i] = [];
  for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0;
  try {
    const id_nv_data = fs.readFileSync('id_nv/' + i,'utf8');
    const id_nv_lines = id_nv_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = Number(id_nv_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0; }
}

const dmid_brain = [];
for (var i = 0; i < num_facets; i++) {
  dmid_brain[i] = [];
  for (var ii = 0; ii < v_len; ii++) dmid_brain[i][ii] = 0;
  try {
    const dmid_brain_data = fs.readFileSync('dmid_brain/' + i,'utf8');
    const dmid_brain_lines = dmid_brain_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) dmid_brain[i][ii] =
      Number(dmid_brain_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) dmid_brain[i][ii] = 0; }
}

const profit_brain = [];
for (var i = 0; i < num_facets; i++) {
  profit_brain[i] = [];
  for (var ii = 0; ii < v_len; ii++) profit_brain[i][ii] = 0;
  try {
    const profit_brain_data = fs.readFileSync('profit_brain/' + i,'utf8');
    const profit_brain_lines = profit_brain_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) profit_brain[i][ii] =
      Number(profit_brain_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) profit_brain[i][ii] = 0; }
}

const tick_v = [],tick_nv = [];
for (var i = 0; i < v_len; i++) tick_v[i] = 1;
const tick_v_data = fs.readFileSync('latest_v','utf8');
const tick_v_lines = tick_v_data.split('\n');
for (var i = 0; i < v_len; i++) tick_v[i] = Number(tick_v_lines[i]);
// for (var i = 0; i < v_len; i++) tick_v[i] = 1;
var tick_v_id = Number(fs.readFileSync('tick_v_id','utf8'));

const adt = [];
for (var i = 0; i < num_facets; i++) {
  try { adt[i] = Number(fs.readFileSync('adt/' + i,'utf8')); }
  catch { adt[i] = 1; }
}
const aadmid = [];
for (var i = 0; i < num_facets; i++) {
  try { aadmid[i] = Number(fs.readFileSync('aadmid/' + i,'utf8')); }
  catch { aadmid[i] = 1; }
}
var pvar = 0;
const apvar = [];
for (var i = 0; i < num_facets; i++) {
  try { apvar[i] = Number(fs.readFileSync('apvar/' + i,'utf8')); }
  catch { apvar[i] = 1; }
}


console.log('doMain ' + new Date());
// var price_delay = Number(fs.readFileSync('price_delay','utf8'));
const price_delay_v = [];
for (var i = 0; i < num_facets; i++) price_delay_v[i] = 0;
for (var i = 0; i < num_facets; i++) {
  try { price_delay_v[i] = Number(fs.readFileSync('price_delay_v/' + i,'utf8')); }
  catch { price_delay_v[i] = price_delay; }
  // price_delay_v[i] = 2e-3;
}
// var time_delay = Number(fs.readFileSync('time_delay','utf8'));
const time_delay_v = [];
for (var i = 0; i < num_facets; i++) time_delay_v[i] = 0;
for (var i = 0; i < num_facets; i++) {
  try { time_delay_v[i] = Number(fs.readFileSync('time_delay_v/' + i,'utf8')); }
  catch { time_delay_v[i] = time_delay; }
  // time_delay_v[i] = 1.5e4;
}
var td = 0;
var prof_t = 0;

var maxb = Number(fs.readFileSync('maxb','utf8'));
var maxa = Number(fs.readFileSync('maxa','utf8'));
var chunk_save = '';

var nh0,nm0,ns0;
var oh0 = Number(fs.readFileSync('oh0','utf8'));
var om0 = Number(fs.readFileSync('om0','utf8'));
var os0 = Number(fs.readFileSync('os0','utf8'));

var linec = 0;
var levx = Number(fs.readFileSync('opt_levx','utf8'));
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
var trade_str = '';

var buyp = 0,sellp = 0;
var buy_size = 0,sell_size = 0;
var buy_order_touch = Number(fs.readFileSync('buy_order_touch','utf8'));
var sell_order_touch = Number(fs.readFileSync('sell_order_touch','utf8'));
var adnav = Number(fs.readFileSync('adnav','utf8'));
var onav = 0;
var ordersTimeout;
var con_str = '';

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
    console.log('doSummary problem with request: ' + e.message);
  });
  req.write('data\n');
  req.end();
}

function doTransactions() {
  // console.log('doTransactions');
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
    // console.log('doTransactions problem with request: ' + e.message);
  });
  req.write('data\n');
  req.end();
}

async function doTransData(data) {
  clearTimeout(transTimeout);
  transTimeout = setTimeout(() => { doTransactions(); }, 100000);
  if (data.type == 'MARKET_ORDER') {
    // pos += Number(data.units);
    // console.log('market order ' + data.units + ' pos ' + pos);
    // doTrade(omidp);

    // console.log('new pos ' + pos);
    // fs.writeFileSync('pos',pos.toFixed() + '\n');
    // fs.appendFileSync('last_market_order',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'ORDER_FILL') {
    if (withdraw_not_ready == 1) {
      console.log('withdraw ready');
      withdraw_not_ready = 0;
      fs.writeFileSync('withdraw_not_ready',withdraw_not_ready + '\n');
    }
    const tnav = Number(data.accountBalance) - nav_withdraw;
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
    pos += Number(data.units);
    con_str = data.price + '  ' + data.units + ' pos ' + pos;

    if (Number(data.orderID) == sell_order_id) {
      sell_order_id = 0;
      fs.writeFileSync('sell_order_id',sell_order_id + '\n');
      console.log('filled at ' + data.price + '  ' + data.units + ' pos ' + pos);
    } else if (Number(data.orderID) == buy_order_id) {
      buy_order_id = 0;
      fs.writeFileSync('buy_order_id',buy_order_id + '\n');
      console.log('filled at ' + data.price + '  ' + data.units + ' pos ' + pos);
    } else {
      if (data.reason == 'MARKET_ORDER') {
        // console.log('market order ' + con_str);
        doPrintLine();
        doTrade(omidp);
      } else {
        console.log('so wtf is this');
        console.log(data);
      }
    }

    // console.log('new pos ' + pos);
    fs.writeFileSync('pos',pos.toFixed() + '\n');
    fs.writeFileSync('nav',nav.toExponential(9) + '\n');
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
    // console.log(data);
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
  // console.log('doMain ' + new Date());
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
    // console.log('doMain problem with request: ' + e.message);
  });
  req.write('data\n');
  req.end();
}

var time_str = '';
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
  nh0 = Number(h0);
  nm0 = Number(m0);
  ns0 = Number(s0);

  var candle_done = 1;
  pvar = 2 * (maxb - maxa) / (maxb + maxa);
  // if (pvar < price_delay) candle_done = 0;
  if (pvar < price_delay_v[tick_v_id]) candle_done = 0;

  const th0 = nh0 < oh0 ? nh0 + 24 - oh0 : nh0 - oh0;
  td = th0 * 60 * 60 + (nm0 - om0) * 60 + (ns0 - os0);
  // if (td < time_delay) candle_done = 0;
  if (td < time_delay_v[tick_v_id]) candle_done = 0;
  const midp = (maxb + maxa) / 2;

  time_str = '';
  if (nh0 < 10) time_str += '0';
  time_str += nh0.toFixed() + ':';
  if (nm0 < 10) time_str += '0';
  time_str += nm0.toFixed() + ':';
  if (ns0 < 9.5) time_str += '0';
  time_str += ns0.toFixed();

  if (candle_done == 1) await doMadeDelayBrain(midp);

  fs.writeFileSync('current_ask',current_ask + '\n');
  fs.writeFileSync('current_bid',current_bid + '\n');
  fs.writeFileSync('maxa',maxa.toFixed(6) + '\n');
  fs.writeFileSync('maxb',maxb.toFixed(6) + '\n');

  var new_pstr = time_str
    + ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + '\n';
  fs.appendFileSync('../ticks',new_pstr);
  fs.writeFileSync('last_price',JSON.stringify(data) + '\n');
  /*
  console.log(tick_v_id,
    (td/60).toFixed(), (time_delay_v[tick_v_id]/60).toFixed(),
    pvar.toExponential(5), price_delay_v[tick_v_id].toExponential(5),
    time_str,current_bid.toFixed(5),current_ask.toFixed(5)
  );
  */
}

async function doTrade(midp) {
  buy_size = Number((levx * 50 * nav / midp).toFixed());
  sell_size = buy_size;
  if (pos > 0) { buy_size = 0; sell_size = pos; }
  else if (pos < 0) { sell_size = 0; buy_size = -pos; }
  if (Math.abs(sellp - current_bid) < Math.abs(buyp - current_ask)) {
    if ((sell_size > 0) && (sellp > 0)) {
      if (sell_order_id == 0) await doOrder(sellp,-sell_size);
      else await doUpdateOrder(sellp,-sell_size,sell_order_id,sell_order_touch);
    } else if (sell_order_id > 0) await doCancelAll(sell_order_id);
    if ((buy_size > 0) && (buyp > 0)) {
      if (buy_order_id == 0) await doOrder(buyp,buy_size);
      else await doUpdateOrder(buyp,buy_size,buy_order_id,buy_order_touch);
    } else if (buy_order_id > 0) await doCancelAll(buy_order_id);
  } else {
    if ((buy_size > 0) && (buyp > 0)) {
      if (buy_order_id == 0) await doOrder(buyp,buy_size);
      else await doUpdateOrder(buyp,buy_size,buy_order_id,buy_order_touch);
    } else if (buy_order_id > 0) await doCancelAll(buy_order_id);
    if ((sell_size > 0) && (sellp > 0)) {
      if (sell_order_id == 0) await doOrder(sellp,-sell_size);
      else await doUpdateOrder(sellp,-sell_size,sell_order_id,sell_order_touch);
    } else if (sell_order_id > 0) await doCancelAll(sell_order_id);
  }
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
    console.log('doCancelAll problem with request: ' + e.message);
  });

  // req.write('data\n');
  req.end();
}

async function doUpdateOrder(price,size,order_id,order_touch) {
  console.log('doUpdateOrder ' + price + ' ' + size + ' ' + order_id + ' ' + order_touch);
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

  var cancel_first = 0;
  var clean_chunk = '';
  if (order_touch != torder_touch) {
    const cancel_path = update_path + '/cancel';
    update_options.path = cancel_path;
    cancel_first = 1;
  } else {
    trade_str += ' ' + size.toFixed() + ' ' + price.toFixed(5);
    if (torder_touch == 1) trade_str += ' <--';
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
    console.log('doUpdateOrder problem with request: ' + e.message);
  });

  req.write(JSON.stringify(body) + '\n');
  req.end();
}

async function doMarketOrder(size) {
  // console.log('doMarketOrder ' + size);
  if (size == 0) return;
  const body = {
    order: {
      instrument: "EUR_USD",
      units: size.toFixed(),
      type: "MARKET",
    }
  }
  var clean_chunk = '';
  var req = https.request(order_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      // console.log(clean_chunk);
      // try {
        // const data = JSON.parse(clean_chunk);
        // console.log(data);
      // } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('doMarketOrder problem with request: ' + e.message);
  });
  req.write(JSON.stringify(body) + '\n');
  req.end();
}

async function doOrder(price,size) {
  console.log('doOrder ' + price + ' ' + size);
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
    console.log('doOrder problem with request: ' + e.message);
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
    console.log('doTrimOrders problem with request: ' + e.message);
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
    console.log('doShowOrders problem with request: ' + e.message);
  });
  req.end();
}


async function readFiles() {
  levx = Number(fs.readFileSync('opt_levx','utf8'));
  // levx /= 5;

  for (var i = 0; i < num_facets; i++) {
    try {
      const id_nv_data = fs.readFileSync('id_nv/' + i,'utf8');
      const id_nv_lines = id_nv_data.split('\n');
      for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = Number(id_nv_lines[ii]);
    } catch { for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0; }
  }
  for (var i = 0; i < num_facets; i++) {
    try {
      const dmid_t_brain_data = fs.readFileSync('dmid_t_brain/' + i,'utf8');
      const dmid_t_brain_lines = dmid_t_brain_data.split('\n');
      for (var ii = 0; ii < v_len; ii++) dmid_t_brain[i][ii] =
        Number(dmid_t_brain_lines[ii]);
    } catch { for (var ii = 0; ii < v_len; ii++) dmid_t_brain[i][ii] = 0; }
  }
  for (var i = 0; i < num_facets; i++) {
    try {
      const pvar_t_brain_data = fs.readFileSync('pvar_t_brain/' + i,'utf8');
      const pvar_t_brain_lines = pvar_t_brain_data.split('\n');
      for (var ii = 0; ii < v_len; ii++) pvar_t_brain[i][ii] =
        Number(pvar_t_brain_lines[ii]);
    } catch { for (var ii = 0; ii < v_len; ii++) pvar_t_brain[i][ii] = 0; }
  }
  for (var i = 0; i < num_facets; i++) {
    try {
      const profit_brain_data = fs.readFileSync('profit_brain/' + i,'utf8');
      const profit_brain_lines = profit_brain_data.split('\n');
      for (var ii = 0; ii < v_len; ii++) profit_brain[i][ii] =
        Number(profit_brain_lines[ii]);
    } catch { for (var ii = 0; ii < v_len; ii++) profit_brain[i][ii] = 0; }
  }
  for (var i = 0; i < num_facets; i++) {
    try { adt[i] = Number(fs.readFileSync('adt/' + i,'utf8')); }
    catch { adt[i] = 1; }
  }
  for (var i = 0; i < num_facets; i++) {
    try { aadmid[i] = Number(fs.readFileSync('aadmid/' + i,'utf8')); }
    catch { aadmid[i] = 1; }
  }
  for (var i = 0; i < num_facets; i++) {
    try { apvar[i] = Number(fs.readFileSync('apvar/' + i,'utf8')); }
    catch { apvar[i] = 1; }
  }
  // price_delay = Number(fs.readFileSync('price_delay','utf8'));
  // time_delay = Number(fs.readFileSync('time_delay','utf8'));
}

// readFiles();
doSummary();
doShowOrders();
doTrimOrders();
var mainTimeout = setTimeout(() => { doMain(); }, 9000);

doTransactions();
var transTimeout = setTimeout(() => { doTransactions(); }, 100000);

///
/// here's the brain code


var dmidp_t = 0;
async function doMadeDelayBrain(midp) {
  var tstr = pvar.toExponential(2)
    + ' ' + price_delay_v[tick_v_id].toExponential(2)
    + ' ' + td.toExponential(2)
    + ' ' + time_delay_v[tick_v_id].toExponential(2);
  if (omidp == 0) omidp = midp;
  const dmidp = (midp - omidp) / omidp;
  omidp = midp;

  const current_d = (current_ask + current_bid - 2 * midp) / pvar;
  tick_v[0] = 1;
  for (var i = 1; i < 13; i++) tick_v[i] = tick_v[i + 4];
  tick_v[13] = td / adt[tick_v_id];
  tick_v[14] = dmidp / aadmid[tick_v_id];
  tick_v[15] = pvar / apvar[tick_v_id];
  tick_v[16] = current_d;

  var vs = 0;
  for (var i = 0; i < v_len; i++) vs += tick_v[i] * tick_v[i];
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i = 0; i < v_len; i++) tick_nv[i] = tick_v[i] / vs;
  var dot_max = -2;
  for (var i = 0; i < num_facets; i++) {
    var tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += tick_nv[ii] * id_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      tick_v_id = i;
    }
  }

  dmidp_t = 0;
  for (var i in tick_v) dmidp_t += dmid_brain[tick_v_id][i] * tick_nv[i];
  if (dmidp_t >= 0) {
    const size = Number((levx * 50 * nav / midp - pos).toFixed());
    back_sellp = current_ask + current_ask * dmidp_t;
    buyp = 0;
    if (size > 0) await doMarketOrder(size);
    else await doTrade(midp);
  } else {
    const size = Number((levx * 50 * nav / midp + pos).toFixed());
    back_buyp = current_bid + current_bid * dmidp_t;
    sellp = 0;
    if (size > 0) await doMarketOrder(-size);
    else await doTrade(midp);
  }

  // await doTrade(midp);

  if (onav > 0) {
    const dnav = (nav - onav) / onav;
    adnav *= 0.999;
    adnav += dnav;
    fs.writeFileSync('adnav',adnav.toExponential(9) + '\n');
  }
  onav = nav;

  maxb = current_bid;
  maxa = current_ask;
  oh0 = nh0; fs.writeFileSync('oh0',oh0.toFixed() + '\n');
  om0 = nm0; fs.writeFileSync('om0',om0.toFixed() + '\n');
  os0 = ns0; fs.writeFileSync('os0',os0.toFixed() + '\n');
  // await readFiles();

  fs.writeFileSync('latest_v',tick_v.join('\n') + '\n');
  fs.writeFileSync('tick_v_id',tick_v_id + '\n');
  fs.writeFileSync('omidp',omidp.toExponential(9) + '\n');
}

async function doPrintLine() {
  if (linec == 0) {
    console.log('   pvar    pdelay td       tdelay  bids    asks     nav      adnav    prof_t   utc');
  }
  linec++; if (linec == 19) linec = 0;
  var tstr = ' ' + maxb.toFixed(5)
    + ' ' + maxa.toFixed(5)
    + ' ' + nav.toExponential(4)
    + ' ' + adnav.toExponential(3)
    ;
  if (dmidp_t >= 0) tstr += ' ';
  tstr += ' ' + dmidp_t.toExponential(2);
  tstr += ' ' + time_str;
  if (con_str != '') tstr += ' --- ' + con_str;
  if (pvar >= 0) tstr = ' ' + tstr;
  tstr += ' ' + tick_v_id;
  fs.appendFileSync('log',tstr + '\n');
  console.log(tstr);
  con_str = '';

}

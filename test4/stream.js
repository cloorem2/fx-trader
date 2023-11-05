const fs = require('fs');
const fsPromises = require('fs/promises');
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

const num_facets = Number(fs.readFileSync('num_facets','utf8'));
const v_len = 7;
const cutx = Number(fs.readFileSync('cutx','utf8'));
const div_n0 = Number(fs.readFileSync('div_n0','utf8'));
const div_n1 = Number(fs.readFileSync('div_n1','utf8'));
const div_n2 = Number(fs.readFileSync('div_n2','utf8'));
const div_n3 = Number(fs.readFileSync('div_n3','utf8'));

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
const tick_v = [];
const tick_nv = [];

var aamidp16 = 0;
var aamidp32 = 0;
var aamidp64 = 0;

var aamidps16 = 0;
var aamidps32 = 0;
var aamidps64 = 0;

var amidp8 = 0;
var amidp16 = 0;
var amidp32 = 0;
var amidp64 = 0;

var amidps8 = 0;
var amidps16 = 0;
var amidps32 = 0;
var amidps64 = 0;

const vv_pos = [];
for (var i = 0; i < num_facets; i++) {
  vv_pos[i] = [];
  const d = fs.readFileSync('vv_pos/' + i,'utf8');
  const l = d.split('\n');
  for (var ii = 0; ii < num_facets; ii++)
    vv_pos[i][ii] = Number(l[ii]);
}




console.log('doMain ' + new Date());
var chunk_save = '';
var linec = 0;
var levx = Number(fs.readFileSync('levx','utf8'));
var pos = Number(fs.readFileSync('pos','utf8'));
var nav = Number(fs.readFileSync('nav','utf8'));

var nav_withdraw = 0;
try { nav_withdraw = Number(fs.readFileSync('nav_withdraw','utf8')); }
catch {}

var nav_mark = Number(fs.readFileSync('nav_mark','utf8'));
var withdraw_not_ready = Number(fs.readFileSync('withdraw_not_ready','utf8'));

var omidp = 0 / 0;
var current_ask = 0; // Number(fs.readFileSync('current_ask','utf8'));
var current_bid = 0; // Number(fs.readFileSync('current_bid','utf8'));

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
    fs.appendFileSync('last_market_order',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'ORDER_FILL') {
    if (withdraw_not_ready == 1) {
      console.log('withdraw ready');
      withdraw_not_ready = 0;
      fs.writeFileSync('withdraw_not_ready',withdraw_not_ready + '\n');
    }
    const tnav = Number(data.accountBalance) - nav_withdraw;
    adnav *= 0.99;
    adnav += (tnav - nav) / nav / 100;
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
    con_str = data.price + '  ';
    if (Number(data.units) >= 0) con_str += ' ';
    con_str += data.units + ' pos ';
    if (pos >= 0) con_str += ' ';
    con_str += pos;

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

var loading = 1;
async function doTickLine(line) {
  const lst = line.split(' ');
  if (lst.length < 3) return;
  current_bid = Number(lst[1]);
  current_ask = Number(lst[2]);
  await doGotPrice();
}

async function doChunk(data) {
  clearTimeout(mainTimeout);
  mainTimeout = setTimeout(() => { doMain(); }, 100000);
  if (data.type != 'PRICE') { return; }
  current_bid = Number(data.bids[0].price);
  current_ask = Number(data.asks[0].price);
  await doGotPrice();
  const [t0,t1] = data.time.split('T');
  const [t2] = t1.split('Z');
  const new_pstr = t2
    + ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + '\n';
  fs.appendFileSync('../ticks',new_pstr);
  fs.writeFileSync('last_price',JSON.stringify(data) + '\n');
  // fs.writeFileSync('current_ask',current_ask + '\n');
  // fs.writeFileSync('current_bid',current_bid + '\n');
}

var tick_count = 0;
var dmidp = 0;
var dmidps = 0;
var ov_id = -1;
var v_id = -1;
var back_pos = 3;
var id_str = '';
async function doGotPrice() {
  const midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) omidp = midp;
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  tick_count++;
  omidp = midp;
  if (tick_count > div_n3) await doAves(div_n0,div_n1,div_n2,div_n3);
  else if (tick_count > div_n2) await doAves(div_n0,div_n1,div_n2,tick_count);
  else if (tick_count > div_n1) await doAves(div_n0,div_n1,tick_count,tick_count);
  else if (tick_count > div_n0) await doAves(div_n0,tick_count,tick_count,tick_count);
  else await doAves(tick_count,tick_count,tick_count,tick_count);

  tick_v[0] = 1;
  tick_v[1] = (amidp8 - amidp16) / aamidp16;
  tick_v[2] = (amidp16 - amidp32) / aamidp32;
  tick_v[3] = (amidp32 - amidp64) / aamidp64;

  tick_v[4] = (amidps8 - amidps16) / aamidps16;
  tick_v[5] = (amidps16 - amidps32) / aamidps32;
  tick_v[6] = (amidps32 - amidps64) / aamidps64;

  var vs = 0;
  for (var i = 0; i < v_len; i++) vs += tick_v[i] * tick_v[i];
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i = 0; i < v_len; i++) tick_nv[i] = tick_v[i] / vs;
  var tdot = 0;
  var dot_max = -2;
  var i_max = -1;
  if (v_id >= 0) {
    for (var ii = 0; ii < v_len; ii++) tdot += tick_nv[ii] * id_nv[v_id][ii];
    dot_max = tdot + cutx;
    i_max = v_id;
  }
  for (var i = 0; i < num_facets; i++) {
    if (i == v_id) continue;
    tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += tick_nv[ii] * id_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      i_max = i;
    }
  }
  if (i_max != v_id) {
    if (v_id >= 0) {
      const oback_pos = back_pos;
      if (vv_pos[i_max][v_id] == 3) back_pos = oback_pos;
      else back_pos = vv_pos[i_max][v_id];

      if ((back_pos == 1) && (oback_pos != 1) && (loading == 0)) {
        const size = Math.floor(levx * nav / midp - pos);
        if (size > 0) await doMarketOrder(size);
      }
      if ((back_pos == 2) && (oback_pos != 2) && (loading == 0)) {
        const size = Number((levx * nav / midp + pos).toFixed());
        if (size > 0) await doMarketOrder(-size);
      }
    }
    if (loading == 0) id_str += ' ' + i_max;
    ov_id = v_id;
    v_id = i_max;
  }
}

async function doAves(n0,n1,n2,n3) {
  amidp8 *= 1 - 1 / n0;
  amidp8 += dmidp / n0;
  amidp16 *= 1 - 1 / n1;
  amidp16 += dmidp / n1;
  amidp32 *= 1 - 1 / n2;
  amidp32 += dmidp / n2;
  amidp64 *= 1 - 1 / n3;
  amidp64 += dmidp / n3;

  amidps8 *= 1 - 1 / n0;
  amidps8 += dmidps / n0;
  amidps16 *= 1 - 1 / n1;
  amidps16 += dmidps / n1;
  amidps32 *= 1 - 1 / n2;
  amidps32 += dmidps / n2;
  amidps64 *= 1 - 1 / n3;
  amidps64 += dmidps / n3;

  aamidp16 *= 1 - 1 / n1;
  aamidp16 += Math.abs(amidp8 - amidp16) / n1;
  aamidp32 *= 1 - 1 / n2;
  aamidp32 += Math.abs(amidp16 - amidp32) / n2;
  aamidp64 *= 1 - 1 / n3;
  aamidp64 += Math.abs(amidp32 - amidp64) / n3;

  aamidps16 *= 1 - 1 / n1;
  aamidps16 += Math.abs(amidps8 - amidps16) / n1;
  aamidps32 *= 1 - 1 / n2;
  aamidps32 += Math.abs(amidps16 - amidps32) / n2;
  aamidps64 *= 1 - 1 / n3;
  aamidps64 += Math.abs(amidps32 - amidps64) / n3;
}

async function doTrade(midp) {
  buy_size = Number((levx * nav / midp).toFixed());
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


          mutexc++;
          mutex = mutex.then(async () => {
            console.log('loading');
            const tick_file = await fsPromises.open('../ticks');
            for await (const line of tick_file.readLines())
              await doTickLine(line);
            loading = 0;
            console.log('done loading pos ' + pos + ' back_pos ' + back_pos);
            // await doChunk(data);
            mutexc--;
          }, (err) => { console.log('caught main mutex err here ' + err); }
          ).catch((err) => { console.log('caught mains mutex err ' + err);
          // }).finally(async () => {
            // if (mutexc > 0) console.log('got mutexc ' + mutexc);
          });
doSummary();
doShowOrders();
doTrimOrders();
var mainTimeout = setTimeout(() => { doMain(); }, 9000);

doTransactions();
var transTimeout = setTimeout(() => { doTransactions(); }, 100000);

///

async function doPrintLine() {
  if (linec == 0) {
    console.log('   bids    asks     nav      adnav');
  }
  linec++; if (linec == 19) linec = 0;
  var tstr = ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + ' ' + nav.toExponential(4)
    + ' ' + adnav.toExponential(3)
    ;
  if (con_str != '') tstr += ' --- ' + con_str;
  tstr += ' ' + v_id;
  if (ov_id >= 0) tstr += ' ' + vv_pos[v_id][ov_id];
  fs.appendFileSync('log',tstr + '\n');
  console.log(tstr);
  con_str = '';

  fs.appendFileSync('log_id',id_str + '\n');
  id_str = '';
}

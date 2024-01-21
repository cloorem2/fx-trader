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


// console.log('doMain ' + new Date());
var chunk_save = '';
var linec = 0;
var levx = Number(fs.readFileSync('levx','utf8')) / 2;
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

var order_placed = 0;
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
        if (pos > 0) obase_pos = 1;
        else if (pos < 0) obase_pos = -1;
        else obase_pos = 0;
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
    adnav *= 0.9;
    adnav += (tnav - nav) / nav / 10;
    nav = tnav;
    if (nav > 4 * nav_mark) {
      // nav_withdraw += nav * 0.5;
      // fs.writeFileSync('nav_withdraw',nav_withdraw.toExponential(4) + '\n');
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
        order_placed = 0;
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
    nav = Number(data.accountBalance) - nav_withdraw;
    nav_mark = nav;
    fs.writeFileSync('nav',nav.toExponential(9) + '\n');
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
  const [t2,t3,t4] = t0.split('-');
  const [t5] = t1.split('Z');
  const [t6,t7,t8] = t5.split(':');
  var [t9,t10] = Number(t8).toFixed(3).split('.');
  while (t9.length < 2) t9 = '0' + t9;
  const t11 = t2 + t3 + t4 + t6 + t7 + t9 + t10;
  const new_pstr = t11
    + ' ' + current_bid.toFixed(5)
    + ' ' + current_ask.toFixed(5)
    + '\n';
  fs.appendFileSync('../ticks-2024',new_pstr);
  fs.writeFileSync('last_price',JSON.stringify(data) + '\n');
  // fs.writeFileSync('current_ask',current_ask + '\n');
  // fs.writeFileSync('current_bid',current_bid + '\n');
}

var tick_count = 0;
var dmidp = 0;
var dmidps = 0;
var ov_id = -1;
var v_id = -1;
var id_str = '';

const maxa_t = {};
const maxb_t = {};
const dir_t = {};
const leg_t = {};
const leg_id = [];
const num_strats = 5;
const prof_t = {};
try {
  var tc = 0;
  // const d = fs.readFileSync('leg_t','utf8');
  const d = fs.readFileSync('rdist2_leg_t_' + num_strats,'utf8');
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    leg_t[ii[0]] = tc; // Number(ii[1]);
    maxb_t[ii[0]] = Number(ii[1]); // 0;
    maxa_t[ii[0]] = Number(ii[2]); // 0;
    dir_t[ii[0]] = Number(ii[3]); // 0;
    leg_id[tc] = ii[0];
    tc++;
  }
} catch {}
try {
  const d = fs.readFileSync('prof_t_' + num_strats,'utf8');
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    prof_t[ii[0]] = Number(ii[1]);
  }
} catch {}

var obase_pos = 0;
var base_pos = 0;
var dir_t_str = '';
async function doGotPrice() {
  const midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) omidp = midp;
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  tick_count++;
  omidp = midp;

  base_pos = 0;
  // for (var i in leg_t) {
  var dir_key = '';
  for (var i = 0; i < num_strats; i++) {
    var t = leg_id[i];
    await doDir(t);
    if (dir_t[t] == 1) dir_key += '1';
    else if (dir_t[t] == -1) dir_key += '2';
    else { dir_key += '0';
      console.log('dir_key should not be getting this 0');
    }
    // base_pos += dir_t[i] * leg_t[i];
  }
  if (typeof prof_t[dir_key] == 'undefined') {
    console.log('why key ' + dir_key + ' zero');
    console.log(prof_t);
    return;
  }
  if (prof_t[dir_key] > 0) base_pos = 1;
  else if (prof_t[dir_key] < 0) base_pos = -1;
  else base_pos = obase_pos;

  if (loading == 0) {
    if (base_pos != obase_pos) {
      if (order_placed == 0) {
        if (base_pos > 0) {
          const size = Math.floor(levx * nav / midp - pos);
          // if (size > 0)
            await doMarketOrder(size);
          fs.appendFileSync('profile-buy',tick_count
            + ' ' + current_ask + ' ' + size + '\n');
        }
        if (base_pos < 0) {
          const size = Math.floor(levx * nav / midp + pos);
          // if (size > 0)
            await doMarketOrder(-size);
          fs.appendFileSync('profile-sell',tick_count
            + ' ' + current_bid + ' ' + size + '\n');
        }
        obase_pos = base_pos;
      }
    }
    var fstr = '';
    for (var i = 0; i < num_strats; i++) {
      var t = leg_id[i];
      if (dir_t[t] == 1)
        fstr += t
          + ' ' + maxb_t[t]
          + ' ' + (maxb_t[t] - Number(t)).toFixed(5)
          + ' ' + dir_t[t] + '\n';
      if (dir_t[t] == -1)
        fstr += t
          + ' ' + (maxa_t[t] + Number(t)).toFixed(5)
          + ' ' + maxa_t[t]
          + ' ' + dir_t[t] + '\n';
    }
    if (dir_t_str.indexOf(fstr) < 0) {
      dir_t_str = fstr;
      fs.writeFileSync('dir_t',fstr);
    }
    const nw = Number(fs.readFileSync('nav_withdraw','utf8'));
    if (nw != nav_withdraw) {
      nav += nav_withdraw - nw;
      nav_withdraw = nw;
    }
  }
}

async function doDir(tag) {
  const nleg = Number(tag);
  if (maxb_t[tag] == 0) {
    maxb_t[tag] = current_bid;
    maxa_t[tag] = current_ask;
  }
  if (dir_t[tag] == 0) {
    if (current_bid > maxb_t[tag]) {
      maxb_t[tag] = current_bid;
      if (maxb_t[tag] - maxa_t[tag] > nleg) dir_t[tag] = 1;
    }
    if (current_ask < maxa_t[tag]) {
      maxa_t[tag] = current_ask;
      if (maxb_t[tag] - maxa_t[tag] > nleg) dir_t[tag] = -1;
    }
  } else if (dir_t[tag] == 1) {
    if (current_bid > maxb_t[tag]) maxb_t[tag] = current_bid;
    if (current_ask < maxb_t[tag] - nleg) {
      maxa_t[tag] = current_ask;
      dir_t[tag] = -1;
    }
  } else if (dir_t[tag] == -1) {
    if (current_ask < maxa_t[tag]) maxa_t[tag] = current_ask;
    if (current_bid > maxa_t[tag] + nleg) {
      maxb_t[tag] = current_bid;
      dir_t[tag] = 1;
    }
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
  order_placed = 1;
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

/*
try {
  fs.renameSync('profile-buy','profile-buy0');
} catch {}
try {
  fs.renameSync('profile-sell','profile-sell0');
} catch {}
*/

          mutexc++;
          mutex = mutex.then(async () => {
            console.log('loading');
            // const tick_file2 = await fsPromises.open('../data/ticks-hist');
            // for await (const line of tick_file2.readLines())
              // await doTickLine(line);
            tick_count = 0;
            const tick_file = await fsPromises.open('../ticks-2024');
            for await (const line of tick_file.readLines())
              await doTickLine(line);
            loading = 0;
            console.log('done loading pos ' + pos);
            // await doChunk(data);

doSummary();
doShowOrders();
doTrimOrders();
mainTimeout = setTimeout(() => { doMain(); }, 9000);

doTransactions();
transTimeout = setTimeout(() => { doTransactions(); }, 100000);

            mutexc--;
          }, (err) => { console.log('caught main mutex err here ' + err); }
          ).catch((err) => { console.log('caught mains mutex err ' + err);
          // }).finally(async () => {
            // if (mutexc > 0) console.log('got mutexc ' + mutexc);
          });
var mainTimeout;
var transTimeout;
          /*
doSummary();
doShowOrders();
doTrimOrders();
var mainTimeout = setTimeout(() => { doMain(); }, 9000);

doTransactions();
var transTimeout = setTimeout(() => { doTransactions(); }, 100000);
*/

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
  tstr += ' ' + base_pos.toExponential(4);
  fs.appendFileSync('log',tstr + '\n');
  console.log(tstr);
  con_str = '';
}

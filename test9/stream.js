const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');
const api_key = 'Bearer ' + fs.readFileSync('../../oanda-api-key','utf8');
const account_id = fs.readFileSync('../../oanda-account-id','utf8');

const active_pairs = fs.readFileSync('active_pairs','utf8').split('\n');
// const pname = active_pairs[0];
// const pname = 'EUR_AUD';
const pname = 'AUD_USD';
console.log(pname);
// const stream_pairs = [ 'EUR_AUD', 'AUD_USD' ];
const stream_pairs = [ 'AUD_USD' ];

const stream_path = '/v3/accounts/' + account_id
  // + '/pricing/stream?instruments=' + pname;
  + '/pricing/stream?instruments=' + stream_pairs.join(',');
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

var precission = 5;
if (pname.indexOf('JPY') >= 0)
  precission = 3;





// console.log('doMain ' + new Date());
var chunk_save = '';
var linec = 0;
// var levx = Number(fs.readFileSync('levx','utf8'));
const final_t = fs.readFileSync('final_' + pname,'utf8').split('\n');
const final_l = final_t[0].split(' ');
const long_levx = Number(final_l[2]);
const amacdc = Number(final_l[3]);
const amidps0c = Number(final_l[4]);
const amidps1c = Number(final_l[5]);
const long_tpx = Number(final_l[6]);
const long_slx = Number(final_l[7]);
const shrt_tpx = Number(final_l[8]);
const shrt_slx = Number(final_l[9]);
const shrt_levx = Number(final_l[10]);
const levx = Number(final_l[2]);
console.log('levx',levx);
var aspread = Number(fs.readFileSync('aspread-' + pname,'utf8'));

// var pos = Number(fs.readFileSync('pos','utf8'));
const pos = {};
pos[pname] = 0;
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
        nav = Number(data.account.NAV);
        nav -= nav_withdraw;
        const positions = data.account.positions;
        for (var ii in positions) {
          console.log(positions[ii]);
          const tpname = positions[ii].instrument;
          const tpos = Number(positions[ii].long.units)
            + Number(positions[ii].short.units);
          if (tpos == 0) continue;
          // if (typeof pos[tpname] == 'undefined') pos[tpname] = 0;
          pos[tpname] = tpos;
          nav -= Number(positions[ii].long.unrealizedPL);
          nav -= Number(positions[ii].short.unrealizedPL);
        }
        fs.writeFileSync('nav',nav.toExponential(9) + '\n');
        if (nav_mark == 0) {
          nav_mark = nav;
          fs.writeFileSync('nav_mark',nav_mark.toExponential(9) + '\n');
        }
        console.log(pos);
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
  // console.log('doTransactions' + new Date());
  fs.appendFileSync('net_drops','doTransactions ' + new Date() + '\n');
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
  transTimeout = setTimeout(() => { doTransactions(); }, 40_000);
  if (data.type == 'MARKET_ORDER') {
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
    const tpname = data.instrument;
    pos[tpname] += Number(data.units);
    con_str = data.price + '  ';
    if (Number(data.units) >= 0) con_str += ' ';
    con_str += data.units + ' pos ';
    if (pos[tpname] >= 0) con_str += ' ';
    con_str += pos[tpname] + ' ' + tpname;

    if (Number(data.orderID) == sell_order_id) {
      sell_order_id = 0;
      fs.writeFileSync('sell_order_id',sell_order_id + '\n');
      console.log('filled at ' + data.price + '  ' + data.units + ' pos ' + pos[tpname]);
    } else if (Number(data.orderID) == buy_order_id) {
      buy_order_id = 0;
      fs.writeFileSync('buy_order_id',buy_order_id + '\n');
      console.log('filled at ' + data.price + '  ' + data.units + ' pos ' + pos[tpname]);
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

    fs.writeFileSync('nav',nav.toExponential(9) + '\n');
    fs.writeFileSync('adnav',adnav.toExponential(5) + '\n');
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
  fs.appendFileSync('net_drops','doMain        ' + new Date() + '\n');
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
  oday0 = lst[0].slice(6,8);
}

var oho0;
var oday0;
var current_time = '';
var ominStr = '';
async function doChunk(data) {
  clearTimeout(mainTimeout);
  mainTimeout = setTimeout(() => { doMain(); }, 40_000);
  if (data.type != 'PRICE') return;
  const tpname = data.instrument;
  if (tpname == pname) {
    current_bid = Number(data.bids[0].price);
    current_ask = Number(data.asks[0].price);
    // await doGotPrice();
  }
  const ticks_fn = '../ticks-' + tpname + '-';

  const [date0,time0] = data.time.split('T');
  const [year0,mo0,day0] = date0.split('-');
  const [time1] = time0.split('Z');
  const [ho0,mi0,sec0] = time1.split(':');
  var [sec1,sec2] = Number(sec0).toFixed(3).split('.');
  while (sec1.length < 2) sec1 = '0' + sec1;
  current_time = year0 + mo0 + day0 + ho0 + mi0 + sec1 + sec2;
  var minStr = year0 + mo0 + day0 + ho0 + mi0;
  if (minStr != ominStr) {
    await doGotPrice();
    ominStr = minStr;
  }
  const new_pstr = current_time
    + ' ' + data.bids[0].price
    + ' ' + data.asks[0].price
    // + ' ' + current_bid.toFixed(5)
    // + ' ' + current_ask.toFixed(5)
    + '\n';
  const t12 = year0 + mo0;
  fs.appendFileSync(ticks_fn + t12, new_pstr);
  aspread *= 1 - 1 / 100_000;
  aspread += (current_ask - current_bid) / 100_000;
  if (ho0 != oho0) {
    fs.writeFileSync('aspread-' + pname,aspread.toExponential(5) + '\n');
    fs.writeFileSync('last_price',JSON.stringify(data) + '\n');
    var fstr = '';
    for (var i = 0; i < num_strats; i++) {
      const t = leg_id[i];
      if (dir_t[t] == 1) {
        const a = (Number(maxb_t[t]) - Number(t)).toFixed(5);
        fstr += t + ' ' +  maxb_t[t] + ' ' + a + ' ' + dir_t[t] + '\n';
      }
      if (dir_t[t] == -1) {
        const b = (Number(maxa_t[t]) + Number(t)).toFixed(5);
        fstr += t + ' ' +  b + ' ' + maxa_t[t] + ' ' + dir_t[t] + '\n';
      }
    }
    fs.writeFileSync('dir_t',fstr);
    oho0 = ho0;
  }
  if (day0 != oday0) {
    adnav *= 0.9;
    fs.writeFileSync('adnav',adnav.toExponential(5) + '\n');
    oday0 = day0;
  }

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
  const d = fs.readFileSync('rdist_' + pname,'utf8');
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
  const d = fs.readFileSync('prof_t_' + pname,'utf8');
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    prof_t[ii[0]] = Number(ii[1]);
  }
} catch {}

var odir_key = '';
var trade_control = 0;
var amidps0 = Number(fs.readFileSync('amidps0-' + pname,'utf8'));
var amidps1 = Number(fs.readFileSync('amidps1-' + pname,'utf8'));
var amacd = Number(fs.readFileSync('amacd-' + pname,'utf8'));
var macd_key = 0;
const amacd_max_pd0 = Number(fs.readFileSync('amacd_max_pd0-' + pname,'utf8'));
const amacd_max_pd1 = Number(fs.readFileSync('amacd_max_pd1-' + pname,'utf8'));
const long_tp = amacd_max_pd1 * long_tpx;
const long_sl = amacd_max_pd1 * long_slx;
const shrt_tp = amacd_max_pd0 * shrt_tpx;
const shrt_sl = amacd_max_pd0 * shrt_slx;
async function doGotPrice() {
  const midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) omidp = midp;
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  tick_count++;
  omidp = midp;

  amidps0 *= 1 - 1 / amidps0c;
  amidps0 += midp / amidps0c;
  amidps1 *= 1 - 1 / amidps1c;
  amidps1 += midp / amidps1c;
  const macd = amidps0 - amidps1;
  amacd *= 1 - 1 / amacdc;
  amacd += macd / amacdc;
  if (macd > amacd) {
    if (macd_key == -1) {
      // if (pos[pname] == 0) {
        const size = Math.floor(long_levx * nav / current_ask - pos[pname]);
        const tp = (current_ask + long_tp).toFixed(precission);
        const sl = (current_ask - long_sl).toFixed(precission);
        if (trade_control == 1)
          await doMarketOrder(size,tp,sl,pname);
        else console.log('would have traded',size,current_ask,tp,sl,pname);
      // }
    }
    macd_key = 1;
  }
  if (macd < amacd) {
    if (macd_key == 1) {
      if (pos[pname] == 0) {
          const size = Math.floor(shrt_levx * nav / current_bid);
          const tp = (current_bid + shrt_tp).toFixed(precission);
          const sl = (current_bid - shrt_sl).toFixed(precission);
        if (trade_control == 1)
          await doMarketOrder(-size,tp,sl,pname);
        else console.log('would have traded',-size,current_bid,tp,sl,pname);
      }
    }
    macd_key = -1;
  }
  const tc = Number(fs.readFileSync('trade_control','utf8'));
  if (tc != trade_control) {
    console.log('got trade_control',tc);
    trade_control = tc;
  }
  const nw = Number(fs.readFileSync('nav_withdraw','utf8'));
  if (nw != nav_withdraw) {
    nav += nav_withdraw - nw;
    nav_withdraw = nw;
  }
  return;

  var dir_key = '';
  for (var i = 0; i < num_strats; i++) {
    var t = leg_id[i];
    await doDir(t);
    if (dir_t[t] == 1) dir_key += '1';
    else if (dir_t[t] == -1) dir_key += '2';
    else { dir_key += '0';
      console.log('dir_key should not be getting this 0');
    }
  }
  if (typeof prof_t[dir_key] == 'undefined') {
    console.log('why key ' + dir_key + ' zero');
    console.log(prof_t);
    return;
  }

  if (loading == 0) {
    // if (prof_t[dir_key] * prof_t[odir_key] < 0) {
    if (trade_control == 1) {
      if (prof_t[dir_key] * pos[pname] <= 0) {
        if (order_placed == 0) {
          for (var ii in pos) {
            if (ii == pname) continue;
            if (pos[ii] == 0) continue;
            await doMarketOrder(-pos[ii],ii);
          }
          if (prof_t[dir_key] > 0) {
            // const size = Math.floor(levx * nav / midp - pos[pname]);
            const size = Math.floor(levx * nav / current_ask - pos[pname]);
            await doMarketOrder(size,pname);
            fs.appendFileSync('profile-buy',current_time
              + ' ' + current_ask + ' ' + size
              + ' ' + dir_key + ' ' + prof_t[dir_key]
              + '\n');
          }
          if (prof_t[dir_key] < 0) {
            // const size = Math.floor(levx * nav / midp + pos[pname]);
            const size = Math.floor(levx * nav / current_bid + pos[pname]);
            await doMarketOrder(-size,pname);
            fs.appendFileSync('profile-sell',current_time
              + ' ' + current_bid + ' ' + size
              + ' ' + dir_key + ' ' + prof_t[dir_key]
              + '\n');
          }
        }
      }
    }
    const tc = Number(fs.readFileSync('trade_control','utf8'));
    if (tc != trade_control) {
      console.log('got trade_control',tc);
      trade_control = tc;
    }
    const nw = Number(fs.readFileSync('nav_withdraw','utf8'));
    if (nw != nav_withdraw) {
      nav += nav_withdraw - nw;
      nav_withdraw = nw;
    }
  }
  if (odir_key != dir_key)
    console.log('dir_key',dir_key,'prof_t',prof_t[dir_key]);
  odir_key = dir_key;
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

async function doTrade(midp) {
  buy_size = Number((levx * nav / midp).toFixed());
  sell_size = buy_size;
  if (pos[pname] > 0) { buy_size = 0; sell_size = pos[pname]; }
  else if (pos[pname] < 0) { sell_size = 0; buy_size = -pos[pname]; }
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
      // instrument: "EUR_USD",
      instrument: pname,
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

async function doMarketOrder(size,tp,sl,tpname) {
  // console.log('doMarketOrder ' + size);
  if (size == 0) return;
  order_placed = 1;
  const body = {
    order: {
      // instrument: "EUR_USD",
      instrument: tpname,
      units: size.toFixed(),
      type: "MARKET",
      stopLossOnFill: sl,
      takeProfitOnFill: tp,
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
      // instrument: "EUR_USD",
      instrument: pname,
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

var mainTimeout;
var transTimeout;

          mutexc++;
          mutex = mutex.then(async () => {
            console.log('loading');
            doSummary();
            doTransactions();
            // doShowOrders();
            // doTrimOrders();
            // const tick_file2 = await fsPromises.open('../data/ticks-hist');
            // for await (const line of tick_file2.readLines())
              // await doTickLine(line);
              /*   /// not loading
            tick_count = 0;
            for (const f of fs.readdirSync('..')) {
              if (f.indexOf('ticks-' + pname) == 0) {
                const tick_file = await fsPromises.open('../' + f);
                for await (const line of tick_file.readLines())
                  await doTickLine(line);
              }
            } */
            loading = 0;
            console.log('done loading oday0',oday0);
            // console.log(dir_t);
            // console.log(maxb_t);
            // console.log(maxa_t);
            // await doChunk(data);

            mainTimeout = setTimeout(() => { doMain(); }, 10_000);


            mutexc--;
          }, (err) => { console.log('caught main mutex err here ' + err);
          }).catch((err) => { console.log('caught mains mutex err ' + err);
          // }).finally(async () => {
            // if (mutexc > 0) console.log('got mutexc ' + mutexc);
          });

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
  fs.appendFileSync('log',tstr + '\n');
  console.log(tstr);
  con_str = '';
}

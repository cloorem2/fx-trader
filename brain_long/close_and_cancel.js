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

const close_path = '/v3/accounts/' + account_id + '/positions/EUR_USD/close';
const close_options = {
  host: 'api-fxtrade.oanda.com',
  path: close_path,
  method: 'PUT',
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  },
}

var maxb = Number(fs.readFileSync('maxb','utf8'));
var maxa = Number(fs.readFileSync('maxa','utf8'));
var apvar = Number(fs.readFileSync('apvar','utf8'));
var aspread = Number(fs.readFileSync('aspread','utf8'));
var chunk_save = '';

var sdelay = Number(fs.readFileSync('sdelay','utf8'));
var oh0 = Number(fs.readFileSync('oh0','utf8'));
var om0 = Number(fs.readFileSync('om0','utf8'));
var os0 = Number(fs.readFileSync('os0','utf8'));

var linec = 0;
var dmid_brain = [0,0,0,0,0,0];
const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
const dmid_brain_lines = dmid_brain_data.split('\n');
for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

var pvar_brain = [0,0,0,0,0,0];
const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
const pvar_brain_lines = pvar_brain_data.split('\n');
for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);

var v = [1,1,1,1,1,1],nv = [0,0,0,0,0,0];
try {
  const v_data = fs.readFileSync('main_vec','utf8');
  const v_lines = v_data.split('\n');
  for (var i in v) v[i] = Number(v_lines[i]);
} catch {}

var apvar = Number(fs.readFileSync('apvar','utf8'));
var pvarp = apvar;
var aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
var pdmidp = aadmidp;
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
          if (mutexc > max_mutexc) {
            max_mutexc = mutexc;
            console.log('max_mutexc ' + max_mutexc);
          }
          mutex = mutex.then(async () => {
            await doTransData(data);
            mutexc--;
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
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
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
    nav = Number(data.accountBalance);
    nav -= nav_withdraw;

    if (nav > 2 * nav_mark) {
      nav_withdraw += nav * 0.25;
      fs.writeFileSync('nav_withdraw',nav_withdraw.toExponential(4) + '\n');
      nav *= 0.75;
      nav_mark = nav;
      fs.writeFileSync('nav_mark',nav_mark.toExponential(9) + '\n');
      withdraw_not_ready = 1;
      fs.writeFileSync('withdraw_not_ready',withdraw_not_ready + '\n');
      console.log('withdrawing ' + (nav * 0.25).toFixed(2)
        + ' to new mark ' + nav_mark.toFixed(2));
    }
    fs.writeFileSync('nav',nav.toExponential(9) + '\n');
    pos += Number(data.units);
    // console.log('new pos ' + pos);
    fs.writeFileSync('pos',pos.toFixed() + '\n');
    fs.writeFileSync('last_order_fill',JSON.stringify(data) + '\n');
    // console.log('order fill data');
    // console.log(data);
    fs.appendFileSync('last_trans','------------\n');
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'DAILY_FINANCING') {
    return;
  }
  if (data.type == 'ORDER_CANCEL') {
    if (data.reason == 'CLIENT_REQUEST_REPLACED') {
    } else if (data.reason == 'CLIENT_REQUEST') {
    } else {
      console.log('here is the other cancel');
      console.log(data);
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
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
  if (data.type == 'ORDER_CANCEL_REJECT') {
    fs.writeFileSync('last_order_cancel_reject',JSON.stringify(data) + '\n');
    fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
    return;
  }
  console.log('transactions data');
  console.log(data);
  fs.appendFileSync('last_trans',JSON.stringify(data) + '\n');
}

var main_json = '';
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
          if (mutexc > max_mutexc) {
            max_mutexc = mutexc;
            console.log('max_mutexc ' + max_mutexc);
          }
          mutex = mutex.then(async () => {
            await doChunk(data);
            mutexc--;
          }).catch((e) => {
            console.log('catch data ' + e);
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
  // const tm0 = nm0 < om0 ? nm0 + 60 - om0 : nm0 - om0;
  // const ts0 = ns0 < os0 ? ns0 + 60 - os0 : ns0 - os0;
  // const tdelay = th0 * 60 * 60 + tm0 * 60 + ts0;
  const tdelay = th0 * 60 * 60 + (nm0 - om0) * 60 + (ns0 - os0);
  if (tdelay >= sdelay) await doMadeDelay(nh0,nm0,ns0);
  fs.writeFileSync('current_ask',current_ask + '\n');
  fs.writeFileSync('current_bid',current_bid + '\n');
  fs.writeFileSync('maxa',maxa.toFixed(6) + '\n');
  fs.writeFileSync('maxb',maxb.toFixed(6) + '\n');
}

var ordersTimeout;
async function doMadeDelay( nh0,nm0,ns0 ) {
  const spread = 2 * (current_ask - current_bid) / (current_ask + current_bid);
  const midp = (maxb + maxa) / 2;
  const pvar = 2 * (maxb - maxa) / (maxb + maxa);
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
  await doTrade(midp,pvar);
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

  apvar = Number(fs.readFileSync('apvar','utf8'));
  aspread = Number(fs.readFileSync('aspread','utf8'));
  if (apvar < 2 * aspread) sdelay *= 1.0001;
  else sdelay *= 0.9999;
  fs.writeFileSync('sdelay',sdelay.toExponential(9) + '\n');

  if (linec == 0) {
    console.log('    pvar    delay    bids    asks     nav     utc');
  }
  linec++; if (linec == 9) linec = 0;
  const closep = (current_ask + current_bid) / 2;
  var tstr =
    pvar.toExponential(3)
    + ' ' + sdelay.toExponential(3)
    + ' ' + maxb.toFixed(5)
    + ' ' + maxa.toFixed(5)
    // + ' ' + closep.toFixed(5)
    + ' ' + nav.toExponential(4);
  // if (pos > 0) tstr += ' ';
  // tstr += ' ' + pos.toFixed(0) + ' ';
  tstr += ' ' + time_str;
  tstr += ' --- ' + trade_str;
  // if (miss_type > 0) {
    // tstr += ' <- ' + miss_counts[0] + ' ' + miss_counts[2];
  // }
  trade_str = '';
  fs.appendFileSync('log',tstr + '\n');
  if (pvar >= 0) tstr = ' ' + tstr;
  console.log(tstr);
  oh0 = nh0; fs.writeFileSync('oh0',oh0.toFixed() + '\n');
  om0 = nm0; fs.writeFileSync('om0',om0.toFixed() + '\n');
  os0 = ns0; fs.writeFileSync('os0',os0.toFixed() + '\n');
  maxa = current_ask;
  maxb = current_bid;

  await readFiles();
  ordersTimeout = setTimeout(() => { doGetOrders(); }, sdelay / 2 * 1000);
  // await doGetOrders();
}

async function doTrade(midp,pvar) {
  const dmidp = (midp - omidp) / omidp;
  omidp = midp;

  v[5] = v[4];
  v[4] = v[3];
  // v[3] = pvarp / apvar;
  v[3] = pvar / apvar;
  v[2] = 1;
  v[1] = v[0];
  v[0] = dmidp / aadmidp;
  var vs = 0;
  for (var i in v) vs += v[i] * v[i];
  vs = Math.sqrt(vs);
  for (var i in v) nv[i] = v[i] / vs;

  pdmidp = 0;
  for (var i in nv) pdmidp += dmid_brain[i] * nv[i];
  pdmidp *= aadmidp / apdmidp;

  pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * nv[i];
  if (pvarp < 0) pvarp = 0;
  pvarp *= apvar / apvarp;

  const tmidp = midp * pdmidp + midp;
  // sellp = Number((tmidp + tmidp * pvarp / 2 + sellm).toFixed(5));
  sellp = Number((tmidp
    + midp * pdmidp * sellf2
    + tmidp * pvarp * sellf
    + sellm).toFixed(5));
  buyp = Number((tmidp
    - midp * pdmidp * sellf2
    - tmidp * pvarp * sellf
    - sellm).toFixed(5));
  // if (Math.abs(sellp - buyp) < 1e-4) return;
  // if (sellp < buyp) { var tp = sellp; sellp = buyp; buyp = tp; }

  buy_size = levx * 50 * nav / midp;
  sell_size = buy_size;
  if (pos > 0) { buy_size = 0; sell_size = pos; }
  if (pos < 0) { sell_size = 0; buy_size = -pos; }
  buy_size = Number(buy_size.toFixed());
  sell_size = Number(sell_size.toFixed());
  if (sell_size > 0) {
    trade_str += ' ' + (-sell_size).toFixed() + ' ' + sellp;
    if (sell_order_id == 0) await doOrder(sellp,-sell_size);
    else await doUpdateOrder(sellp,-sell_size,sell_order_id,sell_order_touch);
  } else if (sell_order_id > 0) await doCancelAll(sell_order_id);
  if (buy_size > 0) {
    trade_str += ' ' + buy_size.toFixed() + ' ' + buyp;
    if (buy_order_id == 0) await doOrder(buyp,buy_size);
    else await doUpdateOrder(buyp,buy_size,buy_order_id,buy_order_touch);
  } else if (buy_order_id > 0) await doCancelAll(buy_order_id);

  /*
  buy_size = levx * 50 * nav / midp - pos;
  if (buy_size < 0) buy_size = 0;
  sell_size = levx * 50 * nav / midp + pos;
  if (sell_size < 0) sell_size = 0;
  buy_size = Number(buy_size.toFixed());
  sell_size = Number(sell_size.toFixed());
  if (sell_size > buy_size) {
    if (sell_size > 0) {
      if (order_id == 0) await doOrder(sellp,-sell_size);
      else await doUpdateOrder(sellp,-sell_size);
    } else if (order_id > 0)
      console.log('should cancel here ' + order_id);
    order_price = sellp;
    order_size = -sell_size;
  } else {
    if (buy_size > 0) {
      if (order_id == 0) await doOrder(buyp,buy_size);
      else await doUpdateOrder(buyp,buy_size);
    } else if (order_id > 0)
      console.log('should cancel here ' + order_id);
    order_price = buyp;
    order_size = buy_size;
  }
  */

  fs.writeFileSync('omidp',omidp.toExponential(9) + '\n');
}

async function doCloseAll() {
  var clean_chunk = '';
  var req = https.request(close_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      try {
        const data = JSON.parse(clean_chunk);
        // console.log('cancel all ' + order_id);
        console.log(data);
        if (clean_chunk.indexOf('REJECT') >= 0) {
          // console.log('close all reject');
        }
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  const body = {
    longUnits: "ALL",
    shortUnits: "ALL",
  }

  req.write(JSON.stringify(body) + '\n');
  req.end();
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
        console.log(data);
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
  if (Number(size.toFixed()) == 0) return;
  var torder_touch = 0;
  if (size > 0) if (price >= current_ask) torder_touch = 1;
  if (size < 0) if (price <= current_bid) torder_touch = 1;
  if (torder_touch == 1) trade_str += ' <--';
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
              // console.log('missing buy_order_id ' + id + ' catch in doUpdateOrder');
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
              // console.log('missing sell_order_id ' + id + ' catch in doUpdateOrder');
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
        // console.log('doUpdateOrder data ' + order_id + ' ' + price + ' ' + size);
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  const price_str = price.toFixed(5);
  // while (price_str.length < 7) price_str += '0';
  const body = {
    order: {
      price: price_str,
      instrument: "EUR_USD",
      units: size.toFixed(),
      type: "LIMIT",
    }
  }
  if (size > 0) {
    if (price >= current_ask) {
      body.order.type = "MARKET_IF_TOUCHED";
    }
  } else {
    if (price <= current_bid) {
      body.order.type = "MARKET_IF_TOUCHED";
    }
  }
  req.write(JSON.stringify(body) + '\n');
  req.end();
}

async function doOrder(price,size) {
  if (Number(size.toFixed()) == 0) return;
  var torder_touch = 0;
  if (size > 0) if (price >= current_ask) torder_touch = 1;
  if (size < 0) if (price <= current_bid) torder_touch = 1;
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
              // console.log('missing buy_order_id ' + id + ' catch in doOrder');
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
              // console.log('missing sell_order_id ' + id + ' catch in doOrder');
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
  const price_str = price.toFixed(5);
  const body = {
    order: {
      price: price_str,
      instrument: "EUR_USD",
      units: size.toFixed(),
      type: "LIMIT",
    }
  }
  if (size > 0) {
    if (price >= current_ask)
      body.order.type = "MARKET_IF_TOUCHED";
  } else {
    if (price <= current_bid)
      body.order.type = "MARKET_IF_TOUCHED";
  }
  req.write(JSON.stringify(body) + '\n');
  req.end();
}

async function doGetOrders() {
  // console.log('get orders');
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
          // if (Number(i.id) == buy_order_id) {
            // okay
          // } else if (Number(i.id) == sell_order_id) {
            // okay
          // } else {
            // console.log('why in the wholy hell is this');
            // console.log(i);
            doCancelAll(i.id);
          // }
        }
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
}

async function readFiles() {
  apvar = Number(fs.readFileSync('apvar','utf8'));
  aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
  sellm = Number(fs.readFileSync('sellm','utf8'));
  sellf = Number(fs.readFileSync('sellf','utf8'));
  sellf2 = Number(fs.readFileSync('sellf2','utf8'));
  levx = Number(fs.readFileSync('opt_levx','utf8'));
  // levx /= 5;

  aadmid_err = Number(fs.readFileSync('aadmid_err','utf8'));
  aapvar_err = Number(fs.readFileSync('aapvar_err','utf8'));
  aspread = Number(fs.readFileSync('aspread','utf8'));

  apdmidp = Number(fs.readFileSync('apdmidp','utf8'));
  apvarp = Number(fs.readFileSync('apvarp','utf8'));

  const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
  const dmid_brain_lines = dmid_brain_data.split('\n');
  for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

  const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
  const pvar_brain_lines = pvar_brain_data.split('\n');
  for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);

  var tstr = '';
  for (var i in nv) tstr += v[i].toExponential(9) + '\n';
  fs.writeFileSync('main_vec',tstr);
}

// readFiles();

// doMain();
// doSummary();
doGetOrders();
doCloseAll();
// var mainTimeout = setTimeout(() => { doMain(); }, 9000);

// doTransactions();
// var transTimeout = setTimeout(() => { doTransactions(); }, 100000);

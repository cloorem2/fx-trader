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
var apvar = Number(fs.readFileSync('apvar','utf8'));
var aspread = Number(fs.readFileSync('aspread','utf8'));
var chunk_save = '';
var sdelay = Number(fs.readFileSync('sdelay','utf8'));

var dmid_brain = [0,0,0,0,0,0];
const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
const dmid_brain_lines = dmid_brain_data.split('\n');
for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

var pvar_brain = [0,0,0,0,0,0];
const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
const pvar_brain_lines = pvar_brain_data.split('\n');
for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);

var v = [0,0,0,0,0,0],nv = [0,0,0,0,0,0];

var aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
var aadmid_err = Number(fs.readFileSync('aadmid_err','utf8'));
var aapvar_err = Number(fs.readFileSync('aapvar_err','utf8'));

var sellp = 1000,buyp = 0;
var sell_size = 0,buy_size = 0;
var omidp = 1;
var orders_placed = 0;
var pos = 0;
var balance = 1;
var posp = 0;
var nav = 1;
var max_nav = 1;
var long_nav = 0.5,short_nav = 0.5;
var max_dd = 0;
var opt_levx = Number(fs.readFileSync('opt_levx','utf8'));
// var opt_levx = 0.01;
var levx = opt_levx;

  var pdmidp = 0;
  var pvarp = 0;

  var a = 1, b = 1;
var opt_sellm = Number(fs.readFileSync('sellm','utf8'));
var opt_sellf = Number(fs.readFileSync('sellf','utf8'));
// var opt_sellf = 0.5;
var opt_buym = Number(fs.readFileSync('buym','utf8'));
// opt_sellm = 0; opt_buym = 0;
var sellm = opt_sellm,buym = opt_buym;
var sellf = opt_sellf;
var tsell_brain = [0,0,0,0,0,0];
var tbuy_brain = [0,0,0,0,0,0];
var sell_brain = [0,0,0,0,0,0];
try {
  const sell_brain_data = fs.readFileSync('sell_brain','utf8');
  const sell_brain_lines = sell_brain_data.split('\n');
  for (var i in sell_brain) {
    sell_brain[i] = Number(sell_brain_lines[i]);
    tsell_brain[i] = Number(sell_brain_lines[i]);
  }
} catch {}

var buy_brain = [0,0,0,0,0,0];
try {
  const buy_brain_data = fs.readFileSync('buy_brain','utf8');
  const buy_brain_lines = buy_brain_data.split('\n');
  for (var i in buy_brain) {
    buy_brain[i] = Number(buy_brain_lines[i]);
    tbuy_brain[i] = Number(buy_brain_lines[i]);
  }
} catch {}

var apdmidp = Number(fs.readFileSync('apdmidp','utf8'));
// var apdmidp = 0;
var apvarp = Number(fs.readFileSync('apvarp','utf8'));

      // a = 4 * Math.log(aadmid_err);
      // b = 4 * Math.log(apvar);
      a = Number(fs.readFileSync('reala','utf8'));
      b = Number(fs.readFileSync('realb','utf8'));
console.log('doMain ' + new Date());
    var tcount = 0;
// var opt_balance = Number(fs.readFileSync('opt_balance','utf8'));
// var abalance = 1;
var smode = 0;
var vmod0 = [0,0,0,0,0,0];
var vmod1 = [0,0,0,0,0,0];
var optx = 0;
var opt_optx = Number(fs.readFileSync('opt_optx','utf8'));
// var opt_optx = 0;
var opt_nav = Number(fs.readFileSync('opt_nav','utf8'));
var opt_long_nav = 0.5,opt_short_nav = 0.5;
var aoptx = opt_optx;
var opt_count = 0;
var out_count = 0;

var tmidp = 0;

async function readFiles() {
  apvar = Number(fs.readFileSync('apvar','utf8'));
  aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
  aadmid_err = Number(fs.readFileSync('aadmid_err','utf8'));
  aapvar_err = Number(fs.readFileSync('aapvar_err','utf8'));
  aspread = Number(fs.readFileSync('aspread','utf8'));

  sdelay = Number(fs.readFileSync('sdelay','utf8'));

  const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
  const dmid_brain_lines = dmid_brain_data.split('\n');
  for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

  const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
  const pvar_brain_lines = pvar_brain_data.split('\n');
  for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);

  fs.writeFileSync('apdmidp',apdmidp.toExponential(9) + '\n');
  fs.writeFileSync('apvarp',apvarp.toExponential(9) + '\n');
  fs.writeFileSync('reala',a.toExponential(9) + '\n');
  fs.writeFileSync('realb',b.toExponential(9) + '\n');
}

async function doMain() {
  await readFiles();
  // while (true) {
    const run_candles = 1000;
    while (true) {
      // console.log('a ' + a.toExponential(3) + ' ' + b.toExponential(3) + ' b');
      for (var i in v) { v[i] = 1; nv[i] = 0; }
      sellp = 1000,buyp = 0;
      sell_size = 0,buy_size = 0;
      omidp = 1;
      balance = 1;
      nav = 1;
      max_nav = 1;
      long_nav = 0.5;
      short_nav = 0.5;
      max_dd = 0;
      pos = 0;
      orders_placed = 0;
      pdmidp = 0;
      pvarp = 0;
      var linec = 0;
      sell_counts = [0,0,0,0,0];
      buy_counts = [0,0,0,0,0];
      while (linec++ < run_candles) await doLine();
      // fs.renameSync('tprice','tprice0');
      // optx = nav * (1 - max_dd);
      const nmonths = run_candles * sdelay / 60 / 60 / 24 / 30;
      // console.log('nmonths ' + nmonths.toFixed(2));
      if (smode == 0) {
        if (nav > 0) {
          optx = Math.log(nav) / nmonths;
          opt_optx *= 0.99999;
          opt_optx += optx / 100000;
          fs.writeFileSync('opt_optx',opt_optx.toExponential(9) + '\n');
        } else opt_optx = -1;
        // fs.renameSync('tprice0','tprice1');
        // opt_nav *= 0.999;
        // opt_nav += nav / 1000;
        // fs.writeFileSync('opt_nav',opt_nav.toExponential(9) + '\n');
        opt_long_nav *= 0.999;
        opt_long_nav += long_nav / 1000;
        opt_short_nav *= 0.999;
        opt_short_nav += short_nav / 1000;
        await doFreshVector();
        smode = 1;
      } else if (smode == 1) {
        // if (balance > opt_balance) await doBigBalance();
        if (nav > 0) {
          optx = Math.log(nav) / nmonths;
          if (optx > opt_optx) await doBigBalance();
        }
        await doOptVector();
        smode = 0;
      }
    }
  // }
  // mainTimeout = setTimeout(() => { doMain(); }, 100000);
}

async function doOptVector() {
  for (var i in v) { tsell_brain[i] = sell_brain[i]; }
  for (var i in v) { tbuy_brain[i] = buy_brain[i]; }
  levx = opt_levx;
  sellm = opt_sellm;
  sellf = opt_sellf;
  // buym = opt_buym;

  opt_count++;
  if (opt_count == 15000) {
    await doPrintLine();
    opt_count = 0;
  }
}

async function doFreshVector() {
  const d = 10 ** (tcount + 3);
  /*
  var vs = 0;
  for (var i in v) {
    vmod0[i] = 2 * Math.random() - 1;
    vs += vmod0[i] * vmod0[i];
  }
  for (var i in v) vmod0[i] /= vs * d;
  for (var i in v) tsell_brain[i] = sell_brain[i] + vmod0[i];
  vs = 0;
  for (var i in v) {
    vmod1[i] = 2 * Math.random() - 1;
    vs += vmod1[i] * vmod1[i];
  }
  for (var i in v) vmod1[i] /= vs * d;
  for (var i in v) tbuy_brain[i] = buy_brain[i] + vmod1[i];
  */
  var x = (2 * Math.random() - 1) / 2;
  levx = opt_levx * (1 + x);
  if (levx > 0.9) levx = 0.9;
  // levx = Math.random() / d;
  // levx = opt_levx;
  sellm = opt_sellm + (2 * Math.random() - 1) / d;
  sellf = opt_sellf + (2 * Math.random() - 1) / 10;
  // buym = opt_buym + (2 * Math.random() - 1) / d;

  tcount++;
  if (tcount == 5) tcount = 0;
}

async function doBigBalance() {
  if (optx < 1) return;
  aoptx *= 0.9999;
  aoptx += optx / 10000;
  if (optx < aoptx) return;
  // const d = optx - opt_optx;
  const d = 0.01;

  // if (balance < 1) return;
  // abalance *= 0.99;
  // abalance += balance / 100;
  // if (balance < abalance) return;
  // const d = balance - opt_balance;
  var tstr = '';
  for (var i in v) {
    sell_brain[i] += d * vmod0[i];
    tstr += sell_brain[i].toExponential(9) + '\n';
  }
  fs.writeFileSync('sell_brain',tstr);
  tstr = '';
  for (var i in v) {
    buy_brain[i] += d * vmod1[i];
    tstr += buy_brain[i].toExponential(9) + '\n';
  }
  fs.writeFileSync('buy_brain',tstr);

  opt_levx *= 0.999;
  opt_levx += levx / 1000;
  fs.writeFileSync('opt_levx',opt_levx.toExponential(9) + '\n');
  opt_sellm *= 0.999;
  opt_sellm += sellm / 1000;
  fs.writeFileSync('sellm',opt_sellm.toExponential(9) + '\n');
  opt_sellf *= 0.99;
  opt_sellf += sellf / 100;
  fs.writeFileSync('sellf',opt_sellf.toExponential(9) + '\n');

  /*
  opt_buym *= 0.99;
  opt_buym += buym / 100;
  fs.writeFileSync('buym',opt_buym.toExponential(9) + '\n');
  */

  /*
  console.log(optx.toExponential(3)
    + ' ' + aoptx.toExponential(3)
    + ' ' + opt_optx.toExponential(3)
    + ' ' + Math.exp(opt_optx).toExponential(3)
    + ' ' + tcount
    + ' ' + opt_levx.toExponential(3)
    + ' ' + opt_sellm.toExponential(3)
    + ' ' + opt_buym.toExponential(3)
    + ' ' + omidp.toExponential(3)
    + ' *'
  );
  out_count++;
  if (out_count >= 10) { out_count = 0;
    console.log('    optx    aoptx opt_optx opt_nav  tc  levx   sm   bm  midp');
  }
  opt_count = 0;
  */
}

var trade_counts = [0,0,0,0,0];
async function doPrintLine() {
  await readFiles();
  out_count++;
  if (out_count >= 10) {
    out_count = 0;
    console.log('    aoptx opt_optx opt_nav    long    short   tc  levx   sm    sf');
  }
  console.log( aoptx.toExponential(3)
    + ' ' + opt_optx.toExponential(3)
    // + ' ' + opt_nav.toExponential(3)
    + ' ' + (Math.exp(opt_optx) - 1).toExponential(3)
    + ' ' + opt_long_nav.toExponential(3)
    + ' ' + opt_short_nav.toExponential(3)
    + ' ' + tcount
    + ' ' + opt_levx.toExponential(3)
    + ' ' + opt_sellm.toExponential(3)
    + ' ' + opt_sellf.toExponential(3)
    // + ' ' + opt_buym.toExponential(3)
    // + ' ' + omidp.toExponential(3)
    /*
    + ' ' + sell_counts[0]
    + ' ' + sell_counts[1]
    + ' ' + sell_counts[2]
    + ' --- ' + buy_counts[0]
    + ' ' + buy_counts[1]
    + ' ' + buy_counts[2]
    */
  );
}

async function doLine(line) {
  var y = Math.random();
  var x = Math.sqrt(Math.log(y) / a);
  if (Math.random() > 0.5) x *= -1;
  apdmidp *= 0.9999;
  apdmidp += Math.abs(x) / 10000;
  if (apdmidp > aadmid_err) a *= 1.0001;
  else a *= 0.9999;
  pdmidp += x;
  // pdmidp = pdmidp + aadmid_err * 2 * (2 * Math.random() - 1);

  y = Math.random();
  x = Math.sqrt(Math.log(y) / b);
  if (Math.random() > 0.5) x *= -1;
  apvarp *= 0.9999;
  apvarp += Math.abs(x) / 10000;
  if (apvarp > aapvar_err) b *= 1.0001;
  else b *= 0.9999;
  pvarp += x;
  if (pvarp < 0) pvarp = 0;
  // pvarp = 2 * Math.random() * pvarp;
  // console.log(a,b);
  // console.log(pdmidp,pvarp);

  const midp = omidp * pdmidp + omidp;
  // console.log(midp,tmidp);
  const highp = midp + midp * pvarp / 2;
  const lowp = midp - midp * pvarp / 2;
  // fs.appendFileSync('tprice',midp.toFixed(5) + ' ' + nav.toFixed(5) + '\n');
  // console.log(highp,sellp,buyp,lowp,pvarp);
  if (orders_placed == 1) {
    // var stype = 0;
    // var btype = 0;
    if (highp >= sellp) {
      if (highp < sellp + aspread / 2) {
        if (Math.random() > 0.5)
          if (lowp <= sellp) await doSell();
      } else if (lowp <= sellp) await doSell();
    }
    if (lowp <= buyp) {
      if (lowp > buyp - aspread / 2) {
        if (Math.random() > 0.5)
          if (highp >= buyp) await doBuy();
      } else if (highp >= buyp) await doBuy();
    }
    // sell_counts[stype]++;
    // buy_counts[btype]++;
  }
  omidp = midp;

  v[5] = v[4];
  v[4] = v[3];
  v[3] = pvarp / apvar;
  v[2] = 1;
  v[1] = v[0];
  v[0] = pdmidp / aadmidp;
  var vs = 0;
  for (var i in v) vs += v[i] * v[i];
  vs = Math.sqrt(vs);
  for (var i in v) nv[i] = v[i] / vs;

  pdmidp = 0;
  for (var i in nv) pdmidp += dmid_brain[i] * nv[i];
  pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * nv[i];
  if (pvarp < 0) pvarp = 0;

  // var sellm = 0;
  // for (var i in nv) sellm += tsell_brain[i] * nv[i];
  // var buym = 0;
  // for (var i in nv) buym += tbuy_brain[i] * nv[i];

  tmidp = omidp * pdmidp + omidp;
  // sellp = tmidp + tmidp * pvarp / 2 + sellm;
  sellp = tmidp + tmidp * pvarp * sellf + sellm;
  sellp = Number(sellp.toFixed(5));
  // buyp = tmidp - tmidp * pvarp / 2 * (1 + buym);
  // buyp = tmidp - tmidp * pvarp / 2 - sellm;
  buyp = tmidp - tmidp * pvarp * sellf - sellm;
  buyp = Number(buyp.toFixed(5));
  // sellp = tmidp + tmidp * pvarp / 2;
  // buyp = tmidp - tmidp * pvarp / 2;
  // if (sellp < buyp * (1 + 2 * aspread)) {
  // if (Math.abs(sellp - buyp) < 1e-4) {
    // orders_placed = 0;
  // } else {
    orders_placed = 1;
  // }

  buy_size = levx * 50 * nav / omidp - pos;
  if (buy_size < 0) buy_size = 0;
  sell_size = levx * 50 * nav / omidp + pos;
  if (sell_size < 0) sell_size = 0;

  /*
  if (pdmidp > 0) sell_size = 0;
  else buy_size = 0;
  */

  // sell_size = 1 + pos;
  // buy_size = 1 - pos;
  /*
  if (pos < 0) {
    buy_size = balance / 10 / omidp - pos;
    sell_size = 0;
  } else {
    buy_size = 0;
    sell_size = balance / 10 / omidp + pos;
  }
  */
}

async function doBuy() {
  if (pos > 0)
    posp = (posp * pos + buyp * buy_size) / (pos + buy_size);
  else {
    if (pos + buy_size > 0) {
      nav -= pos * (posp - buyp);
      short_nav -= pos * (posp - buyp);
      posp = buyp;
    } else {
      nav -= buy_size * (posp - buyp);
      short_nav -= pos * (posp - buyp);
    }
    if (nav < 0) nav = 0;
    if (nav > max_nav) max_nav = nav;
    else if ((max_nav - nav) / max_nav > max_dd)
      max_dd = (max_nav - nav) / max_nav;
  }
  pos += buy_size;
}

async function doSell() {
  // balance += sell_size * sellp;
  if (pos < 0)
    posp = (posp * pos - sellp * sell_size) / (pos - sell_size);
  else {
    if (pos - sell_size < 0) {
      nav += pos * (sellp - posp);
      long_nav += pos * (sellp - posp);
      posp = sellp;
    } else {
      nav += sell_size * (sellp - posp);
      long_nav += sell_size * (sellp - posp);
    }
    if (nav < 0) nav = 0;
    if (nav > max_nav) max_nav = nav;
    else if ((max_nav - nav) / max_nav > max_dd)
      max_dd = (max_nav - nav) / max_nav;
  }
  pos -= sell_size;
}

doMain();

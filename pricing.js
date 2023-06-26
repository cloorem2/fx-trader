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
var maxb = Number(fs.readFileSync('maxb','utf8'));
var maxa = Number(fs.readFileSync('maxa','utf8'));
var apvar = Number(fs.readFileSync('apvar','utf8'));
var corr0 = Number(fs.readFileSync('corr0','utf8'));
var opvar = Number(fs.readFileSync('opvar','utf8'));
var aspread = Number(fs.readFileSync('aspread','utf8'));
var chunk_save = '';

var sdelay = Number(fs.readFileSync('sdelay','utf8'));
var oh0 = Number(fs.readFileSync('oh0','utf8'));
var om0 = Number(fs.readFileSync('om0','utf8'));
var os0 = Number(fs.readFileSync('os0','utf8'));

var linec = 0;
var odmidp = Number(fs.readFileSync('odmidp','utf8'));

var dmid_brain = [0,0,0,0,0,0];
const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
const dmid_brain_lines = dmid_brain_data.split('\n');
for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

var pvar_brain = [0,0,0,0,0,0];
const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
const pvar_brain_lines = pvar_brain_data.split('\n');
for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);

var v = [0,0,0,0,0,0],nv = [0,0,0,0,0,0];
const v_data = fs.readFileSync('v','utf8');
const v_lines = v_data.split('\n');
for (var i in v) { v[i] = Number(v_lines[i]); }

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
var max_dd = 0;
var opt_levx = Number(fs.readFileSync('opt_levx','utf8'));
// var opt_levx = 0.5;
var levx = opt_levx;

  var pdmidp = 0;
  var pvarp = 0;

  var a = 1, b = 1;
var opt_sellm = Number(fs.readFileSync('sellm','utf8'));
var opt_buym = Number(fs.readFileSync('buym','utf8'));
// opt_sellm = 0; opt_buym = 0;
var sellm = opt_sellm,buym = opt_buym;
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

  const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
  const dmid_brain_lines = dmid_brain_data.split('\n');
  for (var i in dmid_brain) {
    dmid_brain[i] = Number(dmid_brain_lines[i]);
  }

  const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
  const pvar_brain_lines = pvar_brain_data.split('\n');
  for (var i in pvar_brain) {
    pvar_brain[i] = Number(pvar_brain_lines[i]);
  }
}

async function doMain() {
  // while (true) {
    while (true) {
      await readFiles();
      // console.log('a ' + a.toExponential(3) + ' ' + b.toExponential(3) + ' b');
      for (var i in v) { v[i] = 1; nv[i] = 0; }
      sellp = 1000,buyp = 0;
      sell_size = 0,buy_size = 0;
      omidp = 1;
      balance = 1;
      nav = 1;
      max_nav = 1;
      max_dd = 0;
      pos = 0;
      orders_placed = 0;
      pdmidp = 0;
      pvarp = 0;
      var linec = 0;
      sell_counts = [0,0,0,0,0];
      buy_counts = [0,0,0,0,0];
      while (linec++ < 20000) await doLine();
      // optx = nav * (1 - max_dd);
      optx = Math.log(nav);
      if (smode == 0) {
        opt_optx *= 0.999;
        opt_optx += optx / 1000;
        fs.writeFileSync('opt_optx',opt_optx.toExponential(9) + '\n');
        opt_nav *= 0.999;
        opt_nav += nav / 1000;
        fs.writeFileSync('opt_nav',opt_nav.toExponential(9) + '\n');
        await doFreshVector();
        smode = 1;
      } else if (smode == 1) {
        // if (balance > opt_balance) await doBigBalance();
        if (optx > opt_optx) await doBigBalance();
        await doOptVector();
        smode = 0;
      }

      fs.writeFileSync('apdmidp',apdmidp.toExponential(9) + '\n');
      fs.writeFileSync('apvarp',apvarp.toExponential(9) + '\n');
      fs.writeFileSync('reala',a.toExponential(9));
      fs.writeFileSync('realb',b.toExponential(9));
    }
  // }
  // mainTimeout = setTimeout(() => { doMain(); }, 100000);
}

async function doOptVector() {
  for (var i in v) { tsell_brain[i] = sell_brain[i]; }
  for (var i in v) { tbuy_brain[i] = buy_brain[i]; }
  levx = opt_levx;
  sellm = opt_sellm;
  buym = opt_buym;

  opt_count++;
  if (opt_count == 100) {
    await doPrintLine();
    opt_count = 0;
  }
}

async function doFreshVector() {
  const d = 10 ** (tcount + 1);
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
  if (levx > 0.5) levx = 0.5;
  // levx = Math.random() / d;
  // levx = opt_levx;
  sellm = opt_sellm + (2 * Math.random() - 1) / d;
  buym = opt_buym + (2 * Math.random() - 1) / d;

  tcount++;
  if (tcount == 5) tcount = 0;
}

async function doBigBalance() {
  if (optx < 1) return;
  aoptx *= 0.99;
  aoptx += optx / 100;
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

  opt_levx *= 0.99;
  opt_levx += levx / 100;
  fs.writeFileSync('opt_levx',opt_levx.toExponential(9) + '\n');
  opt_sellm *= 0.999;
  opt_sellm += sellm / 1000;
  fs.writeFileSync('sellm',opt_sellm.toExponential(9) + '\n');
  opt_buym *= 0.99;
  opt_buym += buym / 100;
  fs.writeFileSync('buym',opt_buym.toExponential(9) + '\n');
  console.log(optx.toExponential(3)
    + ' ' + aoptx.toExponential(3)
    + ' ' + opt_optx.toExponential(3)
    + ' ' + opt_nav.toExponential(3)
    + ' ' + tcount
    + ' ' + opt_levx.toExponential(3)
    + ' ' + opt_sellm.toExponential(3)
    + ' ' + opt_buym.toExponential(3)
    + ' ' + omidp.toExponential(3)
    /*
    + ' ' + sell_counts[0]
    + ' ' + sell_counts[1]
    + ' ' + sell_counts[2]
    + ' --- ' + buy_counts[0]
    + ' ' + buy_counts[1]
    + ' ' + buy_counts[2]
    */
    + ' *'
  );
  out_count++;
  if (out_count >= 10) {
    out_count = 0;
    console.log('    optx    aoptx opt_optx opt_nav  tc  levx   sm   bm  midp');
  }
  opt_count = 0;
}

var trade_counts = [0,0,0,0,0];
async function doPrintLine() {
  out_count++;
  if (out_count >= 10) {
    out_count = 0;
    console.log('    optx    aoptx opt_optx opt_nav  tc  levx   sm   bm  midp');
  }
  console.log(optx.toExponential(3)
    + ' ' + aoptx.toExponential(3)
    + ' ' + opt_optx.toExponential(3)
    + ' ' + opt_nav.toExponential(3)
    + ' ' + tcount
    + ' ' + opt_levx.toExponential(3)
    + ' ' + opt_sellm.toExponential(3)
    + ' ' + opt_buym.toExponential(3)
    + ' ' + omidp.toExponential(3)
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
  // console.log(pdmidp,pvarp);

  const midp = omidp * pdmidp + omidp;
  // console.log(midp,tmidp);
  const highp = Number((midp + midp * pvarp / 2).toFixed(5));
  const lowp = Number((midp - midp * pvarp / 2).toFixed(5));
  // console.log(highp,sellp,buyp,lowp,pvarp);
  if (orders_placed == 1) {
    var stype = 0;
    var btype = 0;
    if (highp >= sellp) {
      // if (lowp - aspread > sellp) sellp = lowp - aspread;
      stype = 1;
      if (lowp <= sellp) {
        await doSell();
        stype = 2;
      }
    }
    if (lowp <= buyp) {
      // if (highp + aspread < buyp) buyp = highp + aspread;
      btype = 1;
      if (highp >= buyp) {
        await doBuy();
        btype = 2;
      }
    }
    sell_counts[stype]++;
    buy_counts[btype]++;
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
  sellp = tmidp + tmidp * pvarp / 2 + sellm;
  sellp = Number(sellp.toFixed(5));
  // buyp = tmidp - tmidp * pvarp / 2 * (1 + buym);
  buyp = tmidp - tmidp * pvarp / 2 - sellm;
  buyp = Number(buyp.toFixed(5));
  // sellp = tmidp + tmidp * pvarp / 2;
  // buyp = tmidp - tmidp * pvarp / 2;
  // if (sellp < buyp * (1 + 2 * aspread)) {
  if (Math.abs(sellp - buyp) < 1e-4) {
    orders_placed = 0;
  } else {
    orders_placed = 1;
  }

  buy_size = levx * 50 * nav / omidp - pos;
  if (buy_size < 0) buy_size = 0;
  sell_size = levx * 50 * nav / omidp + pos;
  if (sell_size < 0) sell_size = 0;

  if (pdmidp > 0) sell_size = 0;
  else buy_size = 0;

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
      posp = buyp;
    } else nav -= buy_size * (posp - buyp);
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
      posp = sellp;
    } else nav += sell_size * (sellp - posp);
    if (nav < 0) nav = 0;
    if (nav > max_nav) max_nav = nav;
    else if ((max_nav - nav) / max_nav > max_dd)
      max_dd = (max_nav - nav) / max_nav;
  }
  pos -= sell_size;
}

doMain();

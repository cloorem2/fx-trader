const fs = require('fs');
// const https = require('https');

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
// var long_nav = 0.5,short_nav = 0.5;
var max_dd = 0;

var optx = 0;
var opt_optx = Number(fs.readFileSync('opt_optx','utf8'));
// opt_optx = 0;
var opt_nav = Number(fs.readFileSync('opt_nav','utf8'));
// var opt_long_nav = 0.5,opt_short_nav = 0.5;
var aoptx = opt_optx;
var opt_levx = Number(fs.readFileSync('opt_levx','utf8'));
// opt_levx = 0.7;
var levx = opt_levx;

var opt_sellm = Number(fs.readFileSync('sellm','utf8'));
var opt_sellf = Number(fs.readFileSync('sellf','utf8'));
var opt_sellf2 = Number(fs.readFileSync('sellf2','utf8'));
// opt_sellm = 0;
// opt_sellf = 0;
// opt_sellf2 = 0;
var sellm = opt_sellm;
var sellf = opt_sellf;
var sellf2 = opt_sellf2;
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
var aapdmidp = Number(fs.readFileSync('aapdmidp','utf8'));
var apvarp = Number(fs.readFileSync('apvarp','utf8'));
var aapvarp = Number(fs.readFileSync('aapvarp','utf8'));
  var pdmidp = 0;
  var pvarp = 0;
  var a = 1, b = 1;

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
var opt_count = 0;
var out_count = 0;
var gcount = 0;

var tmidp = 0;

var duration = 0;
var aduration = 0;

var quit_looking = 0;
var last_midp = 0;
var alast_midp = 0;

var bighit = 0;
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
  fs.writeFileSync('aapdmidp',aapdmidp.toExponential(9) + '\n');
  fs.writeFileSync('apvarp',apvarp.toExponential(9) + '\n');
  fs.writeFileSync('aapvarp',aapvarp.toExponential(9) + '\n');
  fs.writeFileSync('reala',a.toExponential(9) + '\n');
  fs.writeFileSync('realb',b.toExponential(9) + '\n');
}

async function doMain() {
  await readFiles();
  // while (true) {
    const run_candles = 1000;
    while (true) {
      // console.log('a ' + a.toExponential(3) + ' ' + b.toExponential(3) + ' b');
      var anav = 0;
      for (var runc = 0; runc < 1500; runc++) {
        for (var i in v) { v[i] = 1; nv[i] = 0; }
        duration = 0;
        sellp = 1000,buyp = 0;
        sell_size = 0,buy_size = 0;
        omidp = 1;
        balance = 1;
        nav = 1;
        max_nav = 1;
        // long_nav = 0.5;
        // short_nav = 0.5;
        max_dd = 0;
        pos = 0;
        orders_placed = 0;
        pdmidp = 0;
        pvarp = 0;
        var linec = 0;
        sell_counts = [0,0,0,0,0];
        buy_counts = [0,0,0,0,0];
        while (linec++ < run_candles) await doLine();
        anav += nav;
      }
      anav /= 1500;
      // fs.renameSync('tprice','tprice0');
      // optx = nav * (1 - max_dd);
      const nmonths = run_candles * sdelay / 60 / 60 / 24 / 30;
      optx = anav / nmonths;
      // console.log('nmonths ' + nmonths.toFixed(2));
      if (smode == 0) {
        // if (nav > 0) {
          // optx = Math.log(nav) / nmonths;
          opt_optx *= 0.9;
          opt_optx += optx / 10;
          fs.writeFileSync('opt_optx',opt_optx.toExponential(9) + '\n');
        // } else opt_optx = -1;
        // fs.renameSync('tprice0','tprice1');
        // opt_nav *= 0.999;
        // opt_nav += nav / 1000;
        // fs.writeFileSync('opt_nav',opt_nav.toExponential(9) + '\n');
        // opt_long_nav *= 0.999;
        // opt_long_nav += long_nav / 1000;
        // opt_short_nav *= 0.999;
        // opt_short_nav += short_nav / 1000;
        alast_midp *= 0.99;
        alast_midp += last_midp / 100;
        await doPrintLine();
        bighit = 0;

        if (quit_looking == 0) {
          smode = 1;
          await doFreshVector();
        }

        // opt_count++;
        // if (opt_count == 1500) {
          // opt_count = 0;
        // }
      } else if (smode == 1) {
        // if (balance > opt_balance) await doBigBalance();
        // if (nav > 0) {
          // optx = Math.log(nav) / nmonths;
          if (optx > opt_optx) await doBigBalance();
        // }
        await doOptVector();
        smode = 0;
      }
    }
  // }
  // mainTimeout = setTimeout(() => { doMain(); }, 100000);
}

async function doBacktest() {
  for (var i in v) { v[i] = 1; nv[i] = 0; }
  duration = 0;
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
  try { fs.renameSync('backtest.out','backtest.out0'); }
  catch {}
  var plog_data = fs.readFileSync('plog','utf8');
  var plog_lines = plog_data.split('\n');
  for (var i in plog_lines) await doBackLine(plog_lines[i]);
}

async function doOptVector() {
  for (var i in v) { tsell_brain[i] = sell_brain[i]; }
  for (var i in v) { tbuy_brain[i] = buy_brain[i]; }
  levx = opt_levx;
  // sellm = opt_sellm;
  // sellf = opt_sellf;
  // sellf2 = opt_sellf2;
}

async function doFreshVector() {
  tcount++;
  if (tcount == 5) tcount = 0;
  const d = 10 ** (tcount + 3);
  var x = (2 * Math.random() - 1) / 2;
  levx = opt_levx * (1 + x);
  if (levx > 0.8) levx = 0.8;
  // levx = Math.random() / d;
  // levx = opt_levx;

  // sellm = opt_sellm + (2 * Math.random() - 1) / d;
  // sellf = opt_sellf + (2 * Math.random() - 1) / d;
  // sellf2 = opt_sellf2 + (2 * Math.random() - 1) / d;

  for (var i in v) {
    vmod0[i] = (2 * Math.random() - 1) / d;
    tsell_brain[i] = sell_brain[i] + vmod0[i];
    vmod1[i] = (2 * Math.random() - 1) / d;
    tbuy_brain[i] = buy_brain[i] + vmod1[i];
  }
}

async function doBigBalance() {
  // if (optx < 0) return;
  // await doBacktest();
  // if (nav < 1) return;
  // gcount++;
  aoptx *= 0.99;
  aoptx += optx / 100;
  if (optx < aoptx) return;
  // const d = optx - opt_optx;
  const d = 1000;
  bighit = 1;

  // if (balance < 1) return;
  // abalance *= 0.99;
  // abalance += balance / 100;
  // if (balance < abalance) return;
  // const d = balance - opt_balance;
  var tstr = '';
  for (var i in v) {
    sell_brain[i] += vmod0[i] / d;
    tstr += sell_brain[i].toExponential(9) + '\n';
  }
  fs.writeFileSync('sell_brain',tstr);
  tstr = '';
  for (var i in v) {
    buy_brain[i] += vmod1[i] / d;
    tstr += buy_brain[i].toExponential(9) + '\n';
  }
  fs.writeFileSync('buy_brain',tstr);

  opt_levx *= 0.99;
  opt_levx += levx / 100;
  fs.writeFileSync('opt_levx',opt_levx.toExponential(9) + '\n');
  /*
  opt_sellm *= 0.9999;
  opt_sellm += sellm / 10000;
  fs.writeFileSync('sellm',opt_sellm.toExponential(9) + '\n');
  opt_sellf *= 0.9999;
  opt_sellf += sellf / 10000;
  fs.writeFileSync('sellf',opt_sellf.toExponential(9) + '\n');
  opt_sellf2 *= 0.9999;
  opt_sellf2 += sellf2 / 10000;
  fs.writeFileSync('sellf2',opt_sellf2.toExponential(9) + '\n');
  */
}

var trade_counts = [0,0,0,0,0];
async function doPrintLine() {
  await readFiles();
  await doBacktest();
  // if (nav > 1) quit_looking = 1;
  out_count++;
  if (out_count >= 19) {
    out_count = 0;
    console.log('    aoptx opt_optx   levx     back    gc');
  }
  system_str =
    aoptx.toExponential(3)
    + ' ' + opt_optx.toExponential(3)
    // + ' ' + opt_nav.toExponential(3)
    // + ' ' + (Math.exp(opt_optx) - 1).toExponential(3)
    // + ' ' + opt_long_nav.toExponential(3)
    // + ' ' + opt_short_nav.toExponential(3)
    + ' ' + opt_levx.toExponential(3)
    // + ' ' + opt_sellm.toExponential(3)
    // + ' ' + opt_sellf.toExponential(3)
    // + ' ' + opt_sellf2.toExponential(3)
    + ' ' + nav.toExponential(3)
    + ' ' + alast_midp.toExponential(3)
    // + ' ' + gcount
    // + ' ' + aduration.toExponential(3)
    // + ' ' + omidp.toExponential(3)
    /*
    + ' ' + sell_counts[0]
    + ' ' + sell_counts[1]
    + ' ' + sell_counts[2]
    + ' --- ' + buy_counts[0]
    + ' ' + buy_counts[1]
    + ' ' + buy_counts[2]
    */
    ;
  if (bighit == 1) system_str += ' * ' + tcount.toFixed();
  console.log(system_str);
  gcount = 0;
}

async function doBackLine(line) {
  const lst = line.split(' ');
  if (lst.length < 3) return;
  const midp = Number(lst[0]);
  pdmidp = (midp - omidp) / omidp;
  pvarp = Number(lst[1]);
  // const midp = omidp * pdmidp + omidp;
  const highp = midp + midp * pvarp / 2;
  const lowp = midp - midp * pvarp / 2;

  var back_str = midp.toFixed(5) + ' ' + (highp-midp).toFixed(5);

  if (orders_placed == 1) {
    if (highp >= sellp) {
      if (lowp <= sellp + aspread) {
        await doSell();
        if (sell_size > 0) back_str += ' ' + sellp.toFixed(5);
        else back_str += ' 0';
      } else back_str += ' 0';
    } else back_str += ' 0';

    if (lowp <= buyp) {
      if (highp >= buyp - aspread) {
        await doBuy();
        if (buy_size > 0) back_str += ' ' + buyp.toFixed(5);
        else back_str += ' 0';
      } else back_str += ' 0';
    } else back_str += ' 0';
  } else back_str += ' 0 0';
  back_str += ' ' + nav.toExponential(5);
  fs.appendFileSync('backtest.out',back_str + '\n');
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
  apdmidp *= 0.99999;
  apdmidp += Math.abs(pdmidp) / 100000;
  pdmidp *= aadmidp / apdmidp;

  pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * nv[i];
  if (pvarp < 0) pvarp = 0;
  apvarp *= 0.99999;
  apvarp += pvarp / 100000;
  pvarp *= apvar / apvarp;

  await setSellp();
  await setBuyp();

  /*
  tmidp = omidp * pdmidp + omidp;
  sellp = tmidp
    + omidp * pdmidp * sellf2
    + tmidp * pvarp * sellf
    + sellm;
  sellp = Number(sellp.toFixed(5));
  buyp = tmidp
    - omidp * pdmidp * sellf2
    - tmidp * pvarp * sellf
    - sellm;
  buyp = Number(buyp.toFixed(5));
  */

  orders_placed = 1;
  buy_size = levx * 50 * nav / omidp;
  sell_size = buy_size;
  if (pos > 0) {
    buy_size = 0;
    sell_size = pos;
  }
  if (pos < 0) {
    sell_size = 0;
    buy_size = -pos;
  }
}

async function doLine(line) {
  var y = Math.random();
  var x = Math.sqrt(Math.log(y) / a);
  a *= (x / aadmid_err - 1) / 100_000 + 1;
  if (Math.random() > 0.5) x *= -1;
  pdmidp += x;
  aapdmidp *= 0.99999;
  aapdmidp += Math.abs(pdmidp) / 100000;
  pdmidp *= aadmidp / aapdmidp;

  // b = -1 / (pvarp + aspread);
  // y = 1000 * Math.random();
  // x = y * Math.exp(b * y) - aspread;
  y = Math.random();
  x = Math.sqrt(Math.log(y) / b);
  b *= (x / aapvar_err - 1) / 100_000 + 1;
  if (Math.random() > 0.5) x *= -1;
  pvarp += x;
  if (pvarp < 0) pvarp = 0;
  aapvarp *= 0.99999;
  aapvarp += pvarp / 100000;
  pvarp *= apvar / aapvarp;

  const midp = omidp * pdmidp + omidp;
  last_midp = midp;
  // console.log(midp,tmidp);
  const highp = midp + midp * pvarp / 2;
  const lowp = midp - midp * pvarp / 2;
  // fs.appendFileSync('tprice',midp.toFixed(5) + ' ' + nav.toFixed(5) + '\n');
  // console.log(highp,sellp,buyp,lowp,pvarp);
  if (orders_placed == 1) {
    // duration++;
    if (highp >= sellp)
      if (lowp <= sellp + aspread) await doSell();
    if (lowp <= buyp)
      if (highp >= buyp - aspread) await doBuy();
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
  apdmidp *= 0.99999;
  apdmidp += Math.abs(pdmidp) / 100000;
  pdmidp *= aadmidp / apdmidp;

  pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * nv[i];
  if (pvarp < 0) pvarp = 0;
  apvarp *= 0.99999;
  apvarp += pvarp / 100000;
  pvarp *= apvar / apvarp;

  // tmidp = omidp * pdmidp + omidp;
  await setSellp();
  await setBuyp();

  // if (Math.abs(sellp - buyp) < 1e-4) {
    // orders_placed = 0;
  // } else {
    orders_placed = 1;
  // }

  /*
  buy_size = levx * 50 * nav / omidp - pos;
  if (buy_size < 0) buy_size = 0;
  sell_size = levx * 50 * nav / omidp + pos;
  if (sell_size < 0) sell_size = 0;
  */

  buy_size = levx * 50 * nav / omidp;
  sell_size = buy_size;
  if (pos > 0) { buy_size = 0; sell_size = pos; }
  if (pos < 0) { sell_size = 0; buy_size = -pos; }


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

async function setSellp() {
  // sellp = tmidp
    // + omidp * pdmidp * sellf2
    // + tmidp * pvarp * sellf
    // + sellm;
  sellp = omidp;
  for (var i in nv) sellp += tsell_brain[i] * nv[i];
  sellp = Number(sellp.toFixed(5));
}

async function setBuyp() {
  // sellp = tmidp
    // + omidp * pdmidp * sellf2
    // + tmidp * pvarp * sellf
    // + sellm;
  buyp = omidp;
  for (var i in nv) buyp += tbuy_brain[i] * nv[i];
  buyp = Number(buyp.toFixed(5));
}

async function doBuy() {
  if (pos > 0)
    posp = (posp * pos + buyp * buy_size) / (pos + buy_size);
  else {
    if (pos + buy_size > 0) {
      nav -= pos * (posp - buyp);
      posp = buyp;
      // aduration *= 0.999;
      // aduration += duration / 1000;
      // duration = 0;
    } else {
      nav += buy_size * (posp - buyp);
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
      posp = sellp;
      // aduration *= 0.99;
      // aduration += duration / 100;
      // duration = 0;
    } else {
      nav += sell_size * (sellp - posp);
    }
    if (nav < 0) nav = 0;
    if (nav > max_nav) max_nav = nav;
    else if ((max_nav - nav) / max_nav > max_dd)
      max_dd = (max_nav - nav) / max_nav;
  }
  pos -= sell_size;
}

doMain();

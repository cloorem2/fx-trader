const fs = require('fs');
const https = require('https');

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

var optx = 0;
var opt_optx = Number(fs.readFileSync('opt_optx','utf8'));
// opt_optx = 0;
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
  // var pdmidp = 0;
  // var pvarp = 0;

      // a = 4 * Math.log(aadmid_err);
      // b = 4 * Math.log(apvar);
      var pricing_a = Number(fs.readFileSync('reala','utf8'));
      var pricing_b = Number(fs.readFileSync('realb','utf8'));
console.log('doMain ' + new Date());
    var tcount = 0;
var smode = 0;
var vmod0 = [0,0,0,0,0,0];
var vmod1 = [0,0,0,0,0,0];
var opt_count = 0;
var out_count = 0;
var gcount = 0;

var tmidp = 0;

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

  // fs.writeFileSync('apdmidp',apdmidp.toExponential(9) + '\n');
  fs.writeFileSync('aapdmidp',aapdmidp.toExponential(9) + '\n');
  fs.writeFileSync('apvarp',apvarp.toExponential(9) + '\n');
  fs.writeFileSync('aapvarp',aapvarp.toExponential(9) + '\n');
  fs.writeFileSync('reala',a.toExponential(9) + '\n');
  fs.writeFileSync('realb',b.toExponential(9) + '\n');
}

const dp_mod = [ 0,0,0,0,0,0 ];
const lean_mod = [ 0,0,0,0,0,0 ];
const tpd_brain = [ 0,0,0,0,0,0 ];
const tlean_brain = [ 0,0,0,0,0,0 ];
const pd_brain = [ 0,0,0,0,0,0 ];
const lean_brain = [ 0,0,0,0,0,0 ];

var good_one = 0;
async function doMain() {
  const run_candles = 100;
  const v_data = fs.readFileSync('../latest_v','utf8');
  const v_lines = v_data.split('\n');
  var ts = 0;
  for (var i in v) {
    v[i] = Number(v_lines[i]);
    ts += v[i] * v[i];
  }
  ts = Math.sqrt(ts);
  for (var i in v) nv[i] = v[i] / ts;

  tcount++;
  if (tcount == 5) tcount = 0;
  const d = 10 ** (tcount + 3);
  for (var i in v) dp_mod[i] = (2 * Math.random() - 1) / d;
  for (var i in v) tpd_brain[i] = pd_brain[i] + dp_mod[i];
  for (var i in v) lean_mod[i] = (2 * Math.random() - 1) / d;
  for (var i in v) tlean_brain[i] = lean_brain[i] + dp_mod[i];
  ts = 0; for (var i in v) ts += (tlean_brain[i])**2;
  ts = Math.sqrt(ts); for (var i in v) tlean_brain[i] /= ts;
  good_one = 0;
  var linec = 0;
  while (linec++ < run_candles) await doLine();
  if (good_one > 0) {
    for (var i in v) pd_brain[i] += dp_mod[i] / 10;
    for (var i in v) lean_brain[i] += lean_mod[i] / 10;
    ts = 0; for (var i in v) ts += (lean_brain[i])**2;
    ts = Math.sqrt(ts); for (var i in v) lean_brain[i] /= ts;
    console.log('good_one ' + good_one);
    console.log(pd_brain);
    console.log(lean_brain);
  }
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
  aoptx *= 0.99;
  aoptx += optx / 100;
  if (optx < aoptx) return;
  // const d = optx - opt_optx;
  const d = 1000;
  bighit = 1;

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
  out_count++;
  if (out_count >= 19) {
    out_count = 0;
    console.log('    aoptx opt_optx     levx     back    gc');
  }
  var system_str = aoptx.toExponential(3)
    + ' ' + opt_optx.toExponential(3)
    + ' ' + opt_levx.toExponential(3)
    // + ' ' + opt_sellm.toExponential(3)
    // + ' ' + opt_sellf.toExponential(3)
    // + ' ' + opt_sellf2.toExponential(3)
    + ' ' + alast_midp.toExponential(3)
    // + ' ' + gcount
    ;
  if (bighit == 1) system_str += ' * ' + tcount.toFixed();
  console.log(system_str);
  gcount = 0;
}

async function doLine(line) {
  var pdmidp = 0;
  for (var i in nv) pdmidp += dmid_brain[i] * nv[i];
  var x1 = Math.sqrt(Math.log(Math.random()) / pricing_a);
  pricing_a *= (x1 / aadmid_err - 1) / 100_000 + 1;
  if (Math.random() > 0.5) x1 *= -1;
  pdmidp += x1;
  const midp = 1 + pdmidp;

  pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * nv[i];
  var x2 = Math.sqrt(Math.log(Math.random()) / pricing_b);
  pricing_b *= (x2 / aapvar_err - 1) / 100_000 + 1;
  if (Math.random() > 0.5) x2 *= -1;
  pvarp += x2;

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

  var pdmidp2 = 0;
  for (var i in v) pdmidp2 += dmid_brain[i] * nv[i];
  var pd = 0;
  for (var i in v) pd += tpd_brain[i] * nv[i];
  var lean = 0;
  for (var i in v) lean += tlean_brain[i] * nv[i];
  const new_midp = midp + midp * pdmidp2 ;
  const sellp = new_midp + new_midp * pd * lean;
  const buyp = new_midp - new_midp * pd * (1 - lean);

  var x3 = Math.sqrt(Math.log(Math.random()) / pricing_a);
  if (Math.random() > 0.5) x3 *= -1;
  const pdmidp3 = pdmidp2 + x3;
  const new_midp3 = midp + midp * pdmidp3 ;

  var pvarp2 = 0;
  for (var i in v) pvarp2 += pvar_brain[i] * nv[i];
  var x4 = Math.sqrt(Math.log(Math.random()) / pricing_b);
  if (Math.random() > 0.5) x4 *= -1;
  const pvarp3 = pvarp2 + x4;

  const highp = new_midp3 + new_midp3 * pvarp3;
  const lowp = new_midp3 - new_midp3 * pvarp3;
  if (highp >= sellp) {
    if ((lowp <= buyp) || (lowp > sellp)) good_one++;
  } else if (highp < buyp) good_one++;
}



doMain();

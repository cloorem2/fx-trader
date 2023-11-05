const fs = require('fs');
const https = require('https');

var apvar = Number(fs.readFileSync('apvar','utf8'));

var omidp = 0;
const v = [0,0,0,0,0,0],nv = [0,0,0,0,0,0];
const dmid_brain = [0,0,0,0,0,0];
try {
  const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
  const dmid_brain_lines = dmid_brain_data.split('\n');
  for (var i in v) dmid_brain[i] = Number(dmid_brain_lines[i]);
} catch {}

const pvar_brain = [0,0,0,0,0,0];
try {
  const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
  const pvar_brain_lines = pvar_brain_data.split('\n');
  for (var i in v) pvar_brain[i] = Number(pvar_brain_lines[i]);
} catch {}

const dmid_t_brain = [0,0,0,0,0,0];
const dmid_t_mod = [0,0,0,0,0,0];
try {
  const dmid_t_brain_data = fs.readFileSync('dmid_t_brain','utf8');
  const dmid_t_brain_lines = dmid_t_brain_data.split('\n');
  for (var i in v) dmid_t_brain[i] = Number(dmid_t_brain_lines[i]);
} catch {}

const pvar_t_brain = [0,0,0,0,0,0];
const pvar_t_mod = [0,0,0,0,0,0];
try {
  const pvar_t_brain_data = fs.readFileSync('pvar_t_brain','utf8');
  const pvar_t_brain_lines = pvar_t_brain_data.split('\n');
  for (var i in v) pvar_t_brain[i] = Number(pvar_t_brain_lines[i]);
} catch {}

const profit_brain = [ 0,0,0,0,0,0 ];
try {
  const profit_brain_data = fs.readFileSync('profit_brain','utf8');
  const profit_brain_lines = profit_brain_data.split('\n');
  for (var i in v) profit_brain[i] = Number(profit_brain_lines[i]);
} catch {}

var latest_v = [0,0,0,0,0,0],latest_nv = [0,0,0,0,0,0];
var plog_v = [0,0,0,0,0,0],plog_nv = [0,0,0,0,0,0];
var aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
var aadmid_err = Number(fs.readFileSync('aadmid_err','utf8'));
var aapvar_err = Number(fs.readFileSync('aapvar_err','utf8'));

var pricing_a = Number(fs.readFileSync('pricing_a','utf8'));
var pricing_b = Number(fs.readFileSync('pricing_b','utf8'));

var out_count = 0;
console.log('doMain ' + new Date());
var did_print = 0;
var final_profit = 0;
async function doMain() {
  while (true) {
    for (var i in v) { plog_v[i] = 1; plog_nv[i] = 0; }
    omidp = 0;
    vdot = 0;
    back_pos = 0;
    back_profit = 0;
    var plog_data = fs.readFileSync('../plog','utf8');
    var plog_lines = plog_data.split('\n');
    for (var i in plog_lines) await doLine(plog_lines[i]);
    final_profit = back_profit;
    fs.writeFileSync('final_profit',final_profit.toExponential(3) + '\n');
  }
}
  /*

  var tstr = '';
  for (var i in nv) tstr += dmid_brain[i].toExponential(9) + '\n';
  fs.writeFileSync('dmid_brain',tstr);
  tstr = '';
  for (var i in nv)
    tstr += pvar_brain[i].toExponential(9) + '\n';
  fs.writeFileSync('pvar_brain',tstr);
  */

async function doPrintLine() {
  out_count++;
  if (out_count % 20 == 0) {
    console.log('            test brain');
    console.log('dmid_err pvar_err  apvar aadmidp');
    out_count = 0;
  }
  console.log((aadmid_err/aadmidp).toExponential(3)
    + ' ' + (aapvar_err/apvar).toExponential(3)
    + ' ' + apvar.toExponential(3)
    + ' ' + aadmidp.toExponential(3)
    + ' ' + final_profit.toExponential(3)
  );
  fs.writeFileSync('pricing_a',pricing_a.toExponential(9) + '\n');
  fs.writeFileSync('pricing_b',pricing_b.toExponential(9) + '\n');
  console.log(type_count_v);
  for (var i in type_count_v) type_count_v[i] = 0;
}

var vdot = 0;
var type_count = 0;
const type_count_v = [];
var back_pos = 0;
var back_profit = 0;
var back_sellp = 0;
var back_buyp = 0;
async function doLine(line) {
  var lst = line.split(' ');
  if (lst.length < 3) return;
  const spread = Number(lst[2]);
  const pvar = Number(lst[1]);
  if (vdot > 0) {
    apvar *= 1 - vdot / 1000;
    apvar += pvar * vdot / 1000;
    fs.writeFileSync('apvar',apvar.toExponential(9) + '\n');
  }
  const midp = Number(lst[0]);
  if (omidp == 0) omidp = midp;
  const dmidp = (midp - omidp) / omidp;
  omidp = midp;
  if (vdot > 0) {
    aadmidp *= 1 - vdot / 1000;
    aadmidp += Math.abs(dmidp) * vdot / 1000;
    fs.writeFileSync('aadmidp',aadmidp.toExponential(9) + '\n');
  }

  const highp = midp + midp * pvar / 2;
  const lowp = midp - midp * pvar / 2;
  if ((back_pos > -1) && (highp >= back_sellp) && (lowp <= back_sellp)) {
    back_pos -= 1;
    back_profit += back_sellp;
  }
  if ((back_pos < 1) && (highp >= back_buyp) && (lowp <= back_buyp)) {
    back_pos += 1;
    back_profit -= back_buyp;
  }

  // console.log('here');
  // console.log(dmid_brain);
  // console.log(plog_nv);
  // console.log(aadmid_err);
  var pdmidp = 0;
  for (var i in nv) pdmidp += dmid_brain[i] * plog_nv[i];
  const dmid_err = dmidp - pdmidp;
  if (vdot > 0) {
    for (var i in nv) dmid_brain[i] += dmid_err * plog_nv[i] * vdot / 1000;
    var tstr = '';
    for (var i in v) tstr += dmid_brain[i].toExponential(9) + '\n';
    fs.writeFileSync('dmid_brain',tstr);
    aadmid_err *= 1 - vdot / 1000;
    aadmid_err += Math.abs(dmid_err) * vdot / 1000;
    fs.writeFileSync('aadmid_err',aadmid_err.toExponential(9) + '\n');
  }

  var pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * plog_nv[i];
  const pvar_err = pvar - pvarp;
  if (vdot > 0) {
    for (var i in nv) pvar_brain[i] += pvar_err * plog_nv[i] * vdot / 1000;
    var tstr = '';
    for (var i in v) tstr += pvar_brain[i].toExponential(9) + '\n';
    fs.writeFileSync('pvar_brain',tstr);
    aapvar_err *= 1 - vdot / 1000;
    aapvar_err += Math.abs(pvar_err) * vdot / 1000;
    fs.writeFileSync('aapvar_err',aapvar_err.toExponential(9) + '\n');
  }

  plog_v[5] = plog_v[4];
  plog_v[4] = plog_v[3];
  plog_v[3] = pvar / apvar;
  plog_v[2] = 1;
  plog_v[1] = plog_v[0];
  plog_v[0] = dmidp / aadmidp;
  var vs = 0;
  for (var i in v) vs += plog_v[i] * plog_v[i];
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i in v) plog_nv[i] = plog_v[i] / vs;

  var dmidp_t = 0;
  var pvar_t = 0;
  for (var i in v) dmidp_t += dmid_t_brain[i] * plog_nv[i];
  for (var i in v) pvar_t += pvar_t_brain[i] * plog_nv[i];
  const midp_t = midp + midp * dmidp_t;
  back_sellp = midp_t + midp_t * pvar_t / 2;
  back_buyp = midp_t - midp_t * pvar_t / 2;
  if (back_pos > 0) back_buyp = 0;
  if (back_pos < 0) back_sellp = 0;

  const latest_v_data = fs.readFileSync('../latest_v','utf8');
  const latest_v_lines = latest_v_data.split('\n');
  var vs = 0;
  for (var i in v) {
    var tx = Number(latest_v_lines[i]);
    if (tx != latest_v[i]) if (did_print == 0) {
      did_print = 1;
      await doPrintLine();
    }
    latest_v[i] = tx;
    vs += latest_v[i] * latest_v[i];
  }
  did_print = 0;
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i in v) latest_nv[i] = latest_v[i] / vs;

  vdot = 0;
  for (var i in v) vdot += plog_nv[i] * latest_nv[i];

  good_one = 0;
  var linec = 0;
  while (linec++ < 100) await doInnerLine();
}

async function doStepBrain(d) {
  for (var i in v) dmid_t_brain[i] += d * dmid_t_mod[i];
  for (var i in v) pvar_t_brain[i] += d * pvar_t_mod[i];

  var tstr = '';
  for (var i in v) tstr += dmid_t_brain[i].toExponential(9) + '\n';
  fs.writeFileSync('dmid_t_brain0',tstr);
  fs.renameSync('dmid_t_brain0','dmid_t_brain');
  tstr = '';
  tstr = '';
  for (var i in v) tstr += pvar_t_brain[i].toExponential(9) + '\n';
  fs.writeFileSync('pvar_t_brain0',tstr);
  fs.renameSync('pvar_t_brain0','pvar_t_brain');

  /*
  tstr = '';
  for (var i in v) tstr += ' ' + dmid_t_brain[i].toExponential(3);
  fs.appendFileSync('dmid_t_brain_log',tstr + '\n');
  tstr = '';
  for (var i in v) tstr += ' ' + pvar_t_brain[i].toExponential(3);
  fs.appendFileSync('pvar_t_brain_log',tstr + '\n');
  */

  if (typeof type_count_v[type_count] == 'undefined')
    type_count_v[type_count] = 0;
  type_count_v[type_count]++;
}

async function doInnerLine() {
  var pdmidp = 0;
  for (var i in v) pdmidp += dmid_brain[i] * latest_nv[i];
  var x1 = Math.sqrt(Math.log(Math.random()) / pricing_a);
  pricing_a *= (x1 / aadmid_err - 1) / 100_000 + 1;
  if (Math.random() > 0.5) x1 *= -1;
  pdmidp += x1;
  var midp = 1 + pdmidp;

  // console.log(dmid_brain);
  // console.log(latest_nv);
  // console.log(midp,pdmidp,x1)
  var pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * latest_nv[i];
  var x2 = Math.sqrt(Math.log(Math.random()) / pricing_b);
  pricing_b *= (x2 / aapvar_err - 1) / 100_000 + 1;
  if (Math.random() > 0.5) x2 *= -1;
  pvarp = Math.abs(pvarp + x2);

  for (var i in v) v[i] = latest_v[i];
  var pos = 0;
  var profitp = 0;
  var profit = 0;

  v[5] = v[4];
  v[4] = v[3];
  v[3] = pvarp / apvar;
  v[2] = 1;
  v[1] = v[0];
  v[0] = pdmidp / aadmidp;
  var vs = 0;
  for (var i in v) vs += v[i] * v[i];
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i in v) nv[i] = v[i] / vs;

  var dmidp_t = 0;
  var pvar_t = 0;
  for (var i in v) profitp += profit_brain[i] * nv[i];

  type_count++;
  if (type_count >= 4) type_count = 0;
  const d = 10 ** (type_count + 2);
  for (var i in v) dmid_t_mod[i] = (2 * Math.random() - 1) / d;
  for (var i in v) dmidp_t += (dmid_t_brain[i] + dmid_t_mod[i]) * nv[i];
  for (var i in v) pvar_t_mod[i] = (2 * Math.random() - 1) / d;
  for (var i in v) pvar_t += (pvar_t_brain[i] + pvar_t_mod[i]) * nv[i];
    /*
    if (pd !== pd) {
      console.log('luv this', pos, profitp);
      console.log(tpd_brain);
      console.log(pd_brain);
      console.log(nv);
    }
    */

  const midp_t = midp + midp * dmidp_t ;
  const sellp = midp_t + midp_t * pvar_t / 2;
  const buyp = midp_t - midp_t * pvar_t / 2;

  var pdmidp2 = 0;
  for (var i in v) pdmidp2 += dmid_brain[i] * nv[i];
  var x3 = Math.sqrt(Math.log(Math.random()) / pricing_a);
  if (Math.random() > 0.5) x3 *= -1;
  const pdmidp3 = pdmidp2 + x3;
  const new_midp3 = midp + midp * pdmidp3 ;

  var pvarp2 = 0;
  for (var i in v) pvarp2 += pvar_brain[i] * nv[i];
  var x4 = Math.sqrt(Math.log(Math.random()) / pricing_b);
  if (Math.random() > 0.5) x4 *= -1;
  const pvarp3 = Math.abs(pvarp2 + x4);

  const highp = new_midp3 + new_midp3 * pvarp3;
  const lowp = new_midp3 - new_midp3 * pvarp3;
  if ((highp >= sellp) && (lowp <= sellp) && (pos > -1)) {
    pos -= 1;
    profit += sellp;
  }
  if ((lowp <= buyp) && (highp >= buyp) && (pos < 1)) {
    pos += 1;
    profit -= buyp;
  }
  if (pos > 0) profit += lowp;
  if (pos < 0) profit -= highp;
  var profitp_err = profit - profitp;
  // if (profitp_err < 0) profitp_err *= 1.01;
  for (var i in v) profit_brain[i] += profitp_err * nv[i] / 1e4;
  var tstr = '';
  for (var i in v) tstr += profit_brain[i].toExponential(9) + '\n';
  fs.writeFileSync('profit_brain0',tstr);
  fs.renameSync('profit_brain0','profit_brain');
        /*
        tstr = '';
        for (var i in v) tstr += ' ' + profit_brain[i].toExponential(3);
        fs.appendFileSync('profit_brain_log',tstr + '\n');
        */

  if (profit > profitp)
    await doStepBrain(profit - profitp);
}

doMain();

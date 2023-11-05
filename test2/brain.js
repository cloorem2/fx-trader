const fs = require('fs');
const https = require('https');

const num_facets = 10;
const v_len = 13;

var omidp = 0;

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
// for (var i = 0; i < num_facets; i++) console.log(dmid_brain[i]);

const pvar_brain = [];
for (var i = 0; i < num_facets; i++) {
  pvar_brain[i] = [];
  for (var ii = 0; ii < v_len; ii++) pvar_brain[i][ii] = 0;
  try {
    const pvar_brain_data = fs.readFileSync('pvar_brain/' + i,'utf8');
    const pvar_brain_lines = pvar_brain_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) pvar_brain[i][ii] =
      Number(pvar_brain_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) pvar_brain[i][ii] = 0; }
}

const dmid_t_mod = [];
const dmid_t_brain = [];
for (var i = 0; i < num_facets; i++) {
  dmid_t_brain[i] = [];
  for (var ii = 0; ii < v_len; ii++) dmid_t_brain[i][ii] = 0;
  try {
    const dmid_t_brain_data = fs.readFileSync('dmid_t_brain/' + i,'utf8');
    const dmid_t_brain_lines = dmid_t_brain_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) dmid_t_brain[i][ii] =
      Number(dmid_t_brain_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) dmid_t_brain[i][ii] = 0; }
}

const pvar_t_mod = [];
const pvar_t_brain = [];
for (var i = 0; i < num_facets; i++) {
  pvar_t_brain[i] = [];
  for (var ii = 0; ii < v_len; ii++) pvar_t_brain[i][ii] = 0;
  try {
    const pvar_t_brain_data = fs.readFileSync('pvar_t_brain/' + i,'utf8');
    const pvar_t_brain_lines = pvar_t_brain_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) pvar_t_brain[i][ii] =
      Number(pvar_t_brain_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) pvar_t_brain[i][ii] = 0; }
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
const apvar = [];
for (var i = 0; i < num_facets; i++) {
  try { apvar[i] = Number(fs.readFileSync('apvar/' + i,'utf8')); }
  catch { apvar[i] = 1; }
}

const aadmid_err = [];
for (var i = 0; i < num_facets; i++) {
  try { aadmid_err[i] = Number(fs.readFileSync('aadmid_err/' + i,'utf8')); }
  catch { aadmid_err[i] = 0; }
}
const aapvar_err = [];
for (var i = 0; i < num_facets; i++) {
  try { aapvar_err[i] = Number(fs.readFileSync('aapvar_err/' + i,'utf8')); }
  catch { aapvar_err[i] = 0; }
}

const pricing_a = [];
for (var i = 0; i < num_facets; i++) {
  try { pricing_a[i] = Number(fs.readFileSync('pricing_a/' + i,'utf8')); }
  catch {
    pricing_a[i] = -1;
  }
}
const pricing_b = [];
for (var i = 0; i < num_facets; i++) {
  try { pricing_b[i] = Number(fs.readFileSync('pricing_b/' + i,'utf8')); }
  catch {
    pricing_b[i] = -1;
  }
}

const profit_id = [];
for (var i = 0; i < num_facets; i++) { profit_id[i] = 0; }

var out_count = 0;
console.log('doMain ' + new Date());
var did_print = 0;
var final_profit = Number(fs.readFileSync('final_profit','utf8'));
var type_count = 0;
var type_count_v = [ 0,0,0,0,0 ];
var back_pos = 0;
var back_profit = 0;
var back_sellp = 0;
var back_buyp = 0;

var price_delay = Number(fs.readFileSync('price_delay','utf8'));
var time_delay = Number(fs.readFileSync('time_delay','utf8'));
var tprice_delay = price_delay;
var ttime_delay = time_delay;
var nh0,nm0,ns0;
var oh0 = 0,om0 = 0,os0 = 0;
var tick_v_id = -1;
var current_ask = 0;
var current_bid = 0;
var smode = 0;
var time_lap = 0;
var aa_price_delay_diff = Number(fs.readFileSync('price_delay_diff','utf8'));
var aa_time_delay_diff = Number(fs.readFileSync('time_delay_diff','utf8'));
async function doMain() {
  while (true) {
    for (var i = 0; i < v_len; i++) { tick_v[i] = 1; tick_nv[i] = 0; }
    for (var i = 0; i < num_facets; i++) {
      good_candle[i] = 0;
      bad_candle[i] = 0;
    }
    candle_count = 0;
    current_ask = 0;
    current_bid = 0;
    omidp = 0;
    maxa = 0;
    maxb = 0;
    back_pos = 0;
    back_profit = 0;
    tick_v_id = -1;
    time_lap = 0;
    var tick_data = fs.readFileSync('../ticks','utf8');
    var tick_lines = tick_data.split('\n');
    for (var i in tick_lines) await doTickLine(tick_lines[i]);
    if (back_pos > 0) back_profit += current_bid;
    if (back_pos < 0) back_profit -= current_ask;
    time_lap /= 60 * 60 * 24 * 5;
    back_profit /= time_lap;
    if (smode == 0) {
      final_profit *= 1 - 1 / 1e3;
      final_profit += back_profit / 1e3;
      fs.writeFileSync('final_profit',final_profit.toExponential(9) + '\n');
      await doPrintLine();
      smode = 1;
    } else if (smode == 1) {
      tprice_delay = Math.abs(price_delay
        + (2 * Math.random() - 1) * 2 * aa_price_delay_diff);
      ttime_delay = Math.abs(time_delay
        + (2 * Math.random() - 1) * 2 * aa_time_delay_diff);
      smode = 2;
    } else if (smode == 2) {
      if (back_profit > 0)
      if (back_profit > final_profit) {
        price_delay *= 1 - 1 / 100;
        price_delay += tprice_delay / 100;
        fs.writeFileSync('price_delay',price_delay.toExponential(9) + '\n');
        aa_price_delay_diff *= 1 - 1 / 100;
        aa_price_delay_diff += Math.abs(tprice_delay - price_delay) / 100;
        fs.writeFileSync('price_delay_diff',
          aa_price_delay_diff.toExponential(9) + '\n');
        time_delay *= 1 - 1 / 100;
        time_delay += ttime_delay / 100;
        fs.writeFileSync('time_delay',time_delay.toExponential(9) + '\n');
        aa_time_delay_diff *= 1 - 1 / 100;
        aa_time_delay_diff += Math.abs(ttime_delay - time_delay) / 100;
        fs.writeFileSync('time_delay_diff',
          aa_time_delay_diff.toExponential(9) + '\n');
      }
      tprice_delay = price_delay;
      ttime_delay = time_delay;
      smode = 0;
    }
    // for (var i in id_count) id_count[i] = 0;
  }
}

async function doPrintLine() {
  out_count++;
  if (out_count < 10) return;
  out_count = 0;
  console.log('            ----------');
  console.log('dmid_err pvar_err  apvar aadmid count');
  for (var i = 0; i < num_facets; i++) {
    var tstr = (aadmid_err[i]/aadmid[i]).toExponential(3)
      + ' ' + (aapvar_err[i]/apvar[i]).toExponential(3)
      + ' ' + apvar[i].toExponential(3)
      + ' ' + aadmid[i].toExponential(3);
    if (profit_id[i] >= 0) tstr += ' ';
    tstr += ' ' + profit_id[i].toExponential(3)
      + ' ' + id_count[i]
      + ' ' + good_candle[i]
      + ' ' + bad_candle[i]
      ;
    console.log(tstr);
  }
  console.log('final profit ' + final_profit.toExponential(3)
    + ' bp ' + back_profit.toExponential(3)
    + ' pd ' + price_delay.toExponential(4)
    + ' td ' + time_delay.toExponential(4)
  );
  console.log('aapd ' + aa_price_delay_diff.toExponential(3)
    + ' aatd ' + aa_time_delay_diff.toExponential(3));
  console.log('candle count ' + candle_count);
  console.log(type_count_v);
  for (var i in type_count_v) type_count_v[i] = 0;
  for (var i = 0; i < num_facets; i++) {
    fs.writeFileSync('adt/' + i, adt[i].toExponential(9) + '\n');
    fs.writeFileSync('aadmid/' + i, aadmid[i].toExponential(9) + '\n');
    fs.writeFileSync('apvar/' + i, apvar[i].toExponential(9) + '\n');
    var tstr = '';
    for (var ii in tick_v) tstr += dmid_brain[i][ii].toExponential(9) + '\n';
    fs.writeFileSync('dmid_brain/' + i,tstr);
    fs.writeFileSync('aadmid_err/' + i, aadmid_err[i].toExponential(9) + '\n');
    tstr = '';
    for (var ii in tick_v) tstr += pvar_brain[i][ii].toExponential(9) + '\n';
    fs.writeFileSync('pvar_brain/' + i,tstr);
    fs.writeFileSync('aapvar_err/' + i, aapvar_err[i].toExponential(9) + '\n');
    tstr = '';
    for (var ii in tick_v) tstr += id_nv[i][ii].toExponential(9) + '\n';
    fs.writeFileSync('id_nv/' + i,tstr);

    tstr = '';
    for (var ii in tick_v) tstr += dmid_t_brain[i][ii].toExponential(9) + '\n';
    fs.writeFileSync('dmid_t_brain/' + i,tstr);
    tstr = '';
    for (var ii in tick_v) tstr += pvar_t_brain[i][ii].toExponential(9) + '\n';
    fs.writeFileSync('pvar_t_brain/' + i,tstr);
    fs.writeFileSync('pricing_a/' + i, pricing_a[i].toExponential(9) + '\n');
    fs.writeFileSync('pricing_b/' + i, pricing_b[i].toExponential(9) + '\n');
    tstr = '';
    for (var ii in tick_v) tstr += profit_brain[i][ii].toExponential(9) + '\n';
    fs.writeFileSync('profit_brain/' + i,tstr);
  }
}

const id_count = [];
var td = 0;
async function doTickLine(line) {
  var candle_done = 1;
  var lst = line.split(' ');
  if (lst.length < 3) return;
  const time_lst = lst[0].split(':');
  current_bid = Number(lst[1]);
  current_ask = Number(lst[2]);
  if (maxb == 0) maxb = current_bid;
  if (maxa == 0) maxa = current_ask;
  if (current_bid > maxb) maxb = current_bid;
  if (current_ask < maxa) maxa = current_ask;
  const pvar = 2 * (maxb - maxa) / (maxb + maxa);
  if (pvar < tprice_delay) candle_done = 0;

  nh0 = Number(time_lst[0]);
  nm0 = Number(time_lst[1]);
  ns0 = Number(time_lst[2]);
  const th0 = nh0 < oh0 ? nh0 + 24 - oh0 : nh0 - oh0;
  td = th0 * 60 * 60 + (nm0 - om0) * 60 + (ns0 - os0);
  if (td < ttime_delay) candle_done = 0;
  const midp = (maxb + maxa) / 2;
  if (candle_done == 1) await doMadeDelay(midp,pvar);
}

const good_candle = [];
const bad_candle = [];
const cct = [];
var candle_count = 0;
async function doMadeDelay(midp,pvar) {
  time_lap += td;
  if (smode == 0) {
    if (cct[candle_count] == tick_v_id) {
      good_candle[tick_v_id]++;
    } else bad_candle[tick_v_id]++;
    if (typeof cct[candle_count] == 'undefined')
      cct[candle_count] = -1;
    cct[candle_count] = tick_v_id;
    candle_count++;
  }
  if (omidp == 0) omidp = midp;
  const dmidp = (midp - omidp) / omidp;
  omidp = midp;
  if (smode == 1)
  if (tick_v_id >= 0) {
    adt[tick_v_id] *= 1 - 1 / 1e3;
    adt[tick_v_id] += td / 1e3;
    aadmid[tick_v_id] *= 1 - 1 / 1e3;
    aadmid[tick_v_id] += Math.abs(dmidp) / 1e3;
    apvar[tick_v_id] *= 1 - 1 / 1e3;
    apvar[tick_v_id] += pvar / 1e3;
  }

  // const highp = midp + midp * pvar / 2;  maxb
  // const lowp = midp - midp * pvar / 2;  maxa
  if ((back_pos > -1) && (maxb >= back_sellp) && (maxa <= back_sellp)) {
    back_pos -= 1;
    back_profit += back_sellp;
  }
  if ((back_pos < 1) && (maxb >= back_buyp) && (maxa <= back_buyp)) {
    back_pos += 1;
    back_profit -= back_buyp;
  }

  var pvarp = 0;
  var pdmidp = 0;
  if (tick_v_id >= 0) {
    for (var i in tick_v) pdmidp += dmid_brain[tick_v_id][i] * tick_nv[i];
    const dmid_err = dmidp - pdmidp;
    for (var i in tick_v) dmid_brain[tick_v_id][i] += dmid_err * tick_nv[i] / 1e5;
    aadmid_err[tick_v_id] *= 1 - 1 / 1e5;
    aadmid_err[tick_v_id] += Math.abs(dmid_err) / 1e5;
    for (var i in tick_v) pvarp += pvar_brain[tick_v_id][i] * tick_nv[i];
    const pvar_err = pvar - pvarp;
    for (var i in tick_v) pvar_brain[tick_v_id][i] += pvar_err * tick_nv[i] / 1e5;
    aapvar_err[tick_v_id] *= 1 - 1 / 1e5;
    aapvar_err[tick_v_id] += Math.abs(pvar_err) / 1e5;
  }
  tick_v[0] = 1;
  for (var i = 1; i < 10; i++) tick_v[i] = tick_v[i + 3];
  if (tick_v_id >= 0) {
    tick_v[10] = td / adt[tick_v_id];
    tick_v[11] = dmidp / aadmid[tick_v_id];
    tick_v[12] = pvar / apvar[tick_v_id];
  } else {
    tick_v[10] = td / adt[0];
    tick_v[11] = dmidp / aadmid[0];
    tick_v[12] = pvar / apvar[0];
  }
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
    // console.log(i,tdot,id_nv[i]);
  }
  vs = 0;
  for (var ii in tick_v) {
    id_nv[tick_v_id][ii] += tick_nv[ii] / 1e6;
    vs += id_nv[tick_v_id][ii] * id_nv[tick_v_id][ii];
  }
  vs = Math.sqrt(vs);
  if (vs > 0) for (var ii in tick_v) id_nv[tick_v_id][ii] /= vs;
  
  if (typeof id_count[tick_v_id] == 'undefined')
    id_count[tick_v_id] = 0;
  id_count[tick_v_id]++;


  var dmidp_t = 0;
  var pvar_t = 0;
  var prof_t = 0;
  for (var i in tick_v) prof_t += profit_brain[tick_v_id][i] * tick_nv[i];
  for (var i in tick_v) dmidp_t += dmid_t_brain[tick_v_id][i] * tick_nv[i];
  for (var i in tick_v) pvar_t += pvar_t_brain[tick_v_id][i] * tick_nv[i];
  const midp_t = midp + midp * dmidp_t;
  back_sellp = midp_t + midp_t * pvar_t / 2;
  back_buyp = midp_t - midp_t * pvar_t / 2;
  if (back_pos > 0) back_buyp = 0;
  else if (back_pos < 0) back_sellp = 0;
  else if (prof_t <= 0) {
    back_buyp = 0;
    back_sellp = 0;
  }

  good_one = 0;
  var linec = 0;
  while (linec++ < 100) await doInnerLine();

  maxb = current_bid;
  maxa = current_ask;
  oh0 = nh0;
  om0 = nm0;
  os0 = ns0;
}

async function doStepBrain(t_id,d) {
  for (var i in tick_v) dmid_t_brain[t_id][i] += d * dmid_t_mod[i];
  for (var i in tick_v) pvar_t_brain[t_id][i] += d * pvar_t_mod[i];

  /*
  tstr = '';
  for (var i in v) tstr += ' ' + dmid_t_brain[i].toExponential(3);
  fs.appendFileSync('dmid_t_brain_log',tstr + '\n');
  tstr = '';
  for (var i in v) tstr += ' ' + pvar_t_brain[i].toExponential(3);
  fs.appendFileSync('pvar_t_brain_log',tstr + '\n');
  */

  type_count_v[type_count]++;
}

async function doInnerLine() {
  var pdmidp = 0;
  for (var i in tick_v) pdmidp += dmid_brain[tick_v_id][i] * tick_nv[i];
  var x1 = Math.sqrt(Math.log(Math.random()) / pricing_a[tick_v_id]);
  pricing_a[tick_v_id] *= (x1 / aadmid_err[tick_v_id] - 1) / 100_000 + 1;
  if (Math.random() > 0.5) x1 *= -1;
  pdmidp += x1;
  var midp = 1 + pdmidp;

  var pvarp = 0;
  for (var i in tick_v) pvarp += pvar_brain[tick_v_id][i] * tick_nv[i];
  var x2 = Math.sqrt(Math.log(Math.random()) / pricing_b[tick_v_id]);
  pricing_b[tick_v_id] *= (x2 / aapvar_err[tick_v_id] - 1) / 100_000 + 1;
  if (Math.random() > 0.5) x2 *= -1;
  pvarp = Math.abs(pvarp + x2);

  const v = [];
  const nv = [];
  for (var i in tick_v) v[i] = tick_v[i];

  v[0] = 1;
  for (var i = 1; i < 10; i++) v[i] = v[i + 3];
  v[10] = td / adt[tick_v_id];
  v[11] = pdmidp / aadmid[tick_v_id];
  v[12] = pvarp / apvar[tick_v_id];
  var vs = 0;
  for (var i = 0; i < v_len; i++) vs += v[i] * v[i];
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i = 0; i < v_len; i++) nv[i] = v[i] / vs;
  var dot_max = -2;
  var t_id = -2;
  for (var i = 0; i < num_facets; i++) {
    var tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += tick_nv[ii] * id_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      t_id = i;
    }
  }

  var dmidp_t = 0;
  var pvar_t = 0;
  var dmidp_t_p = 0;
  var pvar_t_p = 0;
  var profitp = 0;
  for (var i in tick_v) profitp += profit_brain[t_id][i] * nv[i];

  type_count++;
  if (type_count >= 5) type_count = 0;
  const d = 10 ** (type_count + 4);
  if (smode == 1) {
    for (var i in tick_v) dmid_t_mod[i] = (2 * Math.random() - 1) / d;
    for (var i in tick_v) pvar_t_mod[i] = (2 * Math.random() - 1) / d;
  } else {
    for (var i in tick_v) dmid_t_mod[i] = 0;
    for (var i in tick_v) pvar_t_mod[i] = 0;
  }
  for (var i in tick_v) dmidp_t += (dmid_t_brain[t_id][i] + dmid_t_mod[i]) * nv[i];
  for (var i in tick_v) pvar_t += (pvar_t_brain[t_id][i] + pvar_t_mod[i]) * nv[i];
  for (var i in tick_v) dmidp_t_p += dmid_t_brain[t_id][i] * nv[i];
  for (var i in tick_v) pvar_t_p += pvar_t_brain[t_id][i] * nv[i];

  const midp_t = midp + midp * dmidp_t;
  const midp_t_p = midp + midp * dmidp_t_p;
  const sellp = midp_t + midp_t * pvar_t / 2;
  const buyp = midp_t - midp_t * pvar_t / 2;
  const sellp_p = midp_t_p + midp_t_p * pvar_t_p / 2;
  const buyp_p = midp_t_p - midp_t_p * pvar_t_p / 2;

  var pdmidp2 = 0;
  for (var i in tick_v) pdmidp2 += dmid_brain[t_id][i] * nv[i];
  var x3 = Math.sqrt(Math.log(Math.random()) / pricing_a[t_id]);
  if (Math.random() > 0.5) x3 *= -1;
  const pdmidp3 = pdmidp2 + x3;
  const new_midp3 = midp + midp * pdmidp3 ;

  var pvarp2 = 0;
  for (var i in tick_v) pvarp2 += pvar_brain[t_id][i] * nv[i];
  var x4 = Math.sqrt(Math.log(Math.random()) / pricing_b[t_id]);
  if (Math.random() > 0.5) x4 *= -1;
  const pvarp3 = Math.abs(pvarp2 + x4);

  var pos = 0;
  var pos_p = 0;
  var profit = 0;
  var profit_p = 0;
  const highp = new_midp3 + new_midp3 * pvarp3;
  const lowp = new_midp3 - new_midp3 * pvarp3;
  if ((highp >= sellp_p) && (lowp <= sellp_p) && (pos_p > -1)) {
    pos_p -= 1;
    profit_p += sellp_p;
  }
  if ((lowp <= buyp_p) && (highp >= buyp_p) && (pos_p < 1)) {
    pos_p += 1;
    profit_p -= buyp_p;
  }
  if (pos_p > 0) profit_p += lowp; // midp;
  if (pos_p < 0) profit_p -= highp; // midp;
  if ((highp >= sellp) && (lowp <= sellp) && (pos > -1)) {
    pos -= 1;
    profit += sellp;
  }
  if ((lowp <= buyp) && (highp >= buyp) && (pos < 1)) {
    pos += 1;
    profit -= buyp;
  }
  if (pos > 0) profit += lowp; // midp;
  if (pos < 0) profit -= highp; // midp;

  if (smode == 0) {
    profit_id[t_id] += profit;
  } else if (smode == 1) {
    const profitp_err = profit_p - profitp;
    for (var i in tick_v) profit_brain[t_id][i] += profitp_err * nv[i] / 1e6;
    if (profit > profit_p) await doStepBrain(t_id,profit - profit_p);
  }
}

doMain();

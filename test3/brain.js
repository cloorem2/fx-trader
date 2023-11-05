const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');

const num_facets = 10;
const v_len = 17;

var omidp = 0;
const spw = 60 * 60 * 24 * 7;

var candle_type = 0;
const candle_type_count = [];
const id_nv = [];
const tid_nv = [];
for (var i = 0; i < num_facets; i++) {
  candle_type_count[i] = [0,0,0];
  id_nv[i] = [];
  tid_nv[i] = [];
  for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0;
  try {
    const id_nv_data = fs.readFileSync('id_nv/' + i,'utf8');
    const id_nv_lines = id_nv_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = Number(id_nv_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0; }
  // if (i > 5) {
    // for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = id_nv[i-6][ii];
  // }
  // for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0;
  for (var ii = 0; ii < v_len; ii++) tid_nv[i][ii] = id_nv[i][ii];
}
for (var ii = 0; ii < v_len; ii++) {
  var tstr = '';
  for (var i = 0; i < num_facets; i++) {
    if (id_nv[i][ii] >= 0) tstr += ' ';
    tstr += ' ' + id_nv[i][ii].toExponential(2);
  }
  console.log(tstr);
}

const cctv = [];
const dmid_brain = [];
const tdmid_brain = [];
for (var i = 0; i < num_facets; i++) {
  cctv[i] = [0,0,0,0];
  dmid_brain[i] = [];
  tdmid_brain[i] = [];
  for (var ii = 0; ii < v_len; ii++) dmid_brain[i][ii] = 0;
  try {
    const dmid_brain_data = fs.readFileSync('dmid_brain/' + i,'utf8');
    const dmid_brain_lines = dmid_brain_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) dmid_brain[i][ii] =
      Number(dmid_brain_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) dmid_brain[i][ii] = 0; }
  // for (var ii = 0; ii < v_len; ii++) dmid_brain[i][ii] = 0;
  for (var ii = 0; ii < v_len; ii++) tdmid_brain[i][ii] = dmid_brain[i][ii];
}
// for (var i = 0; i < num_facets; i++) console.log(dmid_brain[i]);

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
const tadt = [];
for (var i = 0; i < num_facets; i++) {
  try { adt[i] = Number(fs.readFileSync('adt/' + i,'utf8')); }
  catch { adt[i] = 1; }
  tadt[i] = adt[i];
}
const aapdmidp = [];
const aapdmidp2 = [];
const aadmid = [];
const taadmid = [];
for (var i = 0; i < num_facets; i++) {
  try { aadmid[i] = Number(fs.readFileSync('aadmid/' + i,'utf8')); }
  catch { aadmid[i] = 1; }
  taadmid[i] = aadmid[i];
  aapdmidp[i] = 0;
  aapdmidp2[i] = 0;
}
const apvar = [];
const tapvar = [];
for (var i = 0; i < num_facets; i++) {
  try { apvar[i] = Number(fs.readFileSync('apvar/' + i,'utf8')); }
  catch { apvar[i] = 1; }
  tapvar[i] = apvar[i];
}

var out_count = 0;
const aspread = Number(fs.readFileSync('aspread','utf8'));
console.log('doMain ' + new Date());
var did_print = 0;
var type_count = 0;
var type_count_v = [ 0,0,0,0,0 ];
const back_profit_v = [];
const back_profit_v0 = [];
var back_profit = 0;
var aback_profit = 0;
var back_profit_max = 0;
var max_dd = 0;
var back_sellp = 0;
var back_buyp = 0;

var hit_total = Number(fs.readFileSync('hit_total','utf8'));
var thit_total = hit_total;
const hit_count = [];
for (var i = 0; i < num_facets; i++) hit_count[i] = 0;
const thit_count = [];
for (var i = 0; i < num_facets; i++) thit_count[i] = 100;
const tprice_delay_v = [];
const price_delay_v_save = [];
const price_delay_v = [];
for (var i = 0; i < num_facets; i++) price_delay_v[i] = 0;
for (var i = 0; i < num_facets; i++) {
  try { price_delay_v[i] = Number(fs.readFileSync('price_delay_v/' + i,'utf8')); }
  catch { price_delay_v[i] = price_delay; }
  // price_delay_v[i] = 2e-3;
}
// console.log(price_delay_v);
for (var i = 0; i < num_facets; i++) price_delay_v_save[i] = price_delay_v[i];
for (var i = 0; i < num_facets; i++) tprice_delay_v[i] = price_delay_v[i];
const time_delay_v_save = [];
const ttime_delay_v = [];
const time_delay_v = [];
for (var i = 0; i < num_facets; i++) time_delay_v[i] = 0;
for (var i = 0; i < num_facets; i++) {
  try { time_delay_v[i] = Number(fs.readFileSync('time_delay_v/' + i,'utf8')); }
  catch { time_delay_v[i] = time_delay; }
  // time_delay_v[i] = 1.5e4;
}
for (var i = 0; i < num_facets; i++) time_delay_v_save[i] = time_delay_v[i];
for (var i = 0; i < num_facets; i++) ttime_delay_v[i] = time_delay_v[i];
var nh0,nm0,ns0;
var oh0 = 0,om0 = 0,os0 = 0;
var tick_v_id = 0;
var current_ask = 0;
var current_bid = 0;
var smode = 0;
var time_lap = 0;
var total_time_lap = 0;
// const tick_data = fs.readFileSync('../ticks-2018','utf8');
// const tick_data = fs.readFileSync('../ticks-2017','utf8');
// const tick_data = fs.readFileSync('../ticks','utf8');
// const tick_data = fs.readFileSync('../data/ticks-hist','utf8');
// const tick_lines = tick_data.split('\n');
var bprofit_id_counter = 10;
var delay_n = 0;
async function doMain() {
  var back_profit0 = -1e9;
  var back_profit1 = 0;
  var back_profit2 = 0;
  while (true) {
    for (var i = 0; i < v_len; i++) {
      tick_v[i] = 1;
      tick_nv[i] = 1 / Math.sqrt(v_len);
    }
    var dot_max = -2;
    for (var i = 0; i < num_facets; i++) {
      back_profit_v[i] = 0;
      var tdot = 0;
      for (var ii = 0; ii < v_len; ii++) tdot += tick_nv[ii] * id_nv[i][ii];
      if (tdot > dot_max) {
        dot_max = tdot;
        tick_v_id = i;
      }

      candle_type_count[i][1] = 0;
      candle_type_count[i][2] = 0;
      cctv[i][0] = 0;
      cctv[i][1] = 0;
      cctv[i][2] = 0;
      cctv[i][3] = 0;
    }
    cct[0] = 0;
    cct[1] = 0;
    cct[2] = 0;
    cct[3] = 0;
    oh0 = -1;
    current_ask = 0;
    current_bid = 0;
    omidp = 0;
    maxa = 0;
    maxb = 0;
    back_buyp = 0;
    back_sellp = 0;
    back_profit = 0;
    aback_profit = 0;
    back_profit_max = 0;
    max_dd = 1e-4;
    time_lap = 0;
    d_n = 1e7;
    back_pos = 0;
    // var tick_data = fs.readFileSync('../ticks-2018','utf8');
    // const tick_data = fs.readFileSync('../ticks','utf8');
    // const tick_lines = tick_data.split('\n');
    // for (var line of tick_lines) await doTickLine(line);

    const tick_file = await fsPromises.open('../data/ticks-hist');
    for await (const line of tick_file.readLines())
      await doTickLine(line);

    if (back_pos > 0) back_profit += current_bid;
    if (back_pos < 0) back_profit -= current_ask;
    // console.log('th ' + thit_total + ' h ' + hit_total + ' s ' + smode);
    if (thit_total < hit_total) { continue; }
    if (smode == 0) { smode = 1; continue; }
    console.log('back_profit',back_profit.toFixed(5),cct,
      thit_total,delay_n);
    if (back_profit > back_profit0) {
      hit_total = thit_total;
      if (back_profit0 < 0) hit_total = 0;
      back_profit0 = back_profit;
      for (var i = 0; i < num_facets; i++) {
        back_profit_v0[i] = back_profit_v[i];
        hit_count[i] = thit_count[i];
        price_delay_v[i] = tprice_delay_v[i];
        time_delay_v[i] = ttime_delay_v[i];
        adt[i] = tadt[i];
        aadmid[i] = taadmid[i];
        apvar[i] = tapvar[i];
        for (var ii = 0; ii < v_len; ii++) {
          id_nv[i][ii] = tid_nv[i][ii];
          dmid_brain[i][ii] = tdmid_brain[i][ii];
        }
        // if (cctv[i][1] + cctv[i][3] == 0) dmid_brain[i][0] /= 2;
      }
      await doPrintLine();
      await doDump();
      fs.renameSync('profit_profile','profit_profile1');
    } else {
      // delay_n *= 2;
      fs.renameSync('profit_profile','profit_profile0');
    }

    smode = 0;
    thit_total = 0;
    for (var i = 0; i < num_facets; i++) {
      thit_count[i] = 100;
      tadt[i] = adt[i];
      taadmid[i] = aadmid[i];
      tapvar[i] = apvar[i];
      for (var ii = 0; ii < v_len; ii++)
        tid_nv[i][ii] = id_nv[i][ii];
    }
    /*
    if (delay_n == 0) {
      var hit = 0;
      for (var i = 0; i < num_facets; i++) {
        if (candle_type_count[i][1] > 1.8 * candle_type_count[i][2]) {
          hit = 1;
          // price_delay_v[i] /= 1.01;
          tprice_delay_v[i] = price_delay_v[i];
          time_delay_v[i] *= 1.01;
          ttime_delay_v[i] = time_delay_v[i];
          for (var ii = 0; ii < v_len; ii++)
            tdmid_brain[i][ii] = dmid_brain[i][ii];
        }
        if (candle_type_count[i][2] > 1.8 * candle_type_count[i][1]) {
          hit = 1;
          price_delay_v[i] *= 1.01;
          tprice_delay_v[i] = price_delay_v[i];
          // time_delay_v[i] /= 1.01;
          ttime_delay_v[i] = time_delay_v[i];
          for (var ii = 0; ii < v_len; ii++)
            tdmid_brain[i][ii] = dmid_brain[i][ii];
        }
      }
      if (hit == 1) {
        back_profit0 = -1e9;
        continue;
      }
    } */
    if (delay_n == 2) {
      var did = 0;
      for (var i = 0; i < num_facets; i++) {
        if (back_profit_v[i] > back_profit_v0[i]) {
          did = 1;
          console.log(i,
            back_profit_v[i].toExponential(3),
            back_profit_v0[i].toExponential(3),
            ' -- ',
            tdmid_brain[i][0].toExponential(3),
            dmid_brain[i][0].toExponential(3),
          );
          // back_profit_v0[i] = back_profit_v[i];
          // price_delay_v[i] = tprice_delay_v[i];
          // time_delay_v[i] = ttime_delay_v[i];
          // for (var ii = 0; ii < v_len; ii++)
            // dmid_brain[i][ii] = tdmid_brain[i][ii];
        } else {
          tprice_delay_v[i] = price_delay_v[i];
          ttime_delay_v[i] = time_delay_v[i];
          for (var ii = 0; ii < v_len; ii++)
            tdmid_brain[i][ii] = dmid_brain[i][ii];
        }
      }
      if (did == 1) {
        delay_n = 0;
        // back_profit0 = -1e9;
        continue;
      }
    }

    const x = Math.random();
    if (x < 0.5) {
      delay_n = 1;
      const d = 1 + (2 * Math.random() - 1) / 1e1;
      const ii = Math.floor(Math.random() * num_facets);
      tprice_delay_v[ii] = d * price_delay_v[ii];
      ttime_delay_v[ii] = d * time_delay_v[ii];
      for (var i = 0; i < num_facets; i++) {
        // for (var ii = 0; ii < v_len; ii++)
          tdmid_brain[i][0] = dmid_brain[i][0]
            + (2 * Math.random() - 1) / 1e2
            ;
          tdmid_brain[i][v_len-1] = dmid_brain[i][v_len-1]
            + (2 * Math.random() - 1) / 1e2
            ;
      }
      /*
    } else if (x < 0.5) {
      delay_n = 1;
      for (var i = 0; i < num_facets; i++) {
        tprice_delay_v[i] = price_delay_v[i]
          * (1 + (2 * Math.random() - 1) / 1e4);
        ttime_delay_v[i] = time_delay_v[i]
          * (1 + (2 * Math.random() - 1) / 1e3);
        for (var ii = 0; ii < v_len; ii++)
          tdmid_brain[i][ii] = dmid_brain[i][ii]
            * (1 + (2 * Math.random() - 1) * (2 * Math.random() - 1) / 1e2);
      }
      */
    } else if (x < 1.75) {
      delay_n = 2;
      for (var i = 0; i < num_facets; i++) {
        tprice_delay_v[i] = price_delay_v[i];
        ttime_delay_v[i] = time_delay_v[i];
        // for (var ii = 0; ii < v_len; ii++)
          tdmid_brain[i][0] = dmid_brain[i][0]
            + (2 * Math.random() - 1) / 1e1;
          tdmid_brain[i][v_len-1] = dmid_brain[i][v_len-1]
            + (2 * Math.random() - 1) / 1e1;
      }
      /*
    } else {
      delay_n = 3;
      for (var i = 0; i < num_facets; i++) {
        if (back_profit_v[i] < back_profit_v0[i]) {
          tprice_delay_v[i] = price_delay_v[i];
          ttime_delay_v[i] = time_delay_v[i];
          for (var ii = 0; ii < v_len; ii++)
            tdmid_brain[i][ii] = dmid_brain[i][ii];
        }
      }
      */
    }
  }
}

async function doPrintLine() {
  console.log(' apvar    aadmid price_del time_del profit dmid_b -- counts');
  for (var i = 0; i < num_facets; i++) {
    var tstr = ''
      + ' ' + apvar[i].toExponential(3)
      + ' ' + aadmid[i].toExponential(3);
    tstr += ' ' + price_delay_v[i].toExponential(3);
    tstr += ' ' + time_delay_v[i].toExponential(3);
    if (back_profit_v[i] >= 0) tstr += ' ';
    tstr += ' ' + back_profit_v[i].toExponential(3);
    if (dmid_brain[i][0] >= 0) tstr += ' ';
    tstr += ' ' + dmid_brain[i][0].toExponential(3);
    if (dmid_brain[i][v_len-1] >= 0) tstr += ' ';
    tstr += ' ' + dmid_brain[i][v_len-1].toExponential(3);
    tstr += ' ' + hit_count[i];
    tstr += ' -- ' +
      cctv[i][0] + ' ' +
      cctv[i][1] + ' ' +
      cctv[i][2] + ' ' +
      cctv[i][3];
    while (tstr.length < 70) tstr += ' ';
    tstr += ' -- ' + candle_type_count[i][1]
      + ' ' + candle_type_count[i][2];
    console.log(tstr);
  }
}

async function doDump() {
  for (var i = 0; i < num_facets; i++) {
    fs.writeFileSync('adt/' + i, adt[i].toExponential(19) + '\n');
    fs.writeFileSync('aadmid/' + i, aadmid[i].toExponential(19) + '\n');
    fs.writeFileSync('apvar/' + i, apvar[i].toExponential(19) + '\n');
    var tstr = '';
    for (var ii in tick_v) tstr += dmid_brain[i][ii].toExponential(19) + '\n';
    fs.writeFileSync('dmid_brain/' + i,tstr);
    tstr = '';
    for (var ii in tick_v) tstr += id_nv[i][ii].toExponential(19) + '\n';
    fs.writeFileSync('id_nv/' + i,tstr);

    /*
    tstr = '';
    for (var ii in tick_v) tstr += profit_brain[i][ii].toExponential(19) + '\n';
    fs.writeFileSync('profit_brain/' + i,tstr);
    */

    fs.writeFileSync('hit_total',hit_total + '\n');
    // fs.writeFileSync('hit_count/' + i,hit_count[i] + '\n');

    fs.writeFileSync('price_delay_v/' + i, price_delay_v[i].toExponential(19) + '\n');
    fs.writeFileSync('time_delay_v/' + i, time_delay_v[i].toExponential(19) + '\n');
  }
  candle_count = 0;
}

var td = 0;
async function doTickLine(line) {
  var lst = line.split(' ');
  if (lst.length < 3) return;
  current_bid = Number(lst[1]);
  // current_ask = Number(lst[2]);
  current_ask = current_bid + aspread;
  if (maxb == 0) maxb = current_bid;
  if (maxa == 0) maxa = current_ask;
  if (current_bid > maxb) maxb = current_bid;
  if (current_ask < maxa) maxa = current_ask;
  const pvar = 2 * (maxb - maxa) / (maxb + maxa);
  var candle_done = 1;
  if (pvar < tprice_delay_v[tick_v_id]) {
    candle_type = 1;
    return; // candle_done = 0;
  }

  nh0 = Number(lst[0].slice(8,10));
  nm0 = Number(lst[0].slice(10,12));
  ns0 = Number(lst[0].slice(12,17)) / 1000;
  /*
  console.log(nh0,nm0,ns0);
  process.exit();

  const time_lst = lst[0].split(':');
  nh0 = Number(time_lst[0]);
  nm0 = Number(time_lst[1]);
  ns0 = Number(time_lst[2]);
  */
  if (oh0 < 0) { oh0 = nh0; om0 = nm0; os0 = ns0; }
  const th0 = nh0 < oh0 ? nh0 + 24 - oh0 : nh0 - oh0;
  td = th0 * 60 * 60 + (nm0 - om0) * 60 + (ns0 - os0);
  if (td < ttime_delay_v[tick_v_id]) {
    candle_type = 2;
    return; // candle_done = 0;
  }
  candle_type_count[tick_v_id][candle_type]++;
  candle_type = 0;
  if (candle_done == 0) return;
  const midp = (maxb + maxa) / 2;
  await doMadeDelay(midp,pvar);
}

const good_candle = [];
const bad_candle = [];
const bgood_candle = [];
const bbad_candle = [];
const cct = [0,0,0,0];
const cct2 = [];
var candle_count = 0;
var d_n = 1e7;
var back_pos = 0;
var back_price = 0;
async function doMadeDelay(midp,pvar) {
  time_lap += td;
  if (omidp == 0) omidp = midp;
  const dmidp = (midp - omidp) / omidp;
  omidp = midp;
  if (smode == 0) {
    tadt[tick_v_id] *= 1 - 1 / d_n;
    tadt[tick_v_id] += td / d_n;
    taadmid[tick_v_id] *= 1 - 1 / d_n;
    taadmid[tick_v_id] += Math.abs(dmidp) / d_n;
    tapvar[tick_v_id] *= 1 - 1 / d_n;
    tapvar[tick_v_id] += pvar / d_n;
  }

  // const highp = midp + midp * pvar / 2;  maxb
  // const lowp = midp - midp * pvar / 2;  maxa
  var tprofit = 0;
  if ((back_pos > 0) && (maxb >= back_sellp) && (maxa - aspread <= back_sellp)) {
    tprofit = back_sellp - back_price;
    back_profit += back_sellp;
    back_pos = 0;
    cct[1]++;
    cctv[tick_v_id][1]++;
  }
  if ((back_pos < 0) && (maxb + aspread >= back_buyp) && (maxa <= back_buyp)) {
    tprofit = back_price - back_buyp;
    back_profit -= back_buyp;
    back_pos = 0;
    cct[3]++;
    cctv[tick_v_id][3]++;
  }
  if (back_pos > 0) {
    tprofit = current_bid - back_price;
    back_profit += current_bid;
  }
  if (back_pos < 0) {
    tprofit = back_price - current_ask;
    back_profit -= current_ask;
  }
  back_profit_v[tick_v_id] += tprofit;
  back_pos = 0;

  /*
  if (smode == 0) {
    var pdmidp = 0;
    for (var i in tick_v) pdmidp += tdmid_brain[tick_v_id][i] * tick_nv[i];
    if (pdmidp > 0) {
      for (var i in tick_v) tdmid_brain[tick_v_id][i]
        += tick_nv[i] * tprofit / 1e6;
    } else {
      for (var i in tick_v) tdmid_brain[tick_v_id][i]
        -= tick_nv[i] * tprofit / 1e6;
    }
  }
  if (smode == 0) {

    var pdmidp = 0;
    for (var i in tick_v) pdmidp += dmid_brain[tick_v_id][i] * tick_nv[i];
    const dmid_err = dmidp - pdmidp;
    for (var i in tick_v) dmid_brain[tick_v_id][i] += dmid_err * tick_nv[i] / d_n;
    const pvar_err = pvar - pvarp;
  }
  */

  const current_d = (current_ask + current_bid - 2 * midp) / pvar;
  tick_v[0] = 1;
  for (var i = 1; i < 13; i++) tick_v[i] = tick_v[i + 4];
  tick_v[13] = td / tadt[tick_v_id];
  tick_v[14] = dmidp / taadmid[tick_v_id];
  tick_v[15] = pvar / tapvar[tick_v_id];
  tick_v[16] = current_d;

  var vs = 0;
  for (var i = 0; i < v_len; i++) vs += tick_v[i] * tick_v[i];
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i = 0; i < v_len; i++) tick_nv[i] = tick_v[i] / vs;
  var dot_max = -2;
  for (var i = 0; i < num_facets; i++) {
    var tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += tick_nv[ii] * tid_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      tick_v_id = i;
    }
  }
  if (smode == 0) {
    thit_total++;
    thit_count[tick_v_id]++;
    d_n = Math.exp(Math.floor(Math.log(thit_count[tick_v_id])) - 1);

    vs = 0;
    for (var ii in tick_v) {
      tid_nv[tick_v_id][ii] += tick_nv[ii] / d_n;
      vs += tid_nv[tick_v_id][ii] * tid_nv[tick_v_id][ii];
    }
    vs = Math.sqrt(vs);
    if (vs > 0) for (var ii in tick_v) tid_nv[tick_v_id][ii] /= vs;
  } else {
    fs.appendFileSync( 'profit_profile', midp.toFixed(5)
      + ' ' + back_profit.toFixed(5)
      // + ' ' + back_sellp.toFixed(5)
      // + ' ' + back_buyp.toFixed(5)
      // + ' ' + dot_max.toExponential(5)
      + '\n');
  }

  var dmidp_t = 0;
  var pvar_t = 0;
  var prof_t = 0;
  // for (var i in tick_v) prof_t += profit_brain[tick_v_id][i] * tick_nv[i];
  for (var i in tick_v) dmidp_t += tdmid_brain[tick_v_id][i] * tick_nv[i];
  if (dmidp_t >= 0) {
    if (back_pos < 1) {
      back_profit -= (1 - back_pos) * current_ask;
      back_pos = 1;
      back_price = current_ask;
    }
    back_sellp = current_ask + current_ask * dmidp_t;
    cct[0]++;
    cctv[tick_v_id][0]++;
  } else {
    if (back_pos > -1) {
      back_profit += (back_pos + 1) * current_bid;
      back_pos = -1;
      back_price = current_bid;
    }
    back_buyp = current_bid + current_bid * dmidp_t;
    cct[2]++;
    cctv[tick_v_id][2]++;
  }
  // const midp_t = midp + midp * dmidp_t;
  // back_buyp = Math.floor(100000 * midp_t) / 100000;
  // back_sellp = back_buyp + 1e-5;
  // console.log(back_buyp,back_sellp);
  // if (back_pos > 0) back_buyp = 0;
  // else if (back_pos < 0) back_sellp = 0;
  // else if (prof_t <= 0) {
  /*
  if (prof_t <= 0) {
    back_buyp = 0;
    back_sellp = 0;
  }
  */

  good_one = 0;
  maxb = current_bid;
  maxa = current_ask;
  oh0 = nh0;
  om0 = nm0;
  os0 = ns0;
}

doMain();

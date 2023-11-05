const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');

var num_facets = Number(fs.readFileSync('num_facets','utf8'));
var tnum_facets = num_facets;
const max_num_facets = 32;
const v_len = 6; // 19;

var omidp = 0;
const spw = 60 * 60 * 24 * 7;


const id_nv = [];
const tid_nv = [];
for (var i = 0; i < num_facets; i++) {
  id_nv[i] = [];
  tid_nv[i] = [];
  for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0;
  try {
    const id_nv_data = fs.readFileSync('id_nv/' + i,'utf8');
    const id_nv_lines = id_nv_data.split('\n');
    for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = Number(id_nv_lines[ii]);
  } catch { for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0; }
  for (var ii = 0; ii < v_len; ii++)
    if (id_nv[i][ii] !== id_nv[i][ii]) id_nv[i][ii] = 0;
  // if (id_nv[i][3] == 0) id_nv[i][3] = Math.random();

  /*
  for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 2 * Math.random() - 1;
  id_nv[i][0] = Math.abs(id_nv[i][0]);
  var ts = 0;
  for (var ii = 0; ii < v_len; ii++) ts += id_nv[i][ii] * id_nv[i][ii];
  ts = Math.sqrt(ts);
  for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] /= ts;
  */

    /*
  if (i == 1)
  if (i > 7)
    for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = id_nv[i-8][ii];
  */
  // for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0;
}

// const temp_vec = id_nv[5];
// id_nv[5] = id_nv[6];
// id_nv[6] = temp_vec;
for (var i = 0; i < num_facets; i++)
  for (var ii = 0; ii < v_len; ii++)
    tid_nv[i][ii] = id_nv[i][ii];

const tick_v = [];
const tick_nv = [];
const otick_nv = [];
var aamidp16 = 0;
var aamidp32 = 0;
var aamidps16 = 0;
var aamidps32 = 0;

const profit_id_count = [];
const profit_id = [];
const profit_id_l_count = [];
const profit_id_l = [];
const profit_id_s_count = [];
const profit_id_s = [];
for (var i = 0; i < num_facets; i++) {
  profit_id[i] = 0;
  profit_id_count[i] = 0;
  profit_id_l[i] = 0;
  profit_id_l_count[i] = 0;
  profit_id_s[i] = 0;
  profit_id_s_count[i] = 0;
}
const aprofit_id = [];
for (var i = 0; i < num_facets; i++) aprofit_id[i] = 0;

const aspread = Number(fs.readFileSync('aspread','utf8'));
console.log('doMain ' + new Date());
var back_profit = 0;
var aback_profit = 0;
var back_profit_max = 0;
var max_dd = 0;
var back_sellp = 0;
var back_buyp = 0;
var back_nav = 1;
var back_nav0 = 0;
var levx = Number(fs.readFileSync('levx','utf8'));
var tlevx = levx;
var max_nav = 0;

var hit_total = Number(fs.readFileSync('hit_total','utf8'));
hit_total = 0;
var thit_total = hit_total;
const vv_pos = [];
const tvv_pos = [];
const tvv_posc = [];
const tvv_poss = [];
for (var i = 0; i < num_facets; i++) {
  vv_pos[i] = [];
  tvv_pos[i] = [];
  tvv_posc[i] = [];
  tvv_poss[i] = [];
  const d = fs.readFileSync('vv_pos/' + i,'utf8');
  const l = d.split('\n');
  for (var ii = 0; ii < num_facets; ii++) {
    vv_pos[i][ii] = Number(l[ii]);
    // vv_pos[i][ii] = 1;
    tvv_pos[i][ii] = vv_pos[i][ii];
    tvv_posc[i][ii] = 0;
    tvv_poss[i][ii] = 0;
  }
}
const hit_count = [];
for (var i = 0; i < num_facets; i++) hit_count[i] = 0;
const thit_count = [];
for (var i = 0; i < num_facets; i++) thit_count[i] = 0;
var nh0,nm0,ns0;
var oh0 = 0,om0 = 0,os0 = 0;
var ov_id = 0;
var v_id = 0;
var current_ask = 0;
var current_bid = 0;
var smode = 3;
var delay_n = 0;
var amidp8 = 0;
var amidp16 = 0;
var amidp32 = 0;
var amidps8 = 0;
var amidps16 = 0;
var amidps32 = 0;
var dmidp = 0,dmidps = 0;
var tick_count = 0;
const cut_v = [];
var trade_count = 0;
const tt = {};
try {
  const d = fs.readFileSync('ttable','utf8');
  for (var i of d.split('\n')) tt[i] = 1;
} catch {}
var poscs = 0;
var max_tps = 0;
async function doMain() {
  var back_profit0 = -1e9;
  var back_profit1 = 0;
  var back_profit2 = 0;
  while (true) {
    for (var i = 0; i < v_len; i++) {
      tick_v[i] = 1;
      tick_nv[i] = 1 / Math.sqrt(v_len);
      otick_nv[i] = 1 / Math.sqrt(v_len);
    }
    var dot_max = -2;
    for (var i = 0; i < tnum_facets; i++) {
      cut_v[i] = 1;
      thit_count[i] = 0;
      profit_id_count[i] = 0;
      profit_id[i] = 0;
      profit_id_l_count[i] = 0;
      profit_id_l[i] = 0;
      profit_id_s_count[i] = 0;
      profit_id_s[i] = 0;
    }
    thit_total = 0;
    ov_id = -1;
    v_id = -1;
    // for (var i = 0; i < num_facets; i++) { profit_id[i] = 0; }
    // for (var i = 0; i < num_facets; i++) { aprofit_id[i] = 0; }
    oh0 = -1;
    current_ask = 0;
    current_bid = 0;
    omidp = 0/0;
    maxa = 0;
    maxb = 0;
    back_buyp = 0;
    back_sellp = 0;
    back_profit = 0;
    aback_profit = 0;
    back_profit_max = 0;
    back_nav = 1;
    max_nav = 0;
    max_dd = 0;
    d_n = 1e7;
    back_pos = 0;
    back_price = 0;
    back_id = v_id;
    amidp8 = 0;
    amidp16 = 0;
    amidp32 = 0;
    amidps8 = 0;
    amidps16 = 0;
    amidps32 = 0;
    dmidp = 0;
    dmidps = 0;
    tick_count = 0;
    trade_count = 0;

    const tick_file = await fsPromises.open('../data/ticks-hist');
    // const tick_file = await fsPromises.open('../ticks');
    for await (const line of tick_file.readLines())
      await doTickLine(line);

      /// this tps sucks
    // var tps = 0;
    // for (var i = 0; i < num_facets; i++)
    // for (var ii = 0; ii < num_facets; ii++)
      // tps += Math.abs(tvv_poss[i][ii]);
    console.log(back_profit.toFixed(5),
      back_nav.toExponential(3),
      tlevx.toExponential(3),
      // tps.toExponential(4),
      // (back_profit_max/max_dd).toExponential(3),
      // max_dd.toExponential(3),
      tcutx.toExponential(2),
      tdiv_n0.toFixed(),
      tdiv_n1.toFixed(),
      tdiv_n2.toFixed(),
      trade_count,
      delay_n,
    );
    if (delay_n == 0) back_profit0 = -1e9;
    /*
    if (tps > max_tps) {
      max_tps = tps;
      // back_profit0 = 0;
      back_nav0 = 0;
    } else if (delay_n == 1) {
      // back_profit = 0;
      back_nav = 0;
    } */
    if (back_nav > back_nav0) {
      if ((delay_n != 5) && (delay_n != 0))
        for (var i in tt) delete tt[i];
      num_facets = tnum_facets;
      cutx = tcutx;
      div_n0 = tdiv_n0;
      div_n1 = tdiv_n1;
      div_n2 = tdiv_n2;
      back_profit0 = back_profit;
      hit_total = thit_total;
      // if (back_nav > back_nav0) {
        back_nav0 = back_nav;
      // }
      var off = 0;
      for (var i = 0; i < num_facets; i++) {
        if (thit_count[i] == 0) {
          console.log('throwing off ' + i);
          off++;
          continue;
        }
        hit_count[i-off] = thit_count[i];
        profit_id[i-off] = profit_id[i];
        profit_id_count[i-off] = profit_id_count[i];
        profit_id_l[i-off] = profit_id_l[i];
        profit_id_l_count[i-off] = profit_id_l_count[i];
        profit_id_s[i-off] = profit_id_s[i];
        profit_id_s_count[i-off] = profit_id_s_count[i];
        var toff = 0;
        for (var ii = 0; ii < num_facets; ii++) {
          if (thit_count[ii] == 0) { toff++; continue; }
          vv_pos[i-off][ii-toff] = tvv_pos[i][ii];
        }
        for (var ii = 0; ii < v_len; ii++) {
          id_nv[i-off][ii] = tid_nv[i][ii];
        }
      }
      if (off > 0) {
        num_facets -= off;
        for (var i = 0; i < num_facets; i++) {
          thit_count[i] = hit_count[i];
          for (var ii = 0; ii < num_facets; ii++)
            tvv_pos[i-off][ii] = vv_pos[i][ii];
          for (var ii = 0; ii < v_len; ii++) {
            tid_nv[i][ii] = id_nv[i][ii];
          }
        }
      }
      // for (var i = 0; i < num_facets; i++) console.log(tvv_pos[i].join(' '));
      delay_n = 0;
      tnum_facets = num_facets;
      await doDump();
      await doPrintLine();
      // fs.renameSync('profit_profile','profit_profile1');
    } else {
      // fs.renameSync('profit_profile','profit_profile0');
      if (back_profit > back_profit0) {
        if (tlevx < levx) {
          tlevx = levx;
          continue;
        }
      }
    }

    thit_total = 0;
    tcutx = cutx;
    tdiv_n0 = div_n0;
    tdiv_n1 = div_n1;
    tdiv_n2 = div_n2;
    tnum_facets = num_facets;
    for (var i = 0; i < num_facets; i++)
      for (var ii = 0; ii < v_len; ii++)
        tid_nv[i][ii] = id_nv[i][ii];
    var tstr = '';
    for (var i = 0; i < num_facets; i++) tstr += tvv_pos[i].join('');
    tt[tstr] = 1;
    var ttstr = '';
    for (var i in tt) ttstr += i + '\n';
    fs.writeFileSync('ttable',ttstr);
    for (var i = 0; i < num_facets; i++)
      for (var ii = 0; ii < num_facets; ii++)
        tvv_pos[i][ii] = vv_pos[i][ii];

    tlevx = levx;

    const ncut = [ 1, 0, 0, 0, 0 ];
    if (back_profit0 > 0) {
      ncut[0] = 0.05; // shift base vars
      ncut[1] = 0.5; // shift base vars
      ncut[2] = 0.05; // take away a facet
      ncut[3] = 0.05; // add facets
      ncut[4] = 0.08;  // shift a facet

    }
    const ncutx = Math.random();
    // ncutx = 2;
    if (ncutx < ncut[0]) {
      tlevx = levx * (1 + (2 * Math.random() - 1) / 10);
      if (tlevx > 50) tlevx = 50;
      delay_n = 6;
    } else if (ncutx < ncut[1]) {
      // console.log('ncut',ncutx,ncut[0]);
      tcutx = cutx * (1 + (2 * Math.random() - 1) / 10);
      tdiv_n0 = div_n0 * (1 + (2 * Math.random() - 1) / 10);
      tdiv_n1 = div_n1 * (1 + (2 * Math.random() - 1) / 10);
      if (tdiv_n1 < 1.1 * tdiv_n0) tdiv_n1 = 1.1 * tdiv_n0;
      tdiv_n2 = div_n2 * (1 + (2 * Math.random() - 1) / 10);
      if (tdiv_n2 < 1.1 * tdiv_n1) tdiv_n2 = 1.1 * tdiv_n1;

      var i = Math.floor(num_facets * Math.random());
      for (var ii = 0; ii < v_len; ii++)
        tid_nv[i][ii] += (2 * Math.random() - 1) / 100;
      var vs = 0;
      for (var ii = 0; ii < v_len; ii++) vs +=
        tid_nv[i][ii] * tid_nv[i][ii];
      vs = Math.sqrt(vs);
      for (var ii = 0; ii < v_len; ii++) tid_nv[i][ii] /= vs;
      
      tlevx = levx * (1 + (2 * Math.random() - 1) / 10);
      if (tlevx > 50) tlevx = 50;
      delay_n = 1;
    } else if (ncutx < ncut[2]) {
      // console.log('ncut',ncutx,ncut[1]);
      if (num_facets > 3) {
        var i = Math.floor(num_facets * Math.random());
        for (var ii = 0; ii < v_len; ii++) tid_nv[i][ii] = 0;
      }
      delay_n = 2;
    } else if (ncutx < ncut[3]) {
      // console.log('ncut',ncutx,ncut[2]);
      for (var i = num_facets; i < max_num_facets; i++) {
        if (typeof id_nv[i] == 'undefined') {
          id_nv[i] = [];
          tid_nv[i] = [];
        }
        for (var ii = 0; ii < v_len; ii++)
          tid_nv[i][ii] = 2 * Math.random() - 1;
        var vs = 0;
        for (var ii = 0; ii < v_len; ii++) vs +=
          tid_nv[i][ii] * tid_nv[i][ii];
        vs = Math.sqrt(vs);
        for (var ii = 0; ii < v_len; ii++) tid_nv[i][ii] /= vs;
        tid_nv[i][0] = Math.abs(tid_nv[i][0]);
      }
      tnum_facets = max_num_facets;
      delay_n = 3;
    } else if (ncutx < ncut[4]) {
      // console.log('ncut',ncutx,ncut[3]);
      var i = Math.floor(num_facets * Math.random());
      for (var ii = 0; ii < v_len; ii++)
        tid_nv[i][ii] += (2 * Math.random() - 1) / 1000;
      var vs = 0;
      for (var ii = 0; ii < v_len; ii++) vs +=
        tid_nv[i][ii] * tid_nv[i][ii];
      vs = Math.sqrt(vs);
      for (var ii = 0; ii < v_len; ii++) tid_nv[i][ii] /= vs;
      delay_n = 4;
    } else {
      // console.log('ncut',ncutx);
      var ts = 0;
      for (var i = 0; i < num_facets; i++)
        for (var ii = 0; ii < num_facets; ii++)
          ts += tvv_posc[i][ii];
        /*
      for (var i = 0; i < num_facets; i++) {
        for (var ii = 0; ii < num_facets; ii++) {
          if (tvv_poss[i][ii] / tvv_posc[i][ii] > aspread)
            tvv_pos[i][ii] = 1;
          else if (tvv_poss[i][ii] / tvv_posc[i][ii] < -aspread)
            tvv_pos[i][ii] = 2;
          else tvv_pos[i][ii] = 1;
        }
      } */
      while (tt[tstr] == 1) {
        // console.log('hit ' + tstr);
        const x = ts * Math.random();
        var tts = 0;
        var maxi = 0;
        var maxii = 0;
        for (var i = 0; i < num_facets; i++) {
          for (var ii = 0; ii < num_facets; ii++) {
            tts += tvv_posc[i][ii];
            if (x < tts) { maxi = i; maxii = ii; break; }
          }
          if (x < tts) break;
        }
        if (tvv_poss[maxi][maxii] > 0) {
          if (Math.random() <
            tvv_poss[maxi][maxii] / tvv_posc[maxi][maxii] / aspread
          ) tvv_pos[maxi][maxii] = 1;
          else tvv_pos[maxi][maxii] = 3;
        } else {
          if (Math.random() <
            - tvv_poss[maxi][maxii] / tvv_posc[maxi][maxii] / aspread
          ) tvv_pos[maxi][maxii] = 2;
          else tvv_pos[maxi][maxii] = 3;
        }
        tstr = '';
        for (var i = 0; i < num_facets; i++) tstr += tvv_pos[i].join('');
      }
      delay_n = 5;
      tlevx = levx * (1 + (2 * Math.random() - 1) / 10);
      if (tlevx > 50) tlevx = 50;
    }
    for (var i = 0; i < num_facets; i++)
      for (var ii = 0; ii < num_facets; ii++) {
        tvv_posc[i][ii] = 0;
        tvv_poss[i][ii] = 0;
      }
  }
}

async function doPrintLine() {
  console.log('     --------');
  var tstr = '';
  for (var i = 0; i < tnum_facets; i++) {
    tstr = i.toFixed();
    while (tstr.length < 4) tstr += ' ';
    for (var ii = 0; ii < v_len; ii++) {
      if (tid_nv[i][ii] >= 0) tstr += ' ';
      tstr += ' ' + tid_nv[i][ii].toExponential(2);
    }
    if (profit_id[i] >= 0) tstr += ' ';
    tstr += ' ' + profit_id[i].toFixed(5);
    if (profit_id_l[i] >= 0) tstr += ' ';
    tstr += ' ' + profit_id_l[i].toFixed(5);
    if (profit_id_s[i] >= 0) tstr += ' ';
    tstr += ' ' + profit_id_s[i].toFixed(5);
    tstr += ' ' + profit_id_count[i];
    tstr += ' ' + profit_id_l_count[i];
    tstr += ' ' + profit_id_s_count[i];
    // tstr += ' ' + thit_count[i];
    console.log(tstr);
  }
  console.log('  profit  profx   cutx   div n0  n1  n2  tradec rtype');
}

async function doDump() {
  for (var i = 0; i < num_facets; i++) {
    var tstr = '';
    for (var ii in tick_v) tstr += id_nv[i][ii].toExponential(19) + '\n';
    fs.writeFileSync('id_nv/' + i,tstr);
    fs.writeFileSync('vv_pos/' + i,vv_pos[i].join('\n'));
  }

  fs.writeFileSync('hit_total',hit_total + '\n');
  fs.writeFileSync('cutx',cutx.toExponential(19) + '\n');
  fs.writeFileSync('div_n0',div_n0.toExponential(19) + '\n');
  fs.writeFileSync('div_n1',div_n1.toExponential(19) + '\n');
  fs.writeFileSync('div_n2',div_n2.toExponential(19) + '\n');
  fs.writeFileSync('num_facets',num_facets + '\n');
  fs.writeFileSync('levx',levx.toExponential(9) + '\n');
  candle_count = 0;
}

async function doAves(n1,n2,n3) {
  amidp8 *= 1 - 1 / n1;
  amidp8 += dmidp / n1;
  amidp16 *= 1 - 1 / n2;
  amidp16 += dmidp / n2;
  amidp32 *= 1 - 1 / n3;
  amidp32 += dmidp / n3;

  amidps8 *= 1 - 1 / n1;
  amidps8 += dmidps / n1;
  amidps16 *= 1 - 1 / n2;
  amidps16 += dmidps / n2;
  amidps32 *= 1 - 1 / n3;
  amidps32 += dmidps / n3;

  aamidp16 *= 1 - 1 / n2;
  aamidp16 += Math.abs(amidp8 - amidp16) / n2;
  aamidp32 *= 1 - 1 / n3;
  aamidp32 += Math.abs(amidp8 - amidp32) / n3;

  aamidps16 *= 1 - 1 / n2;
  aamidps16 += Math.abs(amidps8 - amidps16) / n2;
  aamidps32 *= 1 - 1 / n3;
  aamidps32 += Math.abs(amidps8 - amidps32) / n3;
}

var cutx = Number(fs.readFileSync('cutx','utf8'));
var tcutx = cutx;
var div_n0 = Number(fs.readFileSync('div_n0','utf8'));
var tdiv_n0 = div_n0;
var div_n1 = Number(fs.readFileSync('div_n1','utf8'));
var tdiv_n1 = div_n1;
var div_n2 = Number(fs.readFileSync('div_n2','utf8'));
var tdiv_n2 = div_n2;
var tprof_div = 1;
async function doTickLine(line) {
  var lst = line.split(' ');
  if (lst.length < 3) return;
  current_bid = Number(lst[1]);
  // current_ask = Number(lst[2]);
  current_ask = current_bid + aspread;
  const midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) omidp = midp;
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  tick_count++;
  omidp = midp;
  if (tick_count > tdiv_n2) await doAves(tdiv_n0,tdiv_n1,tdiv_n2);
  else if (tick_count > tdiv_n1) await doAves(tdiv_n0,tdiv_n1,tick_count);
  else if (tick_count > tdiv_n0) await doAves(tdiv_n0,tick_count,tick_count);
  else await doAves(tick_count,tick_count,tick_count);


  tick_v[0] = 1;
  tick_v[1] = (amidp8 - amidp16) / aamidp16;
  tick_v[2] = (amidp8 - amidp32) / aamidp32;
  tick_v[3] = (amidps8 - amidps16) / aamidps16;
  tick_v[4] = (amidps8 - amidps32) / aamidps32;

  tick_v[5] = (amidp16 - amidp32) / aamidp32;

  for (var i = 0; i < v_len; i++) otick_nv[i] = tick_nv[i];
  var vs = 0;
  for (var i = 0; i < v_len; i++) vs += tick_v[i] * tick_v[i];
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i = 0; i < v_len; i++) tick_nv[i] = tick_v[i] / vs;
  var tdot = 0;
  var dot_max = -2;
  var i_max = -1;
  if (v_id >= 0) {
    for (var ii = 0; ii < v_len; ii++) tdot += tick_nv[ii] * tid_nv[v_id][ii];
    dot_max = tdot + tcutx;
    i_max = v_id;
  }
  for (var i = 0; i < tnum_facets; i++) {
    if (i == v_id) continue;
    tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += tick_nv[ii] * tid_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      i_max = i;
    }
  }
  if (i_max != v_id) {
    const oback_mid = back_mid;
    back_mid = (current_ask + current_bid) / 2;
    if (v_id >= 0) {
      const oback_pos = back_pos;
      if (tvv_pos[i_max][v_id] == 0) back_pos = 0;
      else if (tvv_pos[i_max][v_id] == 1) back_pos = 1;
      else if (tvv_pos[i_max][v_id] == 2) back_pos = 2;
      else if (tvv_pos[i_max][v_id] == 3) back_pos = oback_pos;
      if (ov_id >= 0) {
        tvv_posc[v_id][ov_id]++;
        tvv_poss[v_id][ov_id] += back_mid - oback_mid;
      }


      if (oback_pos == 1) {
        if (back_pos == 1) {
          const prof_t = current_ask - back_ask;
          back_profit += prof_t;
          aback_profit += Math.abs(prof_t);
          back_nav += tlevx * back_nav * prof_t / back_ask;
          if (back_nav > max_nav) max_nav = back_nav;
          if (back_nav < max_nav / 2) back_nav = 0;
          /*
          if (back_profit > back_profit_max) back_profit_max = back_profit;
          else if (back_profit_max - back_profit > max_dd)
            max_dd = back_profit_max - back_profit;
          fs.appendFileSync('profit_profile',
            midp.toFixed(5) + ' ' +
            back_profit.toExponential(5) + '\n');
          */
          profit_id_l[v_id] += prof_t;
          profit_id[v_id] += prof_t;
          profit_id_count[v_id]++;
          profit_id_l_count[v_id]++;
        } else {
          const prof_t = current_bid - back_ask;
          back_profit += prof_t;
          aback_profit += Math.abs(prof_t);
          back_nav += tlevx * back_nav * prof_t / back_ask;
          if (back_nav > max_nav) max_nav = back_nav;
          if (back_nav < max_nav / 2) back_nav = 0;
          /*
          if (back_profit > back_profit_max) back_profit_max = back_profit;
          else if (back_profit_max - back_profit > max_dd)
            max_dd = back_profit_max - back_profit;
          fs.appendFileSync('profit_profile',
            midp.toFixed(5) + ' ' +
            back_profit.toExponential(5) + '\n');
          */
          profit_id_l[v_id] += prof_t;
          profit_id[v_id] += prof_t;
          profit_id_count[v_id]++;
          profit_id_l_count[v_id]++;
          trade_count++;
        }
      }
      if (oback_pos == 2) {
        if (back_pos == 2) {
          const prof_t = back_bid - current_bid;
          back_profit += prof_t;
          aback_profit += Math.abs(prof_t);
          back_nav += tlevx * back_nav * prof_t / back_bid;
          if (back_nav > max_nav) max_nav = back_nav;
          if (back_nav < max_nav / 2) back_nav = 0;
          /*
          if (back_profit > back_profit_max) back_profit_max = back_profit;
          else if (back_profit_max - back_profit > max_dd)
            max_dd = back_profit_max - back_profit;
          fs.appendFileSync('profit_profile',
            midp.toFixed(5) + ' ' +
            back_profit.toExponential(5) + '\n');
          */
          profit_id_s[v_id] += prof_t;
          profit_id[v_id] += prof_t;
          profit_id_count[v_id]++;
          profit_id_s_count[v_id]++;
        } else {
          const prof_t = back_bid - current_ask;
          back_profit += prof_t;
          aback_profit += Math.abs(prof_t);
          back_nav += tlevx * back_nav * prof_t / back_bid;
          if (back_nav > max_nav) max_nav = back_nav;
          if (back_nav < max_nav / 2) back_nav = 0;
            /*
          if (back_profit > back_profit_max) back_profit_max = back_profit;
          else if (back_profit_max - back_profit > max_dd)
            max_dd = back_profit_max - back_profit;
          fs.appendFileSync('profit_profile',
            midp.toFixed(5) + ' ' +
            back_profit.toExponential(5) + '\n');
          */
          profit_id_s[v_id] += prof_t;
          profit_id[v_id] += prof_t;
          profit_id_count[v_id]++;
          profit_id_s_count[v_id]++;
          trade_count++;
        }
      }
    }
    back_bid = current_bid;
    back_ask = current_ask;
    thit_count[i_max]++;
    thit_total++;
    ov_id = v_id;
    v_id = i_max;
    /*
    if (smode == -1) {
      var ts = 0;
      for (var ii = 0; ii < v_len; ii++) tid_nv[i_max][ii] += tick_nv[ii] / tidnv_div;
      for (var ii = 0; ii < v_len; ii++) ts += tid_nv[i_max][ii] * tid_nv[i_max][ii];
      ts = Math.abs(ts);
      for (var ii = 0; ii < v_len; ii++) tid_nv[i_max][ii] /= ts;
    } */
  }
}

const good_candle = [];
const bad_candle = [];
const bgood_candle = [];
const bbad_candle = [];
var candle_count = 0;
var d_n = 1e7;
var back_pos = 0;
var back_id = 0;
var back_price = 0;
var back_bid = 0;
var back_ask = 0;
var back_mid = 0;

async function doMadeDelay(midp,pvar) {
}

try { fs.renameSync('err_profile','err_profile0');
} catch {}
try { fs.renameSync('profit_profile','profit_profile0');
} catch {}
doMain();

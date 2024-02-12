const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');

var num_facets = Number(fs.readFileSync('num_facets','utf8'));
var tnum_facets = num_facets;
var num_facets_neg = num_facets;
const max_num_facets = 1000;
const v_len = 7; // 19;

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
  } catch {
    for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 0;

    /*
    */
    for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] = 2 * Math.random() - 1;
    id_nv[i][0] = Math.abs(id_nv[i][0]);
    var ts = 0;
    for (var ii = 0; ii < v_len; ii++) ts += id_nv[i][ii] * id_nv[i][ii];
    ts = Math.sqrt(ts);
    for (var ii = 0; ii < v_len; ii++) id_nv[i][ii] /= ts;
  }
  for (var ii = 0; ii < v_len; ii++)
    if (id_nv[i][ii] !== id_nv[i][ii]) id_nv[i][ii] = 0;
}

const low_nv = [];
const high_nv = [];
const nlow_nv = [];
const nhigh_nv = [];
for (var i = 0; i < num_facets; i++) {
  low_nv[i] = [];
  high_nv[i] = [];
  for (var ii = 0; ii < v_len; ii++) low_nv[i][ii] = 0;
  for (var ii = 0; ii < v_len; ii++) high_nv[i][ii] = 0;
  nlow_nv[i] = [];
  nhigh_nv[i] = [];
  for (var ii = 0; ii < v_len; ii++) nlow_nv[i][ii] = 0;
  for (var ii = 0; ii < v_len; ii++) nhigh_nv[i][ii] = 0;
}

for (var i = 0; i < num_facets; i++)
  for (var ii = 0; ii < v_len; ii++)
    tid_nv[i][ii] = id_nv[i][ii];

const tick_v = [];
const tick_nv = [];
const maxb_nv = [];
const maxa_nv = [];
const otick_nv = [];
var aamidp16 = 0;
var aamidp32 = 0;
var aamidp64 = 0;
var aamidps16 = 0;
var aamidps32 = 0;
var aamidps64 = 0;

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
var back_count = 0;
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
  for (var ii = 0; ii < num_facets; ii++)
    vv_pos[i][ii] = 3;
  try {
    const d = fs.readFileSync('vv_pos/' + i,'utf8');
    const l = d.split('\n');
    for (var ii in l) {
      if (l[ii] == '') continue;
      vv_pos[i][ii] = Number(l[ii]);
    }
  } catch { }
  for (var ii = 0; ii < num_facets; ii++) {
    // vv_pos[i][ii] = 3;
    tvv_pos[i][ii] = vv_pos[i][ii];
    tvv_posc[i][ii] = 0;
    tvv_poss[i][ii] = 0;
  }
  // console.log(vv_pos[i].join(' '));
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
var smode = 0;
var delay_n = 0;
var amidp8 = 0;
var amidp16 = 0;
var amidp32 = 0;
var amidp64 = 0;
var amidps8 = 0;
var amidps16 = 0;
var amidps32 = 0;
var amidps64 = 0;
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
var xmax = 0;
const maxa_t = {};
const maxb_t = {};
const maxa_n = {};
const maxb_n = {};
const dir_t = {};
const leg_t = {};
const price_t = {};
const prof_t = {};
const prof_c = {};
/*
try {
  const d = fs.readFileSync('rdist.out','utf8');
  const lst = d.split('\n');
  var tmax = 0;
  for (var i in lst) {
    if (i == 0) continue;
    var ii = lst[i].split(' ');
    if (ii.length < 3) continue;
    for (var iii in ii) {
      var tl = (Number(ii[6]) * aspread).toExponential(4);
      if (Number(ii[1]) > 0) {
        leg_t[tl] = Number(ii[1]);
        if (Number(ii[1]) > tmax) tmax = Number(ii[1]);
      }
      if (Number(ii[2]) > 0) {
        leg_t[tl] = -Number(ii[2]);
        if (Number(ii[2]) > tmax) tmax = Number(ii[2]);
      }
    }
  }
  for (var i in leg_t) leg_t[i] /= tmax;
} catch {}
*/
try {
  const d = fs.readFileSync('leg_t','utf8');
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    leg_t[ii[0]] = Number(ii[1]);
  }
} catch {}
// for (var i in leg_t) console.log(i,'  ',leg_t[i]);
const tleg_t = {};
var tc = 0;
const leg_id = {};
for (var i in leg_t) {
  tleg_t[i] = leg_t[i];
  dir_t[i] = 0;
  maxb_t[i] = 0;
  maxa_t[i] = 0;
  price_t[i] = 0;
  prof_t[i] = 0;
  prof_c[i] = 0;
  leg_id[i] = tc;
  tc++;
}
var num_strats = 0;
var max_base = 0;
var max_bal = 0;
async function doMain() {
  for (var i = 0; i < 21; i++) tsum[i] = 0;
  for (var i = 0; i < 21; i++) tsumc[i] = 0;
  var back_profit0 = 0; // Number(fs.readFileSync('back_profit0','utf8'));
  var back_profit1 = 0; // Number(fs.readFileSync('back_profit1','utf8'));
  var bp0 = 0; // Number(fs.readFileSync('bp0','utf8'));
  var bp1 = 0; // Number(fs.readFileSync('bp1','utf8'));
  // var bp0 = 0, bp1 = 0, bp2 = 0;
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
    back_count = 0;
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
    amidp64 = 0;
    amidps8 = 0;
    amidps16 = 0;
    amidps32 = 0;
    aamidp16 = 0;
    aamidp32 = 0;
    aamidp64 = 0;
    aamidps16 = 0;
    aamidps32 = 0;

    aamidp16 = 0;
    aamidp32 = 0;
    aamidp64 = 0;
    aamidps16 = 0;
    aamidps32 = 0;
    aamidps64 = 0;

    dmidp = 0;
    dmidps = 0;
    tick_count = 0;
    trade_count = 0;

    base_price = 0;
    base_profit = 0;
    abase_profit = 0;
    base_size = 0;
    base_count = 0;
    balance = 1;

    const tick_file = await fsPromises.open('../data/ticks-hist');
    for await (const line of tick_file.readLines())
      await doTickLine(line);
    // fs.renameSync('ppro','ppro2');
    const tick_file2 = await fsPromises.open('../ticks');
    for await (const line of tick_file2.readLines())
      await doTickLine(line);

      /*
    if (back_pos == 1)
      back_profit += current_bid - back_price;
    if (back_pos == 2)
      back_profit += back_price - current_ask;
    back_count++;
    */

    if (obase_pos > 0) {
      base_profit += current_bid - base_price;
        fs.appendFileSync('ppro',tick_count + ' ' + base_profit + '\n');
      abase_profit += Math.abs(current_bid - base_price);
      balance += base_size * (current_bid - base_price);
      if (balance < 0) balance = 0;
      base_count++;
    }
    if (obase_pos < 0) {
      base_profit += base_price - current_ask;
        fs.appendFileSync('ppro',tick_count + ' ' + base_profit + '\n');
      abase_profit += Math.abs(base_price - current_ask);
      balance += base_size * (base_price - current_ask);
      if (balance < 0) balance = 0;
      base_count++;
    }
    var profit_x = base_profit * Math.abs(base_profit/abase_profit);
    // var profit_x = balance;
    var tmax2 = '0';
    for (var i in tleg_t) {
      var tmax = '1e9';
      for (var ii in tleg_t) {
        if (Number(ii) <= Number(tmax2)) continue;
        if (Number(ii) < Number(tmax)) tmax = ii;
      }
      var tstr = '   ' + tmax + '  ';
      if (tleg_t[tmax] >= 0) tstr += ' ';
      tstr += tleg_t[tmax].toExponential(2);
      if (prof_t[tmax] >= 0) tstr += ' ';
      tstr += '  ' + (prof_t[tmax]/prof_c[tmax]).toExponential(2);
      if (prof_t[tmax] >= 0) tstr += ' ';
      tstr += '  ' + prof_t[tmax].toExponential(2);
      tstr += '  ' + prof_c[tmax];
      console.log(tstr);
      tmax2 = tmax;
    }
    /*
    var tflag = 0;
    for (var i in tleg_t) {
      if (tleg_t[i] * prof_t[i] < 0) {
        tleg_t[i] *= -1;
        tflag = 1;
      }
    }
    if (tflag == 1) {
      for (var i in tleg_t) {
        dir_t[i] = 0;
        maxb_t[i] = 0;
        maxa_t[i] = 0;
        price_t[i] = 0;
        prof_t[i] = 0;
        prof_c[i] = 0;
      }
      continue;
    }
    */
    // if (smode == 2) {
      // if (prof_t[new_mod_leg] * prof_t[mod_leg] < 0) profit_x *= -1;
      // else if (Math.abs(prof_t[new_mod_leg]) / prof_c[new_mod_leg]
        // > Math.abs(prof_t[mod_leg]) / prof_c[mod_leg]) {
        // max_base = 0;
        // console.log('mod_leg ' + mod_leg + ' new_mod_leg ' + new_mod_leg);
      // }
      // else profit_x *= -1;
    // }
      console.log(
        ' ' + base_profit.toExponential(4)
        + ' ' + profit_x.toExponential(4)
        + ' ' + balance.toExponential(4)
        + ' ' + base_count
        + ' nst ' + num_strats
        + ' levx ' + tlevx.toExponential(3)
        + ' sm ' + smode
      );
    if (profit_x >= max_base) {
      if (profit_x == 0) process.exit(1);
      for (var i in tleg_t) leg_t[i] = tleg_t[i];
      for (var i in leg_t) if (leg_t[i] == 0)
        delete leg_t[i];
      var fstr = '';
      for (var i in leg_t)
        fstr += i + ' ' + leg_t[i].toExponential(9) + '\n';
      fs.writeFileSync('leg_t',fstr);
      // if (smode == 1) smode = 2;
      var tstr = '*** ' + mod_leg_c;
      if (profit_x > max_base) {
        tstr += ' *';
        mod_leg_c = 3;
      }
      max_base = profit_x;
      // fs.renameSync('ppro','ppro1');
      // for (var i in leg_t)
        // fs.renameSync('slice' + leg_id[i],'dslice' + leg_id[i]);
      if (balance > max_bal) {
        tstr += ' **';
        max_bal = balance;
        levx = tlevx;
        fs.writeFileSync('levx',levx.toExponential(9) + '\n');
      }
      console.log(tstr);
    } else {
      // fs.renameSync('ppro','ppro0');
      // for (var i in leg_t)
        // fs.renameSync('slice' + leg_id[i],'bslice' + leg_id[i]);
    }
    /*
    } else if (smode == 1) {
      for (var i in leg_t) {
        dir_t[i] = 0;
        maxb_t[i] = 0;
        maxa_t[i] = 0;
        price_t[i] = 0;
        prof_t[i] = 0;
        prof_c[i] = 0;
      }
      tleg_t[tleg] *= -1;
      smode = 2;
      continue;
    }
    */
    for (var i in tleg_t) {
      delete tleg_t[i];
      delete dir_t[i];
      delete maxb_t[i];
      delete maxa_t[i];
      delete price_t[i];
      delete prof_t[i];
      delete prof_c[i];
    }
    num_strats = 0;
    for (var i in leg_t) {
      tleg_t[i] = leg_t[i];
      dir_t[i] = 0;
      maxb_t[i] = 0;
      maxa_t[i] = 0;
      price_t[i] = 0;
      prof_t[i] = 0;
      prof_c[i] = 0;
      num_strats++;
    }
    tlevx = levx;

    if (smode == 0) {
      tlevx = levx * (1 + (2 * Math.random() - 1) / 10);
      for (var i in tleg_t)
        tleg_t[i] = leg_t[i] + (2 * Math.random() - 1) / 100;
      // tleg = (1e-4 * (Math.random() * 400 + 50)).toExponential(4);
      tleg = (1e-4 * (Math.random() * 400)).toExponential(4);
      const x = 2 * Math.random() - 1;
      tleg_t[tleg] = x;
      dir_t[tleg] = 0;
      maxb_t[tleg] = 0;
      maxa_t[tleg] = 0;
      price_t[tleg] = 0;
      prof_t[tleg] = 0;
      prof_c[tleg] = 0;
      num_strats++;
      smode = 1;
      // if (num_strats < 5) smode = 0;
      continue;
    } else if (smode == 1) {
      tlevx = levx * (1 + (2 * Math.random() - 1) / 10);
      for (var i in tleg_t)
        tleg_t[i] = leg_t[i] + (2 * Math.random() - 1) / 100;
      var i_win = '';
      while (i_win == '')
        for (var i in tleg_t)
          if (Math.random() < 0.001)
            i_win = i;
      tleg_t[i_win] = 0;
      smode = 2;
      continue;
    } else if (smode == 2) {
      tlevx = levx * (1 + (2 * Math.random() - 1) / 10);
      for (var i in tleg_t)
        tleg_t[i] = leg_t[i] + (2 * Math.random() - 1) / 100;
      smode = 3;
      continue;
    } else if (smode == 3) {
      // tlevx = levx * (1 + (2 * Math.random() - 1) / 100);
      // for (var i in tleg_t)
        // tleg_t[i] = leg_t[i] * (1 + (2 * Math.random() - 1) / 100);
      mod_leg = '';
      while (mod_leg == '')
        for (var i in tleg_t)
          if (Math.random() < 0.001)
            mod_leg = i;
      new_mod_leg = (mod_leg * (1 + (2 * Math.random() - 1) / mod_leg_c))
        .toExponential(4);
      tleg_t[new_mod_leg] = tleg_t[mod_leg];
      dir_t[new_mod_leg] = 0;
      maxb_t[new_mod_leg] = 0;
      maxa_t[new_mod_leg] = 0;
      price_t[new_mod_leg] = 0;
      prof_t[new_mod_leg] = 0;
      prof_c[new_mod_leg] = 0;
      tleg_t[mod_leg] = 0;
      mod_leg_c++;
      smode = 0;
    }
  }
}
var mod_leg = '';
var new_mod_leg = '';
var mod_leg_c = 2;

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
  fs.writeFileSync('div_n3',div_n3.toExponential(19) + '\n');
  fs.writeFileSync('num_facets',num_facets + '\n');
  fs.writeFileSync('levx',levx.toExponential(9) + '\n');
  candle_count = 0;
}

async function doAves(n0,n1,n2,n3) {
  amidp8 *= 1 - 1 / n0;
  amidp8 += dmidp / n0;
  amidp16 *= 1 - 1 / n1;
  amidp16 += dmidp / n1;
  amidp32 *= 1 - 1 / n2;
  amidp32 += dmidp / n2;
  amidp64 *= 1 - 1 / n3;
  amidp64 += dmidp / n3;

  amidps8 *= 1 - 1 / n0;
  amidps8 += dmidps / n0;
  amidps16 *= 1 - 1 / n1;
  amidps16 += dmidps / n1;
  amidps32 *= 1 - 1 / n2;
  amidps32 += dmidps / n2;
  amidps64 *= 1 - 1 / n3;
  amidps64 += dmidps / n3;

  aamidp16 *= 1 - 1 / n1;
  aamidp16 += Math.abs(amidp8 - amidp16) / n1;
  aamidp32 *= 1 - 1 / n2;
  aamidp32 += Math.abs(amidp16 - amidp32) / n2;
  aamidp64 *= 1 - 1 / n3;
  aamidp64 += Math.abs(amidp32 - amidp64) / n3;

  aamidps16 *= 1 - 1 / n1;
  aamidps16 += Math.abs(amidps8 - amidps16) / n1;
  aamidps32 *= 1 - 1 / n2;
  aamidps32 += Math.abs(amidps16 - amidps32) / n2;
  aamidps64 *= 1 - 1 / n3;
  aamidps64 += Math.abs(amidps32 - amidps64) / n3;
}

var cutx = Number(fs.readFileSync('cutx','utf8'));
var tcutx = cutx;
var div_n0 = Number(fs.readFileSync('div_n0','utf8'));
var tdiv_n0 = div_n0;
var div_n1 = Number(fs.readFileSync('div_n1','utf8'));
var tdiv_n1 = div_n1;
var div_n2 = Number(fs.readFileSync('div_n2','utf8'));
var tdiv_n2 = div_n2;
var div_n3 = Number(fs.readFileSync('div_n3','utf8'));
var tdiv_n3 = div_n3;
var tprof_div = 1;
const tsum = [];
const tsumc = [];
const band = 15;
var odi = -1;
var odi1 = -1;
var odi2 = -1;
const dilst = [];
var opt_a = 1;
var opt_b = 1;
var test_a = opt_a;
var test_b = 1;
var dir = 0;
var leg = 5.309e+1; // Number(fs.readFileSync('leg','utf8'));
var tleg = leg;

var obase_pos = 0;
var base_price = 0;
var base_profit = 0;
var base_count = 0;
var midp = 0;
async function doTickLine(line) {
  var lst = line.split(' ');
  if (lst.length < 3) return;
  current_bid = Number(lst[1]);
  // current_ask = Number(lst[2]);
  current_ask = current_bid + aspread;
  midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) omidp = midp;
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  tick_count++;
  omidp = midp;

  /*
  var di = Math.floor((amidp32 - amidp64) / aamidp64 * 3);
  if (di > 10) di = 10;
  if (di < -10) di = -10;
  di += 10;
  if (smode == 0) {
    tsum[di] += dmidp;
    if (di != odi) tsumc[di]++;
    odi = di;
  } else {
    if (tsum[di]/tsumc[di] > aspread) {
      if (back_pos == 2) {
        back_profit += back_price - current_ask;
        back_count++;
      }
      back_pos = 1;
      back_price = current_ask;
    }
    if (tsum[di]/tsumc[di] < -aspread) {
      if (back_pos == 1) {
        back_profit += current_bid - back_price;
        back_count++;
      }
      back_pos = 2;
      back_price = current_bid;
    }
  }
  if (tick_count > tdiv_n3) await doAves(tdiv_n0,tdiv_n1,tdiv_n2,tdiv_n3);
  else if (tick_count > tdiv_n2) await doAves(tdiv_n0,tdiv_n1,tdiv_n2,tick_count);
  else if (tick_count > tdiv_n1) await doAves(tdiv_n0,tdiv_n1,tick_count,tick_count);
  else if (tick_count > tdiv_n0) await doAves(tdiv_n0,tick_count,tick_count,tick_count);
  else await doAves(tick_count,tick_count,tick_count,tick_count);
  return;

  tick_v[0] = 1;
  tick_v[1] = (amidp8 - amidp16) / aamidp16;
  tick_v[2] = (amidp16 - amidp32) / aamidp32;
  tick_v[3] = (amidp32 - amidp64) / aamidp64;

  tick_v[4] = (amidps8 - amidps16) / aamidps16;
  tick_v[5] = (amidps16 - amidps32) / aamidps32;
  tick_v[6] = (amidps32 - amidps64) / aamidps64;

  for (var i = 0; i < v_len; i++) otick_nv[i] = tick_nv[i];
  var vs = 0;
  for (var i = 0; i < v_len; i++) vs += tick_v[i] * tick_v[i];
  vs = Math.sqrt(vs);
  if (vs > 0) for (var i = 0; i < v_len; i++) tick_nv[i] = tick_v[i] / vs;
  */

  /*
  if (dir == 0) {
    if (current_bid > maxb) {
      maxb = current_bid;
      if (maxb - maxa > tleg * aspread) dir = 1;
    }
    if (current_ask < maxa) {
      maxa = current_ask;
      if (maxb - maxa > tleg * aspread) dir = 2;
    }
  } else if (dir == 1) {
    if (current_bid > maxb) maxb = current_bid;
    if (current_ask < maxb - tleg * aspread) {
      maxa = current_ask;
      dir = 2;
      back_pos = 2;
      if (back_price > 0) {
        back_profit += current_bid - back_price;
        back_count++;
      }
      back_price = current_bid;
    }
  } else if (dir == 2) {
    if (current_ask < maxa) maxa = current_ask;
    if (current_bid > maxa + tleg * aspread) {
      maxb = current_bid;
      dir = 1;
      back_pos = 1;
      if (back_price > 0) {
        back_profit += back_price - current_ask;
        back_count++;
      }
      back_price = current_ask;
    }
  }
  */

  var base_pos = 0;
  for (var i in tleg_t) {
    await doDir(i);
    base_pos += dir_t[i] * tleg_t[i];
  }
  if (obase_pos >= 0) {
    var tbalance = balance + base_size * (current_bid - base_price);
    if (tbalance < 0) { balance = 0; base_size = 0; }
    if (base_pos < 0) {
      if (base_price > 0) {
        base_profit += current_bid - base_price;
        abase_profit += Math.abs(current_bid - base_price);
        balance += base_size * (current_bid - base_price);
        if (balance < 0) balance = 0;
        base_count++;
        /*
        fs.appendFileSync('ppro',tick_count
          + ' ' + base_profit
          + ' ' + balance
          + ' ' + midp
          + '\n');
          */
      }
      base_price = current_bid;
      base_size = balance * tlevx;
    }
  }
  if (obase_pos <= 0) {
    var tbalance = balance + base_size * (base_price - current_ask);
    if (tbalance < 0) { balance = 0; base_size = 0; }
    if (base_pos > 0) {
      if (base_price > 0) {
        base_profit += base_price - current_ask;
        abase_profit += Math.abs(base_price - current_ask);
        balance += base_size * (base_price - current_ask);
        if (balance < 0) balance = 0;
        base_count++;
        /*
        fs.appendFileSync('ppro',tick_count
          + ' ' + base_profit
          + ' ' + balance
          + ' ' + midp
          + '\n');
          */
      }
      base_price = current_ask;
      base_size = balance * tlevx;
    }
  }
  obase_pos = base_pos;
  return;
}

async function doDir(tag) {
  const nleg = Number(tag);
  if (maxb_t[tag] == 0) {
    maxb_t[tag] = current_bid;
    maxa_t[tag] = current_ask;
    maxb_n[tag] = tick_count;
    maxa_n[tag] = tick_count;
  }
  if (dir_t[tag] == 0) {
    if (current_bid > maxb_t[tag]) {
      maxb_t[tag] = current_bid;
      maxb_n[tag] = tick_count;
      if (maxb_t[tag] - maxa_t[tag] > nleg) {
        price_t[tag] = midp;
        dir_t[tag] = 1;
        // fs.appendFileSync('slice' + leg_id[tag],
          // maxa_n[tag] + ' ' + maxa_t[tag] + '\n');
      }
    }
    if (current_ask < maxa_t[tag]) {
      maxa_t[tag] = current_ask;
      maxa_n[tag] = tick_count;
      if (maxb_t[tag] - maxa_t[tag] > nleg) {
        price_t[tag] = midp;
        dir_t[tag] = -1;
        // fs.appendFileSync('slice' + leg_id[tag],
          // maxb_n[tag] + ' ' + maxb_t[tag] + '\n');
      }
    }
  } else if (dir_t[tag] == 1) {
    if (current_bid > maxb_t[tag]) {
      maxb_t[tag] = current_bid;
      maxb_n[tag] = tick_count;
    }
    if (current_ask < maxb_t[tag] - nleg) {
      prof_t[tag] += midp - price_t[tag];
      prof_c[tag]++;
      price_t[tag] = midp;
      maxa_t[tag] = current_ask;
      dir_t[tag] = -1;
      // fs.appendFileSync('slice' + leg_id[tag],
        // maxb_n[tag] + ' ' + maxb_t[tag] + '\n');
    }
  } else if (dir_t[tag] == -1) {
    if (current_ask < maxa_t[tag]) {
      maxa_t[tag] = current_ask;
      maxa_n[tag] = tick_count;
    }
    if (current_bid > maxa_t[tag] + nleg) {
      prof_t[tag] += price_t[tag] - midp;
      prof_c[tag]++;
      price_t[tag] = midp;
      maxb_t[tag] = current_bid;
      dir_t[tag] = 1;
      // fs.appendFileSync('slice' + leg_id[tag],
        // maxa_n[tag] + ' ' + maxa_t[tag] + '\n');
    }
  }
}

var reg_div = 1000;
var treg_div = reg_div;
async function doRegisterHigh() {
  var dot_max = -2;
  var i_max = -1;
  var tdot = 0;
  for (var i = 0; i < num_facets; i++) {
    tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += maxb_nv[ii] * high_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      i_max = i;
    }
  }
  var ts = 0;
  for (var ii = 0; ii < v_len; ii++) {
    high_nv[i_max][ii] += maxb_nv[ii] / treg_div;
    ts += high_nv[i_max][ii] * high_nv[i_max][ii];
  }
  ts = Math.sqrt(ts);
  if (ts > 0) for (var ii = 0; ii < v_len; ii++) high_nv[i_max][ii] /= ts;
}

async function doRegisterNHigh() {
  var dot_max = -2;
  var i_max = -1;
  var tdot = 0;
  for (var i = 0; i < num_facets; i++) {
    tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += maxb_nv[ii] * nhigh_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      i_max = i;
    }
  }
  var ts = 0;
  for (var ii = 0; ii < v_len; ii++) {
    nhigh_nv[i_max][ii] += maxb_nv[ii] / treg_div;
    ts += nhigh_nv[i_max][ii] * nhigh_nv[i_max][ii];
  }
  ts = Math.sqrt(ts);
  if (ts > 0) for (var ii = 0; ii < v_len; ii++) nhigh_nv[i_max][ii] /= ts;
}

async function doRegisterLow() {
  var dot_max = -2;
  var i_max = -1;
  var tdot = 0;
  for (var i = 0; i < num_facets; i++) {
    tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += maxa_nv[ii] * low_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      i_max = i;
    }
  }
  var ts = 0;
  for (var ii = 0; ii < v_len; ii++) {
    low_nv[i_max][ii] += maxa_nv[ii] / treg_div;
    ts += low_nv[i_max][ii] * low_nv[i_max][ii];
  }
  ts = Math.sqrt(ts);
  if (ts > 0) for (var ii = 0; ii < v_len; ii++) low_nv[i_max][ii] /= ts;
}

async function doRegisterNLow() {
  var dot_max = -2;
  var i_max = -1;
  var tdot = 0;
  for (var i = 0; i < num_facets; i++) {
    tdot = 0;
    for (var ii = 0; ii < v_len; ii++) tdot += maxa_nv[ii] * nlow_nv[i][ii];
    if (tdot > dot_max) {
      dot_max = tdot;
      i_max = i;
    }
  }
  var ts = 0;
  for (var ii = 0; ii < v_len; ii++) {
    nlow_nv[i_max][ii] += maxa_nv[ii] / treg_div;
    ts += nlow_nv[i_max][ii] * nlow_nv[i_max][ii];
  }
  ts = Math.sqrt(ts);
  if (ts > 0) for (var ii = 0; ii < v_len; ii++) nlow_nv[i_max][ii] /= ts;
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
try { fs.renameSync('dist','dist0');
} catch {}
try { fs.renameSync('ppro','ppro0');
} catch {}
doMain();

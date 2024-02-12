const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');

const num_strats = 5;
const num_final = 9;

var omidp = 0;
const spw = 60 * 60 * 24 * 7;


const aspread = Number(fs.readFileSync('aspread','utf8'));
console.log('doMain ' + new Date());
var back_profit = 0;
var back_count = 0;
var aback_profit = 0;
var back_profit_max = 0;
var max_dd = 0;
var max_dd_count = 0;
var back_sellp = 0;
var back_buyp = 0;
var back_nav = 1;
var back_nav0 = 0;
var levx = Number(fs.readFileSync('levx','utf8'));
const levx_t = [];
const tlst = fs.readFileSync('levx_t','utf8').split('\n');
for (var i in tlst) levx_t[i] = Number(tlst[i]);
for (var i = levx_t.length; i < num_final; i++) levx_t[i] = 0;
for (var i = 0; i < num_final; i++) if (levx_t[i] == 0) levx_t[i] = 10;
console.log(levx_t);
var tlevx = levx_t[0];
var max_nav = 0;
var max_nav_count = 0;

var nh0,nm0,ns0;
var oh0 = 0,om0 = 0,os0 = 0;
var current_ask = 0;
var current_bid = 0;
var smode = 0;
var rmode = 0;
var delay_n = 0;
var dmidp = 0,dmidps = 0;
var good_tick_count = 0;
var good_tick_count_max = Number(fs.readFileSync('good_tick_count_max','utf8'));
var tick_count = 0;
var tick_count_max = Number(fs.readFileSync('tick_count_max','utf8'));
var trade_count = 0;
var poscs = 0;
var max_tps = 0;
var xmax = 0;
const maxa_t = {};
const maxb_t = {};
const maxa_n = {};
const maxb_n = {};
const dir_t = {};
const dir_t_save = {};
const maxb_t_save = {};
const maxa_t_save = {};
const price_t = {};
const prof_t = {};
const prof_l = [];
const f_prof_l2 = [];
const f_prof_c2 = [];
try {
  const d = fs.readFileSync('f_prof_l2','utf8');
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    f_prof_l2.push(Number(ii[0]) * Number(ii[1]));
    f_prof_c2.push(Number(ii[1]));
  }
} catch {}
const f_prof_l = [];
const f_prof_c = [];
try {
  const d = fs.readFileSync('f_prof_l','utf8');
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    f_prof_l.push(Number(ii[0]) * Number(ii[1]));
    f_prof_c.push(Number(ii[1]));
  }
} catch {}
var prof_s = 0;
var prof_s_max = 0;
var prof_c = 0;
const leg_id = [];
try {
  const d = fs.readFileSync('rdist2_leg_t_' + num_strats,'utf8');
  var iii = 0;
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    leg_id[iii] = ii[0];
    iii++;
  }
} catch {
  for (var i = 0; i < num_strats; i++) {
    var t = (1e-4 * 60 * (i + 1)).toFixed(5);
    leg_id[i] = t;
  }
}
var tleg_id = [];
var max_base = 0;
var max_bal = 0;
var tick_cut = Math.random() * good_tick_count_max / 100;
tick_cut = 0;
const profit_c = [];
const profit_t = [];
for (var i = 0; i < num_final; i++) {
  profit_t[i] = 0;
  profit_c[i] = 0;
}
const final_leg_t = [];
async function getLegId() {
  try {
    var tc = 0;
    const d = fs.readFileSync('final_leg_t','utf8');
    for (var i of d.split('\n')) {
      var ii = i.split(' ');
      if (ii.length < 2) continue;
      profit_c[tc] = Number(ii[0]);
      profit_t[tc] = Number(ii[1]);
      final_leg_t[tc] = ii.slice(2, 2 + num_strats);
      tc++;
    }
  } catch {}
  tleg_id = final_leg_t[0];
  for (var t of tleg_id) {
    dir_t[t] = 0;
    maxb_t[t] = 0;
    maxa_t[t] = 0;
  }
}

var starting_month = '';
var profit_x1 = 0;
var break_rank = 0;
async function doMain() {
  await getLegId();
  var back_profit0 = 0; // Number(fs.readFileSync('back_profit0','utf8'));
  var back_profit1 = 0; // Number(fs.readFileSync('back_profit1','utf8'));
  var bp0 = 0; // Number(fs.readFileSync('bp0','utf8'));
  var bp1 = 0; // Number(fs.readFileSync('bp1','utf8'));
  // var bp0 = 0, bp1 = 0, bp2 = 0;
  while (true) {
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
    max_nav_count = 0;
    max_dd = 0;
    max_dd_count = 0;
    d_n = 1e7;
    back_pos = 0;
    back_price = 0;

    dmidp = 0;
    dmidps = 0;
    good_tick_count = 0;
    tick_count = 0;
    trade_count = 0;

    base_price = 0;
    base_profit = 0;
    base_profit2 = 0;
    base_pos = 0;
    abase_profit = 0;
    base_size = 0;
    base_count = 0;
    balance = 1;
    odir_key = '';
    starting_month = '';

    const tick_file = await fsPromises.open('../data/ticks-hist');
    for await (const line of tick_file.readLines())
      await doTickLine(line);

    for (var i in dir_t_save) {
      delete dir_t_save[i];
      delete maxa_t_save[i];
      delete maxb_t_save[i];
    }
    for (var i of tleg_id) {
      dir_t_save[i] = dir_t[i];
      maxa_t_save[i] = maxa_t[i];
      maxb_t_save[i] = maxb_t[i];
    }
    const tick_file2 = await fsPromises.open('../ticks');
    for await (const line of tick_file2.readLines())
      await doTickLine(line);

    console.log('prof_s',prof_s.toExponential(5),'tc',tick_cut.toFixed());
    if (prof_s > prof_s_max) {
      prof_s_max = prof_s;
    }
    /*
    for (var i in prof_l) {
      if (typeof f_prof_l[i] == 'undefined') {
        f_prof_l[i] = 0;
        f_prof_c[i] = 0;
      }
      f_prof_l[i] += prof_l[i];
      f_prof_c[i]++;
      if (typeof f_prof_l2[i] == 'undefined') {
        f_prof_l2[i] = 0;
        f_prof_c2[i] = 0;
      }
      f_prof_l2[i] += prof_l[prof_l.length - 1 - i];
      f_prof_c2[i]++;
    }
    var fstr = '';
    for (var i in f_prof_l)
      fstr += (f_prof_l[i]/f_prof_c[i]).toExponential(9)
        + ' ' + f_prof_c[i] + '\n';
    fs.writeFileSync('f_prof_l',fstr);
    fstr = '';
    var txp = 0, txc = 0;
    for (var i in f_prof_l2) {
      txp += f_prof_l2[i];
      txc += f_prof_c2[i];
      fstr += (f_prof_l2[i]/f_prof_c2[i]).toExponential(9)
        + ' ' + f_prof_c2[i]
        + ' ' + (txp / txc).toExponential(9)
        + '\n';
    }
    fs.writeFileSync('f_prof_l2',fstr);
    */

    for (var i in prof_t) {
      delete prof_t[i];
    }
    for (var i in dir_t) {
      delete dir_t[i];
      delete maxb_t[i];
      delete maxa_t[i];
    }
    await getLegId();
    prof_l.length = 0;
    prof_s = 0;
    prof_c = 0;
    if (good_tick_count > good_tick_count_max) {
      good_tick_count_max = good_tick_count;
      fs.writeFileSync('good_tick_count_max',good_tick_count_max + '\n');
    }
    // tick_cut = Math.random() * good_tick_count_max / 100;
    tick_cut += 100_000;
  }
}
var mod_leg = '';
var new_mod_leg = '';
var mod_leg_c = 5;
var elapsed_days = 0;

var yo0 = 0;
var mo0 = 0;
var do0 = 0;
var ho0 = 0;
var mi0 = 0;
var si0 = 0;
async function setStartDate(t) {
  yo0 = Number(t.slice(0,4));
  mo0 = Number(t.slice(4,6));
  do0 = Number(t.slice(6,8));
  ho0 = Number(t.slice(8,10));
  mi0 = Number(t.slice(10,12));
  si0 = Number(t.slice(12));
}

async function elapseDays(t) {
  const yo1 = Number(t.slice(0,4));
  const mo1 = Number(t.slice(4,6));
  const do1 = Number(t.slice(6,8));
  const ho1 = Number(t.slice(8,10));
  const mi1 = Number(t.slice(10,12));
  const si1 = Number(t.slice(12));
  elapsed_days = (yo1 - yo0) * 365
    + (mo1 - mo0) * 365 / 12
    + (do1 - do0)
    + (ho1 - ho0) / 24;
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
var base_profit2 = 0;
var base_pos = 0;
var base_count = 0;
var midp = 0;
var odir_key = '';
var last_time = '';
async function doTickLine(line) {
  var lst = line.split(' ');
  if (lst.length < 3) return;
  current_bid = Number(lst[1]);
  // current_ask = Number(lst[2]);
  current_ask = Number((current_bid + aspread).toFixed(5));
  midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) omidp = midp;
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  tick_count++;
  omidp = midp;

  var dir_key = '';
  var init_flag = 0;
  for (var i = 0; i < num_strats; i++) {
    const t = tleg_id[i];
    await doDir(t);
    if (dir_t[t] == 1) dir_key += '1';
    else if (dir_t[t] == -1) dir_key += '2';
    else { dir_key += '0'; init_flag = 1; }
  }
  if (init_flag == 1) return;
  good_tick_count++;
  if (starting_month == '') {
    starting_month = lst[0];
    await setStartDate(lst[0]);
  }
  await elapseDays(lst[0]);

  if (good_tick_count > tick_cut) {
    if (dir_key != odir_key) {
      if (prof_t[dir_key] > 0) {
        if (base_pos < 0) {
          // prof_l[prof_c] = -prof_s;
          prof_c++;
          // prof_s = 0;
          prof_s -= aspread;
        }
        base_pos = 1;
      }
      if (prof_t[dir_key] < 0) {
        if (base_pos > 0) {
          // prof_l[prof_c] = prof_s;
          prof_c++;
          // prof_s = 0;
          prof_s -= aspread;
        }
        base_pos = -1;
      }
    }
    prof_s += base_pos * dmidp;
  }
  if (typeof prof_t[dir_key] == 'undefined')
    prof_t[dir_key] = 0;
  odir_key = dir_key;
  prof_t[dir_key] += dmidp;
}

async function doDir(tag) {
  const nleg = Number(tag);
  if (maxb_t[tag] == 0) {
    maxb_t[tag] = current_bid;
    maxa_t[tag] = current_ask;
  }
  if (dir_t[tag] == 0) {
    if (current_bid > maxb_t[tag]) {
      maxb_t[tag] = current_bid;
      if (maxb_t[tag] - maxa_t[tag] > nleg) dir_t[tag] = 1;
    }
    if (current_ask < maxa_t[tag]) {
      maxa_t[tag] = current_ask;
      if (maxb_t[tag] - maxa_t[tag] > nleg) dir_t[tag] = -1;
    }
  } else if (dir_t[tag] == 1) {
    if (current_bid > maxb_t[tag]) maxb_t[tag] = current_bid;
    if (current_ask < maxb_t[tag] - nleg) {
      maxa_t[tag] = current_ask;
      dir_t[tag] = -1;
    }
  } else if (dir_t[tag] == -1) {
    if (current_ask < maxa_t[tag]) maxa_t[tag] = current_ask;
    if (current_bid > maxa_t[tag] + nleg) {
      maxb_t[tag] = current_bid;
      dir_t[tag] = 1;
    }
  }
}

var d_n = 1e7;
var back_pos = 0;
var back_price = 0;
var back_bid = 0;
var back_ask = 0;
var back_mid = 0;

try { fs.renameSync('err_profile','err_profile0');
} catch {}
try { fs.renameSync('profit_profile','profit_profile0');
} catch {}
try { fs.renameSync('dist','dist0');
} catch {}
try { fs.renameSync('ppro','ppro0');
} catch {}
doMain();

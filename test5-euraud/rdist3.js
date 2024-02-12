const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');

const num_strats = 5;
const num_final = 9;
var max_days = Number(fs.readFileSync('max_days','utf8'));
// var num_back = Math.floor(max_days/7) - 1; // 70;
var num_back = Math.floor(max_days/7/2);

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
var tick_count = 0;
var tick_count_max = Number(fs.readFileSync('tick_count_max','utf8'));
var trade_count = 0;
var poscs = 0;
var max_tps = 0;
var xmax = 0;
const dir_t_save = {};
const maxb_t_save = {};
const maxa_t_save = {};
const price_t = {};
const oprof_t = [];
const prof_t = [];
const prof_c = [];
const prof_t2 = [];
const prof_c2 = [];
const ps_max = [];
const ps_max_base = [];
const ps_max_c = [];
const dir_t = [];
const maxa_t = [];
const maxb_t = [];
for (var i = 0; i < 100; i++) {
  oprof_t[i] = 0;
  prof_t[i] = {};
  prof_c[i] = 0;
  prof_t2[i] = {};
  prof_c2[i] = 0;
  ps_max[i] = 0;
  ps_max_base[i] = 0;
  ps_max_c[i] = 0;
  dir_t[i] = {};
  maxb_t[i] = {};
  maxa_t[i] = {};
}
const leg_id = [];
const tleg_id = [];
try {
  const d = fs.readFileSync('final_leg_t','utf8');
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    for (var iii = 0; iii < 100; iii++) {
      leg_id[iii] = [];
      for (var iiii = 0; iiii < num_strats; iiii++)
        leg_id[iii][iiii] = ii[iiii + 2];
    }
    for (var iii = 0; iii < 100; iii++) {
      tleg_id[iii] = [];
      for (var iiii = 0; iiii < num_strats; iiii++)
        tleg_id[iii][iiii] = ii[iiii + 2];
    }
    break;
  }
} catch {
  for (var ii = 0; ii < 100; ii++)
  for (var i = 0; i < num_strats; i++)
    leg_id[ii][i] = 0;
}
var max_base = 0;
var max_bal = 0;
var tick_cut = Math.random() * tick_count_max / 3;
tick_cut = 0;
const profit_c = [];
const profit_t = [];
for (var i = 0; i < num_final; i++) {
  profit_t[i] = 0;
  profit_c[i] = 0;
}

var starting_month = '';
var profit_x1 = 0;
var spread_amp = 0;
var init_sa = 0;
async function doMain() {
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
    yo0 = 0;

    const tick_file = await fsPromises.open('../data/ticks-hist');
    for await (const line of tick_file.readLines())
      await doTickLine(line);
    const tick_file2 = await fsPromises.open('../ticks');
    for await (const line of tick_file2.readLines())
      await doTickLine(line);

    if (elapsed_days > max_days) {
      max_days = elapsed_days;
      // console.log('max_days ' + max_days.toFixed() + ' ' + Math.floor(max_days/7));
      fs.writeFileSync('max_days',max_days.toExponential(9) + '\n');
    }
    if (smode == 0) {
      smode = 1;
      // console.log('smode 1');
      for (var i = 0; i < 100; i++) {
        oprof_t[i] = 0;
        for (var ii in dir_t[i]) delete dir_t[i][ii];
        for (var ii in maxb_t[i]) delete maxb_t[i][ii];
        for (var ii in maxa_t[i]) delete maxa_t[i][ii];
      }
      continue;
    }
    smode = 0;

    var tot_ps = 0;
    var tot_psc = 0;
    var tot_ps2 = 0;
    var tot_c = 0;
    var tot_base = 0;
    for (var i = 0; i < 100; i++) {
      var ps_base = 0;
      for (var ii in prof_t[i]) ps_base += Math.abs(prof_t[i][ii]);
      var ps = ps_base;
      ps -= prof_c[i] * aspread;
      ps /= num_back;
      if (ps > ps_max[i]) {
        ps_max[i] = ps;
        ps_max_base[i] = ps_base;
        ps_max_c[i] = prof_c[i];
        for (var ii = 0; ii < num_strats; ii++)
          leg_id[i][ii] = tleg_id[i][ii];
        fs.writeFileSync('rdist3_leg_id',leg_id);
        console.log('ps_max hit');
      }
      var ps2 = 0;
      for (var ii in prof_t2[i]) {
        if (prof_t[i][ii] > 0) ps2 += prof_t2[i][ii];
        else if (prof_t[i][ii] < 0) ps2 -= prof_t2[i][ii];
        // else console.log('wtf',i,ii);
      }
      ps2 -= prof_c2[i] * aspread;
      if (ps2 != 0) {
        tot_base += ps_base;
        tot_ps += ps;
        tot_psc += prof_c[i];
        tot_ps2 += ps2;
        tot_c++;
      }
      /*
      if (ps != 0) {
        var tstr = '' + i;
        while (tstr.length < 3) tstr += ' ';
        if (ps > 0) tstr += ' ';
        tstr += ' ' + ps.toExponential(4)
        if (ps2 > 0) tstr += ' ';
        tstr += ' ' + ps2.toExponential(4)
        console.log(i,tstr,
          ' -- ',prof_c[i],prof_c2[i],
          '  ',tleg_id[i].join(' ')
        );
      } */
      oprof_t[i] = 0;
      prof_c[i] = 0;
      prof_c2[i] = 0;
      for (var ii in prof_t[i]) delete prof_t[i][ii];
      for (var ii in prof_t2[i]) delete prof_t2[i][ii];
      for (var ii in dir_t[i]) delete dir_t[i][ii];
      for (var ii in maxb_t[i]) delete maxb_t[i][ii];
      for (var ii in maxa_t[i]) delete maxa_t[i][ii];
    }
    const abase = tot_base / num_back / tot_c;
    const aps2 = tot_ps2 / tot_c;
    const ac = tot_psc / num_back / tot_c;
    const x = (abase - aps2) / ac / aspread;
    if (init_sa == 0) {
      init_sa = 1;
      spread_amp = x;
      fs.writeFileSync('spread_amp',x);
    }
    var tstr = ' ' + tot_c;
    while (tstr.length < 5) tstr += ' ';
    tstr += ' ' + num_back;
    while (tstr.length < 10) tstr += ' ';
    if (tot_ps >= 0) tstr += ' ';
    tstr += ' ' + (tot_ps/tot_c).toExponential(4);
    if (tot_ps2 >= 0) tstr += ' ';
    tstr += ' ' + (tot_ps2/tot_c).toExponential(4);
    if (x >= 0) tstr += ' ';
    tstr += ' ' + x.toExponential(4);
    tstr += ' ac ' + ac.toExponential(4);
    console.log(tstr);
    num_back--;
    continue;

    if (rmode == 0) {
      for (var i = 0; i < 100; i++)
        for (var ii = 0; ii < num_strats; ii++)
          tleg_id[i][ii] = (Number(leg_id[i][ii])
            * (1 + (2 * Math.random() - 1) / 10)).toFixed(5);
      rmode = 1;
      continue;
    } else {
      for (var i = 0; i < 100; i++)
        for (var ii = 0; ii < num_strats; ii++)
          leg_id[i][ii] = tleg_id[i][ii];
      rmode = 0;
      continue;
    }
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

var old_time_mark = 0;
async function elapseDays(t) {
  if (t.indexOf(':') >= 0) {
    if (old_time_mark != '') {
      var ho3 = Number(t.slice(0,2));
      var ho2 = Number(old_time_mark.slice(0,2));
      while (ho3 < ho2) ho3 += 24
      elapsed_days += (ho3 - ho2) / 24;
    }
    old_time_mark = t;
    return;
  }
  if (t.indexOf('-') >= 0) return;
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
    if (elapsed_days !== elapsed_days) {
      console.log('got wtf');
      console.log(t,yo1,mo1,do1,ho1);
      console.log(yo0,mo0,do0,ho0);
      process.exit();
    }
}

async function doDump() {
  fs.writeFileSync('cutx',cutx.toExponential(19) + '\n');
  fs.writeFileSync('div_n0',div_n0.toExponential(19) + '\n');
  fs.writeFileSync('div_n1',div_n1.toExponential(19) + '\n');
  fs.writeFileSync('div_n2',div_n2.toExponential(19) + '\n');
  fs.writeFileSync('div_n3',div_n3.toExponential(19) + '\n');
  fs.writeFileSync('levx',levx.toExponential(9) + '\n');
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
var opart_i = 0;
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
  if (yo0 == 0) await setStartDate(lst[0]);
  await elapseDays(lst[0]);

  const part_i = Math.floor(elapsed_days/7);
  if (part_i >= Math.floor(max_days/7)) return;
  /*
  if (part_i != opart_i) {
    opart_i = part_i;
    console.log('part_i',part_i);
    for (var i = 0; i < part_i; i++)
      for (var ii in prof_t[i])
        console.log(i,ii,prof_t[i][ii]);
  }
  */
  for (var part_ii = 0; part_ii < num_back; part_ii++) {
    const part_iii = part_i - part_ii;
    if (part_iii + num_back > Math.floor(max_days/7)) continue;
    if (part_iii < 0) break;

    var dir_key = '';
    var init_flag = 0;
    for (var i = 0; i < num_strats; i++) {
      const t = tleg_id[part_iii][i];
      await doDir(part_iii,t);
      if (dir_t[part_iii][t] == 1) dir_key += '1';
      else if (dir_t[part_iii][t] == -1) dir_key += '2';
      else { dir_key += '0'; init_flag = 1; }
    }
    if (init_flag == 1) continue;
    if (smode == 0) {
      if (typeof prof_t[part_iii][dir_key] == 'undefined')
        prof_t[part_iii][dir_key] = 0;
      prof_t[part_iii][dir_key] += dmidp;
    } else {
      if (oprof_t[part_iii] * prof_t[part_iii][dir_key] < 0)
        prof_c[part_iii]++;
      if (typeof prof_t[part_iii][dir_key] == 'undefined')
        console.log('wtf #0',dir_key);
      else oprof_t[part_iii] = prof_t[part_iii][dir_key];
    }
  }
  if (smode == 0) {
  } else {
    const part_iii = part_i - num_back;
    if (part_iii >= 0) {
      var dir_key = '';
      var init_flag = 0;
      for (var i = 0; i < num_strats; i++) {
        const t = tleg_id[part_iii][i];
        await doDir(part_iii,t);
        if (dir_t[part_iii][t] == 1) dir_key += '1';
        else if (dir_t[part_iii][t] == -1) dir_key += '2';
        else { dir_key += '0'; init_flag = 1; }
      }
      if (init_flag == 1) return;
      if (typeof prof_t2[part_iii][dir_key] == 'undefined')
        prof_t2[part_iii][dir_key] = 0;
      prof_t2[part_iii][dir_key] += dmidp;
      if (oprof_t[part_iii] * prof_t[part_iii][dir_key] < 0)
        prof_c2[part_iii]++;
      if (typeof prof_t[part_iii][dir_key] == 'undefined') {}
      else oprof_t[part_iii] = prof_t[part_iii][dir_key];
    }
  }
}

async function doDir(i,tag) {
  const nleg = Number(tag);
  if (typeof maxb_t[i][tag] == 'undefined') {
    maxb_t[i][tag] = current_bid;
    maxa_t[i][tag] = current_ask;
  }
  if (dir_t[i][tag] == 1) {
    if (current_bid > maxb_t[i][tag]) maxb_t[i][tag] = current_bid;
    if (current_ask < maxb_t[i][tag] - nleg) {
      maxa_t[i][tag] = current_ask;
      dir_t[i][tag] = -1;
    }
  } else if (dir_t[i][tag] == -1) {
    if (current_ask < maxa_t[i][tag]) maxa_t[i][tag] = current_ask;
    if (current_bid > maxa_t[i][tag] + nleg) {
      maxb_t[i][tag] = current_bid;
      dir_t[i][tag] = 1;
    }
  } else {
    dir_t[i][tag] = 0;
    if (current_bid > maxb_t[i][tag]) {
      maxb_t[i][tag] = current_bid;
      if (maxb_t[i][tag] - maxa_t[i][tag] > nleg) dir_t[i][tag] = 1;
    }
    if (current_ask < maxa_t[i][tag]) {
      maxa_t[i][tag] = current_ask;
      if (maxb_t[i][tag] - maxa_t[i][tag] > nleg) dir_t[i][tag] = -1;
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

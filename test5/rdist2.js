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
// var tick_count_max = Number(fs.readFileSync('tick_count_max','utf8'));
const tick_count_max = [];
try {
  const d = fs.readFileSync('tick_count_max','utf8');
  for (var i of d.split('\n')) tick_count_max.push(Number(i));
} catch {}
for (var i = tick_count_max.length; i < num_final; i++) tick_count_max[i] = 0;
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
// var tick_cut = Math.random() * tick_count_max[0] / 4;
var tick_cut = Math.random() * tick_count_max[0] / 4
      + tick_count_max[0] / 3;
// var tick_cut = 0;
const profit_c = [];
const profit_t = [];
for (var i = 0; i < num_final; i++) {
  profit_t[i] = 0;
  profit_c[i] = 0;
}
const final_leg_t = [];
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

console.log(final_leg_t);
var starting_month = '';
var profit_x1 = 0;
var break_rank = 0;
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

    const tick_file = await fsPromises.open('../data/ticks-hist');
    for await (const line of tick_file.readLines())
      await doTickLine(line);
    const tick_file2 = await fsPromises.open('../ticks');
    for await (const line of tick_file2.readLines())
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
    const tick_file3 = await fsPromises.open('../ticks-2024');
    for await (const line of tick_file3.readLines())
      await doTickLine(line);

      /*
    if (smode == 0) {
      for (var t of tleg_id) {
        dir_t[t] = 0;
        maxb_t[t] = 0;
        maxa_t[t] = 0;
      }
      smode = 1;
      continue;
    } */

    if (tick_count > tick_count_max[rmode])
      tick_count_max[rmode] = tick_count;

    const profit_x = Math.exp(Math.log(balance)/elapsed_days) - 1;
    console.log(
      ' bp ' + profit_x.toExponential(4)
      + ' ' + base_count
      + ' dd ' + max_dd.toExponential(4)
      + ' ' + balance.toExponential(4)
      + ' lev ' + tlevx.toExponential(3)
      + ' rmode ' + rmode
    );


    if (smode == 0) {
      profit_c[rmode]++;
      profit_t[rmode] *= 1 - 1 / profit_c[rmode];
      profit_t[rmode] += profit_x / profit_c[rmode];
      final_leg_t[rmode] = tleg_id;
      var trmode = rmode;
      while (trmode > 0) {
        if (profit_t[trmode] > profit_t[trmode - 1]) {
          var tp = profit_t[trmode];
          profit_t[trmode] = profit_t[trmode - 1];
          profit_t[trmode - 1] = tp;
          tp = profit_c[trmode];
          profit_c[trmode] = profit_c[trmode - 1];
          profit_c[trmode - 1] = tp;
          var final_leg_v = final_leg_t[trmode];
          final_leg_t[trmode] = final_leg_t[trmode - 1];
          final_leg_t[trmode - 1] = final_leg_v;
          var tx = levx_t[trmode];
          levx_t[trmode] = levx_t[trmode - 1];
          levx_t[trmode - 1] = tx;
          var tcm = tick_count_max[trmode];
          tick_count_max[trmode] = tick_count_max[trmode - 1];
          tick_count_max[trmode - 1] = tcm;
        } else break;
        trmode--;
        break_rank = 1;
      }
      if (trmode == 0) {
        var fstr = '';
        for (var i = 0; i < num_strats; i++) {
          const t = tleg_id[i];
          fstr += t
            + ' ' + maxb_t_save[t]
            + ' ' + maxa_t_save[t]
            + ' ' + dir_t_save[t]
            + '\n';
        }
        fs.writeFileSync('rdist2_leg_t_' + num_strats,fstr);
        fstr = '';
        for (var i in prof_t)
          fstr += i + ' ' + prof_t[i].toExponential(1) + '\n';
        fs.writeFileSync('prof_t_' + num_strats,fstr);
      }
      smode = 1;
      rmode = trmode;
      tlevx = levx_t[trmode] * (1 + (2 * Math.random() - 1) / 10);
      profit_x1 = profit_x;
      for (var i in prof_t) delete prof_t[i];
      for (var i in dir_t) {
        delete dir_t[i];
        delete maxb_t[i];
        delete maxa_t[i];
      }
      for (var t of tleg_id) {
        dir_t[t] = 0;
        maxb_t[t] = 0;
        maxa_t[t] = 0;
      }
      continue;
    }
    for (var i in prof_t) delete prof_t[i];
    for (var i in dir_t) {
      delete dir_t[i];
      delete maxb_t[i];
      delete maxa_t[i];
    }
    if (profit_x >= profit_x1) {
      levx_t[rmode] *= 1 - 1 / 5;
      levx_t[rmode] += tlevx / 5;
      fs.writeFileSync('levx_t',levx_t.join('\n'));
      if (profit_c[rmode] > 10) profit_c[rmode] = 10;
    }
    console.log('tick_cut ' + tick_cut.toFixed()
      + ' elapsed_days ' + elapsed_days.toFixed()
    );
    smode = 0;
    var fstr = '';
    for (var i = 0; i < final_leg_t.length; i++) {
      fstr += profit_c[i] + ' ' + profit_t[i].toExponential(9)
        + ' ' + final_leg_t[i].join(' ') + '\n';

      var tstr = ' ' + i;
      while (tstr.length < 5) tstr += ' ';
      tstr += profit_c[i];
      while (tstr.length < 8) tstr += ' ';
      tstr += ' ' + profit_t[i].toExponential(3)
        + ' ' + levx_t[i].toExponential(3)
        + '  -- ';
      for (var ii in final_leg_t[i])
        tstr += ' ' + final_leg_t[i][ii].slice(3,7);
      console.log(tstr);
    }
    fs.writeFileSync('final_leg_t',fstr);
    fs.writeFileSync('tick_count_max',tick_count_max.join('\n'));

    rmode++;
    if (rmode >= num_final) {
      profit_t.length = num_final;
      profit_c.length = num_final;
      levx_t.length = num_final;
      rmode = 0;
    }
    if (break_rank == 1) rmode = 0;
    break_rank = 0;
    if (rmode == 0)
      tick_cut = Math.random() * tick_count_max[rmode] / 4
        + tick_count_max[rmode] / 3;
    if ((rmode == num_final - 1) ||
      (rmode == final_leg_t.length)) {
      tlevx = levx_t[0];
      levx_t[rmode] = levx_t[0];
      profit_c[rmode] = 0;
      profit_t[rmode] = 0;
      tleg_id = [];
      const x = Math.random();
      if (x < 0.6) {
        for (var i = 0; i < num_strats; i++) {
          mod_leg = (Math.random() * 400 * 1e-4).toFixed(5);
          tleg_id[i] = mod_leg;
          dir_t[mod_leg] = 0;
          maxb_t[mod_leg] = 0;
          maxa_t[mod_leg] = 0;
          var ii = i;
          while (ii > 0) {
            if (Number(tleg_id[ii]) < Number(tleg_id[ii-1])) {
              var tl = tleg_id[ii - 1];
              tleg_id[ii - 1] = tleg_id[ii];
              tleg_id[ii] = tl;
            } else break;
            ii--;
          }
        }
        /*
      } else if (x < 0.8) {
        for (var i = 0; i < num_strats; i++)
          tleg_id[i] = final_leg_t[0][i];
        const ii = Math.floor(Math.random() * num_strats);
        tleg_id[ii] = (Number(final_leg_t[0][ii])
          + (2 * Math.floor(2 * Math.random()) - 1) * 1e-5;
        for (var i = 0; i < num_strats; i++) {
          dir_t[tleg_id[i]] = 0;
          maxb_t[tleg_id[i]] = 0;
          maxa_t[tleg_id[i]] = 0;
        }
        const str = tleg_id.join('');
        for (var i in final_leg_t) {
          const tstr = final_leg_t[i].join('');
          if (tstr === str) {
            rmode = i;
            console.log('matched rmode',i);
          }
        }
        console.log(tleg_id);
        */
      } else if (x < 0.8) {
        for (var i = 0; i < num_strats; i++)
          tleg_id[i] = final_leg_t[0][i];
        const ii = Math.floor(Math.random() * num_strats);
        tleg_id[ii] = (Number(final_leg_t[0][ii])
          * (1 + (2 * Math.random() - 1) / 10)).toFixed(5);
        for (var i = 0; i < num_strats; i++) {
          dir_t[tleg_id[i]] = 0;
          maxb_t[tleg_id[i]] = 0;
          maxa_t[tleg_id[i]] = 0;
        }
        const str = tleg_id.join('');
        for (var i in final_leg_t) {
          const tstr = final_leg_t[i].join('');
          if (tstr === str) {
            rmode = i;
            console.log('matched rmode',i);
          }
        }
        console.log(tleg_id);
      } else {
        for (var i = 0; i < num_strats; i++) {
          tleg_id[i] = (Number(final_leg_t[0][i])
            * (1 + (2 * Math.random() - 1) / 10)).toFixed(5);
          if (i > 0)
          if (Number(tleg_id[i]) < Number(tleg_id[i - 1])) {
            var t = tleg_id[i - 1];
            tleg_id[i - 1] = tleg_id[i];
            tleg_id[i] = t;
          }
        }
        for (var i = 0; i < num_strats; i++) {
          dir_t[tleg_id[i]] = 0;
          maxb_t[tleg_id[i]] = 0;
          maxa_t[tleg_id[i]] = 0;
        }
        const str = tleg_id.join('');
        for (var i in final_leg_t) {
          const tstr = final_leg_t[i].join('');
          if (tstr === str) {
            rmode = i;
            console.log('matched');
          }
        }
        console.log(tleg_id);
      }
    } else {
      tlevx = levx_t[rmode];
      tleg_id = final_leg_t[rmode];
      for (var i = 0; i < num_strats; i++) {
        dir_t[tleg_id[i]] = 0;
        maxb_t[tleg_id[i]] = 0;
        maxa_t[tleg_id[i]] = 0;
      }
    }
    continue;
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
  tick_count++;
  if (tick_count > tick_cut) {
    if (starting_month == '') {
      starting_month = lst[0];
      await setStartDate(lst[0]);
    }
    await elapseDays(lst[0]);
  }

  if (base_pos < 0) {
    var nav = balance + base_size * (base_price - current_ask);
    if (nav <= 0) { nav = 0; balance = 0; base_size = 0; }
    if (nav > max_nav) { max_nav = nav; max_nav_count = tick_count; }
    if (max_nav > 0)
      if ((max_nav - nav) / max_nav > max_dd)
        max_dd = (max_nav - nav) / max_nav;
  }
  if (base_pos > 0) {
    var nav = balance + base_size * (current_bid - base_price);
    if (nav <= 0) { nav = 0; balance = 0; base_size = 0; }
    if (nav > max_nav) { max_nav = nav; max_nav_count = tick_count; }
    if (max_nav > 0)
      if ((max_nav - nav) / max_nav > max_dd)
        max_dd = (max_nav - nav) / max_nav;
  }
  if (tick_count > tick_cut) {
    if (dir_key != odir_key) {
      if (prof_t[dir_key] > 0) {
        if (base_pos <= 0) {
          if (base_price > 0) {
            base_profit += base_price - current_ask;
            balance += base_size * (base_price - current_ask);
            base_count++;
          }
          base_pos = 1;
          base_price = current_ask;
          base_size = tlevx * balance / midp;
        }
      }
      if (prof_t[dir_key] < 0) {
        if (base_pos >= 0) {
          if (base_price > 0) {
            base_profit += current_bid - base_price;
            balance += base_size * (current_bid - base_price);
            base_count++;
          }
          base_pos = -1;
          base_price = current_bid;
          base_size = tlevx * balance / midp;
        }
      }
    }
  }
  if (typeof prof_t[dir_key] == 'undefined')
    prof_t[dir_key] = 0;
  prof_t[dir_key] += dmidp;
  odir_key = dir_key;
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

const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');

const num_strats = 5;
const num_final = 9;
const targv = process.argv;
for (const i of targv.shift()) if (i.indexOf('rdist.js') >= 0) break;
targv.shift();
// const pname = 'EUR_AUD';
const pname = targv.shift();
var precission = 5;
var c_type = 0;
if (pname.indexOf('USD') == 4) { c_type = 0;
} else if (pname.indexOf('USD') == 0) { c_type = 1;
} else { c_type = 2;
  console.log(pname,'type',c_type);
  process.exit();
}
if (pname.indexOf('JPY') >= 0) { precission = 3; c_type = 3; }

var omidp = 0;
const spw = 60 * 60 * 24 * 7;


const aspread = Number(fs.readFileSync('aspread-' + pname,'utf8'));
// console.log('doMain ' + new Date());
var max_dd = 0;
var back_nav = 1;
var back_nav0 = 0;

const levx_t = [];
var max_nav = 0;
var max_nav_count = 0;

var nh0,nm0,ns0;
var current_ask = 0;
var current_bid = 0;
var smode = 0;
var rmode = 0;
var delay_n = 0;
var dmidp = 0,dmidps = 0;
var tick_count = 0;
const tick_count_max = [];
try {
  const d = fs.readFileSync('tick_count_max_' + pname,'utf8');
  for (var i of d.split('\n')) tick_count_max.push(Number(i));
} catch {}
for (var i = tick_count_max.length; i < num_final; i++) tick_count_max[i] = 0;
// for (var i = 0; i < num_final; i++) tick_count_max[i] = 0;
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
var tleg_id = [];
var max_base = 0;
var max_bal = 0;
var tick_cut = Math.random() * tick_count_max[0] / 4
      + tick_count_max[0] / 3;
const profit_c = [];
const profit_t = [];
for (var i = 0; i < num_final; i++) {
  profit_t[i] = 0;
  profit_c[i] = 0;
}
const final_leg_t = [];
try {
  var tc = 0;
  const d = fs.readFileSync('final_' + pname,'utf8');
  for (var i of d.split('\n')) {
    var ii = i.split(' ');
    if (ii.length < 2) continue;
    profit_c[tc] = Number(ii[0]);
    profit_t[tc] = Number(ii[1]);
    if (profit_t[tc] !== profit_t[tc]) profit_t[tc] = 0;
    levx_t[tc] = Number(ii[2]);
    final_leg_t[tc] = ii.slice(3, 3 + num_strats);
    tc++;
  }
} catch {}
var tlevx = levx_t[0];
var tlevd = 1 + (2 * Math.random() - 1) / 10;
tleg_id = final_leg_t[0];
for (var t of tleg_id) {
  dir_t[t] = 0;
  maxb_t[t] = 0;
  maxa_t[t] = 0;
}

// console.log(final_leg_t);
var starting_month = '';
var profit_x1 = 0;
var break_rank = 0;
var longRate = 0;
var shortRate = 0;
var marginRate = 0;
async function doMain() {
  const fin_file = await fsPromises.open('financing.txt');
  var finflag0 = 0;
  var finflag1 = 0;
  var finflag2 = 0;
  for await (const line of fin_file.readLines()) {
    if (line.indexOf(pname) >= 0) {
      finflag0 = 1;
      finflag1 = 1;
      finflag2 = 1;
    }
    if (finflag0 == 1) if (line.indexOf('longRate') >= 0) {
      finflag0 = 0;
      const l = line.split('\'');
      longRate = Number(l[1]);
    }
    if (finflag1 == 1) if (line.indexOf('shortRate') >= 0) {
      finflag1 = 0;
      const l = line.split('\'');
      shortRate = Number(l[1]);
    }
    if (finflag2 == 1) if (line.indexOf('marginRate') >= 0) {
      finflag2 = 0;
      const l = line.split('\'');
      marginRate = Number(l[1]);
    }
  }
  // console.log('        --------------------');
  console.log('marginRate',marginRate,'longRate',longRate,'shortRate',shortRate);
  longRate /= 365;
  shortRate /= 365;

  while (true) {
    current_ask = 0;
    current_bid = 0;
    omidp = 0/0;
    maxa = 0;
    maxb = 0;
    back_nav = 1;
    max_nav = 0;
    max_nav_count = 0;
    max_dd = 0;
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
    short_rate_x = 0;
    tint0 = 0;
    tint1 = 0;
    long_rate_x = 0;
    odayStr = '';

    const tick_file = await fsPromises.open('../data-' + pname + '/ticks-hist-comp');
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
    // const tick_file2 = await fsPromises.open('../ticks');
    // for await (const line of tick_file2.readLines())
      // await doTickLine(line);

    if (tick_count > tick_count_max[rmode])
      tick_count_max[rmode] = tick_count;

    if (balance < 1e-9) { balance = 1e-9; max_dd = 1; }
    if (elapsed_days == 0) elapsed_days = 1;
    const profit_x = Math.exp(Math.log(balance)/elapsed_days) - 1;
    if (profit_x !== profit_x) {
      profit_x = 0;
      console.log(balance,elapsed_days,tick_cut);
    }
    console.log(
      ' bp ' + profit_x.toExponential(4)
      + ' ' + base_count
      + ' dd ' + max_dd.toExponential(4)
      + ' ' + balance.toExponential(4)
      + ' lev ' + tlevx.toExponential(3)
      + ' rmode ' + rmode
    );


    for (var i in dir_t) {
      delete dir_t[i];
      delete maxb_t[i];
      delete maxa_t[i];
    }
    if (smode == 0) {
      if (profit_c[rmode] < 100) profit_c[rmode]++;
      else profit_c[rmode] = 100;
      profit_t[rmode] *= 1 - 1 / profit_c[rmode];
      profit_t[rmode] += profit_x / profit_c[rmode];
      if (profit_t[rmode] < 0) profit_t[rmode] = 0;
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
        fs.writeFileSync('rdist_' + pname,fstr);
        fstr = '';
        for (var i in prof_t)
          fstr += i + ' ' + prof_t[i].toExponential(1) + '\n';
        fs.writeFileSync('prof_t_' + pname,fstr);
        // fs.writeFileSync('levx',levx_t[0].toExponential(3) + '\n');
        // try { fs.renameSync('profit_profile-' + pname,
          // 'profit_profile0-' + pname);
        // } catch {}
      // } else {
        // try { fs.renameSync('profit_profile-' + pname,
          // 'profit_profile1-' + pname);
        // } catch {}
      }
      rmode = trmode;
      if (balance > 1) {
        if (max_dd < 0.5) levx_t[rmode] *= 1.001;
        else levx_t[rmode] /= 1.001;
      }
      if (levx_t[rmode] > 0.9 / marginRate)
        levx_t[rmode] = 0.9 / marginRate;
      /*
      smode = 1;
      profit_x1 = profit_x;
      for (var i in prof_t) delete prof_t[i];
      for (var t of tleg_id) {
        dir_t[t] = 0;
        maxb_t[t] = 0;
        maxa_t[t] = 0;
      }
      // if (profit_x < 0) levx_t[rmode] *= 1 - max_dd / 100;
      // tlevx = levx_t[trmode] * (1 + (2 * Math.random() - 1) / 10);
      tlevx = levx_t[trmode] * tlevd;
      continue;
    } else if (smode == 1) {
      if (profit_x > profit_x1) {
        levx_t[rmode] *= 1 - 1 / 5;
        levx_t[rmode] += tlevx / 5;
        if (profit_c[rmode] > 30) profit_c[rmode] = 30;
      }
      if (rmode == 0) {
        smode = 2;
        tlevx = levx_t[rmode] / 2;
        for (var t of tleg_id) {
          dir_t[t] = 0;
          maxb_t[t] = 0;
          maxa_t[t] = 0;
        }
        for (var i in prof_t) delete prof_t[i];
        continue;
      }
      */
    }
    for (var i in prof_t) delete prof_t[i];
    if (profit_c[rmode] < 20) break_rank = 1;
    console.log(
        ' laps ' + elapsed_days.toFixed()
      + ' tint ' + tint0.toExponential(5)
      + ' ' + tint1.toExponential(5)
      + '   ---   ' + pname
    );
    smode = 0;
    var fstr = '';
    for (var i = 0; i < final_leg_t.length; i++) {
      fstr += profit_c[i] + ' ' + profit_t[i].toExponential(9)
        + ' ' + levx_t[i].toExponential(9)
        + ' ' + final_leg_t[i].join(' ') + '\n';

      var tstr = ' ' + i;
      while (tstr.length < 5) tstr += ' ';
      tstr += profit_c[i];
      while (tstr.length < 8) tstr += ' ';
      tstr += ' ' + profit_t[i].toExponential(3)
        + ' ' + levx_t[i].toExponential(3)
        + '  -- ';
      for (var ii in final_leg_t[i])
        if (c_type == 3) tstr += ' ' + final_leg_t[i][ii];
        else tstr += ' ' + final_leg_t[i][ii].slice(3,7);
      console.log(tstr);
    }
    fs.writeFileSync('final_' + pname,fstr);
    fs.writeFileSync('tick_count_max_' + pname,tick_count_max.join('\n'));

    rmode++;
    if (rmode >= num_final) {
      profit_t.length = num_final;
      profit_c.length = num_final;
      levx_t.length = num_final;
      rmode = 0;
    }
    if (break_rank == 1) rmode = 0;
    break_rank = 0;
    if (rmode == 0) process.exit();
      // tick_cut = Math.random() * tick_count_max[rmode] / 4
        // + tick_count_max[rmode] / 3;
    if ((rmode == num_final - 1)
      || (rmode == final_leg_t.length)
      || (profit_t[rmode] <= 0)
    ) {
      // tlevx = levx_t[0] * tlevd;
      tlevx = levx_t[0];
      levx_t[rmode] = tlevx;
      profit_c[rmode] = 20;
      profit_t[rmode] = profit_t[0];
      tleg_id = [];
      const rand_x = Math.random();
      if ((rand_x < 0.6) || (profit_t[0] <= 0)) {
        for (var i = 0; i < num_strats; i++) {
          const mod_leg = c_type == 3
            ? (Math.random() * 4e-2 * current_ask).toExponential(3)
            : (Math.random() * 4e-2).toFixed(precission)
            ;
          tleg_id[i] = mod_leg;
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
      } else if (rand_x < 0.8) {
        for (var i = 0; i < num_strats; i++)
          tleg_id[i] = final_leg_t[0][i];
        const iii = Math.floor(Math.random() * num_strats);
        const x = Number(final_leg_t[0][iii])
          * (1 + (2 * Math.random() - 1) / 10);
        tleg_id[iii] = c_type == 3 ? x.toExponential(3) : x.toFixed(precission);
        for (var i = 0; i < num_strats; i++) {
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
      } else {
        for (var i = 0; i < num_strats; i++) {
          const x = Number(final_leg_t[0][i])
            * (1 + (2 * Math.random() - 1) / 10);
          tleg_id[i] = c_type == 3 ? x.toExponential(3) : x.toFixed(precission);
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
      }
      for (var i = 0; i < num_strats - 2; i++) {
        const d0 = Number(tleg_id[i + 2]) - Number(tleg_id[i]);
        const d1 = Number(tleg_id[i + 1]) - Number(tleg_id[i]);
        if (d1 / d0 < 0.2) {
          const x = Number(tleg_id[i]) + 0.2 * d0;
          tleg_id[i + 1] = c_type == 3 ? x.toExponential(3) : x.toFixed(precission);
        } else if (d1 / d0 > 0.8) {
          const x = Number(tleg_id[i]) + 0.8 * d0;
          tleg_id[i + 1] = c_type == 3 ? x.toExponential(3) : x.toFixed(precission);
        }
      }
      const str = tleg_id.join('');
      for (var i in final_leg_t) {
        const tstr = final_leg_t[i].join('');
        if (tstr === str) {
          rmode = i;
          console.log('matched rmode',i);
          process.exit();
        }
      }
      console.log(tleg_id);
      for (var i = 0; i < num_strats; i++) {
        dir_t[tleg_id[i]] = 0;
        maxb_t[tleg_id[i]] = 0;
        maxa_t[tleg_id[i]] = 0;
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
var elapsed_days = 0;
var oelapsed_days = 0;
var long_rate_x = 0;
var short_rate_x = 0;
var dayStr = '';
var odayStr = '';
var tint0 = 0;
var tint1 = 0;

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
  // console.log('setStartDate');
  // console.log(t,yo0,mo0,do0,ho0,mi0,si0);
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
  if (lst.length < 2) return;
  current_bid = Number(lst[1]);
  // current_ask = Number(lst[2]);
  current_ask = Number((current_bid + aspread).toFixed(precission));
  if (c_type > 0) {
    current_bid = 1 / current_ask;
    current_ask = 1 / Number(lst[1]);
  }
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
    short_rate_x += base_size * (elapsed_days - oelapsed_days);
    var nav = balance + base_size * (base_price - current_ask);
    if (nav <= 0) { nav = 0; balance = 0; base_size = 0; }
    if (nav > max_nav) { max_nav = nav; max_nav_count = tick_count; }
    if (max_nav > 0)
      if ((max_nav - nav) / max_nav > max_dd)
        max_dd = (max_nav - nav) / max_nav;
  }
  if (base_pos > 0) {
    long_rate_x += base_size * (elapsed_days - oelapsed_days);
    var nav = balance + base_size * (current_bid - base_price);
    if (nav <= 0) { nav = 0; balance = 0; base_size = 0; }
    if (nav > max_nav) { max_nav = nav; max_nav_count = tick_count; }
    if (max_nav > 0)
      if ((max_nav - nav) / max_nav > max_dd)
        max_dd = (max_nav - nav) / max_nav;
  }
  oelapsed_days = elapsed_days;
  dayStr = lst[0].slice(0,8);
  if (dayStr != odayStr) {
    balance += short_rate_x * shortRate;
    balance += long_rate_x * longRate;
    tint1 += short_rate_x * shortRate;
    tint0 += long_rate_x * longRate;
    short_rate_x = 0;
    long_rate_x = 0;
    odayStr = dayStr;
  }

  if (tick_count > tick_cut) {
    if (dir_key != odir_key) {
      if (prof_t[dir_key] > 0) {
        if (base_pos <= 0) {
          if (base_price > 0) {
            base_profit += base_price - current_ask;
            balance += base_size * (base_price - current_ask);
            tint1 += base_size * (base_price - current_ask);
            base_count++;
          }
          base_pos = 1;
          base_price = current_ask;
          base_size = tlevx * balance / current_ask;
          /*
          if (rmode == 0) fs.appendFileSync('profit_profile-' + pname,
            base_pos + ' ' + base_price
            + ' ' + (1/midp/marginRate).toExponential(5)
            + ' ' + (1/marginRate).toExponential(5)
            + '\n');
            */
        }
      }
      if (prof_t[dir_key] < 0) {
        if (base_pos >= 0) {
          if (base_price > 0) {
            base_profit += current_bid - base_price;
            balance += base_size * (current_bid - base_price);
            tint0 += base_size * (current_bid - base_price);
            base_count++;
          }
          base_pos = -1;
          base_price = current_bid;
          base_size = tlevx * balance / current_bid;
          /*
          if (rmode == 0) fs.appendFileSync('profit_profile-' + pname,
            base_pos + ' ' + base_price
            + ' ' + (1/midp/marginRate).toExponential(5)
            + ' ' + (1/marginRate).toExponential(5)
            + '\n');
            */
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

try { fs.renameSync('profit_profile-' + pname,'profit_profile1-' + pname);
} catch {}
/*
try { fs.renameSync('err_profile','err_profile0');
} catch {}
try { fs.renameSync('dist','dist0');
} catch {}
try { fs.renameSync('ppro','ppro0');
} catch {}
*/
doMain();

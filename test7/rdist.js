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
if (pname.indexOf('JPY') >= 0) precission = 3;
var c_type = 0;
if (pname.indexOf('USD') == 4) { c_type = 0;
} else if (pname.indexOf('USD') == 0) { c_type = 1;
} else { c_type = 2;
  console.log(pname,'type',c_type);
  process.exit();
}

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
const reg_x0 = [];
const reg_a0 = [];
const reg_b0 = [];
const reg_werr0 = [];
const reg_aerr0 = [];
var reg_x0i = 0;
var leg_c = 1;
var reg_x0d = 824306;
for (var i = 0; i < leg_c; i++) {
  reg_x0[i] = reg_x0d; // 1e9; // (i + 1) * tick_count_max[0] / leg_c;
  // reg_a0[i] = reg_x0[i];
  reg_a0[i] = -3.5e-8;
  reg_b0[i] = 0.68;
  reg_werr0[i] = 0;
  reg_aerr0[i] = 0;
}
var runc = 1;
var otot_err0 = 0;

const { spawn } = require('child_process');
const gnuplot = spawn('gnuplot', ['-']);
gnuplot.stdin.write('set key off\n');
gnuplot.stdin.write('set term x11\n');
// gnuplot.stdin.write('set xrange [' + (tick_count - 10_000)
  // + ':' + tick_count + ']\n');
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
    balance = 10;
    paid_back = 0;
    adbalance = 0;
    adbalancec = 0;
    odir_key = '';
    starting_month = '';
    short_rate_x = 0;
    tint0 = 0;
    tint1 = 0;
    long_rate_x = 0;
    odayStr = '';

    reg_x0i = 0;
    reg_x0d = reg_x0[reg_x0i];
    tot_err0 = 0;

    max_aerr = 0;
    max_aerri = -1;

    const tick_file = await fsPromises.open('../data-' + pname + '/ticks-hist-comp');
    for await (const line of tick_file.readLines())
      await doTickLine(line);

    var f_starting_tick = 0;
    for (const f of fs.readdirSync('..')) {
      if (f.indexOf('ticks-' + pname) == 0) {
        f_starting_tick = tick_count;
        const tick_file = await fsPromises.open('../' + f);
        for await (const line of tick_file.readLines())
          await doTickLine(line);
      }
    }
    console.log(reg_x0i,werr0,reg_x0d);
    if (tick_count > reg_x0[leg_c - 1]) {
      reg_x0[leg_c - 1] = tick_count;
      reg_x0d = leg_c == 1 ? reg_x0[leg_c-1] : reg_x0[leg_c-1] - reg_x0[leg_c-2];
      // gnuplot.stdin.write('set xrange [' + (tick_count - 10_000)
        // + ':' + tick_count + ']\n');
    }

    reg_a0[reg_x0i] += werr0 / reg_x0d / reg_x0d;
    reg_b0[reg_x0i] += err0 / reg_x0d;
    reg_werr0[reg_x0i] = werr0;
    reg_aerr0[reg_x0i] = aerr0 / reg_x0d;
    reg_x0i = 0;
    xx0 = 0;
    yy0 = reg_b0[reg_x0i];
    err0 = 0;
    werr0 = 0;
    aerr0 = 0;

    var fstr = '';
    var x0 = 0, x1 = 0;
    for (var i in reg_x0) {
      x0 = x1;
      x1 = reg_x0[i];
      x11 = x1 - 1;
      const m = reg_a0[i];
      const b = reg_b0[i];
      const td = i == 0 ? reg_x0[i] : reg_x0[i] - reg_x0[i-1];
      const y = m * td + b;
      fstr += x0 + ' ' + b.toExponential(5) + '\n';
      fstr += x11 + ' ' + y.toExponential(5) + '\n';
      var tstr = i + ' ';
      if (reg_werr0[i] >= 0) tstr += ' ';
      tstr += reg_werr0[i].toExponential(2) + '  ';
      tstr += reg_aerr0[i].toExponential(2) + '  ';
      tstr += (x1 - x0);
      console.log(tstr);
      tot_err0 += reg_aerr0[i];
    }
    fs.writeFileSync('reg0',fstr);
    fs.writeFileSync('reg_a0',reg_a0.join('\n'));
    fs.writeFileSync('reg_b0',reg_b0.join('\n'));
    gnuplot.stdin.write('plot "../ticks-' + pname
      + '-202402" using ($0+'+f_starting_tick+'):2 w l,"reg0" using 1:2 w l lw 2\n');
    // gnuplot.stdin.write('plot "../data-' + pname
      // + '/ticks-hist-comp" using 0:2 w l,"reg0" using 1:2 w l lw 2\n');
    runc++;
    // div *= 1.1;

    for (var i = 0; i < leg_c - 1; i++) {
      const td = i == 0 ? reg_x0[i] : reg_x0[i] - reg_x0[i-1];
      const td2 = i == 0 ? reg_x0[i+1] : reg_x0[i+1] - reg_x0[i-1];
      // (reg_a0[i] * x + reg_b0[i] == reg_a0[i+1] * (x - td) + reg_b0[i+1])
      // (reg_a0[i] * x - reg_a0[i+1] * x == - reg_b0[i] - reg_a0[i+1] * td + reg_b0[i+1])
      const x = (reg_b0[i+1] - reg_b0[i] - reg_a0[i+1] * td)
        / (reg_a0[i] - reg_a0[i+1]);
      if (x > td) {
        if (x > td2) reg_x0[i] += (td2 - td) / 9;
        else reg_x0[i] += (x - td) / 9;
      } else {
        if (x > 0) reg_x0[i] -= (td - x) / 9;
        else reg_x0[i] -= td / 9;
      }
    }

    var max_td = 0;
    var max_tdi = -1;
    for (var i = 0; i < leg_c; i++) {
      if (reg_aerr0[i] > max_td) {
        max_td = reg_aerr0[i];
        max_tdi = i;
      }
    }
    console.log(reg_a0);
    console.log('max_td',max_td.toExponential(3),leg_c);
    if (max_td < 1.8e-2)
    if (max_td > 2e-3) {
      const nreg_x0 = [];
      const nreg_a0 = [];
      const nreg_b0 = [];
      const nreg_werr0 = [];
      const nreg_aerr0 = [];
      for (var i = 0; i < max_tdi; i++) {
        nreg_x0[i] = reg_x0[i];
        nreg_a0[i] = reg_a0[i];
        nreg_b0[i] = reg_b0[i];
        nreg_werr0[i] = reg_werr0[i];
        nreg_aerr0[i] = reg_aerr0[i];
      }
      const d = max_tdi == 0 ? 0 : reg_x0[max_tdi-1];
      nreg_x0[max_tdi] = (reg_x0[max_tdi] - d) / 2 + d;
      nreg_a0[max_tdi] = reg_a0[max_tdi];
      nreg_b0[max_tdi] = reg_b0[max_tdi];
      nreg_werr0[max_tdi] = reg_werr0[max_tdi];
      nreg_aerr0[max_tdi] = reg_aerr0[max_tdi];
      for (var i = max_tdi; i < leg_c; i++) {
        nreg_x0[i+1] = reg_x0[i];
        nreg_a0[i+1] = reg_a0[i];
        nreg_b0[i+1] = reg_b0[i];
        nreg_werr0[i+1] = reg_werr0[i];
        nreg_aerr0[i+1] = reg_aerr0[i];
      }
      nreg_b0[max_tdi+1] = reg_b0[max_tdi]
        + reg_a0[max_tdi] * (reg_x0[max_tdi] - d) / 2;
      leg_c += 1;
      for (var i = 0; i < leg_c; i++) {
        reg_x0[i] = nreg_x0[i];
        reg_a0[i] = nreg_a0[i];
        reg_b0[i] = nreg_b0[i];
        reg_werr0[i] = nreg_werr0[i];
        reg_aerr0[i] = nreg_aerr0[i];
      }
      tot_err0 = 0;
    }
    otot_err0 = tot_err0;
    continue;

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
    // const profit_x = Math.exp(Math.log(balance)/elapsed_days) - 1;
    // const profit_x = balance/elapsed_days;
    if (adbalancec == 0) console.log('wtf');
    const profit_x = adbalance === adbalance ? adbalance/adbalancec : 0;
    if (profit_x !== profit_x)
      console.log(balance,elapsed_days,tick_cut);
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
      if (profit_t[rmode] !== profit_t[rmode]) profit_t[rmode] = 0;
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
      if (max_dd < 0.8) levx_t[rmode] *= 1.001;
      else levx_t[rmode] /= 1.001;
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
        tstr += ' ' + final_leg_t[i][ii].slice(3,7);
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
      const x = Math.random();
      if ((x < 0.6) || (profit_t[0] < 0)) {
        for (var i = 0; i < num_strats; i++) {
          const mod_leg = (Math.random() * 4 * Math.pow(10,-precission+3))
            .toFixed(precission);
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
      } else if (x < 0.8) {
        for (var i = 0; i < num_strats; i++)
          tleg_id[i] = final_leg_t[0][i];
        const iii = Math.floor(Math.random() * num_strats);
        tleg_id[iii] = (Number(final_leg_t[0][iii])
          * (1 + (2 * Math.random() - 1) / 10)).toFixed(precission);
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
          tleg_id[i] = (Number(final_leg_t[0][i])
            * (1 + (2 * Math.random() - 1) / 10)).toFixed(precission);
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
        if (d1 / d0 < 0.2) tleg_id[i + 1] =
          Number((Number(tleg_id[i]) + 0.2 * d0).toExponential(5)).toFixed(precission);
        else if (d1 / d0 > 0.8) tleg_id[i + 1] =
          Number((Number(tleg_id[i]) + 0.8 * d0).toExponential(5)).toFixed(precission);
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
var omo1 = 0;
var paid_back = 0;
var odo1 = 0;
var adbalance = 0;
var adbalancec = 0;
async function setStartDate(t) {
  yo0 = Number(t.slice(0,4));
  mo0 = Number(t.slice(4,6));
  do0 = Number(t.slice(6,8));
  ho0 = Number(t.slice(8,10));
  mi0 = Number(t.slice(10,12));
  si0 = Number(t.slice(12));
  // console.log('setStartDate');
  // console.log(t,yo0,mo0,do0,ho0,mi0,si0);
  omo1 = mo0;
  odo1 = do0;
  obalance = balance;
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

  if (omo1 != mo1) {
    omo1 = mo1;
    adbalance += (balance - obalance) / obalance;
    adbalancec++;
    obalance = balance;
    if (paid_back < 11) {
      balance -= 1;
      paid_back++;
    }
  }
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
var div = 1e4;
const pi2 = Math.PI / 2;

var xx0 = 0;
var yy0 = 0;
var err0 = 0;
var werr0 = 0;
var aerr0 = 0;
var tot_err0 = 0;
var max_aerr = 0;
var max_aerri = -1;
async function doTickLine(line) {
  var lst = line.split(' ');
  if (lst.length < 2) return;
  current_bid = Number(lst[1]);
  // current_ask = Number(lst[2]);
  current_ask = Number((current_bid + aspread).toFixed(precission));
  midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) omidp = midp;
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  omidp = midp;

  tick_count++;
  if (reg_x0i < leg_c - 1) {
    if (tick_count > reg_x0[reg_x0i]) {
      reg_a0[reg_x0i] += werr0 / reg_x0d / reg_x0d;
      reg_b0[reg_x0i] += err0 / reg_x0d;
      reg_werr0[reg_x0i] = werr0;
      reg_aerr0[reg_x0i] = aerr0 / reg_x0d;
      reg_x0i++;
      if (reg_x0i == leg_c) return;
      xx0 = 0;
      yy0 = reg_b0[reg_x0i];
      err0 = 0;
      werr0 = 0;
      aerr0 = 0;
      reg_x0d = reg_x0[reg_x0i] - reg_x0[reg_x0i-1];
    }
  }
  const err = midp - yy0;
  const aerr = Math.abs(err);
  if (aerr > max_aerr) {
    max_aerr = aerr;
    max_aerri = tick_count;
  }
  err0 += err;
  aerr0 += aerr;
  werr0 += err * (xx0 - reg_x0d / 2) / reg_x0d;
  xx0 += 1;
  yy0 += reg_a0[reg_x0i];

  return;
  if (tick_count > reg_x1[reg_x1i]) { reg_x1i++; }
  if (reg_x0i > 0) xx0 = reg_x0[reg_x0i - 1];

  var xx1 = 0;
  if (reg_x1i > 0) xx1 = reg_x1[reg_x1i - 1];
  const x0 = (tick_count - xx0) / reg_x0d;
  const x1 = (tick_count - xx1) / reg_x1d;
  const ct0 = Math.atan2((midp - reg_b0[reg_x0i]), (x0 - reg_a0[reg_x0i]));
  const ct1 = Math.atan2((midp - reg_b1[reg_x1i]), (x1 - reg_a1[reg_x1i]));
    // / (tick_count - reg_a0[reg_x0i]));
  const bt0 = Math.atan2(-reg_a0[reg_x0i],reg_b0[reg_x0i]);
  const bt1 = Math.atan2(-reg_a1[reg_x1i],reg_b1[reg_x1i]);
  // var dt0 = bt0 - ct0;
  var dt0 = ct0 - bt0;
  if (dt0 > pi2) dt0 -= Math.PI;
  if (dt0 < -pi2) dt0 += Math.PI;
  // var dt1 = bt1 - ct1;
  var dt1 = ct1 - bt1;
  if (dt1 > pi2) dt1 -= Math.PI;
  if (dt1 < -pi2) dt1 += Math.PI;

  const al0 = Math.sqrt((midp - reg_b0[reg_x0i]) ** 2
    + (x0 - reg_a0[reg_x0i]) ** 2);
  const al1 = Math.sqrt((midp - reg_b1[reg_x1i]) ** 2
    + (x1 - reg_a1[reg_x1i]) ** 2);
  var dl0 = Math.sin(dt0) * al0;
  var dl1 = Math.sin(dt1) * al1;

  const len0 = Math.sqrt(reg_a0[reg_x0i] ** 2 + reg_b0[reg_x0i] ** 2);
  const len1 = Math.sqrt(reg_a1[reg_x1i] ** 2 + reg_b1[reg_x1i] ** 2);

  var at0 = Math.atan2(reg_b0[reg_x0i],reg_a0[reg_x0i]);
  // if (at0 < 0) at0 += Math.PI;
  if (Math.atan2(midp,x0) > at0) dl0 *= -1;
  var at1 = Math.atan2(reg_b1[reg_x1i],reg_a1[reg_x1i]);
  // if (at1 < 0) at1 += Math.PI;
  if (Math.atan2(midp,x1) > at1) dl1 *= -1;
  // console.log(dt0,dl0,Math.atan2(midp,x0),at0);
  // process.exit();
  reg_a0[reg_x0i] = (len0 + dl0 / div) * Math.cos(at0 + dt0 / div / 10);
  reg_b0[reg_x0i] = (len0 + dl0 / div) * Math.sin(at0 + dt0 / div / 10);
  reg_a1[reg_x1i] = (len1 + dl1 / div) * Math.cos(at1 + dt1 / div / 10);
  reg_b1[reg_x1i] = (len1 + dl1 / div) * Math.sin(at1 + dt1 / div / 10);
  return;

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
          if (c_type == 0) base_size = tlevx * balance / midp;
          else base_size = tlevx * balance;
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
          if (c_type == 0) base_size = tlevx * balance / midp;
          else base_size = tlevx * balance;
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

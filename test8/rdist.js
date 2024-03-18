const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');
const exec = require('child_process').exec;

const num_strats = 4;
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
if (pname.indexOf('JPY') >= 0) {
  precission = 3;
  // c_type = 3;
}

const starting_balance = Number(fs.readFileSync('nav','utf8'));
var balance = starting_balance;
var obalance = balance;
var omidp = 0;
const spw = 60 * 60 * 24 * 7;


const aspread = Number(fs.readFileSync('aspread-' + pname,'utf8'));
// console.log('doMain ' + new Date());
var max_dd = 0;
var max_dd_lap = 0;
var back_nav = 1;
var back_nav0 = 0;

const long_levx_t = [];
const shrt_levx_t = [];
var max_nav = 0;

var nh0,nm0,ns0;
var current_ask = 0;
var current_bid = 0;
var smode = 0;
var rmode = 0;
var delay_n = 0;
var dmidp = 0,dmidps = 0,dmidpss = 0;
var dmidps_bull = 0;
var dmidps_bear = 0;
var arsid = 0;
var abulls0 = 0;
var abulls1 = 0;
var abears0 = 0;
var abears1 = 0;
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
const profit_c = [];
const profit_t = [];
const amacdc_t = [];
const amidps0c_t = [];
const amidps1c_t = [];
const long_tpx_t = [];
const long_slx_t = [];
const shrt_tpx_t = [];
const shrt_slx_t = [];
for (var i = 0; i < num_final; i++) {
  profit_t[i] = 0;
  profit_c[i] = 0;
  amacdc_t[i] = 50;
  amidps0c_t[i] = 100;
  amidps1c_t[i] = 150;
  long_tpx_t[i] = 1;
  long_slx_t[i] = 1;
  shrt_tpx_t[i] = 1;
  shrt_slx_t[i] = 1;
  long_levx_t[i] = 10;
  shrt_levx_t[i] = 10;
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
    long_levx_t[tc] = Number(ii[2]);
    amacdc_t[tc] = Number(ii[3]);
    amidps0c_t[tc] = Number(ii[4]);
    amidps1c_t[tc] = Number(ii[5]);
    if (amidps0c_t[tc] > amidps1c_t[tc]) {
      const t = amidps0c_t[tc];
      amidps0c_t[tc] = amidps1c_t[tc];
      amidps1c_t[tc] = t;
    }
    long_tpx_t[tc] = Number(ii[6]);
    if (long_tpx_t[tc] > 1) long_tpx_t[tc] = 1;
    long_slx_t[tc] = Number(ii[7]);
    if (long_slx_t[tc] > 1) long_slx_t[tc] = 1;
    shrt_tpx_t[tc] = Number(ii[8]);
    if (shrt_tpx_t[tc] > 1) shrt_tpx_t[tc] = 1;
    shrt_slx_t[tc] = Number(ii[9]);
    if (shrt_slx_t[tc] > 1) shrt_slx_t[tc] = 1;
    shrt_levx_t[tc] = Number(ii[10]);
    tc++;
  }
} catch {}
var long_tlevx = long_levx_t[0];
var shrt_tlevx = shrt_levx_t[0];
var tlevd = 1 + (2 * Math.random() - 1) / 10;
/*
tleg_id = final_leg_t[0];
for (var t of tleg_id) {
  dir_t[t] = 0;
  maxb_t[t] = 0;
  maxa_t[t] = 0;
} */

// console.log(final_leg_t);
var starting_month = '';
var break_rank = 0;
var longRate = 0;
var shortRate = 0;
var marginRate = 0;
var comp_fn = '';
var comp_fn_flag = 0;
var add_fn_flag = 0;
var new_leg_flag = 1;
async function doMain() {
  // console.log('doMain');
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
    max_dd = 0;
    max_dd_lap = 0;
    d_n = 1e7;
    back_pos = 0;
    back_price = 0;

    dmidp = 0;
    dmidps = 0;
    dmidpss = 0;
    trade_count = 0;

    base_price = 0;
    base_profit = 0;
    obase_profit = 0;
    adbase_profit = 0;
    aadbase_profit = 0;
    max_base = 0;
    base_profit2 = 0;
    base_pos = 0;
    // base_drsi_sl0 = 0;
    // base_drsi_tp0 = 0;
    // base_drsi_sl1 = 0;
    // base_drsi_tp1 = 0;
    adrsi_long = 0;
    adrsi_shrt = 0;

    abase_profit = 0;
    base_size = 0;
    base_count = 0;
    tp_count0 = 0;
    tp_count1 = 0;
    sl_count0 = 0;
    sl_count1 = 0;
    balance = starting_balance;
    obalance = starting_balance;
    odir_key = '';
    odir_tic = 0;
    odir_ti = 0;
    starting_month = '';
    short_rate_x = 0;
    tint0 = 0;
    tint1 = 0;
    long_rate_x = 0;
    odayStr = '';
    ominStr = '';
    amidps0 = 0;
    amidps1 = 0;

    amacd = 0;
    amacd_max_pd0 = 0;
    amacd_min_pd0 = 0;
    amacd_max_pd1 = 0;
    amacd_min_pd1 = 0;
    trade_flag = 0;

    amacd_max_pd2 = 0;
    amacd_max_pd3 = 0;

    macd_key = 0; // up or down
    macd_negc = 0; // how many times have we switched
    macd_negc0 = 0; // how many times have we switched
    macd_posc = 0;
    macd_posc0 = 0;

    macd_max_pd = 0;
    macd_min_pd = 0;
    macd_min_pd_save = 0;

    macd_price = 0;

    dmidps_bull = 0;
    dmidps_bear = 0;
    arsid = 0;
    abulls0 = 0;
    abulls1 = 0;
    abears0 = 0;
    abears1 = 0;



    oelapsed_days = 0;
    elapsed_days = 0;
    long_exposure = 0;
    shrt_exposure = 0;
    max_ds = 0;
    max_dl = 0;
    max_price = 0;

    comp_fn_flag = 0;
    add_fn_flag = 0;
    // comp_fn = '../data-' + pname + '/ticks-comp-' + tleg_id.join('');
    // comp_fn = 'ticks-comp-' + pname + '-' + tleg_id.join('');
    // comp_fn = 'ticks-comp-' + pname;
    comp_fn = '../data-' + pname + '/ticks-comp-' + pname;
    // console.log('comp_fn',comp_fn);
    try {
      fs.unlinkSync(comp_fn + '-0');
    } catch {}
    try {
      if (rmode == 0) fs.unlinkSync('profile-' + pname + '-0');
    } catch {}

    try {
      const comp_file = await fsPromises.open(comp_fn);
      // console.log(comp_fn);
      comp_fn_flag = 1;
      for await (const line of comp_file.readLines())
        await doTickLine(line);
    } catch {
      // do this from within the data dir
      /*
      for (const f of fs.readdirSync('../data-' + pname)) {
        if (f.indexOf('.csv') >= 0)
          fs.unlinkSync('../data-' + pname + '/' + f);
        if (f.indexOf('.txt') >= 0)
          fs.unlinkSync('../data-' + pname + '/' + f);
      }
      for (const f of fs.readdirSync('../data-' + pname))
        if (f.indexOf('H') == 0) {
          const { stdout } = await sh('cd ../data-' + pname + ';unzip ' + f);
        }
        */
      var skip_c = 0;
      for (const f of fs.readdirSync('../data-' + pname)) {
        if (f.indexOf('.csv') >= 0) {
          console.log(f);
          // if (skip_c < 10) { skip_c++; continue; }
          const tick_file = await fsPromises.open('../data-' + pname + '/' + f);
          for await (const line of tick_file.readLines())
            await doTickLine(line);
          tick_file.close();
        }
      }
      add_fn_flag = 1;
      for (const f of fs.readdirSync('..')) {
        if (f.indexOf('ticks') == 0) {
          if (f.indexOf(pname) >= 0) {
            const tick_file = await fsPromises.open('../' + f);
            for await (const line of tick_file.readLines())
              await doTickLine(line);
            // console.log('hree',pname,elapsed_days);
            // process.exit();
            tick_file.close();
          }
        }
      }
      fs.appendFileSync(comp_fn + '-0',current_time + ' ' + current_bid + '\n');
      fs.writeFileSync('amidps0-' + pname,amidps0.toExponential(9) + '\n');
      fs.writeFileSync('amidps1-' + pname,amidps1.toExponential(9) + '\n');
      fs.writeFileSync('amacd-' + pname,amacd.toExponential(9) + '\n');
    }
    try {
      if (comp_fn_flag == 0) {
        fs.renameSync(comp_fn + '-0',comp_fn);
        if (rmode > 0) break_rank = 1;
      }
    } catch { console.log('couldnt rename',comp_fn); }
      // const { stdout } = await sh('rm ../data-' + pname + '/DAT_ASCII_*');

      /*
    const tick_file = await fsPromises.open('../data-' + pname + '/ticks-hist-comp');
    for await (const line of tick_file.readLines())
      await doTickLine(line);
      */

      /*
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
    */
      /*
    const tick_file2 = await fsPromises.open('../ticks');
    for await (const line of tick_file2.readLines())
      await doTickLine(line);
      */

    if (base_pos < 0) {
      base_profit += (base_price - current_ask) / current_ask;
      balance += base_size * (base_price - current_ask);
      base_count++;
      /*
      if (rmode == 0) fs.appendFileSync('profile-' + pname + '-0',
        elapsed_days.toExponential(9)
        + ' ' + balance.toExponential(5)
        + ' ' + base_profit.toExponential(5)
        + '\n'
      );
      */
    }
    if (base_pos > 0) {
      base_profit += (current_bid - base_price) / base_price;
      balance += base_size * (current_bid - base_price);
      base_count++;
      /*
      if (rmode == 0) fs.appendFileSync('profile-' + pname + '-0',
        elapsed_days.toExponential(9)
        + ' ' + balance.toExponential(5)
        + ' ' + base_profit.toExponential(5)
        + '\n'
      );
      */
    }
    const d = base_profit - obase_profit;
    adbase_profit *= 1 - 1 / elapsed_days;
    adbase_profit += d / elapsed_days;
    // const ad = Math.abs(d - adbase_profit);
    // aadbase_profit *= 1 - 1 / elapsed_days;
    // aadbase_profit += ad / elapsed_days;
    try {
      // if (rmode == 0) fs.renameSync('profile-' + pname + '-0','profile-' + pname);
    } catch {}
    if (balance < 1e-9) { balance = 1e-9; max_dd = 1; }
    if (elapsed_days == 0) {
      elapsed_days = 1;
      console.log('bad elapsed_days zero',odir_tic);
    }
    const profit_x = ((sl_count0 < 3) || (sl_count1 < 3)) ? 0
      : Math.exp(Math.log(balance/starting_balance)/elapsed_days) - 1;
    // const profit_x = adbase_profit/aadbase_profit;
    // const profit_x = adbase_profit;
    console.log(
      ' bp ' + profit_x.toExponential(4)
      + ' ' + base_count
      + ' dd ' + max_dd.toExponential(4)
      + ' ' + balance.toExponential(4)
      + ' c ' + comp_fn_flag
      + ' r ' + rmode
      + ' p ' + base_pos
    );
    console.log('   base',base_profit.toExponential(3),
      'ad',adbase_profit.toExponential(3),
      'aad',aadbase_profit.toExponential(3),
      'x',(adbase_profit/aadbase_profit).toExponential(3),
    );
    /*
    console.log(
      ' laps ' + (max_dd_lap/elapsed_days).toExponential(2)
      + ' ' + max_dd_lap.toExponential(2)
      + ' ' + elapsed_days.toExponential(2)
    ); */


    for (var i in dir_t) {
      delete dir_t[i];
      delete maxb_t[i];
      delete maxa_t[i];
    }
    // if (rmode == num_final - 1) {
    if ((new_leg_flag == 1)
      && (smode < 10)
      && (Math.abs(max_dd - 0.5) > 0.01)) {
      var dont_do_this = 0;
      if ((max_dd < 0.5)
        && ((long_levx_t[rmode] >= 0.9 / marginRate)
          || (shrt_levx_t[rmode] >= 0.9 / marginRate)))
            dont_do_this = 1;
      if (dont_do_this == 0) {
        long_levx_t[rmode] *= 1 + (0.5 - max_dd);
        shrt_levx_t[rmode] *= 1 + (0.5 - max_dd);
        if (long_levx_t[rmode] > 0.9 / marginRate) {
          long_levx_t[rmode] = 0.9 / marginRate;
        } else if (shrt_levx_t[rmode] > 0.9 / marginRate) {
          shrt_levx_t[rmode] = 0.9 / marginRate;
        } else {
          long_tlevx = long_levx_t[rmode];
          shrt_tlevx = shrt_levx_t[rmode];
          smode++;
          continue;
        }
      }
    }

    if (profit_c[rmode] < 19) profit_c[rmode]++;
    else profit_c[rmode] = 19;
    profit_t[rmode] *= 1 - 1 / profit_c[rmode];
    profit_t[rmode] += profit_x / profit_c[rmode];
    if (profit_t[rmode] < 1e-9) profit_t[rmode] = 0;
    if (profit_t[rmode] <= 0) {
      try {
        // if (rmode > 0) fs.unlinkSync(comp_fn);
      } catch {
        console.log('couldnt unlink looser',comp_fn);
      }
      profit_t[rmode] = 0;
    }

    if (max_dd < 0.5) {
      var dont_do_this = 0;
      if ((long_levx_t[rmode] >= 0.9 / marginRate)
          || (shrt_levx_t[rmode] >= 0.9 / marginRate))
            dont_do_this = 1;
      if (dont_do_this == 0) {
        long_levx_t[rmode] *= 1 + 1 / profit_c[rmode] / 20;
        shrt_levx_t[rmode] *= 1 + 1 / profit_c[rmode] / 20;
      }
    } else {
      long_levx_t[rmode] /= 1 + 1 / profit_c[rmode] / 20;
      shrt_levx_t[rmode] /= 1 + 1 / profit_c[rmode] / 20;
    }
    if (long_levx_t[rmode] > 0.9 / marginRate)
      long_levx_t[rmode] = 0.9 / marginRate;
    if (shrt_levx_t[rmode] > 0.9 / marginRate)
      shrt_levx_t[rmode] = 0.9 / marginRate;
    // final_leg_t[rmode] = tleg_id;
    var trmode = rmode;
    while (trmode > 0) {
      if (profit_t[trmode] > profit_t[trmode - 1]) {
        const tp0 = profit_t[trmode];
        profit_t[trmode] = profit_t[trmode - 1];
        profit_t[trmode - 1] = tp0;
        const tp1 = profit_c[trmode];
        profit_c[trmode] = profit_c[trmode - 1];
        profit_c[trmode - 1] = tp1;
        const mc = amacdc_t[trmode];
        amacdc_t[trmode] = amacdc_t[trmode - 1];
        amacdc_t[trmode - 1] = mc;
        const ac0 = amidps0c_t[trmode];
        amidps0c_t[trmode] = amidps0c_t[trmode - 1];
        amidps0c_t[trmode - 1] = ac0;
        const ac1 = amidps1c_t[trmode];
        amidps1c_t[trmode] = amidps1c_t[trmode - 1];
        amidps1c_t[trmode - 1] = ac1;

        const px0 = long_tpx_t[trmode];
        long_tpx_t[trmode] = long_tpx_t[trmode - 1];
        long_tpx_t[trmode - 1] = px0;
        const sx0 = long_slx_t[trmode];
        long_slx_t[trmode] = long_slx_t[trmode - 1];
        long_slx_t[trmode - 1] = sx0;
        const px1 = shrt_tpx_t[trmode];
        shrt_tpx_t[trmode] = shrt_tpx_t[trmode - 1];
        shrt_tpx_t[trmode - 1] = px1;
        const sx1 = shrt_slx_t[trmode];
        shrt_slx_t[trmode] = shrt_slx_t[trmode - 1];
        shrt_slx_t[trmode - 1] = sx1;

        // const final_leg_v = final_leg_t[trmode];
        // final_leg_t[trmode] = final_leg_t[trmode - 1];
        // final_leg_t[trmode - 1] = final_leg_v;

        const tx1 = long_levx_t[trmode];
        long_levx_t[trmode] = long_levx_t[trmode - 1];
        long_levx_t[trmode - 1] = tx1;
        const tx2 = shrt_levx_t[trmode];
        shrt_levx_t[trmode] = shrt_levx_t[trmode - 1];
        shrt_levx_t[trmode - 1] = tx2;
      } else break;
      trmode--;
      break_rank = 1;
    }
    if (trmode == 0) {
      fs.writeFileSync('amacd_max_pd0-' + pname,amacd_max_pd0.toExponential(9) + '\n');
      fs.writeFileSync('amacd_max_pd1-' + pname,amacd_max_pd1.toExponential(9) + '\n');
    }
    rmode = trmode;
    for (var i in prof_t) delete prof_t[i];
    console.log( ' laps ' + elapsed_days.toFixed()
      + ' amacdc ' + tamacdc.toFixed(2)
      + ' ' + tamidps0c.toFixed(1) + ' ' + tamidps1c.toFixed(1)
      + '   ---   ' + pname
    );
    console.log('     up',
      amacd_max_pd1.toExponential(2),
      amacd_min_pd1.toExponential(2),
      '(' + amacd_max_pd3.toExponential(2) + ')',
      tp_count1,sl_count1,
      ' -- ',tint1.toExponential(2),
      ' lexp ',(long_exposure/elapsed_days).toExponential(2)
    );
    console.log('     dn',
      amacd_max_pd0.toExponential(2),
      amacd_min_pd0.toExponential(2),
      '(' + amacd_max_pd2.toExponential(2) + ')',
      tp_count0,sl_count0,
      ' -- ',tint0.toExponential(2),
      ' sexp ',(shrt_exposure/elapsed_days).toExponential(2)
    );
    if (rmode == 0) {
      console.log('arsid',arsid.toExponential(3));
      console.log('   rsi ', 'longs',
        adrsi_long.toExponential(3),
        base_drsi_tp1.toExponential(3),
        base_drsi_sl1.toExponential(3) );
      console.log('   rsi ', 'shrts',
        adrsi_shrt.toExponential(3),
        base_drsi_tp0.toExponential(3),
        base_drsi_sl0.toExponential(3) );
      // base_drsi_sl0 *= 0.9;
      // base_drsi_sl1 *= 0.9;
      // base_drsi_tp0 *= 0.9;
      // base_drsi_tp1 *= 0.9;
      fs.writeFileSync('drsi_tp1-' + pname,base_drsi_tp1 + '\n');
      fs.writeFileSync('drsi_sl1-' + pname,base_drsi_sl1 + '\n');
      fs.writeFileSync('drsi_tp0-' + pname,base_drsi_tp0 + '\n');
      fs.writeFileSync('drsi_sl0-' + pname,base_drsi_sl0 + '\n');
    }
    smode = 0;
    var fstr = '';
    // for (var i = 0; i < final_leg_t.length; i++) {
    for (var i = 0; i < num_final; i++) {
      fstr += profit_c[i] + ' ' + profit_t[i].toExponential(9)
        + ' ' + long_levx_t[i].toExponential(9)
        + ' ' + amacdc_t[i].toExponential(9)
        + ' ' + amidps0c_t[i].toExponential(9)
        + ' ' + amidps1c_t[i].toExponential(9)
        + ' ' + long_tpx_t[i].toExponential(9)
        + ' ' + long_slx_t[i].toExponential(9)
        + ' ' + shrt_tpx_t[i].toExponential(9)
        + ' ' + shrt_slx_t[i].toExponential(9)
        + ' ' + shrt_levx_t[i].toExponential(9)
        // + ' ' + final_leg_t[i].join(' ')
        + '\n';

      var tstr = ' ' + i;
      while (tstr.length < 5) tstr += ' ';
      tstr += profit_c[i];
      while (tstr.length < 8) tstr += ' ';
      tstr += ' ' + profit_t[i].toExponential(2)
        + ' ' + long_levx_t[i].toExponential(2)
        + ' ' + shrt_levx_t[i].toExponential(2)
        + '  -- ' + amacdc_t[i].toExponential(2)
        + ' ' + amidps0c_t[i].toExponential(2)
        + ' ' + amidps1c_t[i].toExponential(2)
        + '  l ' + long_tpx_t[i].toExponential(2)
        + ' ' + long_slx_t[i].toExponential(2)
        + '  s ' + shrt_tpx_t[i].toExponential(2)
        + ' ' + shrt_slx_t[i].toExponential(2)
        ;
      console.log(tstr);
    }
    fs.writeFileSync('final_' + pname,fstr);

    rmode++;
    if (rmode >= num_final) return;
    if (break_rank == 1) rmode = 0;
    break_rank = 0;
    if (rmode == 0) {
      try {
        // fs.unlinkSync('ticks-comp-' + pname + '-' + final_leg_t[num_final - 1].join('') );
      } catch {
        /*
        console.log('couldnt unlink last',
          '../data-' + pname + '/ticks-comp-'
            + final_leg_t[num_final - 1].join('')
        ); */
      }
      return;
      // process.exit();
    }
    if ((rmode == num_final - 1)
      || (rmode == final_leg_t.length)
      || (profit_t[rmode] <= 0)
    ) {
      // levx_t[rmode] = 1;
      // levx_t[rmode] = levx_t[0] * (1 + (2*Math.random() - 1)/10);
      long_levx_t[rmode] = long_levx_t[0];
      shrt_levx_t[rmode] = shrt_levx_t[0];
      new_leg_flag = 1;
      profit_c[rmode] = 0;
      profit_t[rmode] = profit_t[0];
      const rand_x = Math.random();
      if ((rand_x < 0.2) || (profit_t[0] <= 0)) {
        amidps1c_t[rmode] = amidps1c_t[0] * 2 * Math.random();
        amidps0c_t[rmode] = amidps1c_t[rmode] * Math.random();
        amacdc_t[rmode] = amidps0c_t[rmode] * Math.random();
        long_tpx_t[rmode] = Math.random();
        long_slx_t[rmode] = Math.random();
        shrt_tpx_t[rmode] = Math.random();
        shrt_slx_t[rmode] = Math.random();
      } else if (rand_x < 0.4) {
        amidps1c_t[rmode] = amidps1c_t[0] * Math.random();
        amidps0c_t[rmode] = amidps1c_t[rmode] * Math.random();
        amacdc_t[rmode] = amidps0c_t[rmode] * Math.random();
        long_tpx_t[rmode] = Math.random();
        long_slx_t[rmode] = Math.random();
        shrt_tpx_t[rmode] = Math.random();
        shrt_slx_t[rmode] = Math.random();
      } else if (rand_x < 0.6) {
        amidps1c_t[rmode] = amidps1c_t[0] * (1 + (2*Math.random() - 1) / 10);
        amidps0c_t[rmode] = amidps0c_t[0] * (1 + (2*Math.random() - 1) / 10);
        amacdc_t[rmode] = amacdc_t[0] * (1 + (2*Math.random() - 1) / 10);
        long_tpx_t[rmode] = long_tpx_t[0] * (1 + (2 * Math.random() - 1) / 10);
        long_slx_t[rmode] = long_slx_t[0] * (1 + (2 * Math.random() - 1) / 10);
        shrt_tpx_t[rmode] = shrt_tpx_t[0] * (1 + (2 * Math.random() - 1) / 10);
        shrt_slx_t[rmode] = shrt_slx_t[0] * (1 + (2 * Math.random() - 1) / 10);
        long_levx_t[rmode] = long_levx_t[0] * (1 + (2 * Math.random() - 1) / 10);
        shrt_levx_t[rmode] = shrt_levx_t[0] * (1 + (2 * Math.random() - 1) / 10);
      } else if (rand_x < 0.8) {
        amidps1c_t[rmode] = amidps1c_t[0] * (1 + (2*Math.random() - 1) / 100);
        amidps0c_t[rmode] = amidps0c_t[0] * (1 + (2*Math.random() - 1) / 100);
        amacdc_t[rmode] = amacdc_t[0] * (1 + (2*Math.random() - 1) / 100);
        long_tpx_t[rmode] = long_tpx_t[0] * (1 + (2 * Math.random() - 1) / 100);
        long_slx_t[rmode] = long_slx_t[0] * (1 + (2 * Math.random() - 1) / 100);
        shrt_tpx_t[rmode] = shrt_tpx_t[0] * (1 + (2 * Math.random() - 1) / 100);
        shrt_slx_t[rmode] = shrt_slx_t[0] * (1 + (2 * Math.random() - 1) / 100);
        long_levx_t[rmode] = long_levx_t[0] * (1 + (2 * Math.random() - 1) / 100);
        shrt_levx_t[rmode] = shrt_levx_t[0] * (1 + (2 * Math.random() - 1) / 100);
      } else {
        amidps1c_t[rmode] = amidps1c_t[0];
        amidps0c_t[rmode] = amidps0c_t[0];
        amacdc_t[rmode] = amacdc_t[0];
        long_tpx_t[rmode] = long_tpx_t[0];
        long_slx_t[rmode] = long_slx_t[0];
        shrt_tpx_t[rmode] = shrt_tpx_t[0];
        shrt_slx_t[rmode] = shrt_slx_t[0];
        long_levx_t[rmode] = long_levx_t[0];
        shrt_levx_t[rmode] = shrt_levx_t[0];
        const xx = Math.random();
        if (xx < 0.1)
          amidps1c_t[rmode] = amidps1c_t[0] * (1 + (2*Math.random() - 1) / 10);
        else if (xx < 0.2)
          amidps0c_t[rmode] = amidps0c_t[0] * (1 + (2*Math.random() - 1) / 10);
        else if (xx < 0.3)
          amacdc_t[rmode] = amacdc_t[0] * (1 + (2*Math.random() - 1) / 10);
        else if (xx < 0.6) {
          long_tpx_t[rmode] = long_tpx_t[0] * (1 + (2 * Math.random() - 1) / 10);
          long_slx_t[rmode] = long_slx_t[0] * (1 + (2 * Math.random() - 1) / 10);
        } else if (xx < 0.9) {
          shrt_tpx_t[rmode] = shrt_tpx_t[0] * (1 + (2 * Math.random() - 1) / 10);
          shrt_slx_t[rmode] = shrt_slx_t[0] * (1 + (2 * Math.random() - 1) / 10);
        } else {
          long_levx_t[rmode] = long_levx_t[0] * (1 + (2 * Math.random() - 1) / 10);
          shrt_levx_t[rmode] = shrt_levx_t[0] * (1 + (2 * Math.random() - 1) / 10);
        }
      }
      tamidps1c = amidps1c_t[rmode];
      tamidps0c = amidps0c_t[rmode];
      tamacdc = amacdc_t[rmode];
      if (long_tpx_t[rmode] > 1) long_tpx_t[rmode] = 1;
      if (long_slx_t[rmode] > 1) long_slx_t[rmode] = 1;
      if (shrt_tpx_t[rmode] > 1) shrt_tpx_t[rmode] = 1;
      if (shrt_slx_t[rmode] > 1) shrt_slx_t[rmode] = 1;
      long_ttpx = long_tpx_t[rmode];
      long_tslx = long_slx_t[rmode];
      shrt_ttpx = shrt_tpx_t[rmode];
      shrt_tslx = shrt_slx_t[rmode];
      long_tlevx = long_levx_t[rmode];
      shrt_tlevx = shrt_levx_t[rmode];
      /*
      tleg_id = [];
      const rand_x = Math.random();
      if ((rand_x < 0.6) || (profit_t[0] <= 0)) {
        for (var i = 0; i < num_strats; i++) {
          const mod_leg =
// c_type == 3 ? (Math.random() * 4e-2 * current_ask).toExponential(3) :
            (Math.random() * 3e-2 * current_ask).toFixed(precission)
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
      */
      /*
      console.log(tleg_id);
      for (var i = 0; i < num_strats; i++) {
        dir_t[tleg_id[i]] = 0;
        maxb_t[tleg_id[i]] = 0;
        maxa_t[tleg_id[i]] = 0;
      } */
    } else {
      long_tlevx = long_levx_t[rmode];
      shrt_tlevx = shrt_levx_t[rmode];
      tamidps0c = amidps0c_t[rmode];
      tamidps1c = amidps1c_t[rmode];
      tamacdc = amacdc_t[rmode];
      long_ttpx = long_tpx_t[rmode];
      long_tslx = long_slx_t[rmode];
      shrt_ttpx = shrt_tpx_t[rmode];
      shrt_tslx = shrt_slx_t[rmode];
      new_leg_flag = 0;
      /*
      tleg_id = final_leg_t[rmode];
      for (var i = 0; i < num_strats; i++) {
        dir_t[tleg_id[i]] = 0;
        maxb_t[tleg_id[i]] = 0;
        maxa_t[tleg_id[i]] = 0;
      } */
    }
    continue;
  }
}
var long_exposure = 0;
var shrt_exposure = 0;
var elapsed_days = 0;
var oelapsed_days = 0;
var long_rate_x = 0;
var short_rate_x = 0;
var dayStr = '';
var odayStr = '';
var minStr = '';
var ominStr = '';

var amacd = 0;
var amidps0 = 0;
var amidps1 = 0;
var tamacdc = amacdc_t[0];
var tamidps0c = amidps0c_t[0];
var tamidps1c = amidps1c_t[0];

var long_ttpx = long_tpx_t[0];
var long_tslx = long_slx_t[0];
var shrt_ttpx = shrt_tpx_t[0];
var shrt_tslx = shrt_slx_t[0];

var amacd_max_pd0 = 0;
var amacd_max_pd1 = 0;
var amacd_max_pd2 = 0;
var amacd_max_pd3 = 0;
var amacd_min_pd0 = 0;
var amacd_min_pd1 = 0;
var trade_flag = 0;

var macd_key = 0;
var macd_negc = 0;
var macd_posc = 0;
var macd_negc0 = 0;
var macd_posc0 = 0;
var macd_price = 0;
var macd_max_pd = 0;
var macd_min_pd = 0;
var macd_min_pd_save = 0;


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
    + (ho1 - ho0) / 24
    + (mi1 - mi0) / 24 / 60
    + (si1 - si0) / 24 / 60 / 60 / 1000
    ;

    /*
  if (Math.abs(elapsed_days - oelapsed_days) > max_bad) {
    max_bad = Math.abs(elapsed_days - oelapsed_days);
    console.log('sucks',add_fn_flag,t,elapsed_days,oelapsed_days);
  } */
}
var max_bad = 0;

async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}


var obase_pos = 0;
var base_price = 0;
var base_profit = 0;
var obase_profit = 0;
var adbase_profit = 0;
var aadbase_profit = 0;
var base_profit2 = 0;
var base_pos = 0;
var base_count = 0;

var base_drsi = 0;
var base_drsi_tp0 = Number(fs.readFileSync('drsi_tp0-' + pname,'utf8')); // 0;
var base_drsi_sl0 = Number(fs.readFileSync('drsi_sl0-' + pname,'utf8')); // 0;
var base_drsi_tp1 = Number(fs.readFileSync('drsi_tp1-' + pname,'utf8')); // 0;
var base_drsi_sl1 = Number(fs.readFileSync('drsi_sl1-' + pname,'utf8')); // 0;
var adrsi_long = 0;
var adrsi_shrt = 0;


var tp_count0 = 0;
var tp_count1 = 0;
var sl_count0 = 0;
var sl_count1 = 0;
var midp = 0;
var odir_key = '';
var odir_tic = 0;
var odir_ti = 0;
var last_time = '';
var max_ds = 0;
var max_dl = 0;
var max_price = 0;
var current_time = '';
async function doTickLine(line) {
  const lst = comp_fn_flag + add_fn_flag == 0
    ? line.split(' ').join('').split(',')
    : line.split(' ')
    ;
  // var lst = line.split(' ');
  if (lst.length < 2) return;
  /*
  if (add_fn_flag == 1) {
    console.log('hree',pname);
    console.log(lst);
    process.exit();
  } */
  if (lst[0].length > 17) return;
  current_time = lst[0];
  current_bid = Number(lst[1]);
  if (add_fn_flag == 1) current_ask = Number(lst[2]);
  else current_ask = Number((current_bid + aspread).toFixed(precission));
  midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) {
    omidp = midp;
    amidps0 = midp;
    amidps1 = midp;
  }
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  omidp = midp;

  if (starting_month == '') {
    starting_month = current_time;
    await setStartDate(current_time);
  } else await elapseDays(current_time);

  if (elapsed_days > oelapsed_days) {
    if (base_pos > 0) long_exposure += elapsed_days - oelapsed_days;
    if (base_pos < 0) shrt_exposure += elapsed_days - oelapsed_days;
  }

  if (dmidp > 0) dmidps_bull += dmidp;
  else dmidps_bear += dmidp;
  dmidpss += dmidps;
  // minStr = current_time.slice(0,14); // these are seconds now
  var rsi0,rsi1;
  if (abulls0 == 0) rsi0 = 0;
  else rsi0 = 1 / (1 - abears0 / abulls0);
  if (abulls1 == 0) rsi1 = 0;
  else rsi1 = 1 / (1 - abears1 / abulls1);
  minStr = current_time.slice(0,12);
  if (minStr != ominStr) {
    if (comp_fn_flag == 0)
      fs.appendFileSync(comp_fn + '-0', current_time + ' ' + current_bid + '\n');

    abulls0 *= 1 - 1 / tamidps0c;
    abulls0 += dmidps_bull / tamidps0c;
    abulls1 *= 1 - 1 / tamidps1c;
    abulls1 += dmidps_bull / tamidps1c;

    abears0 *= 1 - 1 / tamidps0c;
    abears0 += dmidps_bear / tamidps0c;
    abears1 *= 1 - 1 / tamidps1c;
    abears1 += dmidps_bear / tamidps1c;

    // const rsi = dmidps_bull == 0 ? 0 : 1 / (1 - dmidps_bear / dmidps_bull);
    if (abulls0 == 0) rsi0 = 0;
    else rsi0 = 1 / (1 - abears0 / abulls0);
    if (abulls1 == 0) rsi1 = 0;
    else rsi1 = 1 / (1 - abears1 / abulls1);
    const rsid = rsi0 - rsi1;
    // const rsi0 = abulls0 == 0 ? 0 : 1 / (1 - abears0 / abulls0);
    // const rsi1 = abulls1 == 0 ? 0 : 1 / (1 - abears1 / abulls1);
    arsid *= 1 - 1 / tamacdc;
    arsid += rsid / tamacdc;
    dmidps_bull = 0;
    dmidps_bear = 0;

    amidps0 *= 1 - 1 / tamidps0c;
    amidps0 += midp / tamidps0c;
    amidps1 *= 1 - 1 / tamidps1c;
    amidps1 += midp / tamidps1c;
    const macd = amidps0 - amidps1;
    amacd *= 1 - 1 / tamacdc;
    amacd += macd / tamacdc;
    if (macd > amacd) {
      if (macd_key == -1) {
        if (base_pos < 0) {
          base_profit += (base_price - current_ask) / current_ask;
          balance += base_size * (base_price - current_ask);
          tint0 += base_size * (base_price - current_ask);
          base_count++;
          base_pos = 0;
        }
        if (base_pos == 0) {
          base_pos = 1;
          base_price = current_ask;
          base_size = long_tlevx * balance / current_ask;
          // base_drsi = rsid - arsid;
          base_drsi = rsi0;
        }

        macd_negc++;
        const d = macd_negc; // Math.ceil(macd_negc/2);
        amacd_max_pd0 *= 1 - 1 / d;
        amacd_max_pd0 += macd_max_pd / d;
        amacd_min_pd0 *= 1 - 1 / d;
        // if (macd_max_pd < amacd_max_pd0 * ttpx) // hit tp
          amacd_min_pd0 += macd_min_pd_save / d;
        // else amacd_min_pd0 += macd_min_pd / d;
        if (macd_min_pd_save > amacd_min_pd0) {
          macd_negc0++;
          amacd_max_pd2 *= 1 - 1 / macd_negc0;
          amacd_max_pd2 += macd_max_pd / macd_negc0;
        }
        macd_price = midp;
        macd_max_pd = 0;
        macd_min_pd = 0;
        macd_min_pd_save = 0;
        trade_flag = 1;
      }
      if (macd_price > 0) {
        if (midp - macd_price > macd_max_pd) {
          macd_max_pd = midp - macd_price;
          macd_min_pd_save = macd_min_pd;
        }
        if (midp - macd_price < macd_min_pd) {
          macd_min_pd = midp - macd_price;
        }
      }
      macd_key = 1;
    }
    if (macd < amacd) {
      if (macd_key == 1) {
        if (base_pos == 0) {
          base_pos = -1;
          base_price = current_bid;
          base_size = shrt_tlevx * balance / current_bid;
          // base_drsi = rsid - arsid;
          base_drsi = rsi0;
        }

        macd_posc++;
        const d = macd_posc; // Math.ceil(macd_posc/2);
        amacd_max_pd1 *= 1 - 1 / d;
        amacd_max_pd1 += macd_max_pd / d;
        amacd_min_pd1 *= 1 - 1 / d;
        // if (macd_max_pd > amacd_max_pd1 * ttpx) // hit tp
          amacd_min_pd1 += macd_min_pd_save / d;
        // else amacd_min_pd1 += macd_min_pd / d;
        if (macd_min_pd_save < amacd_min_pd1) {
          macd_posc0++;
          amacd_max_pd3 *= 1 - 1 / macd_posc0;
          amacd_max_pd3 += macd_max_pd / macd_posc0;
        }
        macd_price = midp;
        macd_max_pd = 0;
        macd_min_pd = 0;
        macd_min_pd_save = 0;
        trade_flag = 1;
      }
      if (macd_price > 0) {
        if (midp - macd_price < macd_max_pd) {
          macd_max_pd = midp - macd_price;
          macd_min_pd_save = macd_min_pd;
        }
        if (midp - macd_price > macd_min_pd) {
          macd_min_pd = midp - macd_price;
        }
      }
      macd_key = -1;
    }
    dmidpss = 0;
    ominStr = minStr;
  }
  if (base_pos > 0) {
    if (elapsed_days > oelapsed_days)
      long_rate_x += long_tlevx * balance * (elapsed_days - oelapsed_days);
    var nav = balance + base_size * (current_bid - base_price);
    if (nav <= 0) { nav = 0; balance = 0; base_size = 0; }
    if (nav > max_nav) { max_nav = nav; }
    if (max_nav > 0)
      if ((max_nav - nav) / max_nav > max_dd) {
        max_dd = (max_nav - nav) / max_nav;
        max_dd_lap = elapsed_days;
      }

    if (current_bid > base_price + amacd_max_pd1 * long_ttpx) {
      base_profit += (current_bid - base_price) / base_price;
      balance += base_size * (current_bid - base_price);
      tint1 += base_size * (current_bid - base_price);
      base_count++;
      base_pos = 0;
      tp_count1++;
      if (rmode == 0) {
        adrsi_long *= 1 - 1 / (tp_count1 + sl_count1);
        adrsi_long += base_drsi / (tp_count1 + sl_count1);
        base_drsi_tp1 *= 1 - 1 / tp_count1;
        // base_drsi_tp1 += (base_drsi - adrsi_long) / tp_count1;
        base_drsi_tp1 += base_drsi / tp_count1;
      }
    }
    if (current_ask < base_price - amacd_max_pd1 * long_tslx) {
      const cb = Number((base_price - amacd_max_pd1 * long_tslx - aspread)
        .toFixed(precission));
      base_profit += (cb - base_price) / base_price;
      balance += base_size * (cb - base_price);
      tint1 += base_size * (cb - base_price);
      base_count++;
      sl_count1++;
      base_pos = 0;
      if (rmode == 0) {
        adrsi_long *= 1 - 1 / (tp_count1 + sl_count1);
        adrsi_long += base_drsi / (tp_count1 + sl_count1);
        base_drsi_sl1 *= 1 - 1 / sl_count1;
        // base_drsi_sl1 += (base_drsi - adrsi_long) / sl_count1;
        base_drsi_sl1 += base_drsi / sl_count1;
      }
    }
  } else if (base_pos < 0) {
    if (elapsed_days > oelapsed_days)
      short_rate_x += shrt_tlevx * balance * (elapsed_days - oelapsed_days);
    var nav = balance + base_size * (base_price - current_ask);
    if (nav <= 0) { nav = 0; balance = 0; base_size = 0; }
    if (nav > max_nav) { max_nav = nav; }
    if (max_nav > 0)
      if ((max_nav - nav) / max_nav > max_dd) {
        max_dd = (max_nav - nav) / max_nav;
        max_dd_lap = elapsed_days;
      }

    if (current_ask < base_price + amacd_max_pd0 * shrt_ttpx) {
      base_profit += (base_price - current_ask) / current_ask;
      balance += base_size * (base_price - current_ask);
      tint0 += base_size * (base_price - current_ask);
      base_count++;
      base_pos = 0;
      tp_count0++;
      if (rmode == 0) {
        adrsi_shrt *= 1 - 1 / (tp_count0 + sl_count0);
        adrsi_shrt += base_drsi / (tp_count0 + sl_count0);
        base_drsi_tp0 *= 1 - 1 / tp_count0;
        // base_drsi_tp0 += (base_drsi - adrsi_shrt) / tp_count0;
        base_drsi_tp0 += base_drsi / tp_count0;
      }
    }
    if (current_bid > base_price - amacd_max_pd0 * shrt_tslx) {
      const ca = Number((base_price - amacd_max_pd0 * shrt_tslx + aspread)
        .toFixed(precission));
      base_profit += (base_price - ca) / ca;
      balance += base_size * (base_price - ca);
      tint0 += base_size * (base_price - ca);
      base_count++;
      sl_count0++;
      base_pos = 0;
      if (rmode == 0) {
        adrsi_shrt *= 1 - 1 / (tp_count0 + sl_count0);
        adrsi_shrt += base_drsi / (tp_count0 + sl_count0);
        base_drsi_sl0 *= 1 - 1 / sl_count0;
        // base_drsi_sl0 += (base_drsi - adrsi_shrt) / sl_count0;
        base_drsi_sl0 += base_drsi / sl_count0;
      }
    }
    /*
  } else if (trade_flag == 1) { // base_pos == 0
    if (macd_key == 1) {
      // console.log('macd1',midp,macd_price,amacd_min_pd1.toExponential(3));
      if (midp < macd_price + amacd_min_pd1) {
        base_pos = 1;
        base_price = current_ask;
        base_size = tlevx * balance / current_ask;
        base_drsi = (rsi0 - rsi1) - arsi;
        trade_flag = 0;
      }
    }
    if (macd_key == -1) {
      // console.log('macd0',midp,macd_price,amacd_min_pd0.toExponential(3));
      if (midp > macd_price + amacd_min_pd0) {
        base_pos = -1;
        base_price = current_bid;
        base_size = tlevx * balance / current_bid;
        base_drsi = (rsi0 - rsi1) - arsi;
        trade_flag = 0;
      }
    } */
  }

  dayStr = current_time.slice(0,8);
  if (dayStr != odayStr) {
    balance += short_rate_x * shortRate;
    balance += long_rate_x * longRate;
    tint0 += short_rate_x * shortRate;
    tint1 += long_rate_x * longRate;
    short_rate_x = 0;
    long_rate_x = 0;
    odayStr = dayStr;

    if (elapsed_days > 1) {
      const d = base_profit - obase_profit;
      adbase_profit *= 1 - 1 / elapsed_days;
      adbase_profit += d / elapsed_days;
      // const ad = Math.abs(d - adbase_profit);
      aadbase_profit *= 1 - 1 / elapsed_days;
      // aadbase_profit += ad / elapsed_days;
      if (base_pos > 0) {
        const nav = balance + base_size * (current_bid - base_price);
        if (nav > max_nav) max_nav = nav;
        const dd = (max_nav - nav) / max_nav;
        aadbase_profit += dd / elapsed_days;
      } else if (base_pos < 0) {
        const nav = balance + base_size * (base_price - current_ask);
        if (nav > max_nav) max_nav = nav;
        const dd = (max_nav - nav) / max_nav;
        aadbase_profit += dd / elapsed_days;
      } else {
        const nav = balance;
        if (nav > max_nav) max_nav = nav;
        const dd = (max_nav - nav) / max_nav;
        aadbase_profit += dd / elapsed_days;
      }
      obase_profit = base_profit;
    }
  }
  if (elapsed_days > oelapsed_days) oelapsed_days = elapsed_days;

  /*
  if (balance != obalance) {
    if (rmode == 0) fs.appendFileSync('profile-' + pname + '-0',
      elapsed_days.toExponential(9)
      + ' ' + balance.toExponential(5)
      + ' ' + base_profit.toExponential(5)
      + '\n'
    );
    obalance = balance;
  }
  */
  return;
  if (odir_tic > 0) {
    if (typeof prof_t[odir_key] == 'undefined')
      prof_t[odir_key] = 0;
    prof_t[odir_key] += dmidp;
  }

  var dir_key = '';
  var init_flag = 0;
  for (var i = 0; i < num_strats; i++) {
    const t = tleg_id[i];
    await doDir(t);
    if (dir_t[t] == 1) dir_key += '1';
    else if (dir_t[t] == -1) dir_key += '2';
    else { dir_key += '0'; init_flag = 1; }
  }
  if (dir_t[tleg_id[num_strats-1]] != odir_ti) {
    odir_ti = dir_t[tleg_id[num_strats-1]];
    odir_tic++;
  }
  if (odir_tic > 2) {
    if (starting_month == '') {
      starting_month = current_time;
      await setStartDate(current_time);
    } else await elapseDays(current_time);
  }

  if (dir_key != odir_key) {
    max_ds = 0;
    max_dl = 0;
    max_price = midp;
    if (odir_tic > 2)
      await doTrade(dir_key);
    if (comp_fn_flag == 0)
      fs.appendFileSync(comp_fn + '-0', current_time + ' ' + current_bid + '\n');
  }
  if (comp_fn_flag == 0) {
    if (max_price != 0) {
      if (max_price - midp > max_ds) {
        max_ds = max_price - midp;
        // fs.appendFileSync(comp_fn + '-0', current_time + ' ' + current_bid + '\n');
      }
      if (midp - max_price > max_dl) {
        max_dl = midp - max_price;
        // fs.appendFileSync(comp_fn + '-0', current_time + ' ' + current_bid + '\n');
      }
    }
  }
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

doMain();

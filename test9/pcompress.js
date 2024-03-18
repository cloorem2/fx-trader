const fs = require('fs');
const fsPromises = require('fs/promises');
const https = require('https');
const exec = require('child_process').exec;

const num_strats = 1;
const num_final = 9;
const targv = process.argv;
for (const i of targv.shift()) if (i.indexOf('rdist.js') >= 0) break;
targv.shift();
// const pname = 'EUR_AUD';
const pname = targv.shift();
var precission = 5;
if (pname.indexOf('JPY') >= 0) precission = 3;

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
    levx_t[tc] = Number(ii[2]);
    final_leg_t[tc] = ii.slice(3, 3 + num_strats);
    tc++;
  }
} catch {}
var tlevx = levx_t[0];
tleg_id = final_leg_t[0];
tleg_id = [ 0 ];
for (var t of tleg_id) {
  dir_t[t] = 0;
  maxb_t[t] = 0;
  maxa_t[t] = 0;
  maxb_n[t] = '';
  maxa_n[t] = '';
}

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

    // do this from within the data dir
    for (const f of fs.readdirSync('../data-' + pname))
      if (f.indexOf('H') == 0) {
        const { stdout } = await sh('cd ../data-' + pname + ';unzip ' + f);
      }
    for (const f of fs.readdirSync('../data-' + pname)) {
      if (f.indexOf('.csv') >= 0) {
        const tick_file = await fsPromises.open('../data-' + pname + '/' + f);
        for await (const line of tick_file.readLines())
          await doTickLine(line);
      }
    }
    const { stdout } = await sh('rm ../data-' + pname + '/DAT_ASCII_*');

    // const tick_file = await fsPromises.open('../data-' + pname + '/ticks-hist');
    // for await (const line of tick_file.readLines())
      // await doTickLine(line);

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
  // const lst = line.split(' ');
  const lst = line.split(' ').join('').split(',');
  if (lst.length < 3) return;
  current_bid = Number(lst[1]);
  // current_ask = Number(lst[2]);
  current_ask = Number((current_bid + aspread).toFixed(precission));
  midp = (current_ask + current_bid) / 2;
  if (omidp !== omidp) omidp = midp;
  dmidp = (midp - omidp) / omidp;
  dmidps = Math.abs(dmidp);
  omidp = midp;

  for (var i = 0; i < num_strats; i++) {
    const t = tleg_id[i];
    await doDir(t,lst[0]);
  }
}

async function doDir(tag,time) {
  const nleg = Number(tag);
  if (maxb_t[tag] == 0) {
    maxb_t[tag] = current_bid;
    maxa_t[tag] = current_ask;
    maxb_n[tag] = time;
    maxa_n[tag] = time;
  }
  if (dir_t[tag] == 0) {
    if (current_bid > maxb_t[tag]) {
      maxb_t[tag] = current_bid;
      maxb_n[tag] = time;
      if (maxb_t[tag] - maxa_t[tag] > nleg) dir_t[tag] = 1;
    }
    if (current_ask < maxa_t[tag]) {
      maxa_t[tag] = current_ask;
      maxa_n[tag] = time;
      if (maxb_t[tag] - maxa_t[tag] > nleg) dir_t[tag] = -1;
    }
  } else if (dir_t[tag] == 1) {
    if (current_bid > maxb_t[tag]) {
      maxb_t[tag] = current_bid;
      maxb_n[tag] = time;
    }
    if (current_ask < maxb_t[tag] - nleg) {
      fs.appendFileSync('ticks-hist-comp',maxb_n[tag] + ' ' + maxb_t[tag] + '\n');
      maxa_t[tag] = current_ask;
      maxa_n[tag] = time;
      dir_t[tag] = -1;
    }
  } else if (dir_t[tag] == -1) {
    if (current_ask < maxa_t[tag]) {
      maxa_t[tag] = current_ask;
      maxa_n[tag] = time;
    }
    if (current_bid > maxa_t[tag] + nleg) {
      const b = (Number(maxa_t[tag]) - aspread).toFixed(precission);
      fs.appendFileSync('ticks-hist-comp',maxa_n[tag] + ' ' + b + '\n');
      maxb_t[tag] = current_bid;
      maxb_n[tag] = time;
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

/*
try { fs.renameSync('err_profile','err_profile0');
} catch {}
try { fs.renameSync('profit_profile','profit_profile0');
} catch {}
try { fs.renameSync('dist','dist0');
} catch {}
try { fs.renameSync('ppro','ppro0');
} catch {}
*/
doMain();

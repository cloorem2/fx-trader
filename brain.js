const fs = require('fs');
const https = require('https');
const api_key = 'Bearer ' + fs.readFileSync('../oanda-api-key','utf8');
const account_id = fs.readFileSync('../oanda-account-id','utf8');
const stream_path = '/v3/accounts/' + account_id
  + '/pricing/stream?instruments=EUR_USD';
var options = {
  host: 'stream-fxtrade.oanda.com',
  path: stream_path,
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  },
};
var maxb = Number(fs.readFileSync('maxb','utf8'));
var maxa = Number(fs.readFileSync('maxa','utf8'));
var apvar = Number(fs.readFileSync('apvar','utf8'));
var corr0 = Number(fs.readFileSync('corr0','utf8'));
var opvar = Number(fs.readFileSync('opvar','utf8'));
var aspread = Number(fs.readFileSync('aspread','utf8'));
var chunk_save = '';

var linec = 0;
var omidp = 0;
var odmidp = Number(fs.readFileSync('odmidp','utf8'));

var dmid_brain = [0,0,0,0,0,0];
const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
const dmid_brain_lines = dmid_brain_data.split('\n');
for (var i in dmid_brain) {
  dmid_brain[i] = Number(dmid_brain_lines[i]);
}

var pvar_brain = [0,0,0,0,0,0];
try {
  const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
  const pvar_brain_lines = pvar_brain_data.split('\n');
  for (var i in pvar_brain) {
    pvar_brain[i] = Number(pvar_brain_lines[i]);
  }
} catch {}

var v = [0,0,0,0,0,0],nv = [0,0,0,0,0,0];
const v_data = fs.readFileSync('v','utf8');
const v_lines = v_data.split('\n');
for (var i in v) {
  v[i] = Number(v_lines[i]); }

var aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
var aadmid_err = Number(fs.readFileSync('aadmid_err','utf8'));
var aapvar_err = Number(fs.readFileSync('aapvar_err','utf8'));

// var amidp = 0;
// var amidp_d = 100;

var out_count = 0;
var run_type = 0;
console.log('doMain ' + new Date());
async function doMain() {
  // while (true) {
    var tcount = 0;
    // amidp = 0;
    while (true) {
      run_type = 0;
      if (Math.random() > 0.5) run_type = 1;
      for (var i in v) { v[i] = 1; nv[i] = 0; }
      omidp = 0;
      // apvar = Number(fs.readFileSync('apvar','utf8'));
      // aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
      var plog_data = fs.readFileSync('plog','utf8');
      var plog_lines = plog_data.split('\n');
      var cut = 0;
      while (true) {
        cut = Math.random() * plog_lines.length;
        const x = ((plog_lines.length - cut) / 2000)**2;
        if (Math.random() < Math.exp(-x)) break;
      }
      for (var i in plog_lines) {
        if (i < cut) continue;
        await doLine(plog_lines[i]);
      }
      if (tcount++ == 1000) break;
    }
    fs.writeFileSync('aspread',aspread.toExponential(9) + '\n');
    fs.writeFileSync('apvar',apvar.toExponential(9) + '\n');
    fs.writeFileSync('aadmidp',aadmidp.toExponential(9) + '\n');

    var tstr = '';
    for (var i in nv) tstr += dmid_brain[i].toExponential(9) + '\n';
    fs.writeFileSync('dmid_brain',tstr);
    fs.writeFileSync('aadmid_err',aadmid_err.toExponential(9) + '\n');
    tstr = '';
    for (var i in nv)
      tstr += pvar_brain[i].toExponential(9) + '\n';
    fs.writeFileSync('pvar_brain',tstr);
    fs.writeFileSync('aapvar_err',aapvar_err.toExponential(9) + '\n');

    out_count++;
    if (out_count == 19) {
      console.log('dmid_err pvar_err  aspread  apvar aadmidp');
      out_count = 0;
    }
    console.log((aadmid_err/aadmidp).toExponential(3)
      + ' ' + (aapvar_err/apvar).toExponential(3)
      + ' ' + aspread.toExponential(3)
      + ' ' + apvar.toExponential(3)
      + ' ' + aadmidp.toExponential(3)
    );
  // }
  mainTimeout = setTimeout(() => { doMain(); }, 1_000_000);
}

async function doLine(line) {
  var lst = line.split(' ');
  if (lst.length < 3) return;
  const spread = Number(lst[2]);
  aspread *= 0.9999;
  aspread += spread / 10000;

  const pvar = Number(lst[1]);
  apvar *= 0.9999;
  apvar += pvar / 10000;

  var midp = 0;
  if (run_type == 0) midp = Number(lst[0]);
  else midp = 1 / Number(lst[0]);
  // const midp = run_type == 0 ? Number(lst[0]) : 1 / Number(lst[0]);
  if (omidp == 0) omidp = midp;
  const dmidp = (midp - omidp) / omidp;
  aadmidp *= 0.9999;
  aadmidp += Math.abs(dmidp) / 10000;

  /*
  if (amidp0 == 0) {
    amidp0 = midp;
    amidp1 = midp;
    amidp2 = midp;
  }
  if (amidp0c + 1 < amidp_d * 1.01) amidp0c++;
  else amidp0c = amidp_d * 1.01;
  amidp0 *= 1.0 - 1.0 / amidp0c;
  amidp0 += midp / amidp0c;
  if (amidp1c + 1 < amidp_d) amidp1c++;
  else amidp1c = amidp_d;
  amidp1 *= 1.0 - 1.0 / amidp1c;
  amidp1 += midp / amidp1c;
  if (amidp2c + 1 < amidp_d / 1.01) amidp2c++;
  else amidp2c = amidp_d / 1.01;
  amidp2 *= 1.0 - 1.0 / amidp2c;
  amidp2 += midp / amidp2c;
  */

  var pdmidp = 0;
  for (var i in nv) pdmidp += dmid_brain[i] * nv[i];
  const dmid_err = dmidp - pdmidp;
  for (var i in nv) dmid_brain[i] += dmid_err * nv[i] / 1e7;
  aadmid_err *= 1 - 1 / 1e7;
  aadmid_err += Math.abs(dmid_err) / 1e7;

  var pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * nv[i];
  const pvar_err = pvar - pvarp;
  for (var i in nv) pvar_brain[i] += pvar_err * nv[i] / 1e7;
  aapvar_err *= 1 - 1 / 1e7;
  aapvar_err += Math.abs(pvar_err) / 1e7;

  v[5] = v[4];
  v[4] = v[3];
  v[3] = pvar / apvar;
  v[2] = 1;
  v[1] = v[0];
  v[0] = dmidp / aadmidp;
  var vs = 0;
  for (var i in v) vs += v[i] * v[i];
  vs = Math.sqrt(vs);
  for (var i in v) nv[i] = v[i] / vs;

  omidp = midp;
}

var mainTimeout = setTimeout(() => { doMain(); }, 1000);
// doMain();

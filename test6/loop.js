const fs = require('fs');
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;

const num_strats = 5;
const pair_l = fs.readFileSync('active_pairs','utf8').split('\n');
const out_t = {};
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

const prof_l = [];
async function doMain() {
  while (true) {
    // for (const pname of pair_l) {
    const x_len = pair_l.length * Math.random();
    for (var i = 0; i < x_len; i++) {
      const pname = pair_l[i];
      if (pname == '') continue;
      const { stdout } = await sh('node rdist.js ' + pname);
      console.log(stdout);

      const fd = fs.readFileSync('final_' + pname,'utf8').split('\n');
      out_t[pname] = fd[0];
      // console.log('        --------------------');
      // for (const ii in out_t) {
      for (var iii = 0; iii < pair_l.length; iii++) {
        const ii = pair_l[iii];
        if (ii == '') continue;
        if (typeof out_t[ii] == 'undefined') continue;
        var tstr = ii + ' -- ';
        const ttstr = out_t[ii].split(' ');
        tstr += ttstr[0];
        while (tstr.length < 14) tstr += ' ';
        tstr += ' ' + Number(ttstr[1]).toExponential(3);
        tstr += ' ' + Number(ttstr[2]).toExponential(3);
        tstr += ' -- ' + ttstr.slice(3,3 + num_strats).join(' ');
        console.log(tstr);
        if (ii == pname) prof_l[i] = Number(ttstr[1]);
      }
      for (var ii = i; ii > 0; ii--) {
        if (prof_l[ii] > prof_l[ii - 1]) {
          const t = prof_l[ii - 1];
          prof_l[ii - 1] = prof_l[ii];
          prof_l[ii] = t;
          const n = pair_l[ii - 1];
          pair_l[ii - 1] = pair_l[ii];
          pair_l[ii] = n;
        }
      }
      // if (Math.random() < (1 - 1 / Math.pow(2,i+1)) / 2) break;
    }
    fs.writeFileSync('active_pairs',pair_l.join('\n'));
  }
}

doMain();

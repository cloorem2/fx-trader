const fs = require('fs');
const execSync = require('child_process').execSync;

const pair_l = fs.readFileSync('active_pairs','utf8').split('\n');
var currentYM = '';
async function doMain() {
  for (const pname of pair_l) {
    if (pname == '') continue;
    const d0 = JSON.parse(fs.readFileSync('test5/last_price','utf8'));
    const t0 = d0.time.split('T');
    const t1 = t0[0].split('-');
    currentYM = t1[0] + t1[1];

    const tpname = pname.split('_').join('');
    var ndone = 0;
    var tYM = currentYM;
    var nM = Number(t1[1]);
    var nY = Number(t1[0]);
    while (true) {
      try {
        console.log('wget http://www.histdata.com/HISTDATA_COM_ASCII_'
          + tpname + '_T' + tYM + '.zip');
        const d1 = execSync('wget http://www.histdata.com/HISTDATA_COM_ASCII_'
          + tpname + '_T' + tYM + '.zip','utf8').toString();
        console.log('d is',d1);
      } catch {}

      nM--;
      if (nM == 0) { nM = 12; nY--; }
      tYM = nY.toFixed() + nM.toFixed();

      ndone++;
      if (ndone == 3) break;
    }
    // try {
      // const d = execSync('ls ticks-' + pname + '*','utf8').toString();
    // } catch { continue; }
  }
}

doMain();

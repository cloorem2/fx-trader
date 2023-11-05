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

const summary_path = '/v3/accounts/' + account_id;
const sum_options = {
  host: 'api-fxtrade.oanda.com',
  path: summary_path,
  headers: {
    "Content-Type": "application/json",
    "Authorization": api_key,
  },
};

var maxb = Number(fs.readFileSync('maxb','utf8'));
var maxa = Number(fs.readFileSync('maxa','utf8'));
var apvar = Number(fs.readFileSync('apvar','utf8'));
var aspread = Number(fs.readFileSync('aspread','utf8'));
var chunk_save = '';

var sdelay = Number(fs.readFileSync('sdelay','utf8'));
var oh0 = Number(fs.readFileSync('oh0','utf8'));
var om0 = Number(fs.readFileSync('om0','utf8'));
var os0 = Number(fs.readFileSync('os0','utf8'));

var linec = 0;
var dmid_brain = [0,0,0,0,0,0];
const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
const dmid_brain_lines = dmid_brain_data.split('\n');
for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

var pvar_brain = [0,0,0,0,0,0];
const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
const pvar_brain_lines = pvar_brain_data.split('\n');
for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);

var v = [0,0,0,0,0,0],nv = [0,0,0,0,0,0];
var apvar = Number(fs.readFileSync('apvar','utf8'));
var pvarp = apvar;
var aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
var pdmidp = aadmidp;
var sellm = Number(fs.readFileSync('sellm','utf8'));
var levx = Number(fs.readFileSync('opt_levx','utf8'));
var pos = Number(fs.readFileSync('pos','utf8'));
var nav = Number(fs.readFileSync('nav','utf8'));

function doSummary() {
  // console.log('doSummary');
  var clean_chunk = '';
  var req = https.request(sum_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (sum_chunk) {
      const lines = sum_chunk.split('\n');
      clean_chunk += lines.join('');
    });
    res.on('end', function() {
      // console.log(clean_chunk);
      try {
        const data = JSON.parse(clean_chunk);
        nav = Number(data.account.NAV);
        fs.writeFileSync('nav',nav.toExponential(9) + '\n');
        const positions = data.account.positions;
        for (var ii in positions) {
          // console.log(positions[ii]);
          if (positions[ii].instrument == 'EUR_USD') {
            pos += Number(positions[ii].long.units);
            pos -= Number(positions[ii].short.units);
          }
        }
        fs.writeFileSync('pos',pos.toFixed() + '\n');
        // console.log('total pos ' + pos);
      } catch (e) { console.log(e); }
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write('data\n');
  req.end();
}

function doMain() {
  console.log('doMain ' + new Date());
  var req = https.request(options, function(res) {
    // console.log('status: ' + res.statusCode);
    // console.log('headers: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      var lines = chunk.split('\n');
      for (var i in lines) {
        if (lines[i].length == 0) continue;
        // console.log(lines[i].length);
        // console.log(lines[i]);
        try {
          const data = JSON.parse(lines[i]);
          doChunk(data);
        } catch (err) {
          console.log(err);
          console.log('bad chunk ' + lines[i]);
        }
      }
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write('data\n');
  req.write('data\n');
  req.end();
}

function doChunk(data) {
  clearTimeout(mainTimeout);
  mainTimeout = setTimeout(() => { doMain(); }, 100000);
  if (data.type != 'PRICE') { return; }
  const b = Number(data.bids[0].price);
  const a = Number(data.asks[0].price);
  if (b > maxb) { maxb = b;
    fs.writeFileSync('maxb',maxb.toFixed(6) + '\n');
  }
  if (a < maxa) { maxa = a;
    fs.writeFileSync('maxa',maxa.toFixed(6) + '\n');
  }

  const [t0,t1] = data.time.split('T');
  const [t2] = t1.split('Z');
  const [h0,m0,s0] = t2.split(':');
  const [s1] = s0.split('.');

  const nh0 = Number(h0);
  const nm0 = Number(m0);
  const ns0 = Number(s0);
  const th0 = nh0 < oh0 ? nh0 + 24 - oh0 : nh0 - oh0;
  // const tm0 = nm0 < om0 ? nm0 + 60 - om0 : nm0 - om0;
  // const ts0 = ns0 < os0 ? ns0 + 60 - os0 : ns0 - os0;
  // const tdelay = th0 * 60 * 60 + tm0 * 60 + ts0;
  const tdelay = th0 * 60 * 60 + (nm0 - om0) * 60 + (ns0 - os0);
  if (tdelay >= sdelay) doMadeDelay(a,b,nh0,nm0,ns0);
}

async function doMadeDelay( a,b, nh0,nm0,ns0 ) {
  const spread = 2 * (a - b) / (a + b);
  const midp = (maxb + maxa) / 2;
  const pvar = 2 * (maxb - maxa) / (maxb + maxa);
  const pstr = midp.toFixed(6)
    + ' ' + pvar.toExponential(6)
    + ' ' + spread.toExponential(6)
    + '\n';
  fs.appendFileSync('plog',pstr);

  apvar = Number(fs.readFileSync('apvar','utf8'));
  aspread = Number(fs.readFileSync('aspread','utf8'));
  if (apvar < 2 * aspread) sdelay *= 1.001;
  else sdelay *= 0.999;
  fs.writeFileSync('sdelay',sdelay.toExponential(9) + '\n');

  if (linec == 0) {
    console.log('    pvar    delay    bids    asks    nav    pos    utc');
  }
  linec++; if (linec == 9) linec = 0;
  var tstr =
    pvar.toExponential(3)
    + ' ' + sdelay.toExponential(3)
    + ' ' + maxb.toFixed(5) + ' ' + maxa.toFixed(5)
    + ' ' + nav.toFixed(5)
    + ' ' + pos.toFixed(0)
    + ' ' + nh0.toFixed()
    + ':' + nm0.toFixed()
    + ':' + ns0.toFixed()
    ;
  console.log(tstr);
  fs.appendFileSync('log',tstr + '\n');
  maxb = b; fs.writeFileSync('maxb',maxb.toFixed(6) + '\n');
  maxa = a; fs.writeFileSync('maxa',maxa.toFixed(6) + '\n');
  oh0 = nh0; fs.writeFileSync('oh0',oh0.toFixed() + '\n');
  om0 = nm0; fs.writeFileSync('om0',om0.toFixed() + '\n');
  os0 = ns0; fs.writeFileSync('os0',os0.toFixed() + '\n');

  await doTrade(midp,pvar);
  doSummary();
}

async function doTrade(midp,pvar) {
  v[5] = v[4];
  v[4] = v[3];
  v[3] = pvarp / apvar;
  v[2] = 1;
  v[1] = v[0];
  v[0] = pdmidp / aadmidp;
  var vs = 0;
  for (var i in v) vs += v[i] * v[i];
  vs = Math.sqrt(vs);
  for (var i in v) nv[i] = v[i] / vs;

  pdmidp = 0;
  for (var i in nv) pdmidp += dmid_brain[i] * nv[i];
  pvarp = 0;
  for (var i in nv) pvarp += pvar_brain[i] * nv[i];
  if (pvarp < 0) pvarp = 0;

  const tmidp = midp * pdmidp + midp;
  const sellp = Number((tmidp + tmidp * pvarp / 2 + sellm).toFixed(5));
  const buyp = Number((tmidp - tmidp * pvarp / 2 - sellm).toFixed(5));
  if (Math.abs(sellp - buyp) < 1e-4) return;

  var buy_size = levx * 50 * nav / midp - pos;
  if (buy_size < 0) buy_size = 0;
  var sell_size = levx * 50 * nav / midp + pos;
  if (sell_size < 0) sell_size = 0;
  if (pdmidp > 0) sell_size = 0;
  else buy_size = 0;
  buy_size = Number(buy_size.toFixed());
  sell_size = Number(sell_size.toFixed());
  if (buy_size > 0) await doBuy(buyp,buy_size);
  if (sell_size > 0) await doSell(sellp,sell_size);
  await readFiles();
}

async function doBuy(buyp,buy_size) {
  console.log('doBuy  ' + buyp + ' ' + buy_size);
}

async function doSell(sellp,sell_size) {
  console.log('doSell ' + sellp + ' ' + sell_size);
}

async function readFiles() {
  apvar = Number(fs.readFileSync('apvar','utf8'));
  aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
  sellm = Number(fs.readFileSync('sellm','utf8'));
  levx = Number(fs.readFileSync('opt_levx','utf8'));

  aadmid_err = Number(fs.readFileSync('aadmid_err','utf8'));
  aapvar_err = Number(fs.readFileSync('aapvar_err','utf8'));
  aspread = Number(fs.readFileSync('aspread','utf8'));

  const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
  const dmid_brain_lines = dmid_brain_data.split('\n');
  for (var i in dmid_brain) dmid_brain[i] = Number(dmid_brain_lines[i]);

  const pvar_brain_data = fs.readFileSync('pvar_brain','utf8');
  const pvar_brain_lines = pvar_brain_data.split('\n');
  for (var i in pvar_brain) pvar_brain[i] = Number(pvar_brain_lines[i]);
}

readFiles();
doMain();
var mainTimeout = setTimeout(() => { doMain(); }, 100000);

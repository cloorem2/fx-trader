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

var sdelay = Number(fs.readFileSync('sdelay','utf8'));
var oh0 = Number(fs.readFileSync('oh0','utf8'));
var om0 = Number(fs.readFileSync('om0','utf8'));
var os0 = Number(fs.readFileSync('os0','utf8'));

var linec = 0;
var omidp = Number(fs.readFileSync('omidp','utf8'));
var odmidp = Number(fs.readFileSync('odmidp','utf8'));
var ospread = Number(fs.readFileSync('ospread','utf8'));

var dmid_brain = [0,0,0,0,0];
const dmid_brain_data = fs.readFileSync('dmid_brain','utf8');
const dmid_brain_lines = dmid_brain_data.split('\n');
for (var i in dmid_brain) {
  dmid_brain[i] = Number(dmid_brain_lines[i]);
}
var v = [0,0,0,0,0],nv = [0,0,0,0,0];
const v_data = fs.readFileSync('v','utf8');
const v_lines = v_data.split('\n');
for (var i in v) { v[i] = Number(v_lines[i]); }

var aadmidp = Number(fs.readFileSync('aadmidp','utf8'));
var aadmid_err = Number(fs.readFileSync('aadmid_err','utf8'));

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

  const [t0,t1] = data.time.split('T');
  const [t2] = t1.split('Z');
  const [h0,m0,s0] = t2.split(':');
  const [s1] = s0.split('.');

  const nh0 = Number(h0);
  const nm0 = Number(m0);
  const ns0 = Number(s0);
  const th0 = nh0 < oh0 ? nh0 + 24 - oh0 : nh0 - oh0;
  const tm0 = nm0 < om0 ? nm0 + 60 - om0 : nm0 - om0;
  const ts0 = ns0 < os0 ? ns0 + 60 - os0 : ns0 - os0;
  const tdelay = th0 * 60 * 60 + tm0 * 60 + ts0;
  if (tdelay >= sdelay) doMadeDelay(a,b,nh0,nm0,ns0);
  if (b > maxb) { maxb = b;
    fs.writeFileSync('maxb',maxb.toFixed(6) + '\n');
  }
  if (a < maxa) { maxa = a;
    fs.writeFileSync('maxa',maxa.toFixed(6) + '\n');
  }
}

function doMadeDelay( a,b, nh0,nm0,ns0 ) {
  const spread = 2 * (a - b) / (a + b);
  const midp = (maxb + maxa) / 2;
  const dmidp = (midp - omidp) / omidp;
  aadmidp *= 0.99;
  aadmidp += Math.abs(dmidp) / 100;
  fs.writeFileSync('aadmidp',aadmidp.toExponential(9) + '\n');

  const pvar = 2 * (maxb - maxa) / (maxb + maxa);
  const pstr = midp.toFixed(6) + ' ' + pvar.toExponential(6) + '\n';
  fs.appendFileSync('plog',pstr);

  if (ospread < 3 * aspread) doGoodSpread(dmidp,pvar);

  omidp = midp;
  fs.writeFileSync('omidp',omidp.toFixed(6) + '\n');
  odmidp = dmidp;
  fs.writeFileSync('odmidp',odmidp.toExponential(9) + '\n');

  opvar = pvar;
  fs.writeFileSync('opvar',opvar.toExponential(9) + '\n');
  if (linec == 0) {
    console.log('   apvar     pvar       c0  aadmidp  dmid_err  aspread    delay    bids    asks');
  }
  linec++; if (linec == 9) linec = 0;
  var tstr = apvar.toExponential(3)
    + ' ' + pvar.toExponential(3)
    + ' ' + corr0.toExponential(3)
    + ' ' + aadmidp.toExponential(3)
    + ' ' + aadmid_err.toExponential(3)
    + ' ' + aspread.toExponential(3)
    + ' ' + sdelay.toExponential(3)
    + ' ' + maxb.toFixed(5) + ' ' + maxa.toFixed(5);
  if (ospread < 2 * aspread) tstr += ' *';
  console.log(tstr);
  fs.appendFileSync('log',tstr + '\n');
  maxb = b; fs.writeFileSync('maxb',maxb.toFixed(6) + '\n');
  maxa = a; fs.writeFileSync('maxa',maxa.toFixed(6) + '\n');
  oh0 = nh0; fs.writeFileSync('oh0',oh0.toFixed() + '\n');
  om0 = nm0; fs.writeFileSync('om0',om0.toFixed() + '\n');
  os0 = ns0; fs.writeFileSync('os0',os0.toFixed() + '\n');

  ospread = spread;
  fs.writeFileSync('ospread',ospread.toExponential(9) + '\n');
  aspread *= 0.99999;
  aspread += spread / 100000;
  fs.writeFileSync('aspread',aspread.toExponential(9) + '\n');
}

function doGoodSpread(dmidp,pvar) {
  v[4] = v[3];
  v[3] = opvar / apvar;
  v[2] = 1;
  v[1] = v[0];
  v[0] = odmidp / aadmidp;
  var tstr = '';
  for (var i in v) tstr += v[i].toExponential(9) + '\n';
  fs.writeFileSync('v',tstr);

  var vs = 0;
  for (var i in v) vs += v[i] * v[i];
  vs = Math.sqrt(vs);
  for (var i in v) nv[i] = v[i] / vs;

  var pdmidp = 0;
  for (var i in nv) pdmidp += dmid_brain[i] * nv[i];
  const dmid_err = dmidp - pdmidp;
  tstr = '';
  for (var i in nv) {
    dmid_brain[i] += dmid_err * nv[i] / 1e3;
    tstr += dmid_brain[i].toExponential(9) + '\n';
  }
  fs.writeFileSync('dmid_brain',tstr);
  aadmid_err *= 0.9;
  aadmid_err += Math.abs(dmid_err) / 10;
  fs.writeFileSync('aadmid_err',aadmid_err.toExponential(9) + '\n');

  apvar *= 0.99;
  apvar += pvar / 100;
  fs.writeFileSync('apvar',apvar.toExponential(9) + '\n');
  if (apvar < 2 * aspread) sdelay *= 1.01;
  else sdelay *= 0.99;
  fs.writeFileSync('sdelay',sdelay.toExponential(9) + '\n');
  const c0 = (opvar - apvar) * (pvar - apvar);
  corr0 *= 0.9;
  corr0 += c0 / 10;
  fs.writeFileSync('corr0',corr0.toExponential(9) + '\n');
}

doMain();
var mainTimeout = setTimeout(() => { doMain(); }, 100000);

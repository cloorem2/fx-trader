var v = [0,0,0];
var i = 0;
while (i < 1000000) {
  var j = Number((2 * Math.random() - 0.5).toFixed());
  v[j]++;
  i++;
}
console.log(v);


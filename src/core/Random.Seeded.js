function mulberry32(a) {
  var out = function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  out.getSeed = function() {
    return a;
  };
  out.setSeed = function(A) {
    a = A;
  };
  out.setStringSeed = function(str) {
    str = str.replace(/[^0-9a-z]/g,'').substr(0,12);
    if(str.length === 0)str = '1';
    a = parseInt(str,36);
  };
  out.getStringSeed = function() {
    return a.toString(36);
  };
  return out;
}

Math.random.seeded = mulberry32(Math.floor(Math.random()*4294967296));
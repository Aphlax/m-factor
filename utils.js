

/** Seeded random generator (simple fast counter 32) */
export function Random(a, b, c, d, skipShuffle) {
  this.a = a >>> 0;
  this.b = b >>> 0;
  this.c = c >>> 0;
  this.d = d >>> 0;
  if (skipShuffle) return;
  for (let i = 0; i < 15; i++) {
    this.nextInt();
  }
}

Random.prototype.nextInt = function() {
  const a = this.a >>> 0;
  const b = this.b >>> 0;
  let c = this.c >>> 0;
  let d = this.d >>> 0;
  let t = (a + b) | 0;
  this.a = b ^ b >>> 9;
  this.b = c + (c << 3) | 0;
  c = (c << 21 | c >>> 11);
  this.d = d = d + 1 | 0;
  t = t + d | 0;
  this.c = c + t | 0;
  return (t >>> 0);
};

Random.prototype.next = function() {
  return this.nextInt() / 4294967296;
};

Random.prototype.nextSeed = function() {
  return [this.nextInt(), this.nextInt(), this.nextInt(), this.nextInt()];
};

Random.prototype.getState = function() {
  return [this.a, this.b, this.c, this.d];
};

Random.fromState = function(state) {
  return new Random(
    state[0], state[1], state[2], state[3],
    /* skipShuffle */ true);
};

/** Cyrb128 hash function to generate a seed from a string. */
Random.fromString = function(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return new Random(h1>>>0, h2>>>0, h3>>>0, h4>>>0);
};

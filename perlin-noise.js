import {createRand} from './utils.js';

function PerlinNoise(seed, scale, octaves, freq, amp) {
  this.scale = scale ?? 0.01;
  this.octaves = octaves ?? 5;
  this.freq = freq ?? 2;
  this.amp = amp ?? 0.5;
  let rand = createRand(...seed);
  const permutation = this.permutation =
      new Array(512).fill(0).map((a, i) => i);
  for (let i = permutation.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * i), t = permutation[i];
    permutation[i] = permutation[j];
    permutation[j] = t;
  }
  permutation.push(...permutation);
}

PerlinNoise.prototype.get = function(x0, y0) {
  const {scale, octaves, freq, amp, permutation} = this;
  let noise = 0;
  for (let i = 0; i < octaves; i++) {
    const s = scale * freq**i;
    const x = x0 * s, y = y0 * s;
    
    const x_ = Math.floor(x) & 511;
    const y_ = Math.floor(y) & 511;
    const dx = x - Math.floor(x);
    const dy = y - Math.floor(y);
  
    const bl = permutation[permutation[x_] + y_];
    const br = permutation[permutation[x_ + 1] + y_];
    const tl = permutation[permutation[x_] + y_ + 1];
    const tr = permutation[permutation[x_ + 1] + y_ + 1];
  
    const a = dx * (bl&0x1 ? -1 : 1) +
        dy * (bl&0x2 ? -1 : 1);
    const b = (dx - 1) * (br&0x1 ? -1 : 1) +
        dy * (br&0x2 ? -1 : 1);
    const c = dx * (tl&0x1 ? -1 : 1) +
        (dy - 1) * (tl&0x2 ? -1 : 1);
    const d = (dx - 1) * (tr&0x1 ? -1 : 1) +
        (dy - 1) * (tr&0x2 ? -1 : 1);
    
    const fx = fade(dx), fy = fade(dy);
    noise += lerp(fy, lerp(fx, a, b), lerp(fx, c, d)) *
        amp**i;
  }
  return (noise + 1) / 2;
}

function lerp(t, a, b) {
  return a + t * (b - a);
}

function fade(t) {
  return ((6 * t - 15) * t + 10) * t * t * t;
}

export {PerlinNoise};

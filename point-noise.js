

function PointNoise(seed, dist, density) {
  this.seed = seed;
  this.size = dist / Math.sqrt(2);
  this.dist = dist;
  this.density = density;
}

PointNoise.prototype.get = function(x, y, w, h) {
  const {size, dist, density, seed} = this;
  const minX = Math.floor(x / size) - 1;
  const maxX = Math.ceil((x + w) / size) + 1;
  const minY = Math.floor(y / size) - 1;
  const maxY = Math.ceil((y + h) / size) + 1;
  
  const grid = [];
  for (let i = 0; i <= (maxX - minX); i++) {
    grid[i] = [];
    for (let j = 0; j <= (maxY - minY); j++) {
      const x = minX + i, y = minY + j;
      if (hash(x, y, seed, 0) > density) continue;
      grid[i][j] = {
        x: (x + hash(x, y, seed, 1)) * size,
        y: (y + hash(x, y, seed, 2)) * size,
        rank: hash(x, y, seed, 3),
        value: hash(x, y, seed, 4),
      };
    }
  }
  
  const sqDist = dist**2;
  const result = [];
  for (let i = 1; i < (maxX - minX); i++) {
    gridLoop:
    for (let j = 1; j < (maxY - minY); j++) {
      const cell = grid[i][j];
      if (!cell) continue;
      const {x: px, y: py, rank} = cell;
      if (px < x || px >= x + w ||
          py < y || py >= y + h) continue;
      for (let n = 0; n < 9; n++) {
        const oi = i + Math.floor(n / 3) - 1, oj = j + (n % 3) - 1;
        if ((oi == i && oj == j) || !grid[oi][oj]) continue;
        const {x: ox, y: oy, rank: oRank} = grid[oi][oj];
        if ((px - ox)**2 + (py - oy)**2 < sqDist &&
            rank < oRank) {
          continue gridLoop;
        }
      }
      result.push(cell);
    }
  }
  return result;
};

function hash(a, b, c, d) {
  const v = Math.sin(72.556 * a + 38.912 * b + 26.721 * c + 4.332 * d) * 31484.7936;
  return v - Math.floor(v); 
}

export {PointNoise};

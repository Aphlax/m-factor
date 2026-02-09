import {PerlinNoise} from './perlin-noise.js';
import {PointNoise} from './point-noise.js';
import {createRand, createSeedRand} from './utils.js';
import {S} from './sprite-pool.js';
import {RESOURCE_NAMES, resourceSprite} from './entity-properties.js';

const SEED = [0x9E3779B9, 0x243F6A88, 0xB7E15162];

const DEFAULT_TERRAIN = S.dirt2;
const TERRAIN = [
  {id: S.dirt1, s: 0.005, p: 0.98},
  {id: S.dirt3, s: 0.005, p: 0.98},
  {id: S.dirt4, s: 0.005, p: 0.94},
  {id: S.dirt5, s: 0.0065, p: 0.97},
  {id: S.dirt6, s: 0.006, p: 0.95},
  {id: S.dirt7, s: 0.008, p: 0.95},
  {id: S.dryDirt, s: 0.005, p: 0.99},
  {id: S.grass1, s: 0.005, p: 0.7},
  {id: S.grass2, s: 0.005, p: 0.7},
  {id: S.grass3, s: 0.006, p: 0.7},
  {id: S.grass4, s: 0.007, p: 0.85},
  {id: S.sand1, s: 0.005, p: 0.9},
  {id: S.sand2, s: 0.005, p: 0.8},
  {id: S.sand3, s: 0.005, p: 0.8},
  {id: S.redDesert0, s: 0.008, p: 0.85},
  {id: S.redDesert1, s: 0.005, p: 0.7},
  {id: S.redDesert2, s: 0.005, p: 0.6},
  {id: S.redDesert3, s: 0.005, p: 0.5},
];

const MAP_COLOR = [
  {start: S.dirt1, end: S.grass1, color: "#604520"},
  {start: S.grass1, end: S.sand1, color: "#403810"},
  {start: S.sand1, end: S.redDesert0, color: "#906540"},
  {start: S.redDesert0, end: S.water, color: "#584020"},
  {start: S.water, end: S.deepWater, color: "#305060"},
  {start: S.deepWater, end: S.deepWater + 8, color: "#204050"},
];

const RESOURCES = [
  {
    id: RESOURCE_NAMES.iron,
    sprite: S.ironOre,
    startingDist: 40,
    frequency: 1,
    size: 1,
  },
  {
    id: RESOURCE_NAMES.copper,
    sprite: S.copperOre,
    startingDist: 37,
    frequency: 1,
    size: 0.95,
  },
  {
    id: RESOURCE_NAMES.coal,
    sprite: S.coal,
    startingDist: 50,
    frequency: 0.9,
    size: 0.92,
  },
  {
    id: RESOURCE_NAMES.stone,
    sprite: S.stone,
    startingDist: 80,
    frequency: 0.75,
    size: 0.85,
  },
  {
    id: RESOURCE_NAMES.crudeOil,
    sprite: S.crudeOil,
    startingDist: 500,
    frequency: 0.6,
    size: 1.15,
  },
];

const TREES = [
  [
    [S.tree01a, S.tree01aShadow],
    [S.tree01b, S.tree01bShadow],
    [S.tree01c, S.tree01cShadow],
    [S.tree01d, S.tree01dShadow],
    [S.tree01e, S.tree01eShadow],
  ],
  [
    [S.tree02a, S.tree02aShadow],
    [S.tree02b, S.tree02bShadow],
    [S.tree02c, S.tree02cShadow],
    [S.tree02d, S.tree02dShadow],
    [S.tree02e, S.tree02eShadow],
  ],
  [
    [S.tree03a, S.tree03aShadow],
    [S.tree03b, S.tree03bShadow],
    [S.tree03c, S.tree03cShadow],
    [S.tree03d, S.tree03dShadow],
    [S.tree03e, S.tree03eShadow],
  ],
  [
    [S.tree04a, S.tree04aShadow],
    [S.tree04b, S.tree04bShadow],
    [S.tree04c, S.tree04cShadow],
    [S.tree04d, S.tree04dShadow],
    [S.tree04e, S.tree04eShadow],
  ],
];

const TOTAL_RESOURCE_FREQUENCY =
    RESOURCES.map(r => r.frequency)
    .reduce((a, b) => a + b);
const CUMULATIVE_RESOURCE_FREQUENCY =
    RESOURCES.map(r => r.frequency / TOTAL_RESOURCE_FREQUENCY)
    .reduce((agg, a) => agg.push((agg[agg.length - 1] ?? 0) + a) && agg, []);

const RESOURCE_COLORS = new Map([
  [RESOURCE_NAMES.iron, "#9999AA"],
  [RESOURCE_NAMES.copper, "#BB6600"],
  [RESOURCE_NAMES.coal, "#000800"],
  [RESOURCE_NAMES.stone, "#AA8855"],
  [RESOURCE_NAMES.crudeOil, "#DD00DD"],
]);

const PATCH_LIMITS = [4**2, 0.2, 5.5**2, 0.4, 8**2, 0.6, 10**2, 1.2, 10.1**2, 2];
const LAKE_LIMITS = [130**2, 1.5, 160**2, 0.8, 560**2, 0.75, 1500**2, 0.75, 2000**2, 0.7];
const RESOURCE_FREQUENCY = [150**2, 0, 151**2, 1, 3000**2, 0.25];
const RESOURCE_SIZE = [100**2, 1, 500**2, 1.2, 8000**2, 2.4];
const RESOURCE_AMOUNT = [100**2, 1, 250**2, 1.35, 2000**2, 8, 8000**2, 80, 30000**2, 240];


function MapGenerator(seed) {
  this.seed = seed;
}

MapGenerator.prototype.initialize = function() {
  const randSeed = createSeedRand(...SEED, this.seed);
  this.lakeNoise = new PerlinNoise(randSeed(),
      0.00743, 5, 2, 0.5);
  this.terrainNoises = TERRAIN.map(t =>
      new PerlinNoise(randSeed(), t.s, 5, 2, 0.5));
  const rand = createRand(...randSeed());
  this.tileOffsets = new Array(32).fill(0).map(() =>
      new Array(32).fill(0).map(() => Math.floor(rand() * 16)));
  this.starterLakePos =
      createStarterPos(rand, 85, 15);
  this.resources = [];
  for (let r of RESOURCES) {
    this.resources.push({
        ...r,
        pos: createStarterPos(rand, r.startingDist, 50,
            this.starterLakePos, this.resources.map(r => r.pos)),
      });
  }
  this.resourcePointNoise = new PointNoise(rand(), 60, 0.04);
  this.resourceNoise = new PerlinNoise(randSeed(),
      0.025, 5, 2, 0.65)
  this.crudeOilNoise = new PointNoise(rand(), 4, 0.1);
  this.treePointNoise = new PointNoise(rand(), 2, 0.8);
  this.treeNoise = new PerlinNoise(randSeed());
}

MapGenerator.prototype.generateTiles = function (cx, cy) {
  const tiles = new Array(32).fill(0).map(a => []);
  for (let i = 0; i < 32; i++) {
    tileLoop:
    for (let j = 0; j < 32; j++) {
      const x = cx * 32 + i, y = cy * 32 + j;
      const tile = this.lake(x, y) + (this.tileOffsets[i][j] & 7);
      if (tile) {
        tiles[i].push(tile);
        continue;
      }
      
      for (let k in TERRAIN) {
        if (this.terrainNoises[k].get(x, y) < TERRAIN[k].p) continue;
        tiles[i].push(TERRAIN[k].id + this.tileOffsets[i][j]);
        continue tileLoop;
      }
      
      tiles[i].push(DEFAULT_TERRAIN + this.tileOffsets[i][j]);
    }
  }
  return tiles;
}

MapGenerator.prototype.lake = function(x, y) {
  const d = x**2 + y**2;
  let lake = 0;
  if (d <= 150**2) {
    const {x: px, y: py} = this.starterLakePos;
    lake = this.lakeNoise.get(x * 2 + 1000, y * 2.1) -
        sqIp(((x - px)**2 + (y - py)**2) / 5**2, PATCH_LIMITS);
  } else {
    lake = this.lakeNoise.get(x, y) -
        sqIp(d, LAKE_LIMITS);
  }
  
  if (lake > -0.05) {
    if (lake < 0) {
      if (this.lakeNoise.get(x * 0.7 + 100, y * 0.7) > 0.4 - lake * 5) {
        return S.sand1;
      }
    } else {
      if (lake > 0.1)
        return S.deepWater;
      else
        return S.water;
    }
  }
}

MapGenerator.prototype.generateResources = function (cx, cy, tiles) {
  const resourcePoints = this.resourcePointNoise.get(cx * 32 - 60, cy * 32 - 60, 152, 152);
  const crudeOilPoints = this.crudeOilNoise.get(cx * 32, cy * 32, 32, 32);
  const resources = [];
  for (let k = 0; ; k++) {
    let px, py, res, sqPatchDist;
    if (k < resourcePoints.length) {
      const {x: ppx, y: ppy, value} = resourcePoints[k];
      px = ppx; py = ppy;
      sqPatchDist = px**2 + py**2;
      if (sqPatchDist < 100**2 && k < resourcePoints.length) continue;
      const freq = sqIp(sqPatchDist, RESOURCE_FREQUENCY);
      if (value > freq) continue;
      let i = -1;
      while (CUMULATIVE_RESOURCE_FREQUENCY[++i] < value / freq);
      res = RESOURCES[i];
      if (res.id == RESOURCE_NAMES.crudeOil &&
          sqPatchDist < res.startingDist**2) continue;
    } else {
      if ((cx * 32 + 16)**2 + (cy * 32 + 16)**2 > 150**2) break;
      const k_ = k - resourcePoints.length;
      if (k_ >= this.resources.length) break;
      res = this.resources[k_];
      px = res.pos.x; py = res.pos.y;
      sqPatchDist = px**2 + py**2;
    }
    
    const patchSize = Math.min(60, 25 * res.size * sqIp(sqPatchDist, RESOURCE_SIZE));
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        if (tiles[i][j] >= S.water) continue;
        const x = cx * 32 + i, y = cy * 32 + j;
        const dist = ((x - px)**2 + (y - py)**2)**0.5;
        if (dist > patchSize) continue;
        
        if (res.id == RESOURCE_NAMES.crudeOil) {
          let hit = false;
          for (let {x: ox, y: oy, value: oValue} of crudeOilPoints) {
            if (Math.floor(ox) != x || Math.floor(oy) != y) continue;
            if (oValue < sqIp(dist**1.08 / patchSize * 10**2, PATCH_LIMITS)) break;
            hit = true;
            break;
          }
          if (!hit) continue;
          const patchAmount = sqIp(sqPatchDist, RESOURCE_AMOUNT);
          const amount = Math.floor(
              res.size * ((patchAmount + 2)**0.6) +
              this.tileOffsets[j][i] * 0.2);
          if (!resources[i]) resources[i] = [];
          if (resources[i][j]?.amount >= amount) continue;
          resources[i][j] = {
            id: res.id, x, y, amount,
            sprite: res.sprite + (this.tileOffsets[i][j] & 3),
          };
          continue;
        }
        
        const randomOffset = res.id * 555;
        const score = this.resourceNoise.get(x + randomOffset, y) -
            sqIp(dist / patchSize * 10**2, PATCH_LIMITS);
        if (score < 0) continue;
        const patchAmount = sqIp(sqPatchDist, RESOURCE_AMOUNT);
        const amount = Math.floor(
            (Math.min(score, 0.3) / 0.3) *
            res.size * patchAmount * 500 +
            this.tileOffsets[j][i] * 1.5 + 1);
        if (!resources[i]) resources[i] = [];
        if (resources[i][j]?.amount >= amount) continue;
        resources[i][j] = {
          id: res.id,
          x, y, amount,
          sprite: res.sprite + resourceSprite(amount) +
              (this.tileOffsets[i][j] & 7) * 8,
        };
      }
    }
  }
  return resources.some(a => a?.length) ? resources : undefined;
}

MapGenerator.prototype.generateTrees = function(cx, cy, tiles, resources) {
  const treePoints = this.treePointNoise.get(cx * 32, cy * 32, 32, 32);
  const result = [], temp = [];
  treeLoop:
  for (let {x, y, value} of treePoints) {
    let x_ = Math.round(x - cx * 32), y_ = Math.round(y - cy * 32);
    if ((x_ && y_ && tiles[x_ - 1][y_ - 1] >= S.water) ||
        (x_ && y_ < 32 && tiles[x_ - 1][y_] >= S.water) ||
        (x_ < 32 && y_ && tiles[x_][y_ - 1] >= S.water) ||
        (x_ < 32 && y_ < 32 && tiles[x_][y_] >= S.water)) continue;
    if ((x_ && y_ && resources?.[x_ - 1]?.[y_ - 1]) ||
        (x_ && resources?.[x_ - 1]?.[y_]) ||
        (y_ && resources?.[x_]?.[y_ - 1]) ||
        (resources?.[x_]?.[y_])) continue;
    const score = this.treeNoise.get(x, y);
    const limit = (score - 0.6) * 2.5;
    if (value > limit) continue;
    temp.length = 0; let total = 0;
    for (let i = 0; i < TREES.length; i++) {
      const v = this.treeNoise.get(x / 20 + i * 1000, y / 20 + 1000);
      const vv = v**10;
      temp.push(vv);
      total += vv;
    }
    let i = 0, v = value / limit * total;
    while (true) {
      if (v < temp[i]) break;
      v -= temp[i];
      if (++i == temp.length) continue treeLoop;
    }
    const sprites = TREES[i][Math.floor(v / temp[i] * TREES[i].length)];
    if (!sprites) continue;
    result.push({x, y, sprites});
  }
  return result;
};

function createStarterPos(rand, r, dr, lake, others) {
  while(true) {
    let phi = rand() * 2 * Math.PI, a = r + (2 * rand() - 1) * dr;
    const pos = {x: Math.cos(phi) * a, y: Math.sin(phi) * a};
    if (lake && dist(pos, lake) < 60) {
      continue;
    }
    if (others && others.some(o => dist(pos, o) < 40)) {
      continue;
    }
    return pos;
  }
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
}

/** Interpolation using square distances. */
function sqIp(d, limits) {
  for (let i = 0; i < limits.length; i += 2) {
    if (d < limits[i]) {
      if (!i) {
        return limits[1];
      } else {
        return limits[i - 1] +
            (d - limits[i - 2]) / (limits[i] - limits[i - 2]) *
            (limits[i + 1] - limits[i - 1]);
      }
      break;
    } else if (i == limits.length - 2) {
      return limits[i + 1];
    }
  }
}

function TestGenerator() {}
TestGenerator.prototype.initialize = function() {};
TestGenerator.prototype.generateTiles = function() {
  return new Array(32).fill(0).map(_ => new Array(32).fill(DEFAULT_TERRAIN));
};
TestGenerator.prototype.generateResources = function() {};


export {MapGenerator, TestGenerator, MAP_COLOR, RESOURCE_COLORS};

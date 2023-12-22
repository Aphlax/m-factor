import {PerlinNoise} from './perlin-noise.js';
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

const RESOURCES = [
  {
    id: RESOURCE_NAMES.iron,
    sprite: S.ironOre,
    startingDist: 40,
    startingSize: 0.5,
    scale: 0.0093,
    limit: 0.927,
    quantity: 1,
  },
  {
    id: RESOURCE_NAMES.copper,
    sprite: S.copperOre,
    startingDist: 37,
    startingSize: 0.44,
    scale: 0.0103,
    limit: 0.934,
    quantity: 0.95,
  },
  {
    id: RESOURCE_NAMES.coal,
    sprite: S.coal,
    startingDist: 50,
    startingSize: 0.46,
    scale: 0.0112,
    limit: 0.938,
    quantity: 0.92,
  },
  {
    id: RESOURCE_NAMES.stone,
    sprite: S.stone,
    startingDist: 80,
    startingSize: 0.33,
    scale: 0.01405,
    limit: 0.947,
    quantity: 0.85,
  },
];

const starterLimit = dist => dist <= 20 ? 0.4 :
    dist <= 40 ? 0.4 + (dist - 20) / 100 :
    dist <= 60 ? 0.6 + (dist - 40) / 33 : 2;
const resourceLimit = (dist, limit) => dist <= 100 ? 2 :
    dist <= 170 ? 1.3 - (dist - 100) / 70 * (1.3 - limit) :
    limit;
const lakeLimit = dist => dist <= 150 ? 2 :
    dist <= 160 ? 1.2 - (dist - 150) / 25 :
    dist <= 560 ? 0.8 - (dist - 170) / 2000 :
    dist <= 1500 ? 0.6 :
    dist <= 2000 ? 0.6 - (dist - 1500) / 5000 :
    0.5;

function MapGenerator() {}

MapGenerator.prototype.initialize = function(seed) {
  const randSeed = createSeedRand(...SEED, seed);
  this.lakeNoise = new PerlinNoise(randSeed(),
      0.00743, 5, 2, 0.5);
  this.terrainNoises = TERRAIN.map(t =>
      new PerlinNoise(randSeed(), t.s, 5, 2, 0.5));
  const rand = createRand(...randSeed());
  this.tileOffsets = new Array(32).fill(0).map(() =>
      new Array(32).fill(0).map(() => Math.floor(rand() * 16)));
  this.starterLakePos =
      createStarterPos(rand, 70, 30);
  this.resources = [];
  for (let r of RESOURCES) {
    this.resources.push({
        ...r,
        noise: new PerlinNoise(randSeed(),
            r.scale, 8, 2, 0.55),
        pos: createStarterPos(rand, r.startingDist, 50,
            this.starterLakePos, this.resources.map(r => r.pos)),
      });
  }
}

MapGenerator.prototype.generateResources = function (cx, cy, tiles) {
  const resources = [];
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      if (tiles[i][j] >= S.water) continue;
      const x = cx * 32 + i, y = cy * 32 + j;
      const d = Math.sqrt(x**2 + y**2);
      for (let r of this.resources) {
        let resource = -1;
        if (d <= 150) {
          resource = r.noise.get(x * 4.07 + 1000, y * 4)
              - starterLimit(dist(r.pos, {x, y}) / r.startingSize);
          resource = resource > 0 ? Math.min(0.2, resource) / 0.2 : resource;
        }
        if (d > 100 && resource < 0) {
          resource = r.noise.get(x, y) - resourceLimit(d, r.limit);
          resource = resource > 0 ? resource / (1 - r.limit) : resource;
        }
        if (resource > 0) {
          if (!resources[i]) resources[i] = [];
          const amount = Math.floor((0.1 + resource)**2
              * r.quantity * (10 + Math.max(12, Math.sqrt(d)) / 4)
              * 80 + this.tileOffsets[j][i] * 1.5);
          const variation = r.sprite
              + (this.tileOffsets[i][j] & 7) * 8;
          resources[i][j] = {
            id: r.id,
            amount,
            variation,
            sprite: variation + resourceSprite(amount),
          };
          break;
        }
      }
    }
  }
  return resources.some(a => a?.length) ? resources : undefined;
}

MapGenerator.prototype.generateTiles = function (cx, cy) {
  const tiles = new Array(32).fill(0).map(a => []);
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      const x = cx * 32 + i, y = cy * 32 + j;
      let tile = this.lake(x, y) + (this.tileOffsets[i][j] & 7);
      if (!tile) tile = this.terrain(x, y) + this.tileOffsets[i][j];
      
      tiles[i].push(tile);
    }
  }
  return tiles;
}

MapGenerator.prototype.terrain = function(x, y) {
  for (let i in TERRAIN) {
    if (this.terrainNoises[i].get(x, y) >= TERRAIN[i].p)
      return TERRAIN[i].id;
  }
  return DEFAULT_TERRAIN;
}

MapGenerator.prototype.lake = function(x, y) {
  const d = Math.sqrt(x**2 + y**2);
  let lake = 0;
  if (d <= 150) {
    const starterLakeDist =
        Math.sqrt((x - this.starterLakePos.x) ** 2 +
        (y - this.starterLakePos.y) ** 2);
    lake = this.lakeNoise.get(x * 2 + 1000, y * 2.1) -
        starterLimit(dist(this.starterLakePos, {x, y}));
  } else {
    lake = this.lakeNoise.get(x, y) - lakeLimit(d);
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

function createStarterPos(rand, x, dx, lake, others) {
  while(true) {
    let phi = rand() * 2 * Math.PI, a = x + rand() * dx;
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

export {MapGenerator};

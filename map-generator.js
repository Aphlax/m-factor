import {PerlinNoise} from './perlin-noise.js';
import {createRand, createSeedRand} from './utils.js';

const SEED = [0x9E3779B9, 0x243F6A88, 0xB7E15162];

const DEFAULT_TERRAIN = 16; // dirt 2

const TERRAIN = [
  {id: 0, s: 0.005, p: 0.98},  // dirt 1
  {id: 32, s: 0.005, p: 0.98},  // dirt 3
  {id: 48, s: 0.005, p: 0.94},  // dirt 4
  {id: 64, s: 0.0065, p: 0.97},  // dirt 5
  {id: 80, s: 0.006, p: 0.95},  // dirt 6
  {id: 96, s: 0.008, p: 0.95},  // dirt 7
  {id: 112, s: 0.005, p: 0.99},  // dry dirt
  {id: 128, s: 0.005, p: 0.7},  // grass 1
  {id: 144, s: 0.005, p: 0.7},  // grass 2
  {id: 160, s: 0.006, p: 0.7},  // grass 3
  {id: 176, s: 0.007, p: 0.85},  // grass 4
  {id: 192, s: 0.005, p: 0.9},  // sand 1
  {id: 208, s: 0.005, p: 0.8},  // sand 2
  {id: 224, s: 0.005, p: 0.8},  // sand 3
  {id: 240, s: 0.008, p: 0.85},  // red-desert 0
  {id: 256, s: 0.005, p: 0.7},  // red-desert 1
  {id: 17 * 16, s: 0.005, p: 0.6},  // red-desert 2
  {id: 18 * 16, s: 0.005, p: 0.5},  // red-desert 3
];
const WATER = {
  beach: 192,
  water: 19 * 16,
  deepWater: 19.5 * 16,
};

const lakeLimit = dist => dist <= 150 ? 2 :
    dist <= 160 ? 1.2 - (dist - 150) / 25 :
    dist <= 560 ? 0.8 - (dist - 170) / 2000 :
    dist <= 1500 ? 0.6 :
    dist <= 2000 ? 0.6 - (dist - 1500) / 5000 :
    0.5;
const starterLakeLimit = dist => dist <= 20 ? 0.4 :
    dist <= 40 ? 0.4 + (dist - 20) / 100 :
    dist <= 60 ? 0.6 + (dist - 40) / 33 : 2;

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
  this.starterLakePos = ((phi, a) =>
      ({x: Math.cos(phi) * a, y: Math.sin(phi) * a}))
      (rand() * 2 * Math.PI, rand() * 30 + 70);
}


MapGenerator.prototype.generateTiles = function (cx, cy) {
  let tiles = new Array(32).fill(0).map(a => []);
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
  const dist = Math.sqrt(x**2 + y**2);
  let lake = 0;
  if (dist <= 150) {
    const starterLakeDist =
        Math.sqrt((x - this.starterLakePos.x) ** 2 +
        (y - this.starterLakePos.y) ** 2);
    lake = this.lakeNoise.get(x * 2 + 1000, y * 2.1) -
        starterLakeLimit(starterLakeDist);
  } else {
    lake = this.lakeNoise.get(x, y) - lakeLimit(dist);
  }
  if (lake > -0.05) {
    if (lake < 0) {
      if (this.lakeNoise.get(x * 0.7 + 100, y * 0.7) > 0.4 - lake * 5) {
        return WATER.beach;
      }
    } else {
      if (lake > 0.1)
        return WATER.deepWater;
      else
        return WATER.water;
    }
  }
}

export {MapGenerator};

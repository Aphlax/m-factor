import {PerlinNoise} from './perlin-noise.js';
import {createRand, createIntRand} from './utils.js';

const SEED = [0x9E3779B9, 0x243F6A88, 0xB7E15162];

const BIOMES = [
  { // Desert
    color: "rgb(255, 220, 50)",
    height: 0.2,
    moisture: 0,
    heat: 0.5,
  },
  { // Forest
	color: "rgb(0, 150, 0)",
    height: 0.2,
    moisture: 0.4,
    heat: 0.4,
  },
  { // Grassland
	color: "rgb(50, 255, 50)",
    height: 0.2,
    moisture: 0.5,
    heat: 0.3,
  },
  { // Jungle
	color: "rgb(0, 255, 0)",
    height: 0.3,
    moisture: 0.5,
    heat: 0.62,
  },
  { // Mountain
	color: "rgb(200, 200, 200)",
    height: 0.5,
    moisture: 0,
    heat: 0,
  },
  { // Ocean
	color: "rgb(40, 150, 255)",
    height: -0.2,
    moisture: -0.2,
    heat: -0.2,
  },
  { // Tundra
	color: "rgb(255, 220, 255)",
    height: 0.2,
    moisture: 0,
    heat: 0,
  },
];

const lakeLimit = dist => dist <= 100 ? 1.2 :
    dist <= 110 ? 1.2 - (dist - 100) / 25 :
    dist <= 510 ? 0.8 - (dist - 110) / 2000 :
    0.6;

function MapGenerator(seed) {
  this.seed = seed;
}

MapGenerator.prototype.initialize = function() {
  let rand = createIntRand(...SEED, this.seed);
  let randSeed = () => [rand(), rand(), rand(), rand()];
  this.heightNoise = new PerlinNoise(randSeed(),
      0.05, 8, 2, 0.5);
  this.moistureNoise = new PerlinNoise(randSeed(),
      0.046, 2, 2.4, 0.6);
  this.heatNoise = new PerlinNoise(randSeed(),
      0.0351, 2, 2.1, 0.5);
  this.lakeNoise = new PerlinNoise(randSeed(),
      0.01, 8, 2, 0.5);
}


MapGenerator.prototype.generateTiles = function (cx, cy) {
  let tiles = new Array(32).fill(0).map(a => []);
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      const x = cx * 32 + i, y = cy * 32 + j;
      let dist = Math.sqrt(x**2 + y**2);
      if (this.lakeNoise.get(x, y) >= lakeLimit(dist)) {
        if (this.lakeNoise.get(x, y) >= lakeLimit(dist) + 0.1)
          tiles[i].push("rgb(0, 20, 200)");
        else
          tiles[i].push("rgb(10, 40, 255)");
        continue;
      }
      
      let height = this.heightNoise.get(x, y);
      let moisture = this.moistureNoise.get(x, y);
      let heat = this.heatNoise.get(x, y);
      tiles[i].push(tile(height, moisture, heat));
    }
  }
  return tiles;
}

function tile(height, moisture, heat) {
  let color = "red", score = 10;
  for (let biome of BIOMES) {
    if (biome.height <= height &&
        biome.moisture <= moisture &&
        biome.heat <= heat) {
      let s = height - biome.height + moisture -
          biome.moisture + heat - biome.heat;
      if (s < score) {
        color = biome.color;
        score = s;
      }
    }
  }
  return color;
}

export {MapGenerator};

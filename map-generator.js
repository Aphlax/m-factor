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
	color: "rgb(10, 40, 255)",
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
}


MapGenerator.prototype.generateTiles = function (cx, cy) {
  let tiles = new Array(32).fill(0).map(a => []);
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      let height = this.heightNoise.get(cx * 32 + x, cy * 32 + y);
      let moisture = this.moistureNoise.get(cx * 32 + x, cy * 32 + y);
      let heat = this.heatNoise.get(cx * 32 + x, cy * 32 + y);
      tiles[x].push(tile(height, moisture, heat));
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

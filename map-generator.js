import {PerlinNoise} from './perlin-noise.js';
import {createRand, createSeedRand} from './utils.js';

const SEED = [0x9E3779B9, 0x243F6A88, 0xB7E15162];

const lakeLimit = dist => dist <= 150 ? 2 :
    dist <= 160 ? 1.2 - (dist - 150) / 25 :
    dist <= 560 ? 0.8 - (dist - 170) / 2000 :
    dist <= 1500 ? 0.6 :
    dist <= 2000 ? 0.6 - (dist - 1500) / 5000 :
    0.5;
const starterLakeLimit = dist => dist <= 20 ? 0.4 :
    dist <= 40 ? 0.4 + (dist - 20) / 100 :
    dist <= 60 ? 0.6 + (dist - 40) / 33 : 2;

function MapGenerator() {
  
}

MapGenerator.prototype.initialize = function(seed) {
  const randSeed = createSeedRand(...SEED, seed);
  this.lakeNoise = new PerlinNoise(randSeed(),
      0.00743, 5, 2, 0.5);
  this.moistureNoise = new PerlinNoise(randSeed(),
      0.0083, 5, 2, 0.5);
  this.heatNoise = new PerlinNoise(randSeed(),
      0.023, 5, 2, 0.5);
  const rand = createRand(...randSeed());
  this.starterLakePos = ((phi, a) =>
      ({x: Math.cos(phi) * a, y: Math.sin(phi) * a}))
      (rand() * 2 * Math.PI, rand() * 30 + 70);
}


MapGenerator.prototype.generateTiles = function (cx, cy) {
  let tiles = new Array(32).fill(0).map(a => []);
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      const x = cx * 32 + i, y = cy * 32 + j;
      if (!x&&!y){
        tiles[i].push("black");
        continue;
      }
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
            tiles[i].push("rgb(220, 170, 20)");
            continue;
          }
        } else {
          if (lake > 0.1)
            tiles[i].push("rgb(0, 20, 200)");
          else
            tiles[i].push("rgb(10, 40, 255)");
          continue;
        }
      }
      
      
      let tile = "brown";
      if (this.moistureNoise.get(x, y) >= 0.65)
        tile = "green";
      else if (this.heatNoise.get(x, y) >= 0.46)
        tile = "yellow";
        
      if (this.moistureNoise.get(x, y) >= 0.5) {
        if (this.heatNoise.get(x, y) >= 0.5) {
          tile = "green";
        } else {
          tile = "lightgreen";
        }
      } else {
        if (this.heatNoise.get(x, y) >= 0.5) {
          tile = "yellow";
        } else {
          tile = "grey";
        }
      }
      
      tiles[i].push(tile);
    }
  }
  return tiles;
}

export {MapGenerator};

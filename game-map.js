import {MapGenerator} from './map-generator.js';
import {Chunk} from './chunk.js';
import {GameMapInput} from './game-map-input.js';

function GameMap(canvas) {
  this.mapGenerator = new MapGenerator();
  this.view = {
    x: Math.floor(-canvas.width / 2),
    y: Math.floor(-canvas.height / 2),
    width: canvas.width,
    height: canvas.height,
    scale: 24,
  };
  this.input = new GameMapInput(this, this.view);
}

GameMap.prototype.initialize = function(seed) {
  this.mapGenerator.initialize(seed);
  this.chunks = new Map();
};

GameMap.prototype.update = function(time) {
  // Generate missing chunks.
  const SIZE = Chunk.SIZE * this.view.scale;
  const viewX = Math.floor(this.view.x / SIZE),
      viewY = Math.floor(this.view.y / SIZE);
  for (let x = 0; x <= Math.ceil(this.view.width / SIZE); x++) {
	for (let y = 0; y <= Math.ceil(this.view.height / SIZE); y++) {
      const cx = viewX + x;
      const cy = viewY + y;
      if (!this.chunks.has(cx)) {
        this.chunks.set(cx, new Map());
      }
      if (!this.chunks.get(cx).has(cy)) {
        this.chunks.get(cx).set(cy, new Chunk(cx, cy).generate(this.mapGenerator));
      }
    }
  }
  this.input.update(time);
};

GameMap.prototype.draw = function(ctx) {
  const SIZE = Chunk.SIZE * this.view.scale;
  for (let [x, col] of this.chunks.entries()) {
    if ((x + 1) * SIZE <= this.view.x) continue;
    if (x * SIZE > this.view.width + this.view.x) continue;
    for (let [y, chunk] of col.entries()) {
  	if ((y + 1) * SIZE <= this.view.y) continue;
      if (y * SIZE > this.view.height + this.view.y) continue;
      chunk.draw(ctx, this.view);
    }
  }
};

export {GameMap};

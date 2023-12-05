import {MapGenerator} from './map-generator.js';
import {Chunk} from './chunk.js';

function GameMap(canvas) {
  this.mapGenerator = new MapGenerator();
  this.dragpos = {x: 0, y: 0};
  this.view = {
    x: Math.floor(-canvas.width / 2),
    y: Math.floor(-canvas.height / 2),
    width: canvas.width,
    height: canvas.height,
    scale: 5,
  };
}

GameMap.prototype.initialize = function(seed) {
  this.mapGenerator.initialize(seed);
  this.chunks = new Map();
};

GameMap.prototype.update = function() {
  const viewX = Math.floor(this.view.x / 160),
      viewY = Math.floor(this.view.y / 160);
  for (let x = 0; x <= Math.ceil(this.view.width / 160); x++) {
	for (let y = 0; y <= Math.ceil(this.view.height / 160); y++) {
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
};

GameMap.prototype.draw = function(ctx) {
  for (let [x, col] of this.chunks.entries()) {
    if ((x + 1) * 160 <= this.view.x) continue;
    if (x * 160 > this.view.width + this.view.x) continue;
    for (let [y, chunk] of col.entries()) {
  	if ((y + 1) * 160 <= this.view.y) continue;
      if (y * 160 > this.view.height + this.view.y) continue;
      chunk.draw(ctx, this.view);
    }
  }
};

GameMap.prototype.dragStart = function(x, y) {
  this.dragpos.x = x;
  this.dragpos.y = y;
};

GameMap.prototype.dragMove = function(x, y) {
  this.view.x = Math.round(this.view.x - x + this.dragpos.x);
  this.view.y = Math.round(this.view.y - y + this.dragpos.y);
  this.dragpos.x = x;
  this.dragpos.y = y;
};

export {GameMap};

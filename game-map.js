import {MapGenerator} from './map-generator.js';
import {Chunk, SIZE} from './chunk.js';
import {GameMapInput} from './game-map-input.js';
import {MAX_SIZE} from './entity.js'!


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
  this.chunks = new Map();
}

GameMap.prototype.initialize = function(seed) {
  this.chunks = new Map(); // Reset.
  this.mapGenerator.initialize(seed);
};

GameMap.prototype.update = function(time, dt) {
  for (let chunks of this.chunks.values()) {
    for (let chunk of chunks.values()) {
      for (let entity of chunk.entities) {
        entity.update(this, time, dt);
      }
    }
  }
  // Generate missing chunks.
  const size = SIZE * this.view.scale;
  const viewX = Math.floor(this.view.x / size),
      viewY = Math.floor(this.view.y / size);
  for (let x = 0; x <= Math.ceil(this.view.width / size); x++) {
	for (let y = 0; y <= Math.ceil(this.view.height / size); y++) {
      const cx = viewX + x;
      const cy = viewY + y;
      if (!this.chunks.has(cx)) {
        this.chunks.set(cx, new Map());
      }
      if (!this.chunks.get(cx).has(cy)) {
        this.chunks.get(cx).set(cy,
            new Chunk(cx, cy)
                .generate(this.mapGenerator));
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
      chunk.drawTerrain(ctx, this.view);
    }
  }
  for (let [x, col] of this.chunks.entries()) {
    if ((x + 1) * SIZE <= this.view.x) continue;
    if (x * SIZE > this.view.width + this.view.x) continue;
    for (let [y, chunk] of col.entries()) {
  	if ((y + 1) * SIZE <= this.view.y) continue;
      if (y * SIZE > this.view.height + this.view.y) continue;
      chunk.drawResources(ctx, this.view);
    }
  }
};

GameMap.prototype.canPlace = function(x, y, width, height, ignoredEntity) {
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (this.getTerrainAt(x + i, y + j) >= S.water)
        return [false, x + i, y + j];
    }
  }
  const cx1 = Math.floor((x - MAX_SIZE) / SIZE);
  const cx2 = Math.floor((x + width - 1) / SIZE);
  const cy1 = Math.floor((y - MAX_SIZE) / SIZE);
  const cy2 = Math.floor((y + width - 1) / SIZE);
  for (let i = cx1; i <= cx2; i++) {
    if (!this.chunks.has(i)) {
      if (i == cx1 && cx1 != Math.floor(x / SIZE))
        continue;
      return [false, i * SIZE, y];
    }
    for (let j = cy1; j <= cy2; j++) {
      if (!this.chunks.get(i).has(j)) {
        if (j == cy1 && cy1 != Math.floor(y / SIZE))
          continue;
        return [false, x, j * SIZE];
      }
      for (let entity of this.chunks.get(i).get(j).entities) {
        if (entity == ignoredEntity) continue;
        if (x + width > entity.x && x < entity.x + entity.width &&
            y + height > entity.y && y < entity.y + entity.height)
          return [false, entity.x, entity.y];
      }
    }
  }
  return [true];
}

GameMap.prototype.getEntityAt = function(x, y) {
  const cx1 = Math.floor(x / SIZE);
  const cx2 = Math.floor((x + MAX_SIZE) / SIZE);
  const cy1 = Math.floor(y / SIZE);
  const cy2 = Math.floor((y + MAX_SIZE) / SIZE);
  for (let i = cx1; i <= cx2; i++) {
    if (!this.chunks.has(i)) continue;
    for (let j = cy1; j <= cy2; j++) {
      if (!this.chunks.get(i).has(j)) continue;
      for (let entity of this.chunks.get(i).get(j).entities) {
        if (x >= entity.x && x < entity.x + entity.width &&
            y >= entity.y && y < entity.y + entity.height)
          return entity;
      }
    }
  }
  return undefined;
}

GameMap.prototype.getTerrainAt = function(x, y) {
  const cx = Math.floor(x / SIZE);
  if (!this.chunks.has(cx)) return;
  const cy = Math.floor(y / SIZE);
  if (!this.chunks.get(cx).has(cy)) return;
  const chunk = this.chunks.get(cx).get(cy);
  return chunk.tiles[x - cx][y - cy];
}

GameMap.prototype.getResourceAt = function(x, y) {
  const cx = Math.floor(x / SIZE);
  if (!this.chunks.has(cx)) return;
  const cy = Math.floor(y / SIZE);
  if (!this.chunks.get(cx).has(cy)) return;
  const chunk = this.chunks.get(cx).get(cy);
  if (!chunk.resources[x - cx]) return;
  return chunk.resources[x - cx][y - cy];
}

export {GameMap};

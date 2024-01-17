import {SPRITES} from './sprite-pool.js';

export const SIZE = 32;


/**
 * Part of the game map.
 * Inner fields get accessed directly from GameMap.
 */
function Chunk(cx, cy) {
  this.x = cx;
  this.y = cy;
  this.tiles = [];
  this.resources = undefined;
  this.entities = [];
}

Chunk.prototype.generate = function(mapGenerator) {
  this.tiles = mapGenerator.generateTiles(this.x, this.y);
  this.resources = mapGenerator.generateResources(this.x, this.y, this.tiles);
  return this;
};

Chunk.prototype.drawTerrain = function(ctx, view) {
  const xStart = Math.max(0, Math.floor(view.x / view.scale - this.x * SIZE));
  const xEnd = Math.min(SIZE, Math.ceil((view.width + view.x) / view.scale - this.x * SIZE));
  const yStart = Math.max(0, Math.floor(view.y / view.scale - this.y * SIZE));
  const yEnd = Math.min(SIZE, Math.ceil((view.height + view.y) / view.scale - this.y * SIZE));
  const scaleCeil = Math.ceil(view.scale);
  
  for (let x = xStart; x < xEnd; x++) {
    for (let y = yStart; y < yEnd; y++) {
      const sprite = SPRITES.get(this.tiles[x][y]);
      
      ctx.drawImage(
          sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          Math.floor((this.x * SIZE + x) * view.scale - view.x),
          Math.floor((this.y * SIZE + y) * view.scale - view.y),
          scaleCeil, scaleCeil);
    }
  }
  
  // Chunk boundaries.
  const lx = this.x * SIZE * view.scale - view.x,
      ly = this.y * SIZE * view.scale - view.y;
  ctx.beginPath();
  ctx.moveTo(lx, ly + SIZE * view.scale);
  ctx.lineTo(lx, ly);
  ctx.lineTo(lx + SIZE * view.scale, ly);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  ctx.stroke();
}

Chunk.prototype.drawResources = function(ctx, view) {
  const xStart = Math.max(0, Math.floor(view.x / view.scale - this.x * SIZE - 1));
  const xEnd = Math.min(SIZE, Math.ceil((view.width + view.x) / view.scale - this.x * SIZE + 1));
  const yStart = Math.max(0, Math.floor(view.y / view.scale - this.y * SIZE - 1));
  const yEnd = Math.min(SIZE, Math.ceil((view.height + view.y) / view.scale - this.y * SIZE + 1));
  const resourceSize = Math.ceil(view.scale * 1.5);
  if (this.resources) {
    for (let x = xStart; x < xEnd; x++) {
      if (!this.resources[x]) continue;
      for (let y = yStart; y < yEnd; y++) {
        const r = this.resources[x][y];
        if (!r) continue;
        const sprite = SPRITES.get(r.sprite);
        ctx.drawImage(
          sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          Math.floor((this.x * SIZE + x - 0.25) * view.scale - view.x),
          Math.floor((this.y * SIZE + y - 0.25) * view.scale - view.y),
          resourceSize, resourceSize);
      }
    }
  }
};

export {Chunk};

import {SPRITES} from './sprite-pool.js';

const SIZE = Chunk.SIZE = 32;

function Chunk(cx, cy) {
  this.x = cx;
  this.y = cy;
  this.tiles = [];
  this.resources = undefined;
  this.entities = new Array(SIZE).fill(0).map(() => []);
}

Chunk.prototype.generate = function(mapGenerator) {
  this.tiles = mapGenerator.generateTiles(this.x, this.y);
  this.resources = mapGenerator.generateResources(this.x, this.y, this.tiles);
  return this;
};

Chunk.prototype.update = function(time, dt) {
  for (x in this.entities) {
    for (y in this.entities[x]) {
      if (this.entities[x][y].type != 1)
        this.entities[x][y].update(time, dt);
    }
  }
};

Chunk.prototype.draw = function(ctx, view) {
  const xStart = Math.max(0, Math.floor(view.x / view.scale - this.x * SIZE));
  const xEnd = Math.min(SIZE, Math.ceil((view.width + view.x) / view.scale - this.x * SIZE));
  const yStart = Math.max(0, Math.floor(view.y / view.scale - this.y * SIZE));
  const yEnd = Math.min(SIZE, Math.ceil((view.height + view.y) / view.scale - this.y * SIZE));
  const i = view.scale <= 8 ? 0 : view.scale <= 16 ? 1 : 2;
  const scaleCeil = Math.ceil(view.scale);
  
  for (let x = xStart; x < xEnd; x++) {
    for (let y = yStart; y < yEnd; y++) {
      const sprite = SPRITES.get(this.tiles[x][y]);
      
      ctx.drawImage(
          sprite.image,
          sprite.mip[i].x, sprite.mip[i].y,
          sprite.mip[i].width, sprite.mip[i].height,
          Math.floor((this.x * SIZE + x) * view.scale - view.x),
          Math.floor((this.y * SIZE + y) * view.scale - view.y),
          scaleCeil, scaleCeil);
    }
  }
  
  if (this.resources) {
    for (let x = xStart; x < xEnd; x++) {
      if (!this.resources[x]) continue;
      for (let y = yStart; y < yEnd; y++) {
        const r = this.resources[x][y];
        if (!r) continue;
        
        ctx.fillStyle = r.id == 1 ? "grey" : r.id == 2 ? "#D87333" : i.id == 3 ? "black" : "#DB8C44";
        ctx.fillRect(
            Math.floor((this.x * SIZE + x) * view.scale - view.x) +2,
            Math.floor((this.y * SIZE + y) * view.scale - view.y) +2,
            scaleCeil -4, scaleCeil -4);
      }
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
};

export {Chunk};

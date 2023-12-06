const SIZE = Chunk.SIZE = 32;

function Chunk(cx, cy) {
  this.x = cx;
  this.y = cy;
  this.tiles = [];
  this.entities = new Array(SIZE).fill(0).map(() => []);
}

Chunk.prototype.generate = function(mapGenerator) {
  this.tiles = mapGenerator.generateTiles(this.x, this.y);
  return this;
};

Chunk.prototype.update = function(time, dt) {
  for (x in this.entities) {
    for (y in this.entities[x]) {
      if (this.entities[x][y].type != 1)
        this.entities[x][y].update(time, dt);
    }
  }
}

Chunk.prototype.draw = function(ctx, view) {
  const xStart = Math.max(0, Math.floor(view.x / 5 - this.x * SIZE));
  const xEnd = Math.min(SIZE, Math.ceil((view.width + view.x) / 5 - this.x * SIZE));
  const yStart = Math.max(0, Math.floor(view.y / 5 - this.y * SIZE));
  const yEnd = Math.min(SIZE, Math.ceil((view.height + view.y) / 5 - this.y * SIZE));
  
  for (let x = xStart; x < xEnd; x++) {
    for (let y = yStart; y < yEnd; y++) {
      ctx.fillStyle = this.tiles[x][y];
      ctx.fillRect((this.x * SIZE + x) * view.scale - view.x, (this.y * SIZE + y) * view.scale - view.y, view.scale, view.scale);
    }
  }
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

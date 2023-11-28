const SIZE = 32;

function Chunk(cx, cy) {
  this.x = cx;
  this.y = cy;
  this.tiles = [];
  this.belts = [];
  this.entities = [];
}

Chunk.prototype.generate = function(mapGenerator) {
  this.tiles = mapGenerator.generateTiles(this.x, this.y);
  return this;
};

Chunk.prototype.draw = function(ctx, view) {
  const xStart = Math.max(0, Math.floor(view.x / 5 - this.x * SIZE));
  const xEnd = Math.min(SIZE, Math.ceil((view.width + view.x) / 5 - this.x * SIZE));
  const yStart = Math.max(0, Math.floor(view.y / 5 - this.y * SIZE));
  const yEnd = Math.min(SIZE, Math.ceil((view.height + view.y) / 5 - this.y * SIZE));
  
  for (let x = xStart; x < xEnd; x++) {
    for (let y = yStart; y < yEnd; y++) {
      ctx.fillStyle = this.tiles[x][y];
      ctx.fillRect((this.x * SIZE + x) * 5 - view.x, (this.y * SIZE + y) * 5 - view.y, 5, 5);
    }
  }
  const lx = this.x * SIZE * 5 - view.x,
      ly = this.y * SIZE * 5 - view.y;
  ctx.beginPath();
  ctx.moveTo(lx, ly + SIZE * 5);
  ctx.lineTo(lx, ly);
  ctx.lineTo(lx + SIZE * 5, ly);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  ctx.stroke();
};

export {Chunk};

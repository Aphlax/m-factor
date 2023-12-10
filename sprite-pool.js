import {SPRITES} from './sprite-definitions.js';

function SpritePool() {
  this.total = SPRITES.length;
  this.current = 0;
  this.sprites = new Map();
}

SpritePool.prototype.load = function() {
  for (let imageDef of SPRITES) {
    this.loadImage(imageDef);
  }
};

SpritePool.prototype.loadImage = function(imageDef) {
  const img = new Image();
  img.src = imageDef.path;
  img.onload = e => {
    for (let spriteDef of imageDef.sprites) {
      if (this.sprites.has(spriteDef.id)) {
        throw new Error("Sprite id conflict.");
      }
      this.sprites.set(spriteDef.id, {
        image: img,
        ...spriteDef,
      });
    }
    this.current++;
  };
};

SpritePool.prototype.isLoaded = function() {
  return this.current == this.total;
};

SpritePool.prototype.draw = function(ctx) {
  // Loading bar.
  ctx.fillStyle = "black";
  ctx.fillRect(Math.floor(ctx.canvas.width * 0.2),
      Math.floor(ctx.canvas.height * 0.5 - 30),
      Math.floor(ctx.canvas.width * 0.6), 60);
  ctx.fillStyle = "white";
  ctx.fillRect(Math.floor(ctx.canvas.width * 0.2 + 10),
      Math.floor((ctx.canvas.height * 0.5 - 30) * this.current / this.total) + 10,
      Math.floor(ctx.canvas.width * 0.6 - 20), 40);
};

export {SpritePool};

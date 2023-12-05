import {SPRITES} from './sprite-definitions.js';

function SpritePool() {
  this.total = SPRITES.length;
  this.current = 0;
  this.sprites = new Map();
  this.i =0;
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
  
  if (this.isLoaded()) {
    let i = Math.floor(this.i++ / 60) % 2;
    for (let j = 0; j<16; j++) {
      let img = this.sprites.get(j);
      let rect = [10 + j%4*64, 10+j*16,64,64];
      
      ctx.drawImage(img.image, img.mip[i].x, img.mip[i].y,
          img.mip[i].width,img.mip[i].height, 
          ...rect);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";
      ctx.strokeRect(...rect);
    }
  }
};

export {SpritePool};

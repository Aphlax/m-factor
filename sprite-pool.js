import {SPRITES} from './sprite-definitions.js';
export {S} from './sprite-definitions.js';

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
  const image = new Image();
  image.src = imageDef.path;
  image.onload = () => {
    for (let s of imageDef.sprites) {
      if (this.sprites.has(s.id)) {
        throw new Error("Sprite id conflict. " + s.id + " already exists.");
      }
      this.sprites.set(s.id, {...s, image});
    }
    this.current++;
  };
};

SpritePool.prototype.isLoaded = function() {
  return this.current == this.total;
};

SpritePool.prototype.draw = function(ctx, time) {
  // Loading bar.
  ctx.fillStyle = "black";
  ctx.fillRect(Math.floor(ctx.canvas.width * 0.2),
      Math.floor(ctx.canvas.height * 0.5 - 30),
      Math.floor(ctx.canvas.width * 0.6), 60);
  ctx.fillStyle = "white";
  ctx.fillRect(Math.floor(ctx.canvas.width * 0.2 + 10),
      Math.floor(ctx.canvas.height * 0.5 - 20),
      Math.floor((ctx.canvas.width * 0.6 - 30) * this.current / this.total + 10), 40);
      
  // Debug.
  if (this.current == this.total) {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let sprite = 68*16;
    let shadow = 0;
    let size = [32, 32];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        let s = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(sprite+i*8+j)};
        let rect = [10+i*70, 10+ j*70, ...size];
        let xScale = rect[2] / (s.width - s.left - s.right);
        let yScale = rect[3] / (s.height - s.top - s.bottom);
        if (shadow) {
          let ss = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(shadow+i*8+j)};
          let sxScale = rect[2] / (ss.width - ss.left - ss.right);
          let syScale = rect[3] / (ss.height - ss.top - ss.bottom);
          ctx.strokeStyle="blue";
          ctx.strokeRect(rect[0] - ss.left * sxScale - 1,
              rect[1] - ss.top * syScale - 1,
              ss.width * sxScale + 2,
              ss.height * syScale + 2);
          ctx.drawImage(ss.image,
              ss.x, ss.y, ss.width, ss.height,
              rect[0] - ss.left * sxScale,
              rect[1] - ss.top * syScale,
              ss.width * sxScale,
              ss.height * syScale);
        }
        ctx.drawImage(s.image,
            s.x, s.y, s.width, s.height,
            rect[0] - s.left * xScale,
            rect[1] - s.top * yScale,
            s.width * xScale,
            s.height * yScale);
        ctx.strokeStyle="red";
        ctx.strokeRect(...rect);
      }
    }
  //  return;
    let a = 16;
    
    let s = this.get(sprite + (Math.floor(time / 60) % a));
    if(!s) return;
    let r = s.rect, e = s.extend;
    let rect = [10, 570, ...size];
    if (shadow) {
      let ss = this.get(shadow + (Math.floor(time / 60) % a));
      let rs = ss.rect, es = ss.extend;
      let sxScale = rect[2] / (ss.width - ss.left - ss.right);
      let syScale = rect[3] / (ss.height - ss.top - ss.bottom);
      ctx.drawImage(ss.image,
        ss.x, ss.y, ss.width, ss.height,
        rect[0] - ss.left * sxScale,
        rect[1] - ss.top * syScale,
        ss.width * sxScale,
        ss.height * syScale);
    }
    let xScale = rect[2] / (s.width - s.left - s.right);
    let yScale = rect[3] / (s.height - s.top - s.bottom);
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        rect[0] - s.left * xScale,
        rect[1] - s.top * yScale,
        s.width * xScale,
        s.height * yScale);
    ctx.strokeStyle="red";
    ctx.strokeRect(...rect);
  }
};

const INSTANCE = new SpritePool();
INSTANCE.get = INSTANCE.sprites.get.bind(INSTANCE.sprites);

export {INSTANCE as SPRITES};

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
        let s = this.get(sprite+i*8+j), r = s.rect,
            e = s.extend ?? {left: 0, right: 0, top: 0, bottom: 0};
        let rect = [10+i*70, 10+ j*70, ...size];
        let xScale = rect[2] / (r.width - e.left - e.right);
        let yScale = rect[3] / (r.height - e.top - e.bottom);
        if (shadow) {
          let ss = this.get(shadow+i*8+j), rs = ss.rect,
              es = ss.extend ?? {left: 0, right: 0, top: 0, bottom: 0};
          let sxScale = rect[2] / (rs.width - es.left - es.right);
          let syScale = rect[3] / (rs.height - es.top - es.bottom);
          ctx.strokeStyle="blue";
          ctx.strokeRect(rect[0] - es.left * sxScale - 1,
              rect[1] - es.top * syScale - 1,
              rs.width * sxScale + 2,
              rs.height * syScale + 2);
          ctx.drawImage(ss.image,
              rs.x, rs.y, rs.width, rs.height,
              rect[0] - es.left * sxScale,
              rect[1] - es.top * syScale,
              rs.width * sxScale,
              rs.height * syScale);
        }
        ctx.drawImage(s.image,
            r.x, r.y, r.width, r.height,
            rect[0] - e.left * xScale,
            rect[1] - e.top * yScale,
            r.width * xScale,
            r.height * yScale);
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
      let sxScale = rect[2] / (rs.width - es.left - es.right);
      let syScale = rect[3] / (rs.height - es.top - es.bottom);
      ctx.drawImage(ss.image,
        rs.x, rs.y, rs.width, rs.height,
        rect[0] - es.left * sxScale,
        rect[1] - es.top * syScale,
        rs.width * sxScale,
        rs.height * syScale);
    }
    let xScale = rect[2] / (r.width - e.left - e.right);
    let yScale = rect[3] / (r.height - e.top - e.bottom);
    ctx.drawImage(s.image,
        r.x, r.y, r.width, r.height,
        rect[0] - e.left * xScale,
        rect[1] - e.top * yScale,
        r.width * xScale,
        r.height * yScale);
    ctx.strokeStyle="red";
    ctx.strokeRect(...rect);
  }
};

const INSTANCE = new SpritePool();
INSTANCE.get = INSTANCE.sprites.get.bind(INSTANCE.sprites);

export {INSTANCE as SPRITES};

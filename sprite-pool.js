import {SPRITES} from './sprite-definitions.js';
import {S} from './sprite-definitions.js';
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
  ctx.fillStyle = "#EEEEEE";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
    ctx.fillStyle = "lightgrey";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let sprite = S.lab;
    let shadow = S.labShadow;
    let size = [96, 96], xlen = 11, ylen = 3;
    for (let i = 0; i < xlen; i++) {
      for (let j = 0; j < ylen; j++) {
        let s = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(sprite+i*ylen+j)};
        if (!s.image) continue;
        let rect = [10+i*(size[0]+10), 10+ j*(size[1]+10), ...size];
        let xScale = rect[2] / (s.width - s.left - s.right);
        let yScale = rect[3] / (s.height - s.top - s.bottom);
        if (shadow) {
          let ss = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(shadow/*+i*ylen+j*/)};
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
        ctx.strokeStyle="yellow";
        ctx.strokeRect(
            rect[0] - s.left * xScale,
            rect[1] - s.top * yScale,
            s.width * xScale,
            s.height * yScale);
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
    
    //return;
    let a = xlen*ylen;
    
    let s = this.get(sprite + (Math.floor(time / 120) % a));
    if(!s) return;
    let r = s.rect;
    let rect = [10, 570, ...size];
    if (shadow) {
      let ss = this.get(shadow /*+ (Math.floor(time / 60) % a)*/);
      let rs = ss.rect;
      let sxScale = rect[2] / (ss.width - (ss.left ?? 0) - (ss.right ?? 0));
      let syScale = rect[3] / (ss.height - (ss.top ?? 0) - (ss.bottom ?? 0));
      ctx.drawImage(ss.image,
        ss.x, ss.y, ss.width, ss.height,
        rect[0] - (ss.left ?? 0) * sxScale,
        rect[1] - (ss.top ?? 0) * syScale,
        ss.width * sxScale,
        ss.height * syScale);
    }
    let xScale = rect[2] / (s.width - (s.left ?? 0) - (s.right ?? 0));
    let yScale = rect[3] / (s.height - (s.top ?? 0) - (s.bottom ?? 0));
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        rect[0] - (s.left ?? 0) * xScale,
        rect[1] - (s.top ?? 0) * yScale,
        s.width * xScale,
        s.height * yScale);
    ctx.strokeStyle="red";
    ctx.strokeRect(...rect);
    console.log(s.left);
    
    return;
    if (!this.spriteSheetExported) {
      this.spriteSheetExported = true;
      this.exportSpriteSheet();
    }
  }
};


/** For dev only. Used for stone furnace. */
SpritePool.prototype.exportSpriteSheet = function() {
  let sprite = S.stoneFurnaceFire;
  let shadow = S.stoneFurnace;
  let size = [64, 64], xlen = 8, ylen = 6;
  let tile = [80, 64], xoff = -6, yoff = 0;
  let name = "stone-furnace-working";
  
  const canvas = document.createElement("canvas");
  canvas.width = tile[0] * xlen;
  canvas.height = tile[1] * ylen;
  const ctx = canvas.getContext('2d');
  
  
  for (let i = 0; i < xlen; i++) {
    for (let j = 0; j < ylen; j++) {
      let s = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(sprite+i*ylen+j)};
      if (!s.image) continue;
      let rect = [i * tile[0] + xoff, j * tile[1] + yoff, ...size];
      let xScale = rect[2] / (s.width - s.left - s.right);
      let yScale = rect[3] / (s.height - s.top - s.bottom);
      if (shadow) {
        let ss = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(shadow/*+i*ylen+j*/)};
        let sxScale = rect[2] / (ss.width - ss.left - ss.right);
        let syScale = rect[3] / (ss.height - ss.top - ss.bottom);
        
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
    }
  }
  
  // Open in web browser to download.
  let a = document.createElement('a');
  a.download = name + ".png";
  a.href = canvas.toDataURL();
  a.style.position = "absolute";
  a.style.bottom = "10px";
  a.style.left = "10px";
  a.style["z-index"] = 1;
  a.innerText = "download spritesheet\n";
  document.body.appendChild(a);
}

const INSTANCE = new SpritePool();
INSTANCE.get = INSTANCE.sprites.get.bind(INSTANCE.sprites);

export {INSTANCE as SPRITES};

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
  //return false;
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
  
  // For debugging the missing sprites on github.
  if (this.current > this.total * 0.85) {
    for (let imageDef of SPRITES) {
      const id = imageDef.sprites[0].id;
      if (!this.sprites.has(id)) {
        ctx.fillStyle = "black";
        ctx.fillText("#" + id, ctx.canvas.width * 0.5 - 40,
            ctx.canvas.height - 100);
        break;
      }
    }
  }
      
  // Debug.
  if (this.current != this.total) return;
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  let sprite = S.electricFurnaceWorking;
  let shadow = 0;S.smallElectricPoleShadow;
  const animShad = false;
  let light = 0; // S.boilerLightW;
  let size = [32*3, 32*3], xlen = 4, ylen = 3;
  for (let i = 0; i < xlen; i++) {
    for (let j = 0; j < ylen; j++) {
      let s = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(sprite+i*ylen+j)};
      if (!s.image) continue;
      let rect = [10+i*(size[0]+15), 100+ i*(size[1]+15)+ j*(size[1]+15), ...size];
      let xScale = rect[2] / (s.width - s.left - s.right);
      let yScale = rect[3] / (s.height - s.top - s.bottom);
      if (shadow) {
        let ss = {left: 0, right: 0, top: 0, bottom: 0,
            ...this.get(shadow + (animShad ? i*ylen+j : 0))};
        strokeSprite(ctx, ss, rect, "blue");
        drawSprite(ctx, ss, rect);
      }
      if (light) {
        let ls = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(light)};
        strokeSprite(ctx, ls, rect, "lime");
        ctx.globalCompositeOperation = "screen";
        drawSprite(ctx, ls, rect);
        ctx.globalCompositeOperation = "source-over";
      }
      // strokeSprite(ctx, s, rect, "yellow");
      drawSprite(ctx, s, rect);
      ctx.strokeStyle="red";
      ctx.strokeRect(...rect);
    }
  }
  
  const imgs = [this.get(sprite).image,
      shadow ? this.get(shadow).image : 0,
      light ? this.get(light).image : 0];
  let txt = "";
  for (let img of imgs) {
    if (!img) continue;
    txt += img.naturalWidth + "x" + img.naturalHeight;
    txt += " ("+(img.naturalWidth /xlen).toFixed(0) + "x" +
         (img.naturalHeight/ylen).toFixed(0) + "), ";
  }
  ctx.fillStyle = "black";
  ctx.font = "18px arial";
  ctx.fillText(txt, 10, 20);
  
  //return;
  let a = xlen*ylen;
  
  ctx.fillStyle = "orange";
  ctx.fillRect(0, 560, 210, 250);
  
  let s = this.get(sprite + (Math.floor(time / 60) % a));
  if(!s) return;
  let r = s.rect;
  let rect = [30, 580, ...size];
  if (shadow) {
    let ss = this.get(shadow + (animShad ? (Math.floor(time / 60) % a) : 0));
    ctx.globalAlpha = 0.7;
    drawSprite(ctx, ss, rect);
    ctx.globalAlpha = 1;
  }
  if (light) {
    let ls = this.get(light);
    ctx.globalCompositeOperation = "screen";
    drawSprite(ctx, ls, rect);
    ctx.globalCompositeOperation = "source-over";
  }
  drawSprite(ctx, s, rect);
  
  return;
  if (!this.spriteSheetExported) {
    this.spriteSheetExported = this.exportSpriteSheet();
  } else {
    const canvas = this.spriteSheetExported;
    ctx.fillStyle="white";
    ctx.fillRect(10, 10, canvas.width, canvas.height);
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height,
        10, 10, canvas.width, canvas.height);
    ctx.strokeStyle="red";
    ctx.strokeRect(9, 9, canvas.width + 2, canvas.height + 2);
  }
};


/** For dev only. */
SpritePool.prototype.exportSpriteSheet = function() {
  const cfgs = [{
    sprite: S.stoneFurnaceFire,
    shadow: S.stoneFurnace,
    size: [64, 64], xlen: 8, ylen: 6,
    tile: [80, 64], xoff: -6, yoff: 0,
    animShadow: false,
    name: "stone-furnace-working",
  },{
    sprite: S.offshorePumpN,
    shadow: -1,
    size: [32, 64], xlen: 8, ylen: 4,
    tile: [60, 84], xoff: 17, yoff: 12,
    animShadow: false,
    name: "offshore-pump_North",
    path: "graphics/entities/offshore-pump/offshore-pump_North-legs.png",
    sprites: 0//entitySprites(-1, 60, 52, 1, 1, 17, 11, -15, 3, true),
  },{
    sprite: S.offshorePumpE,
    shadow: -1,
    size: [64, 32], xlen: 8, ylen: 4,
    tile: [69, 56], xoff: 6, yoff: 12,
    animShadow: false,
    name: "offshore-pump_East",
    path: "graphics/entities/offshore-pump/offshore-pump_East-legs.png",
    sprites: 0//entitySprites(-1, 54, 32, 1, 1, 6, -16, -12, 12, true),
  },{
    sprite: S.offshorePumpS,
    shadow: -1,
    size: [32, 64], xlen: 8, ylen: 4,
    tile: [56, 78], xoff: 14, yoff: 4,
    animShadow: false,
    name: "offshore-pump_South",
    path: "graphics/entities/offshore-pump/offshore-pump_South-legs.png",
    sprites: 0//entitySprites(-1, 56, 54, 1, 1, 14, 10, -4, -6, true),
  },{
    sprite: S.offshorePumpW,
    shadow: -1,
    size: [64, 32], xlen: 8, ylen: 4,
    tile: [69, 56], xoff: -1, yoff: 8,
    animShadow: false,
    name: "offshore-pump_West",
    path: "graphics/entities/offshore-pump/offshore-pump_West-legs.png",
    sprites: 0//entitySprites(-1, 54, 32, 1, 1, -16, 6, -16, 16, true),
  },{
    sprite: S.boilerFireN,
    shadow: S.boilerN,
    light: S.boilerLightN,
    size: [96, 64], xlen: 8, ylen: 4,
    tile: [131, 108], xoff: 18, yoff: 22,
    animShadow: false,
    name: "boiler-N-working",
  },{
    sprite: S.boilerFireE,
    shadow: S.boilerE,
    light: S.boilerLightE,
    size: [32*2, 32*3], xlen: 8, ylen: 4,
    tile: [105, 147], xoff: 26, yoff: 27,
    animShadow: false,
    name: "boiler-E-working",
  },{
    sprite: S.boilerFireS,
    shadow: S.boilerS,
    light: S.boilerLightS,
    size: [32*3, 32*2], xlen: 8, ylen: 4,
    tile: [128, 95], xoff: 13, yoff: 2,
    animShadow: false,
    name: "boiler-S-working",
  },{
    sprite: S.boilerFireW,
    shadow: S.boilerW,
    light: S.boilerLightW,
    size: [32*2, 32*3], xlen: 8, ylen: 4,
    tile: [96, 132], xoff: 15, yoff: 13,
    animShadow: false,
    name: "boiler-W-working",
  }];
  const cfg = cfgs[cfgs.length - 1];
  
  const canvas = document.createElement("canvas");
  canvas.width = cfg.tile[0] * cfg.xlen;
  canvas.height = cfg.tile[1] * cfg.ylen;
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < cfg.xlen; i++) {
    for (let j = 0; j < cfg.ylen; j++) {
      let s = {left: 0, right: 0, top: 0, bottom: 0, ...this.get(cfg.sprite+i*cfg.ylen+j)};
      if (!s.image) continue;
      let rect = [i * cfg.tile[0] + cfg.xoff, j * cfg.tile[1] + cfg.yoff, ...cfg.size];
      if (cfg.shadow) {
        let ss = {left: 0, right: 0, top: 0, bottom: 0,
            ...this.get(cfg.shadow +(cfg.animShadow ? i*cfg.ylen+j : 0))};
        drawSprite(ctx, ss, rect);
      }
      if (cfg.light) {
        let ls = {left: 0, right: 0, top: 0, bottom: 0,
            ...this.get(cfg.light)};
        /*ctx.save();
        ctx.beginPath();
        ctx.rect(i * cfg.tile[0], j * cfg.tile[1], cfg.tile[0], 66);
        ctx.clip();*/
        ctx.globalCompositeOperation = "screen";
        drawSprite(ctx, ls, rect);
        ctx.globalCompositeOperation = "source-over";
        // ctx.restore();
      }
      drawSprite(ctx, s, rect);
    }
  }
  
  /*
  const p = [62, 70];
  const pixel = ctx.getImageData(...p, 1, 1).data;
  const text = pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ", " + pixel[3];
  ctx.strokeStyle = "yellow";
  ctx.strokeRect(p[0] - 1, p[1] - 1, 4, 4);
  ctx.fillText(text, p[0] + 4, p[1] + 4)
  */
  
  // Open in web browser to download.
  let a = document.createElement('a');
  a.download = cfg.name + ".png";
  a.href = canvas.toDataURL();
  a.style.position = "absolute";
  a.style.bottom = "10px";
  a.style.left = "10px";
  a.style["z-index"] = 1;
  a.innerText = "download spritesheet\n";
  document.body.appendChild(a);
  return canvas;
}

function drawSprite(ctx, s, rect) {
  const xScale = rect[2] / (s.width - s.left - s.right);
  const yScale = rect[3] / (s.height - s.top - s.bottom);
  ctx.drawImage(s.image,
      s.x, s.y, s.width, s.height,
      rect[0] - s.left * xScale,
      rect[1] - s.top * yScale,
      s.width * xScale,
      s.height * yScale);
}

function strokeSprite(ctx, s, rect, color) {
  const xScale = rect[2] / (s.width - s.left - s.right);
  const yScale = rect[3] / (s.height - s.top - s.bottom);
  ctx.strokeStyle = color;
  ctx.strokeRect(rect[0] - s.left * xScale - 1,
      rect[1] - s.top * yScale - 1,
      s.width * xScale + 2,
      s.height * yScale + 2);
}

const INSTANCE = new SpritePool();
INSTANCE.get = INSTANCE.sprites.get.bind(INSTANCE.sprites);

export {INSTANCE as SPRITES};

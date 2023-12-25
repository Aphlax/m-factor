import {SPRITES} from './sprite-definitions.js';
export {NAMES as S} from './sprite-definitions.js';

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
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const {width, height} = imageDef.sprites[0].rect;
    canvas.width = imageDef.sprites.length * width;
    canvas.height = Math.ceil(height * (2 - 0.5**(imageDef.mips - 1)));
    const ctx = canvas.getContext('2d');
    const mipImg = new Image();
    mipImg.onload = () => this.current++;
    
    for (let i in imageDef.sprites) {
      const s = imageDef.sprites[i], r = s.rect;
      if (this.sprites.has(s.id)) {
        throw new Error("Sprite id conflict.");
      }
      const mip = new Array(imageDef.mips).fill(0)
          .map((_, j) => ({
            x: i * width / (2**j),
            y: height * (2 - 2**(1 - j)),
            width: width / (2**j),
            height: height / (2**j),
          })).reverse();
      mip.forEach(m => ctx.drawImage(img,
          r.x, r.y, r.width, r.height,
          m.x, m.y, m.width, m.height));
      
      this.sprites.set(s.id, {
        image: mipImg,
        mip,
      });
    }
    mipImg.src = canvas.toDataURL();
    /*
    let a = document.createElement('a');
    a.download = imageDef.path;
    a.href = canvas.toDataURL();
    a.innerText = imageDef.path + " " + width + "\n";
    //a.appendChild(mipImg);
    //a.appendChild(canvas);
    document.body.appendChild(a);
    */
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
    let sprite = 42*16;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        let s = this.get(sprite+i*8+j), r =s.mip[0];
        let rect = [10+i*70, 10+ j*70, 64, 64];
        ctx.drawImage(s.image,
            r.x, r.y, r.width, r.height,
            ...rect);
        ctx.strokeStyle="red";
        ctx.strokeRect(...rect);
      }
    }
    
    let a = 32;
    
    let s = this.get(sprite + (Math.floor(time / 60) % a));
    if(!s) return;
    let r =s.mip[0];
    let rect = [10, 570, 64, 64];
    ctx.drawImage(s.image,
        r.x, r.y, r.width, r.height,
        ...rect);
    ctx.strokeStyle="red";
    ctx.strokeRect(...rect);
  }
};

const INSTANCE = new SpritePool();
INSTANCE.get = INSTANCE.sprites.get.bind(INSTANCE.sprites);

export {INSTANCE as SPRITES};

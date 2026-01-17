import {SPRITES} from './sprite-pool.js';
import {SETTINGS} from './storage.js';
import {MAP_COLOR, RESOURCES} from './map-generator.js';

export const SIZE = 32;

/**
 * Part of the game map.
 * Inner fields get accessed directly from GameMap.
 */
function Chunk(cx, cy) {
  this.x = cx;
  this.y = cy;
  this.tiles = [];
  this.resources = undefined;
  this.mapBlocks = [];
  this.mapResources = undefined;
  this.entities = [];
  this.particles = [];
}

Chunk.prototype.generate = function(mapGenerator) {
  this.tiles = mapGenerator.generateTiles(this.x, this.y);
  this.resources = mapGenerator.generateResources(this.x, this.y, this.tiles);
  
  this.mapBlocks = [];
  for (let x = 0; x < SIZE; x++) {
    let last = undefined;
    for (let y = 0; y < SIZE; y++) {
      const {color} = MAP_COLOR.find(range =>
          this.tiles[x][y] < range.end);
      if (color == last?.color) {
        last.height++;
      } else {
        last = {x, y, width: 1, height: 1, color};
        this.mapBlocks.push(last);
      }
    }
  }
  if (this.resources) {
    this.mapResources = [];
    for (let x = 0; x < SIZE; x++) {
      if (!this.resources[x]) continue;
      let last, lastId = undefined;
      for (let y = 0; y < SIZE; y++) {
        const res = this.resources[x][y];
        if (!res) continue;
        if (res.id == lastId && last.y == y - 1) {
          last.height++;
        } else {
          const {color} = RESOURCES.find(r => r.id == res.id);
          last = {x, y, width: 1, height: 1, color};
          this.mapResources.push(last);
        }
      }
    }
  }
  return this;
};

Chunk.prototype.drawTerrain = function(ctx, view) {
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  const x0 = this.x * SIZE, y0 = this.y * SIZE;
  const xStart = Math.max(0, Math.floor(vx / s - x0));
  const xEnd = Math.min(SIZE, Math.ceil((vx + vw) / s - x0));
  const yStart = Math.max(0, Math.floor(vy / s - y0));
  const yEnd = Math.min(SIZE, Math.ceil((vy + vh) / s - y0));
  const scaleCeil = Math.ceil(s);
  
  for (let x = xStart; x < xEnd; x++) {
    for (let y = yStart; y < yEnd; y++) {
      const sprite = SPRITES.get(this.tiles[x][y]);
      
      ctx.drawImage(
          sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          Math.floor((x0 + x) * s - vx),
          Math.floor((y0 + y) * s - vy),
          scaleCeil, scaleCeil);
      window.numberImageDraws++;
    }
  }
  
  if (!SETTINGS.debugInfo) return;
  // Chunk boundaries.
  const lx = x0 * s - vx, ly = y0 * s - vy;
  ctx.beginPath();
  ctx.moveTo(lx, ly + SIZE * s);
  ctx.lineTo(lx, ly);
  ctx.lineTo(lx + SIZE * s, ly);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  ctx.stroke();
  window.numberOtherDraws++;
};

Chunk.prototype.drawMap = function(ctx, view) {
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  const x0 = this.x * SIZE, y0 = this.y * SIZE;
  const xStart = Math.floor(vx / s) - x0;
  const xEnd = Math.ceil((vx + vw) / s) - x0;
  const yStart = Math.floor(vy / s) - y0;
  const yEnd = Math.ceil((vy + vh) / s) - y0;
  let lastColor = undefined;
  for (let {x, y, width, height, color} of this.mapBlocks) {
    if (x > xEnd || x + width < xStart ||
        y > yEnd || y + height < yStart) continue;
    if (color != lastColor) {
      ctx.fillStyle = lastColor = color;
    }
    ctx.fillRect(Math.floor((x0 + x) * s - vx), Math.floor((y0 + y) * s - vy),
        Math.ceil(width * s), Math.ceil(height * s));
    window.numberOtherDraws++;
  }
  if (this.mapResources) {
    ctx.save();
    {
      ctx.beginPath();
      const sx = x0 * s - vx, sy = y0 * s - vy;
      const sz = s > 8 ? 10 : 6, szsz = 2 * sz;
      const ss = Math.ceil(SIZE * s / szsz) * szsz;
      const sxs = Math.floor((x0 * s) / szsz) * szsz - vx;
      const sys = Math.floor((y0 * s) / szsz) * szsz - vy;
      for(let x = sxs; x <= sxs + ss + sz; x += szsz) {
        ctx.rect(x, sy, sz, ss);
        window.numberOtherDraws++;
      }
      for(let y = sys; y <= sys + ss + sz; y += szsz) {
        ctx.rect(sx, y, ss, sz);
        window.numberOtherDraws++;
      }
      ctx.clip("evenodd");
    }
    for (let {x, y, width, height, color} of this.mapResources) {
      if (x > xEnd || x + width < xStart ||
          y > yEnd || y + height < yStart) continue;
      if (color != lastColor) {
        ctx.fillStyle = lastColor = color;
      }
      ctx.fillRect(Math.floor((x0 + x) * s - vx), Math.floor((y0 + y) * s - vy),
          Math.ceil(width * s), Math.ceil(height * s));
      window.numberOtherDraws++;
    }
    ctx.restore();
  }
  
  if (!SETTINGS.debugInfo) return;
  // Chunk boundaries.
  const lx = x0 * s - vx, ly = y0 * s - vy;
  ctx.beginPath();
  ctx.moveTo(lx, ly + SIZE * s);
  ctx.lineTo(lx, ly);
  ctx.lineTo(lx + SIZE * s, ly);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  ctx.stroke();
  window.numberOtherDraws++;
};

Chunk.prototype.drawResources = function(ctx, view) {
  if (!this.resources) return;
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  const x0 = this.x * SIZE, y0 = this.y * SIZE;
  const xStart = Math.max(0, Math.floor(vx / s - x0 - 1));
  const xEnd = Math.min(SIZE, Math.ceil((vx + vw) / s - x0 + 1));
  const yStart = Math.max(0, Math.floor(vy / s - y0 - 1));
  const yEnd = Math.min(SIZE, Math.ceil((vy + vh) / s - y0 + 1));
  const resourceSize = Math.ceil(s * 1.5);
  for (let x = xStart; x < xEnd; x++) {
    if (!this.resources[x]) continue;
    for (let y = yStart; y < yEnd; y++) {
      const r = this.resources[x][y];
      if (!r) continue;
      const sprite = SPRITES.get(r.sprite);
      ctx.drawImage(
          sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          Math.floor((x0 + x - 0.25) * s - vx),
          Math.floor((y0 + y - 0.25) * s - vy),
          resourceSize, resourceSize);
      window.numberImageDraws++;
    }
  }
};

Chunk.prototype.drawParticles = function(ctx, view, time) {
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  for (let p of this.particles) {
    if (time < p.startTime) continue;
    if (time > p.startTime + p.duration) continue;
    const t = (time - p.startTime) / p.duration;
    const e = t * t;
    const x = (1 - e) * p.xStart + e * p.xEnd;
    const y = (1 - t) * p.yStart + t * p.yEnd;
    const size = (1 - e) * p.sizeStart + e * p.sizeEnd;
    
    const animation = Math.floor(p.animation +
        (time - p.startTime) * p.animationSpeed / 60) %
        p.animationLength;
    const sprite = SPRITES.get(p.sprite + animation);
    if ((x + sprite.width * size) * s <= vx) continue;
    if (x * s > vx + vw) continue;
    if ((y + sprite.height * size) * s <= vy) continue;
    if (y * s > vy + vh) continue;
    
    ctx.globalAlpha = Math.min((time - p.startTime) / 200,
        (1 - e) * p.alphaStart + e * p.alphaEnd);
    ctx.drawImage(
        sprite.image,
        sprite.x, sprite.y,
        sprite.width, sprite.height,
        (x * s - vx),
        (y * s - vy),
        (sprite.width * size * s / 64),
        (sprite.height * size * s / 64));
    window.numberImageDraws++;
  }
  ctx.globalAlpha = 1;
};

export {Chunk};

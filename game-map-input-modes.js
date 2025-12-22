import {TYPE, DIRECTION, DIRECTIONS} from './entity-properties.js';
import {S} from './sprite-pool.js';
import {COLOR} from './ui-properties.js';

function MultiBuild(ui) {
  this.ui = ui;
}

BeltDrag.prototype.set =
UndergroundExit.prototype.set =
OffshorePump.prototype.set =
MultiBuild.prototype.set = function(gameMap) {
  this.gameMap = gameMap;
  this.view = gameMap.view;
};

MultiBuild.prototype.initialize = function(entity, sx, sy) {
  const {width, height} = entity.size ?
      entity.size[this.ui.rotateButton.direction] : entity;
  this.x = Math.floor((sx + this.view.x) / this.view.scale -
      (width - 1) / 2);
  this.y = Math.floor((sy + this.view.y) / this.view.scale -
      (height - 1) / 2);
  this.entity = entity;
  this.direction = this.ui.rotateButton.direction;
  this.length = 1;
  return this;
};

MultiBuild.prototype.touchMove = function(sx, sy) {
  const x = (sx + this.view.x) / this.view.scale;
  const y = (sy + this.view.y) / this.view.scale;
  const {width, height} = this.entity.size ?
      this.entity.size[this.ui.rotateButton.direction] :
      this.entity;
  const diffX = x - this.x - width / 2,
      diffY = y - this.y - height / 2;
  if (Math.abs(diffX) < Math.abs(diffY)) {
    this.direction = diffY < 0 ?
        DIRECTION.north : DIRECTION.south;
    this.length = Math.round(Math.abs(diffY / height) + 1);
  } else {
    this.direction = diffX > 0 ?
        DIRECTION.east : DIRECTION.west;
    this.length = Math.round(Math.abs(diffX / width) + 1);
  }
};

MultiBuild.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!last) return this;
  const {width, height} = this.entity.size ?
      this.entity.size[this.ui.rotateButton.direction] :
      this.entity;
  const dx = -((this.direction - 2) % 2),
      dy = (this.direction - 1) % 2;
  for (let i = 0; i < this.length; i++) {
    const x = this.x + i * dx * width,
        y = this.y + i * dy * height;
    if (!this.gameMap.canPlace(x, y, width, height))
      continue;
    this.gameMap.createEntity({
        x, y, direction: this.ui.rotateButton.direction,
        name: this.entity.name});
  }
};

MultiBuild.prototype.draw = function(ctx) {
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const eps = 0.08 * this.view.scale;
  const {width, height} = this.entity.size ?
      this.entity.size[this.ui.rotateButton.direction] :
      this.entity;
  const dx = -((this.direction - 2) % 2),
      dy = (this.direction - 1) % 2;
  for (let i = 0; i < this.length; i++) {
    const x = Math.floor((this.x +
        i * dx * width) * this.view.scale - this.view.x),
        y = Math.floor((this.y +
        i * dy * height) * this.view.scale - this.view.y);
    ctx.strokeRect(x + eps, y + eps,
        width * this.view.scale - 2 * eps,
        height * this.view.scale - 2 * eps);
  }
};

function BeltDrag(ui) {
  this.ui = ui;
}

BeltDrag.prototype.initialize = function(entity, sx, sy) {
  this.x = Math.floor((sx + this.view.x) / this.view.scale);
  this.y = Math.floor((sy + this.view.y) / this.view.scale);
  if (!this.gameMap.canPlace(this.x,
      this.y, 1, 1)) {
    return undefined;
  }
  this.entity = entity;
  this.direction = this.ui.rotateButton.direction;
  this.length = 1;
  return this;
};

BeltDrag.prototype.touchMove = function(sx, sy) {
  const diffX = (sx + this.view.x) / this.view.scale -
      this.x - 0.5;
  const diffY = (sy + this.view.y) / this.view.scale  -
      this.y - 0.5;
  const oldDirection = this.direction;
  if (Math.abs(diffX) < Math.abs(diffY)) {
    this.direction = diffY < 0 ?
        DIRECTION.north : DIRECTION.south;
  } else {
    this.direction = diffX > 0 ?
        DIRECTION.east : DIRECTION.west;
  }
  const oldLength = oldDirection != this.direction ?
      1 : this.length;
  this.length = Math.round(Math.max(
      Math.abs(diffX), Math.abs(diffY)) + 0.5);
  for (let i = oldLength; i < this.length; i++) {
    const x = this.x - i *
        ((this.direction - 2) % 2);
    const y = this.y + i *
        ((this.direction - 1) % 2);
    if (!this.gameMap.canPlace(x, y, 1, 1)) {
      this.length = i;
      break;
    }
  }
};

BeltDrag.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!last) return this;
  for (let i = 0; i < this.length; i++) {
    const x = this.x - i * ((this.direction - 2) % 2);
    const y = this.y + i * ((this.direction - 1) % 2);
    if (!this.gameMap.canPlace(x, y, 1, 1)) {
      break;
    }
    this.gameMap.createEntity({
        name: this.entity.name, x, y,
        direction: this.direction});
  }
  return undefined;
};

BeltDrag.prototype.draw = function(ctx) {
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const d = this.direction;
  const x1 = Math.floor(this.x *
      this.view.scale - this.view.x);
  const x2 = x1 - ((d - 2) % 2) *
      (this.length - 1) * this.view.scale;
  const y1 = Math.floor(this.y *
      this.view.scale - this.view.y);
  const y2 = y1 + ((d - 1) % 2) *
      (this.length - 1) * this.view.scale;
  ctx.strokeRect(
      Math.min(x1, x2), Math.min(y1, y2),
      Math.abs(x1 - x2) + this.view.scale,
      Math.abs(y1 - y2) + this.view.scale);
  // Draw arrow.
  const half = this.view.scale / 2;
  const vx = -((d - 2) % 2) * this.view.scale,
      vy = ((d - 1) % 2) * this.view.scale,
      px = -vy, py = vx;
  ctx.beginPath();
  ctx.moveTo(x2 + half + 0.25 * (-vx - px),
      y2 + half + 0.25 * (-vy - py));
  ctx.lineTo(x2 + half, y2 + half);
  ctx.lineTo(x2 + half + 0.25 * (-vx + px),
      y2 + half + 0.25 * (-vy + py));
  if (this.length > 1) {
    ctx.moveTo(x1 + half + 0.5 * vx,
        y1 + half + 0.5 * vy);
    ctx.lineTo(x2 + half, y2 + half);
    ctx.stroke();
    ctx.font = this.view.scale > 22 ?
        "20px monospace" : "14px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLOR.buildPlanner;
    ctx.fillText(this.length, x1 + half, y1 + half);
    ctx.textAlign = "start";
  } else {
    ctx.stroke();
  }
};

function UndergroundExit(ui) {
  this.ui = ui;
}

UndergroundExit.prototype.initialize = function(entity, sx, sy, direction) {
  this.entity = entity;
  const {dx, dy} = DIRECTIONS[direction];
  this.x = Math.floor((sx + this.view.x) / this.view.scale) + dx;
  this.y = Math.floor((sy + this.view.y) / this.view.scale) + dy;
  this.direction = direction;
  return this;
};

UndergroundExit.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!shortTouch) return this;
  const x = Math.floor((sx + this.view.x) / this.view.scale);
  const y = Math.floor((sy + this.view.y) / this.view.scale);
  const dx = x - this.x,
      dy = y - this.y,
      d = this.direction,
      length = this.entity.maxUndergroundGap + 1;
  if (d&0x1 ? dy == 0 && dx * -((d - 2) % 2) >= 0 &&
      dx * -((d - 2) % 2) < length :
      dx == 0 && dy * ((d - 1) % 2) >= 0 &&
      dy * ((d - 1) % 2) < length) {
    if (this.gameMap.canPlace(x, y, 1, 1)) {
      const data = this.entity.type == TYPE.undergroundBelt ?
          {undergroundUp: true} : undefined;
      const direction = this.entity.type == TYPE.undergroundBelt ?
          this.direction : (this.direction + 2) % 4;
      this.gameMap.createEntity({
        name: this.entity.name,
        x, y, direction, data});
    }
  }
};

UndergroundExit.prototype.draw = function(ctx) {
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const d = this.direction;
  const x1 = Math.floor(this.x *
      this.view.scale - this.view.x);
  const x2 = x1 - ((d - 2) % 2) *
      this.entity.maxUndergroundGap * this.view.scale;
  const y1 = Math.floor(this.y *
      this.view.scale - this.view.y);
  const y2 = y1 + ((d - 1) % 2) *
      this.entity.maxUndergroundGap * this.view.scale;
  ctx.strokeRect(
      Math.min(x1, x2), Math.min(y1, y2),
      Math.abs(x1 - x2) + this.view.scale,
      Math.abs(y1 - y2) + this.view.scale);
};

function OffshorePump(ui) {
  this.ui = ui;
}

OffshorePump.prototype.initialize = function(entity) {
  this.entity = entity;
  return this;
};

OffshorePump.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!shortTouch) return this;
  let x = Math.floor((sx + this.view.x) / this.view.scale);
  let y = Math.floor((sy + this.view.y) / this.view.scale);
  if (this.gameMap.getTerrainAt(x, y) < S.water) {
    for (let i = 0; i < DIRECTIONS.length; i++) {
      const {dx, dy} = DIRECTIONS[i];
      if (this.gameMap.getTerrainAt(x + dx, y + dy) >= S.water) {
        x += dx;
        y += dy;
        break;
      }
    }
  }
  const direction = this.gameMap.canPlaceOffshorePump(x, y);
  if (direction != -1) {
    if (direction == DIRECTION.west) x--;
    if (direction == DIRECTION.north) y--;
    this.gameMap.createEntity({
        name: this.entity.name,
        x, y, direction});
    return this;
  } else {
    this.ui.buildMenu.reset();
  }
};

OffshorePump.prototype.draw = function(ctx) {
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const eps = 0.08 * this.view.scale;
  const xStart = Math.floor(this.view.x / this.view.scale) - 1;
  const xEnd = Math.ceil((this.view.x + this.view.width) / this.view.scale) + 1;
  const yStart = Math.floor(this.view.y / this.view.scale) - 1;
  const yEnd = Math.ceil((this.view.y + this.view.height) / this.view.scale) + 1;
  for (let x = xStart; x < xEnd; x++) {
    for (let y = yStart; y < yEnd; y++) {
      const direction = this.gameMap.canPlaceOffshorePump(x, y);
      if (direction == -1) continue;
      
      const x1 = Math.floor(x * this.view.scale - this.view.x);
      const x2 = x1 - ((direction - 2) % 2) * this.view.scale;
      const y1 = Math.floor(y * this.view.scale - this.view.y);
      const y2 = y1 + ((direction - 1) % 2) * this.view.scale;
      ctx.strokeRect(
          Math.min(x1, x2) + eps, Math.min(y1, y2) + eps,
          Math.abs(x1 - x2) + this.view.scale - 2 * eps,
          Math.abs(y1 - y2) + this.view.scale - 2 * eps);
    }
  }
};

export {BeltDrag, MultiBuild, UndergroundExit, OffshorePump};

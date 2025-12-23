import {TYPE, DIRECTION, DIRECTIONS} from './entity-properties.js';
import {S} from './sprite-pool.js';
import {COLOR} from './ui-properties.js';

function MultiBuild(ui) {
  this.ui = ui;
}

SnakeBelt.prototype.set =
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

BeltDrag.prototype.touchEnd = function(sx, sy, shortTouch, lastTouch) {
  if (!lastTouch) return this;
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
  const s = this.view.scale, half = s / 2;;
  const ox = -this.view.x;
  const oy = -this.view.y;
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const d = this.direction;
  const l = this.length - 1;
  const x1 = Math.floor(this.x * s + ox);
  const x2 = x1 - ((d - 2) % 2) * l * s;
  const y1 = Math.floor(this.y * s + oy);
  const y2 = y1 + ((d - 1) % 2) * l * s;
  ctx.strokeRect(
      Math.min(x1, x2), Math.min(y1, y2),
      Math.abs(x1 - x2) + s,
      Math.abs(y1 - y2) + s);
  // Draw arrow.
  const vx = -((d - 2) % 2) * s,
      vy = ((d - 1) % 2) * s,
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
    ctx.font = s > 22 ?
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

function SnakeBelt(ui) {
  this.ui = ui;
}
const SNAKE_DELTA = 16; // Pixels for drag snaking.
const SNAKE_START = {x: 25, y: 75};

SnakeBelt.prototype.initialize = function(entity) {
  this.entity = entity;
  this.active = false;
  this.nodes = [new Node(entity.x, entity.y, entity.direction)];
  this.lastX = 0;
  this.lastY = 0;
  return this;
};

SnakeBelt.prototype.touchStart = function(sx, sy, firstTouch) {
  const {x, y} = this.nodes[0];
  const cx = (x + 1) * this.view.scale - this.view.x + SNAKE_START.x,
      cy = (y + 1) * this.view.scale - this.view.y + SNAKE_START.y;
  if (firstTouch && !this.active &&
      Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2) < 22) {
    this.active = true;
    this.lastX = sx;
    this.lastY = sy;
  }
};

SnakeBelt.prototype.touchMove = function(sx, sy) {
  if (!this.active) return;
  const dx = sx - this.lastX,
      dy = sy - this.lastY;
  if (Math.abs(dx) < SNAKE_DELTA &&
      Math.abs(dy) < SNAKE_DELTA)
    return;
  this.lastX = sx;
  this.lastY = sy;
  let dir;
  if (Math.abs(dx) > Math.abs(dy)) {
    dir = dx > 0 ? DIRECTION.east : DIRECTION.west;
  } else {
    dir = dy > 0 ? DIRECTION.south : DIRECTION.north;
  }
  const last = this.nodes[this.nodes.length - 1];
  if (dir == last.direction) {
    last.length++;
  } else if (dir == (last.direction + 2) % 4) {
    if (last.length == 1) {
      last.direction = dir;
    } else {
      last.length--;
    }
  } else if (last.length == 1) {
    if (this.nodes.length == 1) {
      last.direction = dir;
    } else {
      const prev = this.nodes[this.nodes.length - 2];
      this.nodes.pop();
      if (dir == prev.direction) {
        prev.length += 2;
      }
    }
  } else {
    last.length--;
    const {dx, dy} = DIRECTIONS[last.direction];
    this.nodes.push(new Node(last.x + dx * last.length,
        last.y + dy * last.length, dir));
  }
};

SnakeBelt.prototype.touchEnd = function(sx, sy, shortTouch, lastTouch) {
  if (!lastTouch) return this;
  if (!this.active) {
    return !shortTouch ? this : undefined;
  }
  if (shortTouch) {
    this.active = false;
    return this;
  }
  if (this.entity.direction != this.nodes[0].direction) {
    this.gameMap.deleteEntity(this.entity);
  }
  const entities = [];
  for (let node of this.nodes) {
    const {dx, dy} = DIRECTIONS[node.direction];
    next:
    for (let i = 0; i < node.length; i++) {
      const x = node.x + i * dx,
          y = node.y + i * dy;
      if (!this.gameMap.canPlace(x, y, 1, 1))
        continue;
      for (let entity of entities) {
        if (entity.x == x && entity.y == y)
          continue next;
      }
      entities.push({
          name: this.entity.name, x, y,
          direction: node.direction});
    }
  }
  this.gameMap.pasteEntities(entities, 0, 0);
};

SnakeBelt.prototype.draw = function(ctx) {
  const s = this.view.scale;
  const ox = -this.view.x;
  const oy = -this.view.y;
  const half = s / 2;
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  if (!this.active) {
    const {x, y} = this.nodes[0];
    ctx.strokeRect(x * s + ox, y * s + oy, s, s);
    ctx.beginPath();
    const cx = x * s + s + ox + SNAKE_START.x,
        cy = y * s + s + oy + SNAKE_START.y, pi = Math.PI;
    ctx.arc(cx, cy, 20, 0, 2 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, -0.1 * pi, 0.1 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 0.4 * pi, 0.6 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 0.9 * pi, 1.1 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 1.4 * pi, 1.6 * pi);
    ctx.moveTo(x * s + s * 4 / 5 + ox, y * s + s + oy);
    ctx.lineTo(cx - 8.5, cy - 18.5);
    ctx.stroke();
    return;
  }
  
  // Draw box.
  ctx.beginPath();
  {
    const first = this.nodes[0];
    const {dx, dy} = DIRECTIONS[first.direction];
    const px = -dy, py = dx;
    const sx = first.x * s + ox + half;
    const sy = first.y * s + oy + half;
    ctx.moveTo(sx - half * px, sy - half * py);
    ctx.lineTo(sx - half * dx - half * px,
        sy - half * dy - half * py);
    ctx.lineTo(sx - half * dx + half * px,
        sy - half * dy + half * py);
    ctx.lineTo(sx + half * px, sy + half * py);
  }
  for (let i = 0; i < this.nodes.length; i++) {
    const node = this.nodes[i], prev = this.nodes[i - 1], next = this.nodes[i + 1];
    const {dx, dy} = DIRECTIONS[node.direction];
    const px = -dy, py = dx;
    const sx = node.x * s + ox + half;
    const sy = node.y * s + oy + half;
    const segLen = (node.length - (next ? 0 : 0.5)) * s;
    const fromDir = ((node.direction - (prev?.direction ?? (node.direction + 2)) + 4) % 4) - 2;
    const toDir = (((next?.direction ?? (node.direction + 2)) - node.direction + 4) % 4) - 2;
    ctx.moveTo(sx + half * (fromDir * dx - px), 
        sy + half * (fromDir * dy - py));
    ctx.lineTo(sx + segLen * dx - half * (toDir * dx + px), 
        sy + segLen * dy - half * (toDir * dy + py));
    ctx.moveTo(sx - half * (fromDir * dx - px), 
        sy - half * (fromDir * dy - py));
    ctx.lineTo(sx + segLen * dx + half * (toDir * dx + px), 
        sy + segLen * dy + half * (toDir * dy + py));
  }
  {
    const last = this.nodes[this.nodes.length - 1];
    const {dx, dy} = DIRECTIONS[last.direction];
    const px = -dy, py = dx;
    const sx = (last.x + (last.length - 1) * dx) * s + ox + half;
    const sy = (last.y + (last.length - 1) * dy) * s + oy + half;
    ctx.moveTo(sx + half * dx - half * px,
        sy + half * dy - half * py);
    ctx.lineTo(sx + half * dx + half * px,
        sy + half * dy + half * py);
  }
  ctx.stroke();
  // Draw arrow.
  {
    const first = this.nodes[0];
    let arrowStart;
    if (first.length > 1 || this.nodes.length > 1) {
      let length = 0;
      for (let node of this.nodes) length += node.length;
      ctx.font = s > 22 ? "20px monospace" : "14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = COLOR.buildPlanner;
      ctx.fillText(length,
          first.x * s + ox + half, first.y * s + oy + half);
      ctx.textAlign = "start";
      arrowStart = 0.5;
    } else {
      arrowStart = -0.25;
    }
    const {dx, dy} = DIRECTIONS[first.direction];
    ctx.beginPath();
    ctx.moveTo((first.x + arrowStart * dx) * s + ox + half,
        (first.y + arrowStart * dy) * s + oy + half);
  }
  for (let i = 1; i < this.nodes.length; i++) {
    const node = this.nodes[i];
    ctx.lineTo(node.x * s + ox + half,
        node.y * s + oy + half);
  }
  // Draw arrow head.
  {
    const last = this.nodes[this.nodes.length - 1];
    const {dx, dy} = DIRECTIONS[last.direction];
    const px = -dy, py = dx;
    const tx = (last.x + last.length * dx) * s + ox + half;
    const ty = (last.y + last.length * dy) * s + oy + half;
    const headLen = 0.625 * s;
    const backLen = 0.875 * s;
    const wingW = 0.25 * s;
    ctx.lineTo(tx - headLen * dx, ty - headLen * dy);
    ctx.moveTo(tx - backLen * dx - wingW * px, 
        ty - backLen * dy - wingW * py);
    ctx.lineTo(tx - headLen * dx, ty - headLen * dy);
    ctx.lineTo(tx - backLen * dx + wingW * px, 
        ty - backLen * dy + wingW * py);
  }
  ctx.stroke();
};

function Node(x, y, direction) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.length = 1;
}

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

UndergroundExit.prototype.touchEnd = function(sx, sy, shortTouch, lastTouch) {
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

OffshorePump.prototype.touchEnd = function(sx, sy, shortTouch, lastTouch) {
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

export {BeltDrag, MultiBuild, SnakeBelt, UndergroundExit, OffshorePump};

import {TYPE, DIRECTION, DIRECTIONS, COLOR as ENTITY_COLOR, ENERGY} from './entity-properties.js';
import {S, SPRITES} from './sprite-pool.js';
import {COLOR} from './ui-properties.js';


function MultiBuild(ui) {
  this.ui = ui;
}

MultiBuild.prototype.set =
BeltDrag.prototype.set =
SnakeBelt.prototype.set =
UndergroundChain.prototype.set =
UndergroundExit.prototype.set =
InserterDrag.prototype.set =
PowerPoleDrag.prototype.set =
GridDrag.prototype.set =
OffshorePump.prototype.set = function(gameMap) {
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
  const entities = [];
  for (let i = 0; i < this.length; i++) {
    const x = this.x + i * dx * width,
        y = this.y + i * dy * height;
    if (!this.gameMap.canPlace(x, y, width, height))
      continue;
    entities.push({
        x, y, direction: this.ui.rotateButton.direction,
        name: this.entity.name});
  }
  this.gameMap.createEntities(entities);
};

MultiBuild.prototype.draw = function(ctx) {
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const s = this.view.scale, ox = -this.view.x, oy = -this.view.y;
  const eps = 0.08 * s;
  const {width, height} = this.entity.size ?
      this.entity.size[this.ui.rotateButton.direction] :
      this.entity;
  const {dx, dy} = DIRECTIONS[this.direction];
  for (let i = 0; i < this.length; i++) {
    const x = Math.floor((this.x +
        i * dx * width) * s + ox),
        y = Math.floor((this.y +
        i * dy * height) * s + oy);
    ctx.strokeRect(x + eps, y + eps,
        width * s - 2 * eps,
        height * s - 2 * eps);
  }
  if (this.length <= 1) return;
  if (width > 1) {
    ctx.font = s > 22 ? "20px monospace" : "14px monospace";
  } else {
    ctx.font = s > 22 ? "14px monospace" : "10px monospace";
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOR.buildPlanner;
  const nr = Math.ceil((this.length + 1) / 8);
  for (let i = 0; i < nr; i++) {
    ctx.fillText(this.length,
        (this.x + width * ((i * 8 - (i ? 1 : 0)) * dx + 0.5)) * s + ox,
        (this.y + height * ((i * 8 - (i ? 1 : 0)) * dy + 0.5)) * s + oy);
  }
  ctx.textAlign = "start";
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
  const entities = [];
  for (let i = 0; i < this.length; i++) {
    const x = this.x - i * ((this.direction - 2) % 2);
    const y = this.y + i * ((this.direction - 1) % 2);
    if (!this.gameMap.canPlace(x, y, 1, 1))
      break;
    entities.push({
        name: this.entity.name, x, y,
        direction: this.direction});
  }
  this.gameMap.createEntities(entities);
};

BeltDrag.prototype.draw = function(ctx) {
  const s = this.view.scale, half = s / 2;;
  const ox = -this.view.x, oy = -this.view.y;
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
  this.icon = undefined;
}
const SNAKE_DELTA = 12; // Pixels for drag snaking.
const SNAKE_START = {x: 25, y: 75};

SnakeBelt.prototype.initialize = function(entity) {
  this.entity = entity;
  this.active = false;
  this.nodes = [new Node(entity.x, entity.y, entity.direction)];
  this.lastX = 0;
  this.lastY = 0;
  if (!this.icon) {
    this.icon = SPRITES.get(S.snakeIcon);
  }
  return this;
};

SnakeBelt.prototype.isClickMode = function() {
  return !this.active;
}

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
  this.gameMap.createEntities(entities);
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
    const icon = this.icon;
    ctx.drawImage(icon.image,
        icon.x, icon.y, icon.width, icon.height,
        cx - 12, cy - 12, 24, 24);
    return;
  }
  
  // Draw box.
  ctx.beginPath();
  for (let i = 0; i < this.nodes.length; i++) {
    const node = this.nodes[i], prev = this.nodes[i - 1], next = this.nodes[i + 1];
    const {dx, dy} = DIRECTIONS[node.direction];
    const px = -dy, py = dx;
    const sx = node.x * s + ox + half;
    const sy = node.y * s + oy + half;
    const segLen = (node.length - (next ? 0 : 0.5)) * s;
    const fromDir = ((node.direction - (prev?.direction ?? (node.direction + 2)) + 4) % 4) - 2;
    const toDir = (((next?.direction ?? (node.direction + 2)) - node.direction + 4) % 4) - 2;
    if (!prev) {
      ctx.moveTo(sx - half * px, sy - half * py);
      ctx.lineTo(sx - half * dx - half * px,
          sy - half * dy - half * py);
      ctx.lineTo(sx - half * dx + half * px,
          sy - half * dy + half * py);
      ctx.lineTo(sx + half * px, sy + half * py);
    }
    ctx.moveTo(sx + half * (fromDir * dx - px), 
        sy + half * (fromDir * dy - py));
    ctx.lineTo(sx + segLen * dx - half * (toDir * dx + px), 
        sy + segLen * dy - half * (toDir * dy + py));
    ctx.moveTo(sx - half * (fromDir * dx - px), 
        sy - half * (fromDir * dy - py));
    ctx.lineTo(sx + segLen * dx + half * (toDir * dx + px), 
        sy + segLen * dy + half * (toDir * dy + py));
    if (!next) {
      const ex = sx + (node.length - 0.5) * dx * s;
      const ey = sy + (node.length - 0.5) * dy * s;
      ctx.moveTo(ex - half * px, ey - half * py);
      ctx.lineTo(ex + half * px, ey + half * py);
    }
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
    const head = 0.625 * s;
    const back = 0.875 * s;
    const wing = 0.25 * s;
    ctx.lineTo(tx - head * dx, ty - head * dy);
    ctx.moveTo(tx - back * dx - wing * px, 
        ty - back * dy - wing * py);
    ctx.lineTo(tx - head * dx, ty - head * dy);
    ctx.lineTo(tx - back * dx + wing * px, 
        ty - back * dy + wing * py);
  }
  ctx.stroke();
};

function Node(x, y, direction) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.length = 1;
}

function UndergroundChain(ui) {
  this.ui = ui;
  this.placeable = [true];
  this.gaps = [];
}

UndergroundChain.prototype.initialize = function(entity, sx, sy) {
  this.entity = entity;
  this.x = Math.floor((sx + this.view.x) / this.view.scale);
  this.y = Math.floor((sy + this.view.y) / this.view.scale);
  if (!this.gameMap.canPlace(this.x, this.y, 1, 1))
    return;
  this.direction = 0;
  this.length = 1;
  this.placeable.length = 1;
  this.gaps.length = 0;
  return this;
};

UndergroundChain.prototype.touchMove = function(sx, sy) {
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
  const {dx, dy} = DIRECTIONS[this.direction];
  for (let i = oldLength; i < this.length; i++) {
    this.placeable[i] = this.gameMap.canPlace(
        this.x + i * dx, this.y + i * dy, 1, 1);
  }
  this.gaps.length = 0;
  let current = 1;
  outer:
  while (current < this.length) {
    const step = Math.min(this.entity.maxUndergroundGap,
        this.length - current - 1);
    for (let i = step; i >= 0; i--) {
      if (current + i == this.length) {
        this.gaps.push(i);
        return;
      }
      if (this.placeable[current + i] && this.placeable[current + i + 1]) {
        this.gaps.push(i);
        current += i + 2;
        continue outer;
      }
    }
    this.gaps.push(step);
    current += step + 2;
  }
};

UndergroundChain.prototype.touchEnd = function(sx, sy, shortTouch, lastTouch) {
  if (shortTouch || !lastTouch) return this;
  const start = {
    name: this.entity.name,
    direction: this.entity.type == TYPE.pipeToGround ?
        (this.direction + 2) % 4 : this.direction,
  };
  const end = {
    name: this.entity.name,
    direction: this.direction,
    data: this.entity.type == TYPE.undergroundBelt ?
        {undergroundUp: true} : undefined,
  };
  const {dx, dy} = DIRECTIONS[this.direction];
  const entities = [];
  entities.push({x: this.x, y: this.y, ...start});
  let current = 1;
  for (let gap of this.gaps) {
    current += gap;
    const x = this.x + current * dx,
        y = this.y + current * dy;
    if (this.placeable[current])
      entities.push({x: x, y: y, ...end});
    if (current >= this.length - 2) break;
    if (this.placeable[current + 1])
      entities.push({x: x + dx, y: y + dy, ...start});
    current += 2;
  }
  this.gameMap.createEntities(entities);
};

UndergroundChain.prototype.draw = function(ctx) {
  const s = this.view.scale, half = s / 2;
  const ox = -this.view.x;
  const oy = -this.view.y;
  const {dx, dy} = DIRECTIONS[this.direction];
  const px = -dy, py = dx;
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  ctx.strokeRect(this.x * s + ox, this.y * s + oy, s, s);
  let current = 1
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  for (let gap of this.gaps) {
    const x = (this.x + current * dx) * s + ox + half,
        y = (this.y + current * dy) * s + oy + half;
    ctx.moveTo(x - (dx + px) * half, y - (dy + py) * half);
    ctx.lineTo(x + gap * dx * s - (dx + px) * half,
        y + gap * dy * s - (dy + py) * half);
    ctx.moveTo(x - (dx - px) * half, y - (dy - py) * half);
    ctx.lineTo(x + gap * dx * s - (dx - px) * half,
        y + gap * dy * s - (dy - py) * half);
    current += gap + 2;
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  current = 1;
  let lastValid = true;
  for (let gap of this.gaps) {
    current += gap;
    const x = (this.x + current * dx) * s + ox + half,
        y = (this.y + current * dy) * s + oy + half;
    const isValid = this.placeable[current] &&
        ((current == this.length - 1) || this.placeable[current + 1]);
    if (isValid != lastValid) {
      lastValid = isValid;
      ctx.stroke();
      ctx.strokeStyle = isValid ?
        COLOR.buildPlanner : COLOR.buildPlannerInvalid;
      ctx.beginPath();
    }
    const l = current + 2 >= this.length ? 1 : 2;
    ctx.moveTo(x - (dx + px) * half, y - (dy + py) * half);
    ctx.lineTo(x + l * dx * s - (dx + px) * half,
        y + l * dy * s - (dy + py) * half);
    ctx.lineTo(x + l * dx * s - (dx - px) * half,
        y + l * dy * s - (dy - py) * half);
    ctx.lineTo(x - (dx - px) * half, y - (dy - py) * half);
    ctx.lineTo(x - (dx + px) * half, y - (dy + py) * half);
    current += 2;
  }
  ctx.stroke();
};

function UndergroundExit(ui) {
  this.ui = ui;
}

UndergroundExit.prototype.initialize = function(entity) {
  this.entity = entity;
  this.direction = (entity.direction +
      (entity.type == TYPE.pipeToGround ||
      (entity.type == TYPE.undergroundBelt &&
      entity.data.undergroundUp) ? 2 : 0)) % 4;
  const {dx, dy} = DIRECTIONS[this.direction];
  this.x = entity.x + dx;
  this.y = entity.y + dy;
  return this;
};

UndergroundExit.prototype.isClickMode = function() {
  return true;
}

UndergroundExit.prototype.touchEnd = function(sx, sy, shortTouch, lastTouch) {
  if (!shortTouch) return this;
  const x = Math.floor((sx + this.view.x) / this.view.scale);
  const y = Math.floor((sy + this.view.y) / this.view.scale);
  const dx = x - this.x,
      dy = y - this.y,
      d = this.direction,
      length = this.entity.data.maxUndergroundGap + 1;
  if (d&0x1 ? dy == 0 && dx * -((d - 2) % 2) >= 0 &&
      dx * -((d - 2) % 2) < length :
      dx == 0 && dy * ((d - 1) % 2) >= 0 &&
      dy * ((d - 1) % 2) < length) {
    if (this.gameMap.canPlace(x, y, 1, 1)) {
      const data = this.entity.type == TYPE.undergroundBelt &&
          !this.entity.data.undergroundUp ?
          {undergroundUp: true} : undefined;
      const direction = (this.direction +
          (this.entity.type == TYPE.undergroundBelt &&
          this.entity.data.undergroundUp ? 2 : 0)) % 4;
      this.gameMap.createEntity({
        name: this.entity.name,
        x, y, direction, data});
    }
  }
};

UndergroundExit.prototype.draw = function(ctx) {
  const s = this.view.scale, half = s / 2;
  const ox = -this.view.x;
  const oy = -this.view.y;
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const d = this.direction;
  const x1 = Math.floor(this.x * s + ox);
  const x2 = x1 - ((d - 2) % 2) *
      this.entity.data.maxUndergroundGap * s;
  const y1 = Math.floor(this.y * s + oy);
  const y2 = y1 + ((d - 1) % 2) *
      this.entity.data.maxUndergroundGap * s;
  ctx.strokeRect(
      Math.min(x1, x2), Math.min(y1, y2),
      Math.abs(x1 - x2) + s,
      Math.abs(y1 - y2) + s);
};

function InserterDrag(ui) {
  this.ui = ui;
  this.positions = [];
}

InserterDrag.prototype.initialize = function(entity, sx, sy) {
  this.x = Math.floor((sx + this.view.x) / this.view.scale);
  this.y = Math.floor((sy + this.view.y) / this.view.scale);
  this.entity = entity;
  this.inserterDirection = this.direction =
      this.ui.rotateButton.direction;
  this.positions.length = 0;
  this.input = undefined;
  this.output = undefined;
  this.length = 0;
  return this;
};

InserterDrag.prototype.touchMove = function(sx, sy) {
  const x = (sx + this.view.x) / this.view.scale;
  const y = (sy + this.view.y) / this.view.scale;
  const diffX = x - this.x - 0.5,
      diffY = y - this.y - 0.5;
  const oldDirection = this.direction;
  let oldLength = this.length;
  if (Math.abs(diffX) < Math.abs(diffY)) {
    this.direction = diffY < 0 ?
        DIRECTION.north : DIRECTION.south;
    this.length = Math.round(Math.abs(diffY) + 1);
  } else {
    this.direction = diffX > 0 ?
        DIRECTION.east : DIRECTION.west;
    this.length = Math.round(Math.abs(diffX) + 1);
  }
  if (oldDirection != this.direction) {
    oldLength = 0;
    this.positions.length = 0;
    this.input = undefined;
    this.output = undefined;
  }
  const {dx, dy} = DIRECTIONS[this.direction];
  const {dx: idx, dy: idy} = DIRECTIONS[this.inserterDirection];
  for (let i = oldLength; i < this.length; i++) {
    if (this.positions[this.positions.length - 1] > i)
      continue;
    const x = this.x + i * dx, y = this.y + i * dy;
    if (!this.gameMap.canPlace(x, y, 1, 1))
      continue;
    let input = this.gameMap.getEntityAt(x - idx, y - idy);
    if (input?.type == TYPE.belt ||
        input?.type == TYPE.undergroundBelt) {
      input = input.data.lane;
    }
    let output = this.gameMap.getEntityAt(x + idx, y + idy);
    if (output?.type == TYPE.belt ||
        output?.type == TYPE.undergroundBelt) {
      output = output.data.lane;
    }
    if ((input || output) &&
        this.input == input && this.output == output)
      continue;
    this.input = input;
    this.output = output;
    this.positions.push(i);
  }
};

InserterDrag.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!last) return this;
  const {dx, dy} = DIRECTIONS[this.direction];
  const entities = [];
  for (let i of this.positions) {
    if (i >= this.length) break;
    const x = this.x + i * dx,
        y = this.y + i * dy;
    if (!this.gameMap.canPlace(x, y, 1, 1))
      continue;
    entities.push({
        name: this.entity.name, x, y,
        direction: this.inserterDirection});
  }
  this.gameMap.createEntities(entities);
};

InserterDrag.prototype.draw = function(ctx) {
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const s = this.view.scale, ox = -this.view.x, oy = -this.view.y;
  const eps = 0.08 * s, half = s / 2, q = s / 4;
  const {dx, dy} = DIRECTIONS[this.direction];
  const {dx: idx, dy: idy} = DIRECTIONS[this.inserterDirection];
  const ipx = -idy, ipy = idx;
  ctx.beginPath();
  for (let i of this.positions) {
    if (i >= this.length) break;
    const x = Math.floor((this.x +
        i * dx) * s + ox),
        y = Math.floor((this.y +
        i * dy) * s + oy);
    ctx.rect(x + eps, y + eps,
        s - 2 * eps,
        s - 2 * eps);
    ctx.moveTo(x - idx * s + half, y - idy * s + half);
    ctx.lineTo(x + half - idx * (half - eps), y + half - idy * (half - eps));
    ctx.moveTo(x + half + idx * (half - eps), y + half + idy * (half - eps));
    ctx.lineTo(x + idx * s + half, y + idy * s + half);
    ctx.moveTo(x + idx * (s - q) + half - ipx * q,
        y + idy * (s - q) + half - ipy * q);
    ctx.lineTo(x + idx * s + half, y + idy * s + half);
    ctx.lineTo(x + idx * (s - q) + half + ipx * q,
        y + idy * (s - q) + half + ipy * q);
  }
  ctx.stroke();
  if (this.positions.length && this.positions[0] == 0 && this.length > 1) {
    let i = 0;
    while (this.positions[i] < this.length) i++;
    ctx.font = s > 22 ? "14px monospace" : "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLOR.buildPlanner;
    ctx.fillText(i,
        this.x * s + ox + half, this.y * s + oy + half);
    ctx.textAlign = "start";
  }
};

function PowerPoleDrag(ui) {
  this.ui = ui;
  this.positions = [{}];
}

PowerPoleDrag.prototype.initialize = function(entity, sx, sy) {
  this.x = Math.floor((sx + this.view.x) / this.view.scale);
  this.y = Math.floor((sy + this.view.y) / this.view.scale);
  this.entity = entity;
  this.positions.length = 1;
  this.positions[0].x = this.x;
  this.positions[0].y = this.y;
  return this;
};

PowerPoleDrag.prototype.touchMove = function(sx, sy) {
  this.x = Math.floor((sx + this.view.x) / this.view.scale);
  this.y = Math.floor((sy + this.view.y) / this.view.scale);
  const last = this.positions[this.positions.length - 1];
  if ((last.x - this.x) ** 2 + (last.y - this.y) ** 2 >=
      this.entity.wireReach ** 2) {
    outer:
    for (let i = 0; i < this.entity.wireReach; i++) {
      const p = i / (2 * this.entity.wireReach);
      const x = Math.round(p * last.x + (1 - p) * this.x);
      const y = Math.round(p * last.y + (1 - p) * this.y);
      if ((last.x - x) ** 2 + (last.y - y) ** 2 >
          this.entity.wireReach ** 2)
        continue;
      if (!this.gameMap.canPlace(x, y, 1, 1))
        continue;
      for (let pole of this.positions) {
        if (x == pole.x && y == pole.y)
          continue outer;
      }
      this.positions.push({x, y});
      break;
    }
  }
};

PowerPoleDrag.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!last) return this;
  const entities = [];
  for (let {x, y} of this.positions) {
    if (!this.gameMap.canPlace(x, y, 1, 1))
      continue;
    entities.push(
        {name: this.entity.name, x, y, direction: 0});
  }
  this.gameMap.createEntities(entities);
};

PowerPoleDrag.prototype.draw = function(ctx) {
  if (!this.positions.length) return;
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const s = this.view.scale, ox = -this.view.x, oy = -this.view.y;
  const eps = 0.08 * s, half = s / 2;
  const {width, height} = this.entity;
  ctx.beginPath();
  for (let {x, y} of this.positions) {
    ctx.roundRect(x * s + ox + eps, y * s + oy + eps,
        width * s - 2 * eps, height * s - 2 * eps, 2 * eps);
  }
  ctx.stroke();
  ctx.font = s > 22 ? "14px monospace" : "10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOR.buildPlanner;
  const nr = Math.ceil((this.positions.length + 1) / 8);
  for (let i = 0; i < nr; i++) {
    const position = this.positions[(i * 8 - (i ? 1 : 0))];
    ctx.fillText(this.positions.length,
        position.x * s + ox + width * half,
        position.y * s + oy + height * half);
  }
  ctx.textAlign = "start";
};

function GridDrag(ui) {
  this.ui = ui;
  this.icon = undefined;
}
const GRID_DELTA = 40; // Pixels for drag grid step.
const GRID_START = {x: 25, y: 75};

GridDrag.prototype.initialize = function(entity) {
  this.entity = entity;
  this.active = false;
  this.points = [new Point(entity.x, entity.y, entity.direction)];
  this.lastX = 0;
  this.lastY = 0;
  if (!this.icon) {
    this.icon = SPRITES.get(S.gridDragIcon);
  }
  return this;
};

GridDrag.prototype.isClickMode = function() {
  return !this.active;
}

GridDrag.prototype.touchStart = function(sx, sy, firstTouch) {
  const {x, y} = this.points[0];
  const cx = (x + 1) * this.view.scale - this.view.x + GRID_START.x,
      cy = (y + 1) * this.view.scale - this.view.y + GRID_START.y;
  if (firstTouch && !this.active &&
      Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2) < 22) {
    this.active = true;
    this.lastX = sx;
    this.lastY = sy;
  }
};

GridDrag.prototype.touchMove = function(sx, sy) {
  if (!this.active) return;
  const pdx = sx - this.lastX,
      pdy = sy - this.lastY;
  if (Math.abs(pdx) < GRID_DELTA &&
      Math.abs(pdy) < GRID_DELTA)
    return;
  this.lastX = sx;
  this.lastY = sy;
  let dir;
  if (Math.abs(pdx) > Math.abs(pdy)) {
    dir = pdx > 0 ? DIRECTION.east : DIRECTION.west;
  } else {
    dir = pdy > 0 ? DIRECTION.south : DIRECTION.north;
  }
  const last = this.points[this.points.length - 1];
  if (this.points.length > 1 &&
      (dir + 2) % 4 == last.direction) {
    this.points.pop();
    return;
  }
  const {x, y} = last, {dx, dy} = DIRECTIONS[dir];
  const reach = this.entity.data.wireReach;
  const area = this.entity.data.powerSupplyArea;
  const x2 = x + dx * reach, y2 = y + dy * reach;
  const size = area * 2 + this.entity.width; // Assumes width == height.
  const len = reach - size;
  const ex = x - area + (dir&0x1 ? (dir == 1 ? size : -len) : 0),
      ey = y - area + (dir&0x1 ? 0 : (dir == 2 ? size : -len));
  const entities = this.gameMap.getEntitiesIn(ex, ey, dir&0x1 ? len : size, dir&0x1 ? size : len);
  let setback = 0;
  for (let entity of entities) {
    if (entity.type != TYPE.generator &&
        entity.energySource != ENERGY.electric)
      continue;
    if (entity.data.grid) continue;
    if (x - area + size > entity.x && x - area < entity.x + entity.width &&
        y - area + size > entity.y && y - area < entity.y + entity.height)
      continue;
    if (x2 - area + size > entity.x && x2 - area < entity.x + entity.width &&
        y2 - area + size > entity.y && y2 - area < entity.y + entity.height)
      continue;
    const shift = dir == 0 ? entity.y - y2 - area :
        (dir == 1 ? x2 - area - entity.x - entity.width :
        (dir == 2 ? y2 - area - entity.y - entity.heigth :
       /*dir == 3*/ entity.x - x2 - area));
    if (shift + 1 > setback) setback = shift + 1;
    if (setback >= len) break;
  }
  for (let i = 0; i < reach - setback; i++) {
    const dist = reach - setback - i;
    if (!this.gameMap.canPlace(x + dx * dist, y + dy * dist,
        this.entity.width, this.entity.height))
      continue;
    this.points.push(new Point(x + dx * dist, y + dy * dist, dir));
    return;
  }
  this.points.push(new Point(x2, y2, dir, false));
};

GridDrag.prototype.touchEnd = function(sx, sy, shortTouch, lastTouch) {
  if (!lastTouch) return this;
  if (!this.active) {
    return !shortTouch ? this : undefined;
  }
  if (shortTouch) {
    this.active = false;
    return this;
  }
  const entities = [];
  outer:
  for (let {x, y} of this.points) {
    if (!this.gameMap.canPlace(x, y, this.entity.width, this.entity.height))
      continue;
    for (let e of entities) {
      if (e.x == x && e.y == y) continue outer;
    }
    entities.push(
        {name: this.entity.name, x, y, direction: 0});
  }
  this.gameMap.createEntities(entities);
};

GridDrag.prototype.draw = function(ctx) {
  const ox = -this.view.x, oy = -this.view.y;
  const s = this.view.scale, half = s / 2, eps = 0.08 * s;
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  if (!this.active) {
    const {x, y} = this.points[0];
    ctx.beginPath();
    ctx.roundRect(x * s + ox + eps, y * s + oy + eps, s - 2 * eps, s - 2 * eps, 2 * eps);
    const cx = x * s + s + ox + GRID_START.x,
        cy = y * s + s + oy + GRID_START.y, pi = Math.PI;
    ctx.moveTo(cx + 20, cy);
    ctx.arc(cx, cy, 20, 0, 2 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, -0.1 * pi, 0.1 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 0.4 * pi, 0.6 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 0.9 * pi, 1.1 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 1.4 * pi, 1.6 * pi);
    ctx.moveTo(x * s + s * 4 / 5 + ox, y * s + s + oy - eps);
    ctx.lineTo(cx - 8.5, cy - 18.5);
    ctx.stroke();
    const icon = this.icon;
    ctx.drawImage(icon.image,
        icon.x, icon.y, icon.width, icon.height,
        cx - 12, cy - 12, 24, 24);
    return;
  }
  
  const area = this.entity.data.powerSupplyArea;
  ctx.fillStyle = ENTITY_COLOR.powerSupplyArea;
  ctx.beginPath();
  let lastValid = true;
  for (let i = 0; i < this.points.length; i++) {
    const {x, y, valid} = this.points[i];
    ctx.fillRect((x - area) * s + ox, (y - area) * s + oy,
        (area * 2 + this.entity.width) * s, (area * 2 + this.entity.height) * s);
    if (valid != lastValid) {
      lastValid = valid;
      ctx.stroke();
      ctx.strokeStyle = valid ?
        COLOR.buildPlanner : COLOR.buildPlannerInvalid;
      ctx.beginPath();
    }
    ctx.roundRect(x * s + ox + eps, y * s + oy + eps,
        this.entity.width * s - 2 * eps, this.entity.height * s - 2 * eps, 2 * eps);
  }
  ctx.stroke();
};

function Point(x, y, direction, valid = true) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.valid = valid;
}

function OffshorePump(ui) {
  this.ui = ui;
}

OffshorePump.prototype.initialize = function(entity) {
  this.entity = entity;
  return this;
};

OffshorePump.prototype.isClickMode = function() {
  return true;
}

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
  const s = this.view.scale, eps = 0.08 * s;
  const vx = this.view.x;
  const vy = this.view.y;
  ctx.strokeStyle = COLOR.buildPlanner;
  ctx.lineWidth = 1;
  const xStart = Math.floor(vx / s) - 1;
  const xEnd = Math.ceil((vx + this.view.width) / s) + 1;
  const yStart = Math.floor(vy / s) - 1;
  const yEnd = Math.ceil((vy + this.view.height) / s) + 1;
  for (let x = xStart; x < xEnd; x++) {
    for (let y = yStart; y < yEnd; y++) {
      const direction = this.gameMap.canPlaceOffshorePump(x, y);
      if (direction == -1) continue;
      
      const x1 = Math.floor(x * s - vx);
      const x2 = x1 - ((direction - 2) % 2) * s;
      const y1 = Math.floor(y * s - vy);
      const y2 = y1 + ((direction - 1) % 2) * s;
      ctx.strokeRect(
          Math.min(x1, x2) + eps, Math.min(y1, y2) + eps,
          Math.abs(x1 - x2) + s - 2 * eps,
          Math.abs(y1 - y2) + s - 2 * eps);
    }
  }
};

export {BeltDrag, MultiBuild, SnakeBelt, UndergroundChain, UndergroundExit, InserterDrag, PowerPoleDrag, GridDrag, OffshorePump};

import {ENTITIES} from './entity-definitions.js';
import {COLOR as ENTITY_COLOR, DIRECTIONS} from './entity-properties.js';
import {SPRITES, S} from './sprite-pool.js';
import {TOOL, COLOR} from './ui-properties.js';
import {GMC} from './game-map-converter.js';

const CLIPBOARD = {
  value: undefined,
};

function CopyTool(ui) {
  this.ui = ui;
}

const COPY_MODE = {
  drag: 1,
  sit: 2,
  copyButton: 3,
  diagonalDrag: 4, // and 5, 6, 7.
  sideDrag: 8, // and 9, 10, 11.
};

const COPY_OK_BUTTON = {x: -40, y: -230};

CopyTool.prototype.set =
PasteTool.prototype.set = function(gameMap) {
  this.gameMap = gameMap;
  this.view = gameMap.view;
};

CopyTool.prototype.initialize = function(sx, sy, drag) {
  if (!this.copyWhiteSprite) {
    this.copyWhiteSprite = SPRITES.get(S.copyWhiteIcon);
  }
  this.x1 = this.x2 = Math.floor((sx + this.view.x) / this.view.scale);
  this.y1 = this.y2 = Math.floor((sy + this.view.y) / this.view.scale);
  this.entities = [];
  this.entityDisplay = [];
  this.mode = drag ? COPY_MODE.drag : COPY_MODE.sit;
  return this;
};

CopyTool.prototype.isClickMode = function() {
  return this.mode == COPY_MODE.sit;
}

CopyTool.prototype.touchStart = function(sx, sy, firstTouch) {
  if (!firstTouch) return;
  if (this.mode != COPY_MODE.sit) return;
  {
    const {x: dx, y: dy} = COPY_OK_BUTTON;
    const x = this.view.width + dx, y = this.view.height + dy;
    if ((sx - x)**2 + (sy - y)**2 < 26**2) {
      this.mode = COPY_MODE.copyButton;
    }
  }
  
  const s = this.view.scale, ox = -this.view.x, oy = -this.view.y;
  {
    const x1 = Math.min(this.x1, this.x2),
        y1 = Math.min(this.y1, this.y2),
        x2 = Math.max(this.x1, this.x2) + 1,
        y2 = Math.max(this.y1, this.y2) + 1;
    for (let i = 0; i < 4; i++) {
      const dx = i < 2 ? 20 : -20, dy = i == 1 || i == 2 ? 20 : -20;
      const xs = i < 2 ? x2 : x1, ys = i == 1 || i == 2 ? y2 : y1;
      const x = xs * s + ox + dx, y = ys * s + oy + dy;
      if ((sx - x)**2 + (sy - y)**2 < 400) {
        this.mode = COPY_MODE.diagonalDrag + i;
        break;
      }
    }
  }
  
  {
    const x1 = Math.min(this.x1, this.x2) * s + ox,
        y1 = Math.min(this.y1, this.y2) * s + oy,
        x2 = (Math.max(this.x1, this.x2) + 1) * s + ox,
        y2 = (Math.max(this.y1, this.y2) + 1) * s + oy;
    let x = this.view.width * 0.5,
        y = this.view.height * 0.4;
    if (x < x1 + 60) x = x1 + 60;
    if (x > x2 - 60) x = x2 - 60;
    if (y < y1 + 60) y = y1 + 60;
    if (y > y2 - 60) y = y2 - 60;
    for (let i = 0; i < 4; i++) {
      if (i&0x1 ? y2 - y1 < 120 : x2 - x1 < 120)
        continue;
      const {dx, dy} = DIRECTIONS[i];
      const px = -dy * 40, py = dx * 40;
      let bx, by;
      if (i == 0) { bx = x; by = y1 - 22; }
      if (i == 1) { bx = x2 + 22; by = y; }
      if (i == 2) { bx = x; by = y2 + 22; }
      if (i == 3) { bx = x1 - 22; by = y; }
      const maxX = i&0x1 ? 22 : 44, maxY = i&0x1 ? 44 : 22;
      if (Math.abs(sx - bx) < maxX && Math.abs(sy - by) < maxY) {
        this.mode = COPY_MODE.sideDrag + i;
        break;
      }
    }
  }
};

CopyTool.prototype.touchMove = function(sx, sy) {
  if (this.mode == COPY_MODE.copyButton) {
    this.mode = COPY_MODE.sit;
  } else if (this.mode != COPY_MODE.sit) {
    const x = Math.floor((sx + this.view.x) / this.view.scale);
    const y = Math.floor((sy + this.view.y) / this.view.scale);
    if (this.mode == COPY_MODE.drag) {
      this.x2 = x
      this.y2 = y
    }
    if (this.mode == COPY_MODE.diagonalDrag + 0 ||
        this.mode == COPY_MODE.diagonalDrag + 3 ||
        this.mode == COPY_MODE.sideDrag + 0) {
      this.y1 = Math.min(this.y2, y);
    }
    if (this.mode == COPY_MODE.diagonalDrag + 0 ||
        this.mode == COPY_MODE.diagonalDrag + 1 ||
        this.mode == COPY_MODE.sideDrag + 1) {
      this.x2 = Math.max(this.x1, x);
    }
    if (this.mode == COPY_MODE.diagonalDrag + 1 ||
        this.mode == COPY_MODE.diagonalDrag + 2 ||
        this.mode == COPY_MODE.sideDrag + 2) {
      this.y2 = Math.max(this.y1, y);
    }
    if (this.mode == COPY_MODE.diagonalDrag + 2 ||
        this.mode == COPY_MODE.diagonalDrag + 3 ||
        this.mode == COPY_MODE.sideDrag + 3) {
      this.x1 = Math.min(this.x2, x);
    }
    this.entities = this.gameMap.getEntitiesIn(
        Math.min(this.x1, this.x2), Math.min(this.y1, this.y2),
        Math.abs(this.x1 - this.x2) + 1, Math.abs(this.y1 - this.y2) + 1);
    const display = new Map();
    for (let entity of this.entities) {
      if (display.has(entity.name)) {
        display.get(entity.name).amount++;
        continue;
      }
      const name = entity.name;
      const def = ENTITIES.get(name);
      const sprite = SPRITES.get(def.icon);
      display.set(name, {name, sprite, amount: 1});
    }
    this.entityDisplay = [...display.values()]
        .sort((a, b) => a.amount != b.amount ?
          -a.amount + b.amount : a.name - b.name);
  }
};

CopyTool.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!last) return this;
  if ((this.mode == COPY_MODE.drag ||
      this.mode == COPY_MODE.copyButton)  &&
      this.entities.length) {
    let {x, y} = this.entities[0];
    for (let e of this.entities) {
      if (e.x < x) x = e.x;
      if (e.y < y) y = e.y;
    }
    const entities = [];
    for (let e of this.entities) {
      entities.push(GMC.entityConstructor(e, -x, -y));
    }
    CLIPBOARD.value = entities;
    this.ui.buildMenu.trySelectEntry(TOOL.paste);
    return this.ui.gameMapInput.pasteTool;
  } else if (this.mode == COPY_MODE.sit) {
    if (shortTouch) {
      return;
    }
    return this;
  } else if (this.mode >= COPY_MODE.diagonalDrag &&
      this.mode < COPY_MODE.sideDrag + 4) {
    this.mode = COPY_MODE.sit;
    return this;
  }
};

CopyTool.prototype.draw = function(ctx) {
  const s = this.view.scale, ox = -this.view.x, oy = -this.view.y;
  for (let entity of this.entities) {
    const x1 = entity.x * s + ox, y1 = entity.y * s + oy,
        x2 = x1 + entity.width * s, y2 = y1 + entity.height * s,
        d = 0.3 * s;
    ctx.beginPath();
    ctx.moveTo(x1, y1 + d); ctx.lineTo(x1, y1); ctx.lineTo(x1 + d, y1);
    ctx.moveTo(x2, y1 + d); ctx.lineTo(x2, y1); ctx.lineTo(x2 - d, y1);
    ctx.moveTo(x1, y2 - d); ctx.lineTo(x1, y2); ctx.lineTo(x1 + d, y2);
    ctx.moveTo(x2, y2 - d); ctx.lineTo(x2, y2); ctx.lineTo(x2 - d, y2);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.strokeStyle = ENTITY_COLOR.greenHighlightBorder;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = ENTITY_COLOR.greenHighlight;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  {
    const x = Math.min(this.x1, this.x2),
        y = Math.min(this.y1, this.y2),
        w = Math.abs(this.x1 - this.x2) + 1,
        h = Math.abs(this.y1 - this.y2) + 1;
    ctx.strokeStyle = COLOR.copyToolBackdrop;
    ctx.lineWidth = 4;
    ctx.strokeRect(x * s + ox + 3, y * s + oy + 3, w * s - 6, h * s - 6);
    ctx.strokeStyle = COLOR.copyTool;
    ctx.lineWidth = 1;
    ctx.strokeRect(x * s + ox, y * s + oy, w * s, h * s);
  }
  
  if (this.mode == COPY_MODE.sit) {
    const x1 = Math.min(this.x1, this.x2) * s + ox,
        y1 = Math.min(this.y1, this.y2) * s + oy,
        x2 = (Math.max(this.x1, this.x2) + 1) * s + ox,
        y2 = (Math.max(this.y1, this.y2) + 1) * s + oy;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const dx = i < 2 ? 20 : -20, dy = i == 1 || i == 2 ? 20 : -20;
      const px = -dy * 0.6, py = dx * 0.6;
      const x = i < 2 ? x2 : x1, y = i == 1 || i == 2 ? y2 : y1;
      ctx.moveTo(x + 0.7 * dx + px, y + 0.7 * dy + py);
      ctx.lineTo(x + 0.7 * dx - px, y + 0.7 * dy - py);
      ctx.moveTo(x + 1.0 * dx + 0.8 * px, y + 1.0 * dy + 0.8 * py);
      ctx.lineTo(x + 1.0 * dx - 0.8 * px, y + 1.0 * dy - 0.8 * py);
      ctx.moveTo(x + 1.3 * dx + 0.6 * px, y + 1.3 * dy + 0.6 * py);
      ctx.lineTo(x + 1.3 * dx - 0.6 * px, y + 1.3 * dy - 0.6 * py);
    }
    ctx.strokeStyle = COLOR.copyTool;
    ctx.stroke();
  }
  
  if (this.mode == COPY_MODE.sit) {
    const x1 = Math.min(this.x1, this.x2) * s + ox,
        y1 = Math.min(this.y1, this.y2) * s + oy,
        x2 = (Math.max(this.x1, this.x2) + 1) * s + ox,
        y2 = (Math.max(this.y1, this.y2) + 1) * s + oy;
    let x = this.view.width * 0.5,
        y = this.view.height * 0.4;
    if (x < x1 + 60) x = x1 + 60;
    if (x > x2 - 60) x = x2 - 60;
    if (y < y1 + 60) y = y1 + 60;
    if (y > y2 - 60) y = y2 - 60;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const {dx, dy} = DIRECTIONS[i];
      const px = -dy * 40, py = dx * 40;
      let bx, by;
      if (i == 0) { bx = x; by = y1 - 29; }
      if (i == 1) { bx = x2 + 29; by = y; }
      if (i == 2) { bx = x; by = y2 + 29; }
      if (i == 3) { bx = x1 - 29; by = y; }
      if (i&0x1 ? y2 - y1 < 120 : x2 - x1 < 120)
        continue;
      
      ctx.moveTo(bx + -8.5 * dx + px, by + -8.5 * dy + py);
      ctx.lineTo(bx + -8.5 * dx - px, by + -8.5 * dy - py);
      ctx.moveTo(bx + 0 * dx + 0.8 * px, by + 0 * dy + 0.8 * py);
      ctx.lineTo(bx + 0 * dx - 0.8 * px, by + 0 * dy - 0.8 * py);
      ctx.moveTo(bx + 8.5 * dx + 0.6 * px, by + 8.5 * dy + 0.6 * py);
      ctx.lineTo(bx + 8.5 * dx - 0.6 * px, by + 8.5 * dy - 0.6 * py);
    }
    ctx.strokeStyle = COLOR.copyTool;
    ctx.stroke();
  }
  
  {
    const {x: dx, y: dy} = COPY_OK_BUTTON;
    const x = this.view.width + dx, y = this.view.height + dy;
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLOR.copyTool;
    ctx.fillStyle = this.mode == COPY_MODE.copyButton ?
        COLOR.buildBackground : COLOR.copyToolBackground;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    const icon = this.copyWhiteSprite;
    ctx.drawImage(icon.image,
        icon.x, icon.y, icon.width, icon.height,
        x - 20, y - 20, 40, 40);
  }
  
  if (!this.entityDisplay.length) return;
  const len = Math.min(this.entityDisplay.length, Math.floor((this.view.width - 160) / 40)),
      rows = Math.ceil(this.entityDisplay.length / len),
      y = this.view.height - 180 - rows * 40;
  ctx.fillStyle = COLOR.copyToolBackground;
  ctx.fillRect(10, y - 2, len * 40, rows * 40);
  ctx.strokeStyle = COLOR.copyTool;
  ctx.lineWidth = 1;
  ctx.strokeRect(10, y - 2, len * 40, rows * 40);
  ctx.fillStyle = COLOR.primary;
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "end";
  for (let i = 0; i < this.entityDisplay.length; i++) {
    const {sprite: s, amount} = this.entityDisplay[i];
    const x = i % len,
        dy = Math.floor(i / len);
    ctx.drawImage(s.image, s.x, s.y, s.width, s.height,
        x * 40 + 12, y + dy * 40, 32, 32);
    ctx.fillText(amount, x * 40 + 48, y + dy * 40 + 30);
  }
  ctx.textAlign = "start";
};

function PasteTool(ui) {
  this.ui = ui;
}

const PASTE_MODE = {
  none: 0,
  noPaste: 1,
  centerScreen: 2,
  sit: 3,
  adjust: 4,
};

const PASTE_OK_BUTTON = {x: -40, y: -230};
const PASTE_ADJUST_BUTTON = {x: 25, y: 75};
const ADJUST_DELTA = 12;

PasteTool.prototype.initialize = function() {
  if (!this.tickSprite) {
    this.tickSprite = SPRITES.get(S.tickIcon);
  }
  if (!this.moveSprite) {
    this.moveSprite = SPRITES.get(S.moveIcon);
  }
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = this.view;
  this.x = Math.round((vx + vw * 0.5) / s);
  this.y = Math.round((vy + vh * 0.4) / s);
  this.pressedButton = 0;
  if (!CLIPBOARD.value?.length) {
    this.entities = undefined;
    this.mode = PASTE_MODE.noPaste;
    return this;
  }
  this.entities = [];
  this.width = 0; this.height = 0;
  for (let entity of CLIPBOARD.value) {
    const definition = ENTITIES.get(entity.name);
    const sprites = definition.idleAnimation ?
        definition.idleAnimation[entity.direction] :
        definition.sprites[entity.direction];
    const sprite = SPRITES.get(sprites[0]);
    this.entities.push(
        {entity, definition, state: 0, sprite});
    
    const {width, height} = definition.size?.[entity.direction] ?? definition;
    if (entity.x + width > this.width) this.width = entity.x + width;
    if (entity.y + height > this.height) this.height = entity.y + height;
  }
  this.computeEntityState();
  this.mode = PASTE_MODE.centerScreen;
  return this;
};

PasteTool.prototype.isClickMode = function() {
  return this.mode != PASTE_MODE.adjust &&
      !this.pressedButton;
}

PasteTool.prototype.computeEntityState = function() {
  const dx = Math.floor(this.x - this.width / 2),
      dy = Math.floor(this.y - this.height / 2);
  for (let e of this.entities) {
    const entity = e.entity;
    const {width, height} = e.definition.size?.[entity.direction] ?? e.definition;
    const x = entity.x + dx, y = entity.y + dy;
    const canPlace = this.gameMap.canPlace(x, y, width, height);
    if (!canPlace) {
      const other = this.gameMap.getEntityAt(x, y);
      if (other && other.name == entity.name &&
          other.x == x && other.y == y && other.direction == entity.direction) {
        e.state = 2;
        continue;
      }
    }
    e.state = canPlace ? 1 : 0;
  }
};

PasteTool.prototype.touchStart = function(sx, sy, firstTouch) {
  if (!firstTouch) return;
  if (this.mode == PASTE_MODE.noPaste) return;
  
  {
    const {x: dx, y: dy} = PASTE_OK_BUTTON;
    const x = this.view.width + dx, y = this.view.height + dy;
    if ((sx - x)**2 + (sy - y)**2 < 36**2) {
      this.pressedButton = 1;
      return;
    }
  }
  
  const s = this.view.scale, ox = -this.view.x, oy = -this.view.y;
  {
    const x = (this.x + 0.5) * s + ox,
        y = (this.y + 0.5) * s + oy;
    if ((sx - x)**2 + (sy - y)**2 < (s * 1.2)**2) {
      this.pressedButton = 2;
      return;
    }
  }
  
  {
    const {x: dx, y: dy} = PASTE_ADJUST_BUTTON;
    let cx = this.x * s + s + ox + dx,
        cy = this.y * s + s + oy + dy, pi = Math.PI;
    if (cx < 60) cx = 60;
    if (cx > this.view.width - 60) cx = this.view.width - 60;
    if (cy < 120) cy = 120;
    if (cy > this.view.height - 240) cy = this.view.height - 240;
    if ((sx - cx)**2 + (sy - cy)**2 < 400) {
      this.mode = PASTE_MODE.adjust;
      this.lastX = sx; this.lastY = sy;
      return;
    }
  }
};

PasteTool.prototype.touchMove = function(sx, sy) {
  if (this.pressedButton) {
    this.pressedButton = -1;
    return;
  }
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = this.view;
  if (this.mode == PASTE_MODE.centerScreen) {
    const x = Math.round((vx + vw * 0.5) / s);
    const y = Math.round((vy + vh * 0.4) / s);
    if (x == this.x && y == this.y) return;
    this.x = x; this.y = y;
    this.computeEntityState();
  } else if (this.mode == PASTE_MODE.adjust) {
    const dx = sx - this.lastX,
        dy = sy - this.lastY;
    if (Math.abs(dx) < ADJUST_DELTA &&
        Math.abs(dy) < ADJUST_DELTA)
      return;
    this.lastX = sx;
    this.lastY = sy;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.x += dx > 0 ? 1 : -1;
    } else {
      this.y += dy > 0 ? 1 : -1;
    }
    this.computeEntityState();
  }
};

PasteTool.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!last) return this;
  if (this.pressedButton) {
    if (this.pressedButton == 1) {
      const entities = [];
      for (let {entity, state} of this.entities) {
        if (state == 1) {
          entities.push(entity);
        }
      }
      const dx = Math.floor(this.x - this.width / 2),
          dy = Math.floor(this.y - this.height / 2);
      this.gameMap.createEntities(entities, dx, dy);
      this.pressedButton = 0;
      this.ui.buildMenu.reset();
      return;
    }
    if (this.pressedButton == 2) {
      this.mode = PASTE_MODE.sit;
    }
    this.pressedButton = 0;
    return this;
  }
  if (this.mode == PASTE_MODE.adjust) {
    this.mode = PASTE_MODE.sit;
  }
  if (this.mode == PASTE_MODE.noPaste) {
    if (!shortTouch) return this;
    this.ui.buildMenu.reset();
    return;
  }
  return this;
};

PasteTool.prototype.draw = function(ctx) {
  if (this.mode == PASTE_MODE.noPaste) {
    ctx.fillStyle = COLOR.copyToolBackground;
    const x = this.view.width / 2 - 90,
        y = this.view.height - 211;
    ctx.fillRect(x, y, 180, 25);
    ctx.strokeStyle = COLOR.copyTool;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 180, 25);
    ctx.fillStyle = COLOR.primary;
    ctx.font = "18px monospace";
    ctx.textBaseline = "middle";
    ctx.textAlign = "start";
    ctx.fillText("Nothing to paste", x + 4, y + 13);
    return;
  }
  const s = this.view.scale, ox = -this.view.x, oy = -this.view.y, eps = 0.08 * s;
  const dx = Math.floor(this.x - this.width / 2),
      dy = Math.floor(this.y - this.height / 2);
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  let lastState = 0;
  for (let {entity, definition, state, sprite} of this.entities) {
    const {width, height} = definition.size?.[entity.direction] ?? definition;
    const x1 = (dx + entity.x) * s + ox, y1 = (dy + entity.y) * s + oy,
        x2 = x1 + width * s, y2 = y1 + height * s, d = 0.3 * s;
    const xScale = width * s /
        (sprite.width - sprite.left - sprite.right);
    const yScale = height * s /
        (sprite.height - sprite.top - sprite.bottom);
    ctx.drawImage(sprite.image,
        sprite.x, sprite.y, sprite.width, sprite.height,
        Math.floor(x1 - sprite.left * xScale),
        Math.floor(y1 - sprite.top * yScale),
        Math.ceil(sprite.width * xScale),
        Math.ceil(sprite.height * yScale));
    if (state != 1) {
      if (state != lastState) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = lastState == 0 ?
            ENTITY_COLOR.redHighlightBorder : ENTITY_COLOR.blueHighlightBorder;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = lastState == 0 ?
            ENTITY_COLOR.redHighlight : ENTITY_COLOR.blueHighlight;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.globalAlpha = 0.7;
        lastState = state;
      }
      ctx.moveTo(x1, y1 + d); ctx.lineTo(x1, y1); ctx.lineTo(x1 + d, y1);
      ctx.moveTo(x2, y1 + d); ctx.lineTo(x2, y1); ctx.lineTo(x2 - d, y1);
      ctx.moveTo(x1, y2 - d); ctx.lineTo(x1, y2); ctx.lineTo(x1 + d, y2);
      ctx.moveTo(x2, y2 - d); ctx.lineTo(x2, y2); ctx.lineTo(x2 - d, y2);
    }
  }
  ctx.globalAlpha = 1;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.strokeStyle = lastState == 0 ?
      ENTITY_COLOR.redHighlightBorder : ENTITY_COLOR.blueHighlightBorder;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = lastState == 0 ?
      ENTITY_COLOR.redHighlight : ENTITY_COLOR.blueHighlight;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  {
    ctx.beginPath();
    const rs = (s - 2 * eps);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        ctx.rect(((this.x + i) * s + ox + eps),
            ((this.y + j) * s + oy + eps), rs, rs);
      }
    }
    ctx.lineWidth = 1;
    ctx.lineJoin = "miter";
    const x = (this.x + 0.5) * s + ox,
        y = (this.y + 0.5) * s + oy;
    const gradient = ctx.createRadialGradient(
        x, y, 0.7071 * s, x, y, 1.2 * s);
    gradient.addColorStop(0, COLOR.copyTool);
    gradient.addColorStop(1, COLOR.copyToolTransparent);
    ctx.strokeStyle = gradient;
    ctx.stroke();
    if (this.pressedButton == 2) {
      ctx.strokeStyle = COLOR.buildBorder;
      ctx.beginPath();
      ctx.arc(x, y, 1.2 * s, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
  
  {
    const {x: dx, y: dy} = PASTE_OK_BUTTON;
    const x = this.view.width + dx, y = this.view.height + dy;
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLOR.copyTool;
    ctx.fillStyle = this.pressedButton == 1 ?
        COLOR.buildBackground : COLOR.copyToolBackground;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    const icon = this.tickSprite;
    ctx.drawImage(icon.image,
        icon.x, icon.y, icon.width, icon.height,
        x - 20, y - 20, 40, 40);
  }
  
  if (this.mode != PASTE_MODE.adjust) {
    const {x: dx, y: dy} = PASTE_ADJUST_BUTTON;
    let cx = this.x * s + s + ox + dx,
        cy = this.y * s + s + oy + dy, pi = Math.PI;
    if (cx < 60) cx = 60;
    if (cx > this.view.width - 60) cx = this.view.width - 60;
    if (cy < 120) cy = 120;
    if (cy > this.view.height - 240) cy = this.view.height - 240;
    ctx.strokeStyle = COLOR.copyTool;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, -0.1 * pi, 0.1 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 0.4 * pi, 0.6 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 0.9 * pi, 1.1 * pi);
    ctx.stroke(); ctx.beginPath();
    ctx.arc(cx, cy, 23, 1.4 * pi, 1.6 * pi);
    ctx.stroke();
    ctx.beginPath();
    const x = (this.x + 0.5) * s + ox,
        y = (this.y + 0.5) * s + oy;
    const gradient = ctx.createRadialGradient(
        x, y, s, x, y, 1.3 * s);
    gradient.addColorStop(0, COLOR.copyToolTransparent);
    gradient.addColorStop(1, COLOR.copyTool);
    ctx.strokeStyle = gradient;
    ctx.moveTo(x, y);
    const dist = Math.sqrt((cx - x)**2 + (cy - y)**2);
    ctx.lineTo(cx - 20 * (cx - x) / dist, cy - 20 * (cy - y) / dist);
    ctx.stroke();
    const icon = this.moveSprite;
    ctx.drawImage(icon.image,
        icon.x, icon.y, icon.width, icon.height,
        cx - 14, cy - 14, 28, 28);
  }
};

export {CLIPBOARD, CopyTool, PasteTool};

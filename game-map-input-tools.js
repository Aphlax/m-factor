import {ENTITIES} from './entity-definitions.js';
import {COLOR as ENTITY_COLOR} from './entity-properties.js';
import {SPRITES, S} from './sprite-pool.js';
import {TOOL, COLOR} from './ui-properties.js';
import {GMC} from './game-map-converter.js';

const CLIPBOARD = {
  value: undefined,
};

function CopyTool(ui) {
  this.ui = ui;
}

CopyTool.prototype.set =
PasteTool.prototype.set = function(gameMap) {
  this.gameMap = gameMap;
  this.view = gameMap.view;
};

CopyTool.prototype.initialize = function(sx, sy) {
  this.x1 = this.x2 = Math.floor((sx + this.view.x) / this.view.scale);
  this.y1 = this.y2 = Math.floor((sy + this.view.y) / this.view.scale);
  this.entities = [];
  this.entityDisplay = [];
  return this;
};

CopyTool.prototype.touchMove = function(sx, sy) {
  this.x2 = Math.floor((sx + this.view.x) / this.view.scale);
  this.y2 = Math.floor((sy + this.view.y) / this.view.scale);
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
};

CopyTool.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!last) return this;
  if (this.entities.length) {
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
  dropping: 3,
  adjust: 4,
};

const PASTE_OK_BUTTON = {x: -40, y: -230};
const PASTE_ADJUST_BUTTON = {x: 25, y: 75};

PasteTool.prototype.initialize = function() {
  if (!this.tickSprite) {
    this.tickSprite = SPRITES.get(S.tickIcon);
  }
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = this.view;
  this.x = Math.round((vx + vw / 2) / s);
  this.y = Math.round((vy + vh / 2) / s);
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
    const canPlace = false;
    this.entities.push(
        {entity, canPlace, definition, sprite});
    
    const {width, height} = definition.size?.[entity.direction] ?? definition;
    if (entity.x + width > this.width) this.width = entity.x + width;
    if (entity.y + height > this.height) this.height = entity.y + height;
  }
  const dx = Math.floor(this.x - this.width / 2),
      dy = Math.floor(this.y - this.height / 2);
  for (let e of this.entities) {
    const {width, height} = e.definition.size?.[e.entity.direction] ?? e.definition;
    e.canPlace = this.gameMap.canPlace(e.entity.x + dx, e.entity.y + dy, width, height);
  }
  this.mode = PASTE_MODE.centerScreen;
  return this;
};

PasteTool.prototype.isClickMode = function() {
  return this.mode != PASTE_MODE.adjust &&
      !this.pressedButton;
}

PasteTool.prototype.touchStart = function(sx, sy, firstTouch) {
  const {x: dx, y: dy} = PASTE_OK_BUTTON;
  const b1x = this.view.width + dx, b1y = this.view.height + dy;
  if (firstTouch &&
      ((sx - b1x)**2 + (sy - b1y)**2) < 36**2) {
    this.pressedButton = 1;
  }
};

PasteTool.prototype.touchMove = function(sx, sy) {
  if (this.pressedButton) {
    this.pressedButton = -1;
    return;
  }
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = this.view;
  if (this.mode == PASTE_MODE.centerScreen) {
    const x = Math.round((vx + vw / 2) / s);
    const y = Math.round((vy + vh / 2) / s);
    if (x == this.x && y == this.y) return;
    this.x = x; this.y = y;
    const dx = Math.floor(this.x - this.width / 2),
        dy = Math.floor(this.y - this.height / 2);
    for (let e of this.entities) {
      const {width, height} = e.definition.size?.[e.entity.direction] ?? e.definition;
      e.canPlace = this.gameMap.canPlace(e.entity.x + dx, e.entity.y + dy, width, height);
    }
  }
};

PasteTool.prototype.touchEnd = function(sx, sy, shortTouch, last) {
  if (!last) return this;
  if (this.pressedButton) {
    if (this.pressedButton == 1) {
      const entities = [];
      for (let {entity, canPlace} of this.entities) {
        if (canPlace) {
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
    this.pressedButton = 0;
    return this;
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
  const s = this.view.scale, ox = -this.view.x, oy = -this.view.y;
  const dx = Math.floor(this.x - this.width / 2),
      dy = Math.floor(this.y - this.height / 2);
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  for (let {entity, definition, canPlace, sprite} of this.entities) {
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
    if (!canPlace) {
      ctx.moveTo(x1, y1 + d); ctx.lineTo(x1, y1); ctx.lineTo(x1 + d, y1);
      ctx.moveTo(x2, y1 + d); ctx.lineTo(x2, y1); ctx.lineTo(x2 - d, y1);
      ctx.moveTo(x1, y2 - d); ctx.lineTo(x1, y2); ctx.lineTo(x1 + d, y2);
      ctx.moveTo(x2, y2 - d); ctx.lineTo(x2, y2); ctx.lineTo(x2 - d, y2);
    }
  }
  ctx.globalAlpha = 1;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.strokeStyle = ENTITY_COLOR.redHighlightBorder;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = ENTITY_COLOR.redHighlight;
  ctx.lineWidth = 2;
  ctx.stroke();
  
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
    const ts = this.tickSprite;
    ctx.drawImage(ts.image, ts.x, ts.y, ts.width, ts.height,
        x - 20, y - 20, 40, 40);
  }
};

export {CLIPBOARD, CopyTool, PasteTool};
  
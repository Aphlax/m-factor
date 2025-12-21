import {TYPE, DIRECTION, DIRECTIONS} from './entity-properties.js';
import {COLOR} from './ui-properties.js';
import {S} from './sprite-pool.js';

const MIN_SCALE = 16;
const MAX_SCALE = 32;
const MODE = {
  none: 0,
  multiBuild: 1,
  buildBelt: 2,
  buildOffshorePump: 3,
  buildUndergroundBeltExit: 4,
  copySelection: 5,
  copyDrag: 6,
};

function GameMapInput(ui) {
  this.gameMap = undefined;
  this.view = undefined;
  
  this.ui = ui;
  
  this.touches = new Array(3).fill(0).map(() => ({id: 0, x: 0, y: 0}));
  this.mode = MODE.none;
  this.currentBuild = {
    x: 0, y: 0,
    entity: undefined,
    direction: 0, length: 0,
    xEnd: 0, yEnd: 0,
  };
}

GameMapInput.prototype.set = function(gameMap) {
  this.gameMap = gameMap;
  this.view = gameMap.view;
};

GameMapInput.prototype.draw = function(ctx) {
  if (this.mode == MODE.buildBelt ||
      this.mode == MODE.buildUndergroundBeltExit) {
    ctx.strokeStyle = COLOR.buildPlanner;
    ctx.lineWidth = 1;
    const d = this.currentBuild.direction;
    const x1 = Math.floor(this.currentBuild.x *
        this.view.scale - this.view.x);
    const x2 = x1 - ((d - 2) % 2) *
        (this.currentBuild.length - 1) * this.view.scale;
    const y1 = Math.floor(this.currentBuild.y *
        this.view.scale - this.view.y);
    const y2 = y1 + ((d - 1) % 2) *
        (this.currentBuild.length - 1) * this.view.scale;
    ctx.strokeRect(
        Math.min(x1, x2), Math.min(y1, y2),
        Math.abs(x1 - x2) + this.view.scale,
        Math.abs(y1 - y2) + this.view.scale);
    if (this.mode == MODE.buildBelt) {
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
      if (this.currentBuild.length > 1) {
        ctx.moveTo(x1 + half + 0.5 * vx,
            y1 + half + 0.5 * vy);
        ctx.lineTo(x2 + half, y2 + half);
        ctx.stroke();
        ctx.font = this.view.scale > 22 ?
            "20px monospace" : "14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = COLOR.buildPlanner;
        ctx.fillText(this.currentBuild.length, x1 + half, y1 + half);
        ctx.textAlign = "start";
      } else {
        ctx.stroke();
      }
    }
  } else if (this.mode == MODE.multiBuild) {
    ctx.strokeStyle = COLOR.buildPlanner;
    ctx.lineWidth = 1;
    const eps = 0.08 * this.view.scale;
    const {width, height} = this.currentBuild.entity.size ?
        this.currentBuild.entity.size[this.ui.rotateButton.direction] :
        this.currentBuild.entity;
    const dx = -((this.currentBuild.direction - 2) % 2),
        dy = (this.currentBuild.direction - 1) % 2;
    for (let i = 0; i < this.currentBuild.length; i++) {
      const x = Math.floor((this.currentBuild.x +
          i * dx * width) * this.view.scale - this.view.x),
          y = Math.floor((this.currentBuild.y +
          i * dy * height) * this.view.scale - this.view.y);
      ctx.strokeRect(x + eps, y + eps,
          width * this.view.scale - 2 * eps,
          height * this.view.scale - 2 * eps);
    }
  } else if (this.mode == MODE.buildOffshorePump) {
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
  }
};

GameMapInput.prototype.touchStart = function(e) {
  this.setTouches(e);
};

/**
  There is exactly 1 move update per update!
  Move happens only after significant move.
*/
GameMapInput.prototype.touchMove = function(e, longTouch) {
  let i = -1;
  if ((this.mode == MODE.none ||
      this.mode == MODE.buildOffshorePump ||
      this.mode == MODE.buildUndergroundBeltExit) && !longTouch) {
    i = 0;
  } else if (this.mode != MODE.none &&
      this.mode != MODE.buildOffshorePump &&
      this.mode != MODE.buildUndergroundBeltExit) {
    i = 1;
  }
  if (e.touches[i]) {
    if (e.touches[i + 1]) {
      const emx = (e.touches[i].clientX + e.touches[i + 1].clientX);
      const emy = (e.touches[i].clientY + e.touches[i + 1].clientY);
      const omx = (this.touches[i].x + this.touches[i + 1].x) / 2;
      const omy = (this.touches[i].y + this.touches[i + 1].y) / 2;
      const oldDist = Math.sqrt((this.touches[i].x - this.touches[i + 1].x)**2 + (this.touches[i].y - this.touches[i + 1].y)**2);
      const newDist = Math.sqrt((e.touches[i].clientX - e.touches[i + 1].clientX)**2 + (e.touches[i].clientY - e.touches[i + 1].clientY)**2);
      let scale = this.view.scale * newDist / oldDist;
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)) / this.view.scale;
      this.view.scale *= scale;
      this.view.x = Math.round((this.view.x + emx / 2) * scale - emx + omx);
      this.view.y = Math.round((this.view.y + emy / 2) * scale - emy + omy);
    } else {
      const dx = e.touches[i].clientX - this.touches[i].x;
      this.view.x = Math.round(this.view.x - dx);
      const dy = e.touches[i].clientY - this.touches[i].y;
      this.view.y = Math.round(this.view.y - dy);
    }
  }
  if (this.mode == MODE.multiBuild) {
    const x = (e.touches[0].clientX +
        this.view.x) / this.view.scale;
    const y = (e.touches[0].clientY +
        this.view.y) / this.view.scale;
    const {width, height} = this.currentBuild.entity.size ?
        this.currentBuild.entity.size[this.ui.rotateButton.direction] :
        this.currentBuild.entity;
    const diffX = x - this.currentBuild.x - width / 2,
        diffY = y - this.currentBuild.y - height / 2;
    if (Math.abs(diffX) < Math.abs(diffY)) {
      this.currentBuild.direction = diffY < 0 ?
          DIRECTION.north : DIRECTION.south;
      this.currentBuild.length = Math.round(Math.abs(diffY / height) + 0.5);
    } else {
      this.currentBuild.direction = diffX > 0 ?
          DIRECTION.east : DIRECTION.west;
      this.currentBuild.length = Math.round(Math.abs(diffX / width) + 0.5);
    }
  } else if (this.mode == MODE.buildBelt) {
    const diffX = (e.touches[0].clientX +
        this.view.x) / this.view.scale -
        this.currentBuild.x - 0.5;
    const diffY = (e.touches[0].clientY +
        this.view.y) / this.view.scale  -
        this.currentBuild.y - 0.5;
    const oldDirection = this.currentBuild.direction;
    if (Math.abs(diffX) < Math.abs(diffY)) {
      this.currentBuild.direction = diffY < 0 ?
          DIRECTION.north : DIRECTION.south;
    } else {
      this.currentBuild.direction = diffX > 0 ?
          DIRECTION.east : DIRECTION.west;
    }
    const oldLength = oldDirection != this.currentBuild.direction ?
        1 : this.currentBuild.length;
    this.currentBuild.length = Math.round(Math.max(
        Math.abs(diffX), Math.abs(diffY)));
    for (let i = oldLength; i < this.currentBuild.length; i++) {
      const x = this.currentBuild.x - i *
          ((this.currentBuild.direction - 2) % 2);
      const y = this.currentBuild.y + i *
          ((this.currentBuild.direction - 1) % 2);
      if (!this.gameMap.canPlace(x, y, 1, 1)) {
        this.currentBuild.length = i;
        break;
      }
    }
  }
  this.setTouches(e);
};

GameMapInput.prototype.touchEnd = function(e, shortTouch) {
  if (this.mode == MODE.multiBuild && !e.touches.length) {
    const {width, height} = this.currentBuild.entity.size ?
        this.currentBuild.entity.size[this.ui.rotateButton.direction] :
        this.currentBuild.entity;
    const dx = -((this.currentBuild.direction - 2) % 2),
        dy = (this.currentBuild.direction - 1) % 2;
    for (let i = 0; i < this.currentBuild.length; i++) {
      const x = this.currentBuild.x + i * dx * width,
          y = this.currentBuild.y + i * dy * height;
      if (!this.gameMap.canPlace(x, y, width, height))
        continue;
      this.gameMap.createEntity({
          x, y, direction: this.ui.rotateButton.direction,
          name: this.currentBuild.entity.name});
    }
    this.mode = MODE.none;
  } else if (this.mode == MODE.buildBelt && !e.touches.length) {
    this.mode = MODE.none;
    for (let i = 0; i < this.currentBuild.length; i++) {
      const x = this.currentBuild.x -
          ((this.currentBuild.direction - 2) % 2) * i;
      const y = this.currentBuild.y +
          ((this.currentBuild.direction - 1) % 2) * i;
      if (!this.gameMap.canPlace(x, y, 1, 1)) {
        break;
      }
      this.gameMap.createEntity({
          name: this.currentBuild.entity.name,
          x, y,
          direction: this.currentBuild.direction});
    }
  } else if (this.mode == MODE.buildOffshorePump && shortTouch) {
    let x = Math.floor((this.touches[0].x + this.view.x) / this.view.scale);
    let y = Math.floor((this.touches[0].y + this.view.y) / this.view.scale);
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
          name: this.currentBuild.entity.name,
          x, y, direction});
      this.ui.buildMenu.entityBuilt();
    }
  } else if (this.mode == MODE.buildUndergroundBeltExit && shortTouch) {
    const x = Math.floor((this.touches[0].x + this.view.x) / this.view.scale);
    const y = Math.floor((this.touches[0].y + this.view.y) / this.view.scale);
    const dx = x - this.currentBuild.x,
        dy = y - this.currentBuild.y,
        d = this.currentBuild.direction;
    if ((!(dx == 0 && dy * ((d - 1) % 2) >= 0 &&
        dy * ((d - 1) % 2) < this.currentBuild.length) &&
        !(dy == 0 && dx * -((d - 2) % 2) >= 0 &&
        dx * -((d - 2) % 2) < this.currentBuild.length)) ||
        this.gameMap.tryCreateEntity(
        this.touches[0].x, this.touches[0].y, d,
        this.currentBuild.entity,
        {undergroundUp: true})) {
      this.mode = MODE.none;
      this.ui.buildMenu.entityBuilt();
    }
  } else if (shortTouch) {
    const entity = this.gameMap.getSelectedEntity(
        this.touches[0].x, this.touches[0].y);
    const entry = this.ui.buildMenu.getSelectedEntry();
    if (entity?.type || !entry?.entity) {
      this.ui.window.set(entity);
      if (entry?.entity) {
        this.ui.buildMenu.reset();
      }
    } else {
      const d = this.ui.rotateButton.direction;
      const entity = this.gameMap.tryCreateEntity(
          this.touches[0].x, this.touches[0].y,
          d, entry.entity);
      if (entity) {
        if (entity.type == TYPE.undergroundBelt &&
            !entity.data.undergroundUp &&
            !entity.data.beltOutput) {
          this.mode = MODE.buildUndergroundBeltExit;
          this.currentBuild.x = entity.x - (d - 2) % 2;
          this.currentBuild.y = entity.y + (d - 1) % 2;
          this.currentBuild.entity = entry.entity;
          this.currentBuild.direction = d;
          this.currentBuild.length = entity.data.maxUndergroundGap + 1;
        } else {
          this.ui.buildMenu.entityBuilt();
        }
      }
    }
  }
  this.setTouches(e);
};

GameMapInput.prototype.touchLong = function(e) {
  const entry = this.ui.buildMenu.getSelectedEntry();
  const entity = entry?.entity;
  if (entity) {
    const {width, height} = entity.size ?
        entity.size[this.ui.rotateButton.direction] : entity;
    this.currentBuild.x = Math.floor((e.touches[0].clientX +
        this.view.x) / this.view.scale -
        (width - 1) / 2);
    this.currentBuild.y = Math.floor((e.touches[0].clientY +
        this.view.y) / this.view.scale -
        (height - 1) / 2);
    if (entity.type == TYPE.belt) {
      if (this.gameMap.canPlace(this.currentBuild.x,
          this.currentBuild.y, 1, 1)) {
        this.mode = MODE.buildBelt;
        this.currentBuild.entity = entity;
        this.currentBuild.length = 1;
      }
    } else if (entity.type != TYPE.offshorePump) {
      this.mode = MODE.multiBuild;
      this.currentBuild.entity = entity;
      this.currentBuild.length = 1;
    }
  }
};

GameMapInput.prototype.mouseWheel = function(e) {
  let scale = this.view.scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1);
  scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)) / this.view.scale;
  this.view.scale *= scale;
  this.view.x = Math.round((this.view.x + e.clientX) * scale - e.clientX);
  this.view.y = Math.round((this.view.y + e.clientY) * scale - e.clientY);
};

GameMapInput.prototype.setOffshorePumpMode = function(entity) {
  this.mode = MODE.buildOffshorePump;
  this.currentBuild.entity = entity;
};

GameMapInput.prototype.resetMode = function() {
  this.mode = MODE.none;
};

GameMapInput.prototype.setTouches = function(e) {
  for (let i = 0; i < 3; i++) {
    if (e.touches[i]) {
      this.touches[i].id = e.touches[i].identifier;
      this.touches[i].x = e.touches[i].clientX;
      this.touches[i].y = e.touches[i].clientY;
    } else if (this.touches[i].x || this.touches[i].y) {
      this.touches[i].id = 0;
      this.touches[i].x = 0;
      this.touches[i].y = 0;
    }
  }
};

export {GameMapInput};

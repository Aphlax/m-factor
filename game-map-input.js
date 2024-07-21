import {TYPE, DIRECTION} from './entity-properties.js';
import {COLOR} from './ui-properties.js';

const MIN_SCALE = 16;
const MAX_SCALE = 32;
const MODE = {
  none: 0,
  buildBelt: 1,
};

function GameMapInput(gameMap, view) {
  this.gameMap = gameMap;
  this.view = view;
  this.lastUpdate = 0;
  
  this.buildMenu = undefined; // Set in GameUi.
  this.rotateButton = undefined;
  
  this.touches = new Array(3).fill(0).map(() => ({id: 0, x: 0, y: 0}));
  this.mode = MODE.none;
  this.currentBuild = {
    x: 0, y: 0,
    direction: 0, length: 0
  };
}

GameMapInput.prototype.update = function(time) {
  this.lastUpdate = time;
};

GameMapInput.prototype.draw = function(ctx) {
  if (this.mode == MODE.buildBelt) {
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
    if (this.currentBuild.length > 1) {
      const half = this.view.scale / 2;
      const vx = -((d - 2) % 2) * this.view.scale,
          vy = ((d - 1) % 2) * this.view.scale,
          px = -vy, py = vx;
      ctx.beginPath();
      ctx.moveTo(x1 + half + 0.5 * vx, y1 + half + 0.5 * vy);
      ctx.lineTo(x2 + half, y2 + half);
      ctx.lineTo(x2 + half + 0.25 * (-vx + px),
          y2 + half + 0.25 * (-vy + py));
      ctx.moveTo(x2 + half, y2 + half);
      ctx.lineTo(x2 + half + 0.25 * (-vx - px),
          y2 + half + 0.25 * (-vy - py));
      ctx.stroke();
      ctx.font = this.view.scale > 22 ?
          "20px monospace" : "14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = COLOR.buildPlanner;
      ctx.fillText(this.currentBuild.length, x1 + half, y1 + half);
      ctx.textAlign = "start";
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
  if (this.mode == MODE.none && !longTouch) {
    i = 0;
  } else if (this.mode != MODE.none) {
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
  if (this.mode == MODE.buildBelt) {
    const x = (e.touches[0].clientX +
        this.view.x) / this.view.scale;
    const y = (e.touches[0].clientY +
        this.view.y) / this.view.scale;
    const oldDirection = this.currentBuild.direction;
    if (Math.abs(x - this.currentBuild.x - 0.5) <
        Math.abs(y - this.currentBuild.y - 0.5)) {
      this.currentBuild.direction =
          y - this.currentBuild.y < 0 ?
          DIRECTION.north : DIRECTION.south;
    } else {
      this.currentBuild.direction =
          x - this.currentBuild.x > 0 ?
          DIRECTION.east : DIRECTION.west;
    }
    const oldLength = oldDirection != this.currentBuild.direction ?
        1 : this.currentBuild.length;
    this.currentBuild.length = Math.round(Math.max(
        Math.abs(x - this.currentBuild.x - 0.5),
        Math.abs(y - this.currentBuild.y - 0.5)));
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
  if (this.mode == MODE.buildBelt && !e.touches.length) {
    this.mode = MODE.none;
    for (let i = 0; i < this.currentBuild.length; i++) {
      const x = this.currentBuild.x -
          ((this.currentBuild.direction - 2) % 2) * i;
      const y = this.currentBuild.y +
          ((this.currentBuild.direction - 1) % 2) * i;
      if (!this.gameMap.canPlace(x, y, 1, 1)) {
        break;
      }
      this.gameMap.createEntity(
          this.buildMenu.getSelectedEntity().name,
          x, y, this.currentBuild.direction, this.lastUpdate);
    }
  }
  if (shortTouch) {
    const entity = this.gameMap.getSelectedEntity(
        this.touches[0].x, this.touches[0].y);
    const entityDef = this.buildMenu.getSelectedEntity();
    if (entity?.type || !entityDef) {
      this.gameMap.game.ui.window.set(entity);
      if (entityDef) {
        this.buildMenu.reset();
      }
    } else {
      if (this.gameMap.tryCreateEntity(
          this.touches[0].x, this.touches[0].y,
          this.rotateButton.direction,
          entityDef, this.lastUpdate)) {
        this.buildMenu.entityBuilt();
      }
    }
  }
  this.setTouches(e);
};

GameMapInput.prototype.touchLong = function(e) {
  const entity = this.buildMenu.getSelectedEntity();
  if (entity?.type == TYPE.belt) {
    this.currentBuild.x = Math.floor((e.touches[0].clientX +
        this.view.x) / this.view.scale);
    this.currentBuild.y = Math.floor((e.touches[0].clientY +
        this.view.y) / this.view.scale);
    if (this.gameMap.canPlace(this.currentBuild.x,
        this.currentBuild.y, 1, 1)) {
      this.mode = MODE.buildBelt;
      this.currentBuild.length = 1;
    }
  }
}

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

import {TYPE, DIRECTION, DIRECTIONS} from './entity-properties.js';
import {COLOR} from './ui-properties.js';
import {S} from './sprite-pool.js';
import {BeltDrag, MultiBuild, SnakeBelt, UndergroundChain, UndergroundExit, InserterDrag, OffshorePump} from './game-map-input-modes.js';

const MIN_SCALE = 16;
const MAX_SCALE = 32;

function GameMapInput(ui) {
  this.gameMap = undefined;
  this.view = undefined;
  
  this.ui = ui;
  
  this.touches = new Array(3).fill(0).map(() => ({id: 0, x: 0, y: 0}));
  this.current = undefined;
  
  this.multiBuild = new MultiBuild(ui);
  this.snakeBelt = new SnakeBelt(ui);
  this.beltDrag = new BeltDrag(ui);
  this.undergroundChain = new UndergroundChain(ui);
  this.undergroundExit = new UndergroundExit(ui);
  this.inserterDrag = new InserterDrag(ui);
  this.offshorePump = new OffshorePump(ui);
}

GameMapInput.prototype.set = function(gameMap) {
  this.gameMap = gameMap;
  this.view = gameMap.view;
  this.multiBuild.set(gameMap);
  this.snakeBelt.set(gameMap);
  this.beltDrag.set(gameMap);
  this.undergroundChain.set(gameMap);
  this.undergroundExit.set(gameMap);
  this.offshorePump.set(gameMap);
  this.inserterDrag.set(gameMap);
};

GameMapInput.prototype.draw = function(ctx) {
  if (this.current?.draw)
    this.current.draw(ctx);
};

GameMapInput.prototype.touchStart = function(e) {
  const firstTouch = e.touches.length == 1;
  if (this.current?.touchStart)
    this.current.touchStart(e.touches[0].clientX, e.touches[0].clientY, firstTouch);
  this.setTouches(e);
};

/**
  There is exactly 1 move update per update!
  Move happens only after significant move.
*/
GameMapInput.prototype.touchMove = function(e, longTouch) {
  let i = -1;
  const isClickMode = !this.current ||
      this.current == this.undergroundExit ||
      this.current == this.offshorePump ||
      (this.current == this.snakeBelt && !this.snakeBelt.active)
  if (isClickMode && !longTouch) {
    i = 0;
  } else if (!isClickMode) {
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
  if (this.current?.touchMove)
    this.current.touchMove(e.touches[0].clientX, e.touches[0].clientY);
  this.setTouches(e);
};

GameMapInput.prototype.touchEnd = function(e, shortTouch) {
  const lastTouch = !e.touches.length;
  if (this.current?.touchEnd) {
    this.current = this.current.touchEnd(
        this.touches[0].x, this.touches[0].y,
        shortTouch, lastTouch);
  } else if (!this.current && shortTouch) {
    const entity = this.gameMap.getSelectedEntity(
        this.touches[0].x, this.touches[0].y);
    const entry = this.ui.buildMenu.getSelectedEntry();
    if (entity?.type || (entity && !entry)) {
      this.ui.window.set(entity);
      if (entry) {
        this.ui.buildMenu.reset();
      }
    } else if (entry?.entity) {
      const d = this.ui.rotateButton.direction;
      const entity = this.gameMap.tryCreateEntity(
          this.touches[0].x, this.touches[0].y,
          d, entry.entity);
      if (entity?.type == TYPE.undergroundBelt &&
          !entity.data.undergroundUp &&
          !entity.data.beltOutput) {
        this.current = this.undergroundExit.initialize(entity);
      } else if (entity?.type == TYPE.pipeToGround &&
          !entity.data.pipes[1]) {
        this.current = this.undergroundExit.initialize(entity);
      } else if (entity?.type == TYPE.belt &&
          !entity.data.beltOutput) {
        this.current = this.snakeBelt.initialize(entity);
      }
    } else {
      this.ui.window.set();
    }
  }
  this.setTouches(e);
};

GameMapInput.prototype.touchLong = function(e) {
  if (this.current?.touchLong) {
    this.current.touchLong(e.touches[0].clientX, e.touches[0].clientY);
  } else if (!this.current) {
    const entry = this.ui.buildMenu.getSelectedEntry();
    const entity = entry?.entity;
    if (entity) {
      if (entity.type == TYPE.belt) {
        this.current = this.beltDrag.initialize(entity, e.touches[0].clientX, e.touches[0].clientY);
      } else if (entity.type == TYPE.undergroundBelt ||
          entity.type == TYPE.pipeToGround) {
        this.current = this.undergroundChain.initialize(entity, e.touches[0].clientX, e.touches[0].clientY);
      } else if (entity.type == TYPE.inserter) {
        this.current = this.inserterDrag.initialize(entity, e.touches[0].clientX, e.touches[0].clientY);
      } else if (entity.type != TYPE.offshorePump) {
        this.current = this.multiBuild.initialize(entity, e.touches[0].clientX, e.touches[0].clientY);
      }
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
  this.current = this.offshorePump.initialize(entity);
};

GameMapInput.prototype.setSnakeBeltMode = function(entity) {
  this.ui.window.set();
  this.current = this.snakeBelt.initialize(entity);
};

GameMapInput.prototype.setUndergroundExitMode = function(entity) {
  this.ui.window.set();
  this.current = this.undergroundExit.initialize(entity);
};

GameMapInput.prototype.resetMode = function() {
  this.current = undefined;
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

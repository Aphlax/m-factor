import {TYPE, DIRECTION, DIRECTIONS} from './entity-properties.js';
import {COLOR, TOOL} from './ui-properties.js';
import {S} from './sprite-pool.js';
import {BeltDrag, MultiBuild, SnakeBelt, UndergroundChain, UndergroundExit, InserterDrag, PowerPoleDrag, GridDrag, OffshorePump} from './game-map-input-modes.js';
import {CopyTool, PasteTool} from './game-map-input-tools.js';

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
  this.powerPoleDrag = new PowerPoleDrag(ui);
  this.gridDrag = new GridDrag(ui);
  this.offshorePump = new OffshorePump(ui);
  
  this.copyTool = new CopyTool(ui);
  this.pasteTool = new PasteTool(ui);
}

GameMapInput.prototype.set = function(gameMap) {
  this.gameMap = gameMap;
  this.view = gameMap.view;
  this.current = undefined;
  
  this.multiBuild.set(gameMap);
  this.snakeBelt.set(gameMap);
  this.beltDrag.set(gameMap);
  this.undergroundChain.set(gameMap);
  this.undergroundExit.set(gameMap);
  this.inserterDrag.set(gameMap);
  this.powerPoleDrag.set(gameMap);
  this.gridDrag.set(gameMap);
  this.offshorePump.set(gameMap);
  
  this.copyTool.set(gameMap);
  this.pasteTool.set(gameMap);
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
      this.current.isClickMode?.();
  if (isClickMode && !longTouch) {
    i = 0;
  } else if (!isClickMode) {
    i = 1;
  }
  if (e.touches[i]) {
    if (e.touches[i + 1]) {
      const {clientX: sx1, clientY: sy1} = e.touches[i];
      const {clientX: sx2, clientY: sy2} = e.touches[i + 1];
      const {x: osx1, y: osy1} = this.touches[i];
      const {x: osx2, y: osy2} = this.touches[i + 1];
      const mx = (sx1 + sx2), my = (sy1 + sy2);
      const omx = (osx1 + osx2) / 2, omy = (osy1 + osy2) / 2;
      const dist = Math.sqrt((sx1 - sx2)**2 + (sy1 - sy2)**2);
      const oldDist = Math.sqrt((osx1 - osx2)**2 + (osy1 - osy2)**2);
      let scale = this.view.scale * dist / oldDist;
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)) / this.view.scale;
      this.view.scale *= scale;
      this.view.x = Math.round((this.view.x + mx / 2) * scale - mx + omx);
      this.view.y = Math.round((this.view.y + my / 2) * scale - my + omy);
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
  const {x: sx, y: sy} = this.touches[0];
  if (this.current?.touchEnd) {
    this.current = this.current.touchEnd(
        sx, sy, shortTouch, lastTouch);
  } else if (!this.current && shortTouch) {
    const entity = this.gameMap.getSelectedEntity(sx, sy);
    const entry = this.ui.buildMenu.getSelectedEntry();
    if (entry?.tool == TOOL.copy) {
      this.current = this.copyTool.initialize(sx, sy, false);
    } else if (entity?.type || (entity && !entry)) {
      this.ui.window.set(entity);
      if (entry) {
        this.ui.buildMenu.reset();
      }
    } else if (entry?.entity) {
      const d = this.ui.rotateButton.direction;
      const entity = this.gameMap.tryCreateEntityFromScreen(
          sx, sy, d, entry.entity);
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
      } else if (entity?.type == TYPE.electricPole) {
        this.current = this.gridDrag.initialize(entity);
      }
    } else {
      this.ui.window.set();
    }
  }
  this.setTouches(e);
};

GameMapInput.prototype.touchLong = function(e) {
  const {clientX: sx, clientY: sy} = e.touches[0];
  if (this.current) {
    this.current.touchLong?.(sx, sy);
  } else {
    const entry = this.ui.buildMenu.getSelectedEntry();
    if (!entry) {
      const entity = this.gameMap.getSelectedEntity(sx, sy);
      if (entity?.type) {
        this.ui.window.set();
        this.ui.buildMenu.trySelectEntry(entity.name);
      }
    } else if (entry.entity) {
      const entity = entry.entity;
      if (entity.type == TYPE.belt) {
        this.current = this.beltDrag.initialize(entity, sx, sy);
      } else if (entity.type == TYPE.undergroundBelt ||
          entity.type == TYPE.pipeToGround) {
        this.current = this.undergroundChain.initialize(entity, sx, sy);
      } else if (entity.type == TYPE.inserter) {
        this.current = this.inserterDrag.initialize(entity, sx, sy);
      } else if (entity.type == TYPE.electricPole) {
        this.current = this.powerPoleDrag.initialize(entity, sx, sy);
      } else if (entity.type != TYPE.offshorePump) {
        this.current = this.multiBuild.initialize(entity, sx, sy);
      }
    } else {
      if (entry.tool == TOOL.copy) {
        this.current = this.copyTool.initialize(sx, sy, true);
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

GameMapInput.prototype.setPasteTool = function() {
  this.current = this.pasteTool.initialize();
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

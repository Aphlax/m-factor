import {Entity} from './entity.js';
import {UiWindow} from './ui-window.js';
import {TYPE, RESOURCE_LABELS} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';
import {COLOR} from './ui-properties.js';

const MODE = {
  none: 0,
  map: 1,
  window: 2,
};

function GameUi(game, gameMapInput, canvas) {
  this.game = game;
  this.gameMapInput = gameMapInput;
  this.window = new UiWindow(this, canvas);
  this.window.initialize();
  
  this.mode = MODE.none;
}

GameUi.prototype.update = function(time) {
  this.window.update(time);
  if (this.game.gameMap.view.height != this.window.y) {
    this.game.gameMap.view.height = this.window.y;
  }
};

GameUi.prototype.draw = function(ctx, time, view) {
  if (this.window.selectedEntity) {
    Entity.prototype.drawSelection.call(this.window.selectedEntity, ctx, view);
    if (this.window.selectedEntity.type) {
      this.window.selectedEntity.drawIO(ctx, view);
    }
  }
  
  this.window.draw(ctx, time);
};

GameUi.prototype.touchStart = function(e) {
  if (this.mode == MODE.none) {
    const isWindow = e.touches[0].clientY >= this.window.y;
    this.mode = isWindow ? MODE.window : MODE.map;
  }
  if (this.mode == MODE.window) {
    this.window.touchStart(e);
  } else if (this.mode == MODE.map) {
    this.gameMapInput.touchStart(e);
  }
}

GameUi.prototype.touchMove = function(e) {
  if (this.mode == MODE.window) {
    this.window.touchMove(e);
  } else if (this.mode == MODE.map) {
    this.gameMapInput.touchMove(e);
  }
}

GameUi.prototype.touchEnd = function(e) {
  if (this.mode == MODE.window) {
    this.window.touchEnd(e);
  } else if (this.mode == MODE.map) {
    this.gameMapInput.touchEnd(e);
  }
  if (!e.touches.length) {
    this.mode = MODE.none;
  }
}

export {GameUi};

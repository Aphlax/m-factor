import {Entity} from './entity.js';
import {UiWindow} from './ui-window.js';
import {UiBuildMenu} from './ui-build-menu.js';
import {TYPE, RESOURCE_LABELS} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';
import {COLOR} from './ui-properties.js';

const MODE = {
  none: 0,
  map: 1,
  window: 2,
  buildMenu: 3,
};
const LONG_TOUCH_DURATION = 500;

function GameUi(game, gameMapInput, canvas) {
  this.game = game;
  this.gameMapInput = gameMapInput;
  this.window = new UiWindow(this, canvas);
  this.window.initialize();
  this.buildMenu = new UiBuildMenu(this, canvas);
  
  this.mode = MODE.none;
  this.lastUpdate = 0;
  
  this.longTouchStarted = false;
  this.longTouchEnd = 0;
  this.longTouch = false;
  this.longTouchIndicator = 0;
  this.longTouchEvent = {touches: [{}]};
  this.shortTouch = false;
}

GameUi.prototype.update = function(time) {
  if (this.longTouchStarted) {
    this.longTouchStarted = false;
    this.longTouchEnd = time + LONG_TOUCH_DURATION;
  } else if (this.longTouchEnd && time >= this.longTouchEnd) {
    this.longTouchEnd = 0;
    this.longTouch = true;
    this.shortTouch = false;
    navigator.vibrate(200);
    this.longTouchIndicator = time + 200;
    
    if (this.mode == MODE.window) {
      this.window.touchLong(this.longTouchEvent);
    } else if (this.mode == MODE.map) {
      this.gameMapInput.touchLong(this.longTouchEvent);
    } else if (this.mode == MODE.buildMenu) {
      this.buildMenu.touchLong(this.longTouchEvent);
    }
  }
  
  const dt = time - this.lastUpdate;
  this.lastUpdate = time;
  this.window.update(time, dt);
  this.buildMenu.update(time, dt);
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
  
  this.buildMenu.draw(ctx);
  this.window.draw(ctx, time);
  
  if (time < this.longTouchIndicator) {
    const intensity = 1 -  Math.abs((this.longTouchIndicator - time) - 100) / 100;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = COLOR.longTouchIndicator;
    ctx.lineWidth = Math.floor(intensity * 10) * 2;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = Math.floor(intensity * 10);
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
  }
};

GameUi.prototype.touchStart = function(e) {
  if (e.touches.length == 1) {
    this.longTouchStarted = true;
    this.longTouchEvent.touches[0].clientX =
        e.touches[0].clientX;
    this.longTouchEvent.touches[0].clientY =
        e.touches[0].clientY;
    this.shortTouch = true;
  } else {
    this.shortTouch = false;
    if (this.longTouchEnd) {
      this.longTouchEnd = 0;
    }
  }
  if (this.mode == MODE.none) {
    if (e.touches[0].clientY >= this.window.y) {
      this.mode = MODE.window;
    } else if (this.buildMenu.inBounds(e.touches[0])) {
      this.mode = MODE.buildMenu;
    } else {
      this.mode = MODE.map;
    }
  }
  if (this.mode == MODE.window) {
    this.window.touchStart(e);
  } else if (this.mode == MODE.map) {
    this.gameMapInput.touchStart(e);
  } else if (this.mode == MODE.buildMenu) {
    this.buildMenu.touchStart(e);
  }
}

GameUi.prototype.touchMove = function(e) {
  if (this.shortTouch) {
    this.shortTouch = false;
  }
  if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
  if (this.mode == MODE.window) {
    this.window.touchMove(e, this.longTouch);
  } else if (this.mode == MODE.map) {
    this.gameMapInput.touchMove(e, this.longTouch);
  } else if (this.mode == MODE.buildMenu) {
    this.buildMenu.touchMove(e, this.longTouch);
  }
}

GameUi.prototype.touchEnd = function(e) {
  if (this.mode == MODE.window) {
    this.window.touchEnd(e, this.shortTouch);
  } else if (this.mode == MODE.map) {
    this.gameMapInput.touchEnd(e, this.shortTouch);
  } else if (this.mode == MODE.buildMenu) {
    this.buildMenu.touchEnd(e, this.shortTouch);
  }
  if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
  if (this.shortTouch) {
    this.shortTouch = false;
  }
  if (this.longTouch) {
    this.longTouch = false;
  }
  if (!e.touches.length) {
    this.mode = MODE.none;
  }
}

export {GameUi};

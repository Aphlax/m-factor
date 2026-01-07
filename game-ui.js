import {Entity} from './entity.js';
import {GameMapInput} from './game-map-input.js';
import {UiWindow} from './ui-window.js';
import {UiBuildMenu} from './ui-build-menu.js';
import {UiRotateButton} from './ui-rotate-button.js';
import {UiButton, BUTTON} from './ui-button.js';
import {TYPE, RESOURCE_LABELS} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';
import {COLOR} from './ui-properties.js';
import {S} from './sprite-pool.js';

const MODE = {
  none: 0,
  map: 1,
  window: 2,
  buildMenu: 3,
  rotateButton: 4,
  menuButton: 5,
};
const LONG_TOUCH_DURATION = 400;

function GameUi(game, canvas) {
  this.game = game;
  this.gameMapInput = new GameMapInput(this);
  this.window = new UiWindow(this, canvas);
  this.window.initialize();
  this.buildMenu = new UiBuildMenu(this, canvas);
  this.rotateButton = new UiRotateButton(this, canvas);
  this.menuButton = new UiButton({x: 0, y: 0, ui: this}, canvas.width - 55, 15);
  this.menuButton.setButton(BUTTON.gameMenu, S.menuIcon);
  
  this.mode = MODE.none;
  this.lastUpdate = 0;
  
  this.longTouchEnd = 0;
  this.longTouch = false;
  this.longTouchIndicator = 0;
  this.longTouchEvent = {touches: [{}]};
  this.longTouchEvent.changedTouches = this.longTouchEvent.touches;
  this.shortTouch = false;
}

GameUi.prototype.setMap = function(gameMap) {
  this.gameMapInput.set(gameMap);
  this.buildMenu.reset();
  this.window.set();
  this.window.y = this.window.canvasHeight;
};

GameUi.prototype.update = function(time) {
  if (this.longTouchEnd && time >= this.longTouchEnd) {
    this.longTouchEnd = 0;
    this.longTouch = true;
    this.shortTouch = false;
    navigator.vibrate(20);
    this.longTouchIndicator = time + 200;
    
    if (this.mode == MODE.window) {
      this.window.touchLong(this.longTouchEvent);
    } else if (this.mode == MODE.map) {
      this.gameMapInput.touchLong(this.longTouchEvent);
    } else if (this.mode == MODE.buildMenu) {
      this.buildMenu.touchLong(this.longTouchEvent);
    } else if (this.mode == MODE.rotateButton) {
      this.rotateButton.touchLong(this.longTouchEvent);
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

GameUi.prototype.drawGroundIndicators = function(ctx) {
  const entity = this.window.selectedEntity;
  if (entity && entity.type == TYPE.electricPole) {
    entity.drawPowerSupplyArea(ctx, this.gameMapInput.view);
  } else if (entity && entity.type == TYPE.mine) {
    entity.drawMineDrillArea(ctx, this.gameMapInput.view);
  }
}

GameUi.prototype.draw = function(ctx, time) {
  if (this.window.selectedEntity) {
    // Resources do not have drawSelection, but this still works...
    Entity.prototype.drawSelection.call(
        this.window.selectedEntity, ctx, this.gameMapInput.view);
    if (this.window.selectedEntity.type) {
      this.window.selectedEntity.drawIO(ctx, this.gameMapInput.view);
    }
  }
  
  this.gameMapInput.draw(ctx);
  this.buildMenu.draw(ctx);
  this.rotateButton.draw(ctx);
  this.window.draw(ctx, time);
  this.menuButton.draw(ctx);
  
  if (time < this.longTouchIndicator) {
    const intensity = 1 -  Math.abs((this.longTouchIndicator - time) - 100) / 100;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = COLOR.longTouchIndicator;
    ctx.lineWidth = Math.floor(intensity * 10) * 2;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    window.numberOtherDraws++;
    ctx.lineWidth = Math.floor(intensity * 10);
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    window.numberOtherDraws++;
    ctx.globalAlpha = 1;
  }
};

GameUi.prototype.touchStart = function(e) {
  if (e.touches.length == 1) {
    this.longTouchEnd = this.lastUpdate + LONG_TOUCH_DURATION
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
    } else if (this.rotateButton.inBounds(e.touches[0])) {
      this.mode = MODE.rotateButton;
    } else if (this.menuButton.inBounds(e.touches[0])) {
      this.mode = MODE.menuButton;
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
  } else if (this.mode == MODE.rotateButton) {
    this.rotateButton.touchStart(e);
  } else if (this.mode == MODE.menuButton) {
    this.menuButton.touchStart(e);
  }
};

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
  } else if (this.mode == MODE.rotateButton) {
    this.rotateButton.touchMove(e, this.longTouch);
  } else if (this.mode == MODE.menuButton) {
    this.menuButton.touchMove(e, this.longTouch);
  }
};

GameUi.prototype.touchEnd = function(e) {
  if (this.mode == MODE.window) {
    this.window.touchEnd(e, this.shortTouch);
  } else if (this.mode == MODE.map) {
    this.gameMapInput.touchEnd(e, this.shortTouch);
  } else if (this.mode == MODE.buildMenu) {
    this.buildMenu.touchEnd(e, this.shortTouch);
  } else if (this.mode == MODE.rotateButton) {
    this.rotateButton.touchEnd(e, this.shortTouch);
  } else if (this.mode == MODE.menuButton) {
    this.menuButton.touchEnd(e, this.shortTouch);
  }
  if (this.longTouchEnd) {
    this.longTouchEnd = 0;
  }
  if (this.shortTouch) {
    this.shortTouch = false;
  }
  if (!e.touches.length) {
    if (this.longTouch) {
      this.longTouch = false;
    }
    this.mode = MODE.none;
  }
};

GameUi.prototype.mouseWheel = function(e) {
  this.gameMapInput.mouseWheel(e);
};

export {GameUi};

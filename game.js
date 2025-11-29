"use strict";

import {GameMap, MAP} from './game-map.js';
import {GameUi} from './game-ui.js';
import {GameMenu} from './game-menu.js';
import {Storage} from './storage.js';
import {SPRITES} from './sprite-pool.js';
import {scenario} from './scenario.js';
import {STATE} from './entity-properties.js';

const MODE = {
  loading: 0,
  playing: 2,
  gameMenu: 3,
};

function Game(canvas) {
  this.seed = 114;
  this.mode = MODE.loading;
  this.spritePool = SPRITES;
  this.spritePool.load();
  this.ui = new GameUi(this, canvas);
  this.gameMenu = new GameMenu(this, canvas);
  this.storage = new Storage(this);
  this.gameMap = undefined;
  
  this.setupScenario = true;
  this.lastUpdate = 0;
  this.playTime = 0;
  
  this.storage.initialize();
  this.loadMap(0, new GameMap(this.seed, MAP.nauvis)
      .centerView(canvas));
  this.mode = MODE.loading;
}

Game.prototype.loadMap = function(time, gameMap) {
  this.playTime = time;
  this.gameMap = gameMap;
  this.gameMap.initialize();
  this.ui.setMap(gameMap);
  this.mode = MODE.playing;
};

Game.prototype.update = function(time) {
  if (this.ui.window.selectedEntity?.type) {
    const entity = this.ui.window.selectedEntity;
    this.debug = Object.keys(STATE)
        .filter(s => STATE[s] == entity.state)[0] +
        ", " + (entity.nextUpdate < 1000000 ?
        (entity.nextUpdate / 1000).toFixed(1) : "XXX") +
        ", " + (entity.taskStart < 1000000 ?
        (entity.taskStart / 1000).toFixed(1) : "XXX") +
        ", " + (entity.taskEnd < 1000000 ?
        (entity.taskEnd / 1000).toFixed(1) : "XXX");
  } else {
    this.debug = "";
  }
  if (this.mode == MODE.playing) {
    const dt = time - this.lastUpdate;
    if (dt < 100) {
      this.playTime += dt;
      this.gameMap.update(this.playTime, dt);
      this.ui.update(this.playTime);
      if (this.setupScenario) {
        scenario(this.gameMap, this.playTime);
        this.setupScenario = false;
      }
    }
  } else if (this.mode == MODE.loading) {
    if (this.spritePool.isLoaded()) {
      this.mode = MODE.playing;
    }
  }
  this.lastUpdate = time;
};

Game.prototype.draw = function(ctx, time) {
  if (this.mode == MODE.playing) {
    this.gameMap.drawGround(ctx, this.playTime);
    this.ui.drawGroundIndicators(ctx);
    this.gameMap.draw(ctx, this.playTime);
    this.ui.draw(ctx, this.playTime);
  } else if (this.mode == MODE.loading) {
    this.spritePool.draw(ctx, time);
  } else if (this.mode == MODE.gameMenu) {
    this.gameMap.drawGround(ctx, this.playTime);
    this.gameMap.draw(ctx, this.playTime);
    this.ui.window.draw(ctx, this.playTime);
    this.gameMenu.draw(ctx);
    this.storage.draw(ctx, time);
  }
};

Game.prototype.openMenu = function() {
  this.mode = MODE.gameMenu;
};

Game.prototype.continuePlay = function() {
  this.mode = MODE.playing;
};

Game.prototype.saveGame = function() {
  this.storage.save("", this.playTime, this.gameMap);
};

Game.prototype.loadGame = function() {
  this.storage.load("");
};

Game.prototype.touchStart = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchStart(e);
  } else if (this.mode == MODE.gameMenu) {
    this.gameMenu.touchStart(e);
  }
};

Game.prototype.touchMove = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchMove(e);
  } else if (this.mode == MODE.gameMenu) {
    this.gameMenu.touchMove(e);
  }
};

Game.prototype.touchEnd = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchEnd(e);
  } else if (this.mode == MODE.gameMenu) {
    this.gameMenu.touchEnd(e);
  }
};

Game.prototype.mouseWheel = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.mouseWheel(e);
  }
};

export {Game};

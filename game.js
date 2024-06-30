"use strict";

import {GameMap} from './game-map.js';
import {GameUi} from './game-ui.js';
import {SPRITES} from './sprite-pool.js';
import {scenario} from './scenario.js';
import {STATE} from './entity-properties.js';

const MODE = {
  loading: 0,
  playing: 2,
};

function Game(canvas) {
  this.seed = 114;
  this.mode = MODE.loading;
  this.spritePool = SPRITES;
  this.spritePool.load();
  this.gameMap = new GameMap(this, canvas);
  this.gameMap.initialize(this.seed);
  this.ui = new GameUi(this, this.gameMap.input, canvas);
  
  this.setupScenario = true;
  this.playTime = 0;
}

Game.prototype.update = function(time) {
  if (this.ui.window.selectedEntity?.type) {
    const entity = this.ui.window.selectedEntity;
    this.debug = Object.keys(STATE)
        .filter(s => STATE[s] == entity.state)[0] +
        ", " + entity.nextUpdate;
  } else {
    this.debug = "";
  }
  if (this.mode == MODE.playing) {
    this.playTime = time;
    this.gameMap.update(this.playTime);
    this.ui.update(this.playTime);
    if (this.setupScenario) {
      scenario(this.gameMap, this.playTime);
      this.setupScenario = false;
    }
  } else if (this.mode == MODE.loading) {
    if (this.spritePool.isLoaded()) {
      this.mode = MODE.playing;
    }
  }
};

Game.prototype.draw = function(ctx, time) {
  if (this.mode == MODE.playing) {
    this.gameMap.draw(ctx, time);
    this.ui.draw(ctx, time, this.gameMap.view);
  } else if (this.mode == MODE.loading) {
    this.spritePool.draw(ctx, time);
  }
};

Game.prototype.touchStart = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchStart(e)
    if (e.touches[0].clientY < 50) {
      this.seed = Math.floor(Math.random() * 1000);
      this.setupScenario = true;
      this.gameMap.initialize(this.seed);
    }
  }
}
Game.prototype.touchMove = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchMove(e);
  }
}
Game.prototype.touchEnd = function(e) {
  if (this.mode == MODE.playing) {
    this.ui.touchEnd(e);
  }
}

export {Game};

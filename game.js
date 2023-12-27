"use strict";

import {GameMap} from './game-map.js';
import {SPRITES} from './sprite-pool.js';

const MODE = {
  loading: 0,
  playing: 2,
};

function Game(canvas) {
  this.seed = 546;
  this.mode = MODE.loading;
  this.gameMap = new GameMap(canvas);
  this.spritePool = SPRITES;
  this.gameMap.initialize(this.seed);
  this.spritePool.load();
  this.setupScenario = true;
}

Game.prototype.update = function(time, dt) {
  if (this.mode == MODE.playing) {
    this.gameMap.update(time, dt);
    if (this.setupScenario) {
      this.gameMap.createEntity(2, 9, 11, 0, time);
      this.gameMap.createEntity(1, 10, 10, 3, time);
      this.setupScenario = false;
    }
  } else if (this.mode == MODE.loading) {
    if (this.spritePool.isLoaded() && time > 1000) {
      this.mode = MODE.playing;
    }
  }
};

Game.prototype.draw = function(ctx, time, dt) {
  if (this.mode == MODE.playing) {
    this.gameMap.draw(ctx, time, dt);
  } else if (this.mode == MODE.loading) {
    this.spritePool.draw(ctx, time);
  }
};

Game.prototype.touchStart = function(e) {
  if (this.mode == MODE.playing) {
    this.gameMap.input.touchStart(e);
    if (e.touches[0].clientY < 50) {
      this.seed = Math.floor(Math.random() * 1000);
      this.setupScenario = true;
      this.gameMap.initialize(this.seed);
    }
  }
}
Game.prototype.touchMove = function(e) {
  if (this.mode == MODE.playing) {
    this.gameMap.input.touchMove(e);
  }
}
Game.prototype.touchEnd = function(e) {
  if (this.mode == MODE.playing) {
    this.gameMap.input.touchEnd(e);
  }
}

export {Game};

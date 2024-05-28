"use strict";

import {GameMap} from './game-map.js';
import {SPRITES} from './sprite-pool.js';
import {scenario} from './scenario.js';

const MODE = {
  loading: 0,
  playing: 2,
};

function Game(canvas) {
  this.seed = 114;
  this.mode = MODE.loading;
  this.gameMap = new GameMap(this, canvas);
  this.spritePool = SPRITES;
  this.gameMap.initialize(this.seed);
  this.spritePool.load();
  this.setupScenario = true;
}

Game.prototype.update = function(time) {
  if (this.entity)
    this.debug = this.entity.nextUpdate;
  if (this.mode == MODE.playing) {
    this.gameMap.update(time);
    if (this.setupScenario) {
      this.entity = scenario(this.gameMap, time).inserter;
      this.setupScenario = false;
    }
  } else if (this.mode == MODE.loading) {
    if (this.spritePool.isLoaded() && time > 1000) {
      this.mode = MODE.playing;
    }
  }
};

Game.prototype.draw = function(ctx, time) {
  if (this.mode == MODE.playing) {
    this.gameMap.draw(ctx, time);
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

"use strict";

import {GameMap} from './game-map.js';
import {SpritePool} from './sprite-pool.js';

const MODE = {
  loading: 0,
  playing: 2,
};

function Game(canvas) {
  this.seed = 1274;
  this.mode = MODE.loading;
  this.gameMap = new GameMap(canvas);
  this.spritePool = new SpritePool();
  this.gameMap.initialize(this.seed);
  this.spritePool.load();
}

Game.prototype.update = function(time, dt, input) {
  if (this.mode == MODE.playing) {
    this.gameMap.update(time);
  } else if (this.mode == MODE.loading) {
    if (this.spritePool.isLoaded() && time > 1000) {
      this.mode = MODE.playing;
    }
  }
};

Game.prototype.draw = function(time, dt, ctx) {
  if (this.mode == MODE.playing) {
    this.gameMap.draw(ctx);
  } else if (this.mode == MODE.loading) {
    this.spritePool.draw(ctx);
  }
};

Game.prototype.touchStart = function(e) {
  if (this.mode == MODE.playing) {
    this.gameMap.touchStart(e);
    if (e.touches[0].clientY < 50) {
      this.gameMap.initialize(Math.floor(Math.random() * 1000));
    }
  }
}
Game.prototype.touchMove = function(e) {
  if (this.mode == MODE.playing) {
    this.gameMap.touchMove(e);
  }
}
Game.prototype.touchEnd = function(e) {
  if (this.mode == MODE.playing) {
    this.gameMap.touchEnd(e);
  }
}

export {Game};

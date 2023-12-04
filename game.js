"use strict";

import {GameMap} from './game-map.js';

function Game(canvas) {
  this.seed = 1274;
  this.gameMap = new GameMap(canvas);
  this.gameMap.initialize(this.seed);
}

Game.prototype.update = function(time, dt, input) {
  this.gameMap.update();
};

Game.prototype.draw = function(time, dt, ctx) {
  this.gameMap.draw(ctx);
};

Game.prototype.touchStart = function(e) {
  this.gameMap.dragStart(e.touches[0].clientX, e.touches[0].clientY);
  if (e.touches[0].clientY < 50) {
    this.gameMap.initialize(Math.floor(Math.random() * 1000));
  }
}
Game.prototype.touchMove = function(e) {
  this.gameMap.dragMove(e.touches[0].clientX, e.touches[0].clientY);
}
Game.prototype.touchEnd = function(e) {
  
}

export {Game};

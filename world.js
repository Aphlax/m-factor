import {Random} from './utils.js';
import {GameMap, MAP} from './game-map.js';
import {Character} from './character.js';
import {scenario} from './scenario.js';


function World() {
  this.game = undefined;
  this.seed = 0;
  
  this.gameMap = undefined;
  this.character = undefined;
  
  this.playTime = 0;
  this.setupScenario = false;
  this.achievedVictory = false;
  
  this.productionRandom = undefined;
}

World.create = function(seed, canvas) {
  const world = new World();
  world.seed = seed;
  world.gameMap = new GameMap(seed, MAP.nauvis)
      .setViewFromCanvas(canvas);
  world.character = new Character();
  world.playTime = 0;
  world.setupScenario = true;
  world.achievedVictory = false;
  
  world.productionRandom = new Random(seed, 86, 14, 666);
  return world;
}

World.prototype.initialize = function(game) {
  this.game = game; // Only used for victory screen.
  this.gameMap.initialize(this);
  return this;
};

World.prototype.update = function(dt) {
  this.playTime += dt;
  
  this.gameMap.update(this.playTime, dt);
  
  if (this.setupScenario) {
    scenario(this.gameMap, this.playTime);
    this.setupScenario = false;
  }
};

World.prototype.drawGround = function(ctx) {
  this.gameMap.drawGround(ctx, this.playTime);
};

World.prototype.draw = function(ctx) {
  this.gameMap.draw(ctx, this.playTime);
};

World.prototype.drawMap = function(ctx) {
  this.gameMap.drawMap(ctx, this.playTime);
};

export {World};

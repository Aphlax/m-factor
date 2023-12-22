import {S, SPRITES} from './sprite-pool.js';
import {MINE_PATTERN, MINE_PRODUCTS} from './entity-properties.js';

export const MAX_SIZE = 6;
export const TYPE = {
  mine: 1,
};
export const STATE = {
  running: 0,
  idle: 1,
  missingItem: 1,
  outputFull: 2,
  noEnergy: 3,
  mineNoOutput: 10,
  mineEmpty: 11,
};

function Entity() {
  this.type = 0;
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.direction = 0;
  this.sprite = undefined;
  this.nextUpdate = 0;
  this.state = 0;
  this.data = 0;
  // Inventories.
  this.inputInv = undefined;
  this.outputInv = undefined;
  // Connected entities.
  this.inputEntities = [];
  this.outputEntities = [];
}

Entity.prototype.set = function(type, x, y, width, height, direction, sprite) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.direction = direction;
  this.sprite = sprite;
  return this;
};

Entity.prototype.initialize = function(time) {
  if (this.type == TYPE.mine) {
    this.state = STATE.running;
    this.nextUpdate = time + 666;
    this.data = 0;
  }
  return this;
};

Entity.prototype.update = function(gameMap, time, dt) {
  if (this.type == TYPE.mine) {
    if (time >= this.nextUpdate) {
      const outEntity = this.outputEntities[0];
      if (!outEntity) {
        this.state = STATE.mineNoOutput;
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
        return;
      }
      let resource;
      for (let i = 0; i < 16; i++) {
        resource = gameMap.getResourceAt(
            this.x + MINE_PATTERN.x4[i],
            this.y + MINE_PATTERN.y4[i]);
        if (resource) break;
      }
      if (!resource) {
        this.state = STATE.mineEmpty;
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
        return;
      }
      // no energy
      const item = MINE_PRODUCTS[resource.id];
      if (outEntity.insert(item, amount, this.nextUpdate, this)) {
        this.nextUpdate += 666;
        resource.amount--;
        if (resource.amount == 25 ||
            resource.amount == 100 ||
            resource.amount == 500 ||
            resource.amount == 2500 ||
            resource.amount == 10000 ||
            resource.amount == 50000 ||
            resource.amount == 250000) {
          resource.sprite--;
        }
      } else {
        this.state = STATE.outputFull;
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
      }
    }
  }
};

Entity.prototype.draw = function(ctx, view, time, dt) {
  const r = this.sprite.mip[0];
  ctx.drawImage(this.sprite.image,
      r.x, r.y, r.width, r.height,
      this.x * view.scale - view.x,
      this.y * view.scale - view.y,
      this.width * view.scale,
      this.height * view.scale)
};

Entity.prototype.insert = function(item, amount, time, origin) {
  return 0;
};

Entity.prototype.extract = function(item, amount, time, origin) {
  return 0;
};

Entity.prototype.itemInserted = function() {
  
};

Entity.prototype.itemExtracted = function() {
  
};

export {Entity};
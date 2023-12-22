import {S, SPRITES} from './sprite-pool.js';

export const MAX_SIZE = 6;
export const TYPE = {
  mine: 1,
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

Entity.prototype.update = function(gameMap, time, dt) {
  if (this.type == TYPE.mine) {
    if (time >= this.nextUpdate) {
      const outEntity = this.outputEntities[0];
      if (!outEntity) {
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
        return;
      }
      // no energy, no minable resources
      const item = 1;
      if (outEntity.insert(item, this.nextUpdate, this)) {
        this.nextUpdate += 666;
      } else {
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

Entity.prototype.insert = function(item, time, origin) {
  return 0;
};

Entity.prototype.extract = function() {
  return 0;
};

Entity.prototype.itemInserted = function() {
  
};

Entity.prototype.itemExtracted = function() {
  
};

export {Entity};
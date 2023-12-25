import {S, SPRITES} from './sprite-pool.js';
import {ENTITIES} from './entity-definitions.js';
import {TYPE, MAX_SIZE, STATE, MINE_PATTERN, MINE_PRODUCTS} from './entity-properties.js';


function Entity() {
  this.type = 0;
  this.name = undefined;
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.direction = 0;
  this.sprite = 0;
  this.animation = 0;
  this.animationLength = 0;
  
  this.taskStart = 0;
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

Entity.prototype.setup = function(name, x, y, direction, time) {
  const def = ENTITIES.get(name);
  this.type = def.type;
  this.name = name;
  this.x = x;
  this.y = y;
  this.width = def.width;
  this.height = def.height;
  this.direction = direction;
  this.sprite = def.sprites[direction];
  this.animation = 0;
  this.animationLength = def.animationLength;
  
  if (this.type == TYPE.mine) {
    this.state = STATE.running;
    this.nextUpdate = time + 666;
    this.taskStart = time;
    this.data = 0;
  }
  return this;
};

Entity.prototype.update = function(gameMap, time, dt) {
  if (this.type == TYPE.mine) {
    if (time >= this.nextUpdate) {
      this.animation = (this.animation + (time - this.taskStart) / 60) % this.animationLength;
      const outEntity = this.outputEntities[0];
      if (!outEntity) {
        this.state = STATE.running;//STATE.mineNoOutput;
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
        return;
      }
      let resource, x, y;
      for (let i = 0; i < 16; i++) {
        resource = gameMap.getResourceAt(
            x = this.x + MINE_PATTERN.x4[(i + this.data) & 15],
            y = this.y + MINE_PATTERN.y4[(i + this.data) & 15]);
        if (resource) {
          this.data = (this.data + i + 1) & 15;
          break;
        }
      }
      if (!resource) {
        this.state = STATE.mineEmpty;
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
        return;
      }
      // no energy
      const item = MINE_PRODUCTS[resource.id];
      if (outEntity.insert(item, 1, this.nextUpdate, this)) {
        this.taskStart = this.nextUpdate;
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
        } else if (!resource.amount) {
          gameMap.getResourceAt(x, y, /*remove*/ true);
        }
      } else {
        this.state = STATE.outputFull;
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
      }
    }
  }
};

Entity.prototype.draw = function(ctx, view, time, dt) {
  if ((this.x + this.width) * view.scale <= view.x)
    return;
  if (this.x * view.scale > view.x + view.width)
    return;
  if ((this.y + this.height) * view.scale <= view.y)
    return;
  if (this.y * view.scale > view.y + view.height)
    return;
  let animation = this.animation;
  if (this.animationLength && this.state == STATE.running) {
    animation = Math.floor(animation +
        (time - this.taskStart) / 60) % this.animationLength;
  }
  const sprite = SPRITES.get(this.sprite + animation);
  const r = sprite.mip[0];
  ctx.drawImage(sprite.image,
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

Entity.prototype.outputEntityHasSpace = function() {
  
};

Entity.prototype.nearbyEntityCreated = function() {
  
};

export {Entity};
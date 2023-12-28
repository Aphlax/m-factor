import {Inventory} from './inventory.js';
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
  this.spriteShadow = 0;
  this.animation = 0;
  this.animationLength = 0;
  
  this.taskStart = 0;
  this.nextUpdate = 0;
  this.state = 0;
  this.data = {};
  // Inventories.
  this.inputInventory = undefined;
  this.outputInventory = undefined;
  // Connected entities.
  this.inputEntities = new Set();
  this.outputEntities = new Set();
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
  this.sprite = def.sprites[direction][0];
  this.spriteShadow = def.sprites[direction][1];
  this.animation = 0;
  this.animationLength = def.animationLength;
  this.inputEntities.clear();
  this.outputEntities.clear();
  
  if (this.type == TYPE.mine) {
    this.state = STATE.running;
    this.nextUpdate = time + 666;
    this.taskStart = time;
    this.data.minePattern = 0;
    this.data.mineOutputX = def.mineOutput[direction].x;
    this.data.mineOutputY = def.mineOutput[direction].y;
  } else if (this.type == TYPE.chest) {
    this.inputInventory = this.outputInventory =
        new Inventory(def.capacity);
  }
  return this;
};

Entity.prototype.update = function(gameMap, time, dt) {
  if (this.type == TYPE.mine) {
    if (time >= this.nextUpdate) {
      this.animation = Math.floor(this.animation + (time - this.taskStart) / 60) % this.animationLength;
      let resource, x, y;
      for (let i = 0; i < 16; i++) {
        resource = gameMap.getResourceAt(
            x = (this.x + MINE_PATTERN.x4[(i + this.data.minePattern) % 16]),
            y = (this.y + MINE_PATTERN.y4[(i + this.data.minePattern) % 16]));
        if (resource) {
          this.data.minePattern = (this.data.minePattern + i + 1) % 16;
          break;
        }
      }
      if (!resource) {
        this.state = STATE.mineEmpty;
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
        return;
      }
      
      // no energy
      const [outEntity] = this.outputEntities;
      if (!outEntity) {
        this.state = STATE.mineNoOutput;
        this.nextUpdate = Number.MAX_SAFE_INTEGER;
        return;
      }
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
  const r = sprite.rect, e = sprite.extend;
  const xScale = this.width * view.scale / (r.width - e.left - e.right);
  const yScale = this.height * view.scale / (r.height - e.top - e.bottom);
  ctx.drawImage(sprite.image,
      r.x, r.y, r.width, r.height,
      this.x * view.scale - view.x -
          e.left * xScale,
      this.y * view.scale - view.y -
          e.top * yScale,
      r.width * xScale,
      r.height * yScale)
};

Entity.prototype.drawShadow = function(ctx, view, time, dt) {
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
  const sprite = SPRITES.get(this.spriteShadow + animation);
  const r = sprite.rect, e = sprite.extend;
  const xScale = this.width * view.scale / (r.width - e.left - e.right);
  const yScale = this.height * view.scale / (r.height - e.top - e.bottom);
  ctx.drawImage(sprite.image,
      r.x, r.y, r.width, r.height,
      this.x * view.scale - view.x -
          e.left * xScale,
      this.y * view.scale - view.y -
          e.top * yScale,
      r.width * xScale,
      r.height * yScale)
};

Entity.prototype.insert = function(item, amount, time, origin) {
  if (this.type == TYPE.chest) {
    const count = this.inputInventory.insert(item, amount, time);
    if (count) {
      for (let oEntity of this.outputEntities) {
        if (oEntity.state == STATE.missingInput) {
          // TODO ,, use time.
        }
      }
    }
    return count;
  }
  return 0;
};

Entity.prototype.extract = function(item, amount, time, origin) {
  return 0;
};

Entity.prototype.outputEntityHasSpace = function() {
  
};

Entity.prototype.connectMineTo = function(other, time) {
  const x = this.x + this.data.mineOutputX,
        y = this.y + this.data.mineOutputY;
  if (other.x > x || other.x + other.width <= x ||
      other.y > y || other.y + other.height <= y) {
    return;
  }
  this.outputEntities.add(other);
  other.inputEntities.add(this);
  if (this.state == STATE.mineNoOutput) {
    this.state == STATE.running;
    this.nextUpdate = time + 666;
  }
};

Entity.prototype.connectInserterTo = function(other) {
    
};

export {Entity};
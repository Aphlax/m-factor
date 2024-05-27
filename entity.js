import {Inventory} from './inventory.js';
import {S, SPRITES} from './sprite-pool.js';
import {ENTITIES} from './entity-definitions.js';
import {TYPE, MAX_SIZE, NEVER, NOW, STATE, MINE_PATTERN, MINE_PRODUCTS, INSERTER_PICKUP_BEND} from './entity-properties.js';
import * as entityLogic from './entity-logic.js';
import * as entityDrawing from './entity-drawing.js';

Object.assign(Entity.prototype, entityLogic);
Object.assign(Entity.prototype, entityDrawing);
function Entity() {
  this.type = 0;
  this.label = undefined;
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.direction = 0;
  this.sprite = 0;
  this.spriteShadow = 0;
  this.animation = 0;
  this.animationLength = 0;
  this.animationSpeed = 0;
  
  this.taskStart = 0;
  this.taskDuration = 0;
  this.nextUpdate = 0; // taskEnd?
  this.state = 0;
  this.data = {};
  // Inventories.
  this.inputInventory = undefined;
  this.outputInventory = undefined;
  // Connected entities.
  this.inputEntities = [];
  this.outputEntities = [];
}

Entity.prototype.setup = function(name, x, y, direction, time) {
  const def = ENTITIES.get(name);
  this.type = def.type;
  this.label = def.label;
  this.x = x;
  this.y = y;
  this.width = def.width;
  this.height = def.height;
  this.direction = direction;
  this.sprite = def.sprites[direction][0];
  this.spriteShadow = def.sprites[direction][1];
  this.animation = 0;
  this.animationLength = def.animationLength;
  this.animationSpeed = def.animationSpeed ?? 1;
  this.inputEntities.length = 0;
  this.outputEntities.length = 0;
  
  if (this.type == TYPE.belt) {
    this.animation = (time * this.animationSpeed / 60) % def.animationLength;
    this.animationSpeed *= def.beltSpeed;
    this.data.beltSpeed = def.beltSpeed;
    this.data.beltSprites = def.beltSprites[direction];
    this.data.beltEndSprites = def.beltEndSprites[direction];
    this.data.beltInput = undefined;
    this.data.beltOutput = undefined;
    this.updateBeltSprites();
  } else if (this.type == TYPE.inserter) {
    this.state = STATE.missingItem;
    this.nextUpdate = time + def.taskDuration;
    this.taskStart = time;
    this.taskDuration = def.taskDuration;
    this.data.inserterHandSprites = def.inserterHandSprites;
    this.data.inserterPosition = 0;
    this.data.inserterItem = 0;
    this.data.inserterPickupBend =
        INSERTER_PICKUP_BEND[(direction + 2) % 4];
  } else if (this.type == TYPE.mine) {
    this.state = STATE.running;
    this.nextUpdate = time + def.taskDuration;
    this.taskStart = time;
    this.taskDuration = def.taskDuration;
    this.data.minePattern = 0;
    this.data.minedResource = 0;
    this.data.mineOutputX = def.mineOutput[direction].x;
    this.data.mineOutputY = def.mineOutput[direction].y;
  } else if (this.type == TYPE.chest) {
    this.inputInventory = this.outputInventory =
        new Inventory(def.capacity);
  }
  return this;
};

Entity.prototype.update = function(gameMap, time) {
  if (this.type == TYPE.inserter) {
    if (this.state == STATE.inserterCoolDown) {
      this.state = STATE.missingItem;
    }
    if (this.state == STATE.missingItem) {
      if (!this.outputEntities.length || !this.inputEntities.length) {
        this.nextUpdate = NEVER;
        return;
      }
      const [inputEntity] = this.inputEntities;
      const [outputEntity] = this.outputEntities;
      
      if (inputEntity.type == TYPE.belt) {
        const wants = outputEntity.insertWants();
        const positionForBelt = this.direction * 3 + 1;
        const waitOrItem = inputEntity.beltExtract(
            wants, this.nextUpdate, positionForBelt);
        if (waitOrItem >= 0) {
          this.nextUpdate += waitOrItem;
          return;
        }
        this.data.inserterItem = -waitOrItem;
        this.state = STATE.running;
        this.taskStart = this.nextUpdate;
        this.nextUpdate = this.taskStart + this.taskDuration;
        return;
      } else if (outputEntity.type == TYPE.belt) {
        const [item] = inputEntity.outputInventory.items;
        if (!inputEntity.extract(item, 1, this.nextUpdate)) {
          this.nextUpdate = NEVER;
          return;
        }
        this.data.inserterItem = item;
        this.state = STATE.running;
        this.taskStart = this.nextUpdate;
        this.nextUpdate = this.taskStart + this.taskDuration;
        return;
      } else {
        const wants = outputEntity.insertWants();
        for (let i = 0; i < inputEntity.outputInventory.items.length; i++) {
          const item = inputEntity.outputInventory.items[i];
          if (!i && item == inputEntity.outputInventory.items[i - 1]) {
            continue;
          }
          if (wants != -1 && !wants.includes(item)) {
            continue;
          }
          if (inputEntity.extract(item, 1, this.nextUpdate)) {
            this.data.inserterItem = item;
            this.state = STATE.running;
            this.taskStart = this.nextUpdate;
            this.nextUpdate = this.taskStart + this.taskDuration;
            return;
          }
        }
        this.nextUpdate = NEVER;
        return;
      }
    } else if (this.state == STATE.running) {
      // We arrived at the target with the hand holding an item.
      if (!this.outputEntities.length) {
        this.state = STATE.noOutput;
        this.nextUpdate = NEVER;
        return;
      }
      const [outputEntity] = this.outputEntities;
      if (outputEntity.type == TYPE.belt) {
        const positionForBelt = this.direction * 3 + 1;
        const wait = outputEntity.beltInsert(
            this.data.inserterItem,
            this.taskStart + this.taskDuration,
            positionForBelt);
        if (wait) {
          this.nextUpdate += wait;
          return;
        }
        this.data.inserterItem = undefined;
        this.state = STATE.inserterCoolDown;
        this.taskStart = this.nextUpdate;
        this.nextUpdate = this.taskStart + this.taskDuration;
        return;
      }
      
      const amount = outputEntity.insert(this.data.inserterItem, 1, this.nextUpdate);
      if (!amount) {
        this.nextUpdate = NEVER;
        return;
      }
      this.data.inserterItem = undefined;
      this.state = STATE.inserterCoolDown;
      this.taskStart = this.nextUpdate;
      this.nextUpdate = this.taskStart + this.taskDuration;
      return;
    }
  } else if (this.type == TYPE.mine) {
    if (this.state == STATE.running) {
      this.animation = Math.floor(this.animation + (time - this.taskStart) * this.animationSpeed / 60) % this.animationLength;
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
        this.nextUpdate = NEVER;
        return;
      }
      
      // Modify resource.
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
      
      this.data.minedResource = resource.id;
      this.state = STATE.itemReady;
    }
    if (this.state == STATE.itemReady) {
      const [outputEntity] = this.outputEntities;
      if (!outputEntity) {
        this.state = STATE.noOutput;
        this.nextUpdate = NEVER;
        return;
      }
      const item = MINE_PRODUCTS[this.data.minedResource];
      if (outputEntity.type == TYPE.belt) {
        const positionForBelt = ((this.direction + 2) % 4) * 3 + 1;
        const wait = outputEntity.beltInsert(item, this.nextUpdate, positionForBelt);
        if (wait) {
          this.nextUpdate += wait;
          return;
        }
        this.state = STATE.running;
        this.taskStart = this.nextUpdate;
        this.nextUpdate = this.taskStart + this.taskDuration;
        return;
      }
      if (!outputEntity.insert(item, 1, this.nextUpdate)) {
        this.nextUpdate = NEVER;
        return;
      }
      this.state = STATE.running;
      this.taskStart = this.nextUpdate;
      this.nextUpdate = this.taskStart + this.taskDuration;
      return;
    }
  }
};

Entity.prototype.insert = function(item, amount, time) {
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
  } else if (this.type == TYPE.belt) {
    throw new Error("Can only insert into belts with beltInsert.");
  }
  return 0;
};

/**
 * Returns the expected wait time in ms until the belt is free to take the item.
 * If 0, the item was put on the belt.
 */
Entity.prototype.beltInsert = function(item, time, positionForBelt) {
  return this.data.lane.insertItem(item, this, time, positionForBelt);
};

/**
 * What does this entiry want to have inserted?
 * Either an array of items or -1 for anything.
 */
Entity.prototype.insertWants = function() {
  if (this.type == TYPE.belt) {
    return -1;
  } else if (this.type == TYPE.chest) {
    return this.inputInventory.insertWants();
  }
  return [];
}

Entity.prototype.extract = function(item, amount, time, origin) {
  return 0;
};

/**
 * items is a filter, -1 for any, otherwise an array of allowed items
 * positionForBelt determines which lane is considered first.
 *
 * returns a negative item id if extracted.
 * returns a positive wait time in ms if no item.
 */
Entity.prototype.beltExtract = function(items, time, positionForBelt) {
  return this.data.lane.extractItem(items, this, time, positionForBelt);
};

Entity.prototype.connectBelt = function(other, time, transportNetwork) {
  const x = this.x - (this.direction - 2) % 2;
  const y = this.y + (this.direction - 1) % 2;
  if (x == other.x && y == other.y) {
    if (other.direction + 2 % 4 == this.direction) {
      return;
    }
    this.outputEntities.push(other);
    other.inputEntities.push(this);
    if (other.beltInputOutput()) {
      transportNetwork.beltInputChanged(other);
    }
    return true;
  }
  const x2 = other.x - (other.direction - 2) % 2;
  const y2 = other.y + (other.direction - 1) % 2;
  if (x2 == this.x && y2 == this.y) {
    this.inputEntities.push(other);
    other.outputEntities.push(this);
    if (this.beltInputOutput()) {
      transportNetwork.beltInputChanged(this);
    }
    return true;
  }
};

/**
 * Computes the belt connection input and output of this belt.
 * Returns true iff the input of this belt changed.
 */
Entity.prototype.beltInputOutput = function() {
  const oldBeltInput = this.data.beltInput;
  let right = undefined, left = undefined;
  for (let i = 0; i < this.inputEntities.length; i++) {
    const other = this.inputEntities[i];
    if (other.type != TYPE.belt) continue;
    if (this.x + (this.direction - 2) % 2 == other.x &&
        this.y - (this.direction - 1) % 2 == other.y) {
      this.data.beltInput = other;
      other.data.beltOutput = this;
      if (right?.data.beltOutput) {
        right.data.beltOutput = undefined;
      }
      if (left?.data.beltOutput) {
        left.data.beltOutput = undefined;
      }
      for (i++; i < this.inputEntities.length; i++) {
        if (this.inputEntities[i].type != TYPE.belt ||
            !this.inputEntities[i].data.beltOutput) continue;
        this.inputEntities[i].data.beltOutput = undefined;
      }
      return oldBeltInput != this.data.beltInput;
    } else if (!right &&
        this.x - (this.direction - 1) % 2 == other.x &&
        this.y - (this.direction - 2) % 2 == other.y) {
      right = other;
    } else if (!left &&
        this.x + (this.direction - 1) % 2 == other.x &&
        this.y + (this.direction - 2) % 2 == other.y) {
      left = other;
    }
  }
  if (right && left) {
    this.data.beltInput = undefined;
    if (right.data.beltOutput) {
      right.data.beltOutput = undefined;
    }
    if (left.data.beltOutput) {
      left.data.beltOutput = undefined;
    }
    return oldBeltInput != this.data.beltInput;
  }
  this.data.beltInput = right || left;
  if (this.data.beltInput) {
    this.data.beltInput.data.beltOutput = this;
  }
  return oldBeltInput != this.data.beltInput;
};

Entity.prototype.updateBeltSprites = function() {
  let right = false, left = false;
  for (let other of this.inputEntities) {
    if (other == this.data.beltInput) continue;
    if (other.type != TYPE.belt) continue;
    if (!right &&
        this.x - (this.direction - 1) % 2 == other.x &&
        this.y - (this.direction - 2) % 2 == other.y) {
      right = true;
    } else if (!left &&
        this.x + (this.direction - 1) % 2 == other.x &&
        this.y + (this.direction - 2) % 2 == other.y) {
      left = true;
    }
  }
  this.data.beltExtraRightSprite = right ? this.data.beltEndSprites[2] : 0;
  this.data.beltExtraLeftSprite = left ? this.data.beltEndSprites[3] : 0;
  if (!this.data.beltInput) {
    this.sprite = this.data.beltSprites[0];
    this.data.beltBeginSprite = this.data.beltEndSprites[0];
  } else {
    const curve = (this.direction - this.data.beltInput.direction + 4) % 4;
    this.sprite = this.data.beltSprites[curve == 3 ? 2 : curve];
    this.data.beltBeginSprite = 0;
  }
  if (!this.data.beltOutput) {
    this.data.beltEndSprite = this.data.beltEndSprites[1];
  } else {
    this.data.beltEndSprite = 0;
  }
};

Entity.prototype.connectInserter = function(other) {
  const dx = -(this.direction - 2) % 2;
  const dy = (this.direction - 1) % 2;
  if (other.x <= this.x + dx &&
      other.x + other.width > this.x + dx &&
      other.y <= this.y + dy &&
      other.y + other.height > this.y + dy) {
    if (other.inputInventory || other.type == TYPE.belt) {
      this.outputEntities.push(other);
      other.inputEntities.push(this);
    }
  } else if (other.x <= this.x - dx &&
      other.x + other.width > this.x - dx &&
      other.y <= this.y - dy &&
      other.y + other.height > this.y - dy) {
    if (other.outputInventory || other.type == TYPE.belt) {
      this.inputEntities.push(other);
      other.outputEntities.push(this);
    }
  }
};

Entity.prototype.connectMine = function(other, time) {
  const x = this.x + this.data.mineOutputX,
        y = this.y + this.data.mineOutputY;
  if (other.x > x || other.x + other.width <= x ||
      other.y > y || other.y + other.height <= y) {
    return;
  }
  this.outputEntities.push(other);
  other.inputEntities.push(this);
  if (this.state == STATE.mineNoOutput) {
    this.state == STATE.running;
    this.nextUpdate = time + this.taskDuration;
  }
};

export {Entity};
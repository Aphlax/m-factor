import {Inventory} from './inventory.js';
import {ENTITIES} from './entity-definitions.js';
import {TYPE, MAX_SIZE, NEVER, STATE, MINE_PATTERN, MINE_PRODUCTS, INSERTER_PICKUP_BEND, LAB_FILTERS, FUEL_FILTERS, ENERGY} from './entity-properties.js';
import {ITEMS} from './item-definitions.js';
import {RECIPES, FURNACE_FILTERS} from './recipe-definitions.js';
import {S, SPRITES} from './sprite-pool.js';
import * as entityLogic from './entity-logic.js';
import * as entityDrawing from './entity-drawing.js';

Object.assign(Entity.prototype, entityLogic);
Object.assign(Entity.prototype, entityDrawing);
function Entity() {
  this.name = 0;
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
  this.spriteShadowAnimation = true;
  
  this.taskStart = 0;
  this.taskDuration = 0; // Move to data.taskDuration.
  this.taskEnd = 0;
  this.nextUpdate = 0;
  this.state = 0;
  this.data = {};
  this.energySource = 0;
  this.energyStored = 0; // kJ.
  this.energyConsumption = 0; // kW.
  // Inventories.
  this.inputInventory = undefined;
  this.outputInventory = undefined;
  this.fuelInventory = undefined;
  // Connected entities.
  this.inputEntities = [];
  this.outputEntities = [];
}

Entity.prototype.setup = function(name, x, y, direction, time) {
  const def = ENTITIES.get(name);
  this.name = name;
  this.type = def.type;
  this.label = def.label;
  this.x = x;
  this.y = y;
  this.width = def.width;
  this.height = def.height;
  this.direction = direction;
  this.energySource = 0;
  this.sprite = def.sprites[direction][0];
  this.spriteShadow = def.sprites[direction][1];
  this.animation = 0;
  this.animationLength = def.animationLength;
  this.animationSpeed = def.animationSpeed ?? 1;
  this.spriteShadowAnimation = !def.noShadowAnimation;
  this.inputEntities.length = 0;
  this.outputEntities.length = 0;
  
  if (this.type == TYPE.belt) {
    this.animationSpeed *= def.beltSpeed;
    this.data.beltSpeed = def.beltSpeed;
    this.data.beltSprites = def.beltSprites[direction];
    this.data.beltEndSprites = def.beltEndSprites[direction];
    this.data.beltInput = undefined;
    this.data.beltOutput = undefined;
    this.data.beltSideLoadMinusWait = 0;
    this.data.beltSideLoadPlusWait = 0;
    this.updateBeltSprites();
  } else if (this.type == TYPE.inserter) {
    this.state = STATE.missingItem;
    this.taskEnd = this.nextUpdate = time;
    this.taskStart = time - def.taskDuration;
    this.taskDuration = def.taskDuration;
    this.data.inserterHandSprites = def.inserterHandSprites;
    this.data.inserterItem = 0;
    this.data.inserterPickupBend =
        INSERTER_PICKUP_BEND[(direction + 2) % 4];
  } else if (this.type == TYPE.mine) {
    this.state = STATE.noEnergy;
    this.taskStart = time;
    this.taskEnd = time;
    this.nextUpdate = this.taskEnd;
    this.taskDuration = def.taskDuration;
    this.data.minePattern = 0;
    this.data.minedResource = 0;
    this.data.mineOutputX = def.mineOutput[direction].x;
    this.data.mineOutputY = def.mineOutput[direction].y;
    this.energySource = def.energySource;
    this.energyConsumption = def.energyConsumption;
  } else if (this.type == TYPE.furnace) {
    this.state = STATE.missingItem;
    this.nextUpdate = NEVER;
    this.taskStart = -1;
    this.taskDuration = 0;
    this.taskEnd = 0;
    this.sprite = def.idleAnimation;
    this.data.processingSpeed = def.processingSpeed;
    this.data.recipe = undefined;
    this.data.idleAnimation = def.idleAnimation;
    this.data.workingAnimation = def.sprites[direction][0];
    this.inputInventory = new Inventory(1)
        .setFilters(FURNACE_FILTERS);
    this.outputInventory = new Inventory(1);
    this.energySource = def.energySource;
    this.energyConsumption = def.energyConsumption;
    if (def.energySource == ENERGY.burner) {
      this.fuelInventory = new Inventory(1)
          .setFilters(FUEL_FILTERS);
    }
  } else if (this.type == TYPE.assembler) {
    this.state = STATE.noRecipe;
    this.nextUpdate = NEVER;
    this.data.processingSpeed = def.processingSpeed;
    this.data.recipe = undefined;
    this.inputInventory = new Inventory(0);
    this.outputInventory = new Inventory(0);
  } else if (this.type == TYPE.chest) {
    this.inputInventory = this.outputInventory =
        new Inventory(def.capacity);
  } else if (this.type == TYPE.lab) {
    this.state = STATE.missingItem;
    this.nextUpdate = NEVER;
    this.inputInventory = this.outputInventory =
        new Inventory(1).setFilters(LAB_FILTERS);
  }
  return this;
};

Entity.prototype.update = function(gameMap, time) {
  if (this.type == TYPE.inserter) {
    if (this.state == STATE.inserterCoolDown ||
        this.state == STATE.missingItem ||
        this.state == STATE.noOutput ||
        this.state == STATE.outputFull) {
      if (!this.outputEntities.length || !this.inputEntities.length) {
        this.state = !this.outputEntities.length ?
            STATE.noOutput : STATE.missingItem;
        this.nextUpdate = NEVER;
        return;
      }
      const [inputEntity] = this.inputEntities;
      const [outputEntity] = this.outputEntities;
      
      if (inputEntity.type == TYPE.belt) {
        const wants = outputEntity.insertWants();
        if (wants != -1 && !wants.length) {
          this.state = STATE.outputFull;
          this.nextUpdate = NEVER;
          return;
        }
        const positionForBelt = this.direction * 3 + 1;
        const waitOrItem = inputEntity.beltExtract(
            wants, this.nextUpdate, positionForBelt);
        if (waitOrItem >= 0) {
          this.state = STATE.missingItem;
          this.nextUpdate += waitOrItem;
          return;
        }
        this.data.inserterItem = -waitOrItem;
        this.state = STATE.running;
        this.taskStart = this.nextUpdate;
        this.taskEnd = this.nextUpdate =
            this.taskStart + this.taskDuration;
        return;
      } else if (outputEntity.type == TYPE.belt) {
        const [item] = inputEntity.outputInventory.items;
        if (!inputEntity.extract(item, 1, this.nextUpdate)) {
          this.state = STATE.missingItem;
          this.nextUpdate = NEVER;
          return;
        }
        this.data.inserterItem = item;
        this.state = STATE.running;
        this.taskStart = this.nextUpdate;
        this.taskEnd = this.nextUpdate =
            this.taskStart + this.taskDuration;
        return;
      } else {
        const wants = outputEntity.insertWants();
        if (wants != -1 && !wants.length) {
          this.state = STATE.outputFull;
          this.nextUpdate = NEVER;
          return;
        }
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
            this.taskEnd = this.nextUpdate =
                this.taskStart + this.taskDuration;
            return;
          }
        }
        this.state = STATE.missingItem;
        this.nextUpdate = NEVER;
        return;
      }
    } else if (this.state == STATE.running ||
        this.state == STATE.itemReady) {
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
        this.taskEnd = this.nextUpdate =
            this.taskStart + this.taskDuration;
        return;
      }
      
      const amount = outputEntity.insert(this.data.inserterItem, 1, this.nextUpdate);
      if (!amount) {
        this.state = STATE.itemReady;
        this.nextUpdate = NEVER;
        return;
      }
      this.data.inserterItem = undefined;
      this.state = STATE.inserterCoolDown;
      this.taskStart = this.nextUpdate;
      this.taskEnd = this.nextUpdate =
          this.taskStart + this.taskDuration;
      return;
    }
  } else if (this.type == TYPE.mine) {
    if (this.state == STATE.running) {
      this.animation = Math.floor(this.animation +
          (time - this.taskStart) * this.animationSpeed / 60) %
          this.animationLength;
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
    let continueNextItem = false;
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
      } else if (!outputEntity.insert(item, 1, this.nextUpdate)) {
        this.nextUpdate = NEVER;
        return;
      }
      continueNextItem = true;
    }
    if (continueNextItem ||
        this.state == STATE.noEnergy) {
      if (this.energyStored < 1) {
        this.state = STATE.noEnergy;
        this.nextUpdate = NEVER;
        return;
      }
      this.energyStored--;
      this.state = STATE.running;
      this.taskStart = this.nextUpdate;
      this.taskEnd = this.nextUpdate =
          this.taskStart + this.taskDuration;
      return;
    }
  } else if (this.type == TYPE.furnace) {
    if (this.state == STATE.outOfEnergy) {
      const item = this.fuelInventory.items[0];
      if (item && this.fuelInventory.extract(item, 1, true)) {
        this.state = STATE.running;
        const p = (this.nextUpdate - this.taskStart) /
            (this.taskEnd - this.taskStart);
        this.taskStart = this.nextUpdate - p * this.data.recipe.duration;
        this.taskEnd = this.nextUpdate + (1 - p) * this.data.recipe.duration;
        this.energyStored = ITEMS.get(item).fuelValue +
            (this.nextUpdate - this.taskStart) / 1000 *
            this.energyConsumption;
        this.sprite = this.data.workingAnimation;
        gameMap.createSmoke(this.x + 1, this.y, this.nextUpdate,
            this.taskEnd - this.nextUpdate);
        for (let inputEntity of this.inputEntities) {
          if (inputEntity.state == STATE.outputFull ||
              inputEntity.state == STATE.itemReady) {
            inputEntity.nextUpdate = this.nextUpdate;
          }
        }
        this.nextUpdate = this.taskEnd;
        return;
      }
      this.nextUpdate = NEVER;
      return;
    }
    let taskFinished = false, continueNextItem = false;
    if (this.state == STATE.running) {
      if (this.energySource == ENERGY.burner) {
        if (this.nextUpdate >= this.taskEnd) {
          this.energyStored -=
              (this.nextUpdate - this.taskStart) /
              1000 * this.energyConsumption;
          taskFinished = true;
        } else {
          const item = this.fuelInventory.items[0];
          if (item && this.fuelInventory.extract(item, 1, true)) {
            this.energyStored = ITEMS.get(item).fuelValue +
                (this.nextUpdate - this.taskStart) / 1000 *
                this.energyConsumption;
            for (let inputEntity of this.inputEntities) {
              if (inputEntity.state == STATE.outputFull ||
                  inputEntity.state == STATE.itemReady) {
                inputEntity.nextUpdate = this.nextUpdate;
              }
            }
            this.nextUpdate = this.taskEnd;
            return;
          } else {
            this.energyStored = 0;
            this.state = STATE.outOfEnergy;
            const p = (this.nextUpdate - this.taskStart) /
                (this.taskEnd - this.taskStart);
            this.taskStart = this.nextUpdate - p * NEVER;
            this.taskEnd = this.nextUpdate + (1 - p) * NEVER;
            this.nextUpdate = NEVER;
            this.sprite = this.data.idleAnimation;
            this.animation = 0;
            return;
          }
        }
      } else {
        taskFinished = true;
      }
    }
    if (taskFinished ||
        this.state == STATE.itemReady) {
      const output = this.data.recipe.outputs[0];
      const amount = this.outputInventory.insert(output.item, output.amount);
      if (!amount) {
        this.state = STATE.itemReady;
        this.nextUpdate = NEVER;
        this.sprite = this.data.idleAnimation;
        this.animation = 0;
        return;
      }
      for (let outputEntity of this.outputEntities) {
        if (outputEntity.state == STATE.missingItem) {
          outputEntity.nextUpdate = this.nextUpdate;
        }
      }
      continueNextItem = true;
    }
    if (continueNextItem ||
        this.state == STATE.missingItem ||
        this.state == STATE.noEnergy) {
      if (this.energySource == ENERGY.burner &&
          this.energyStored <= 0) {
        const item = this.fuelInventory.items[0];
        if (item && this.fuelInventory.extract(item, 1, true)) {
          this.energyStored = ITEMS.get(item).fuelValue;
        } else {
          this.state = STATE.noEnergy;
          this.nextUpdate = NEVER;
          return;
        }
      }
      const item = this.inputInventory.items[0];
      if (!this.data.recipe ||
          this.data.recipe.inputs[0].item != item) {
        this.data.recipe = RECIPES.filter(r =>
             r.entities.includes(this.name) &&
             r.inputs[0].item == item)[0];
      }
      if (!this.data.recipe) {
        this.state = STATE.missingItem;
        this.nextUpdate = NEVER;
        this.sprite = this.data.idleAnimation;
        this.animation = 0;
        return;
      }
      const amount = this.inputInventory.extract(
          item, this.data.recipe.inputs[0].amount,
          true /* onlyFullAmount */);
      if (!amount) {
        this.state = STATE.missingItem;
        this.nextUpdate = NEVER;
        this.sprite = this.data.idleAnimation;
        this.animation = 0;
        return;
      }
      for (let inputEntity of this.inputEntities) {
        if (inputEntity.state == STATE.outputFull ||
            inputEntity.state == STATE.itemReady) {
          inputEntity.nextUpdate = this.nextUpdate;
        }
      }
      if (continueNextItem && this.state == STATE.running) {
        this.animation = Math.floor(this.animation +
          (time - this.taskStart) * this.animationSpeed / 60) %
          this.animationLength;
      }
      this.state = STATE.running;
      this.taskStart = this.nextUpdate;
      this.taskEnd = this.nextUpdate = this.taskStart +
          this.data.processingSpeed * this.data.recipe.duration;
      this.sprite = this.data.workingAnimation;
      gameMap.createSmoke(this.x + 1, this.y, this.taskStart,
          this.nextUpdate - this.taskStart);
      if (this.energySource == ENERGY.burner &&
          this.nextUpdate > this.taskStart +
          this.energyStored / this.energyConsumption * 1000) {
        this.nextUpdate = this.taskStart +
            this.energyStored / this.energyConsumption * 1000;
      }
      return;
    }
  } else if (this.type == TYPE.assembler) {
    let continueNextItem = false;
    if (this.state == STATE.running || this.state == STATE.itemReady) {
      if (this.state == STATE.running) {
        this.animation = Math.floor(this.animation +
          (time - this.taskStart) * this.animationSpeed / 60) %
          this.animationLength;
      }
      if (!this.outputInventory.insertFilters()) {
        this.state = STATE.itemReady;
        this.nextUpdate = NEVER;
        return;
      }
      for (let outputEntity of this.outputEntities) {
        if (outputEntity.state == STATE.missingItem) {
          outputEntity.nextUpdate = this.nextUpdate;
        }
      }
      continueNextItem = true;
    }
    if (continueNextItem || this.state == STATE.missingItem) {
      if (!this.inputInventory.extractFilters()) {
        this.state = STATE.missingItem;
        this.nextUpdate = NEVER;
        return;
      }
      for (let inputEntity of this.inputEntities) {
        if (inputEntity.state == STATE.outputFull ||
            inputEntity.state == STATE.itemReady) {
          inputEntity.nextUpdate = this.nextUpdate;
        }
      }
      this.state = STATE.running;
      this.taskStart = this.nextUpdate;
      this.taskEnd = this.nextUpdate = this.taskStart +
          this.data.processingSpeed * this.data.recipe.duration;
      return;
    }
  } else if (this.type == TYPE.lab) {
    if (this.state == STATE.running ||
        this.state == STATE.missingItem) {
      if (this.state == STATE.running) {
        this.animation = Math.floor(this.animation +
            (time - this.taskStart) * this.animationSpeed / 60) %
            this.animationLength;
      }
      if (!this.inputInventory.extractFilters()) {
        this.state = STATE.missingItem;
        this.nextUpdate = NEVER;
        this.animation = 0;
        return;
      }
      for (let inputEntity of this.inputEntities) {
        if (inputEntity.state == STATE.outputFull ||
            inputEntity.state == STATE.itemReady) {
          inputEntity.nextUpdate = this.nextUpdate;
        }
      }
      this.state = STATE.running;
      this.taskStart = this.nextUpdate;
      this.taskEnd = this.nextUpdate =
          this.taskStart + 9800;
    }
  }
};

Entity.prototype.insert = function(item, amount, time) {
  if (this.fuelInventory) {
    for (let filter of FUEL_FILTERS) {
      if (item == filter.item) {
        const count = this.fuelInventory.insert(item, amount);
        if (count && (this.state == STATE.outOfEnergy ||
            this.state == STATE.noEnergy)) {
          this.nextUpdate = time;
        }
        return count;
      }
    }
  }
  if (this.inputInventory) {
    const count = this.inputInventory.insert(item, amount);
    if (count) {
      if (this.type == TYPE.chest ||
          this.type == TYPE.lab) {
        for (let outputEntity of this.outputEntities) {
          if (outputEntity.state == STATE.missingItem) {
            outputEntity.nextUpdate = time;
          }
        }
      }
      if (this.state == STATE.missingItem) {
        this.nextUpdate = time;
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
  const wait = this.data.lane.insertItem(item, this, time, positionForBelt);
  if (!wait) {
    for (let outputEntity of this.outputEntities) {
      if (outputEntity.state == STATE.missingItem) {
        outputEntity.nextUpdate = time;
      }
    }
  }
  return wait;
};

/**
 * What does this entiry want to have inserted?
 * Either an array of items or -1 for anything.
 */
Entity.prototype.insertWants = function() {
  if (this.type == TYPE.belt) {
    return -1;
  } else if (this.type == TYPE.assembler) {
    const wants = this.outputInventory.insertWants();
    if (wants != -1 && !wants.length) {
      return wants;
    }
    return this.inputInventory.insertWants();
  } else if (this.energySource == ENERGY.burner) {
    if (!this.inputInventory) {
      return this.fuelInventory.insertWants();
    }
    const wants = this.inputInventory.insertWants();
    const fuel = this.fuelInventory.insertWants();
    if (wants == -1 || fuel == -1 ) return -1;
    return !fuel.length ? wants : !wants.length ? fuel :
        [...wants, ...fuel];
  } else if (this.inputInventory) {
    return this.inputInventory.insertWants();
  }
  return [];
}

Entity.prototype.extract = function(item, amount, time) {
  if (this.outputInventory) {
    const count = this.outputInventory.extract(item, amount);
    if (count) {
      if (this.type == TYPE.chest ||
          this.type == TYPE.assembler ||
          this.type == TYPE.lab) {
        for (let inputEntity of this.inputEntities) {
          if (inputEntity.state == STATE.outputFull ||
              inputEntity.state == STATE.itemReady) {
            inputEntity.nextUpdate = time;
          }
        }
      }
      if (this.state == STATE.outputFull ||
          this.state == STATE.itemReady) {
        this.nextUpdate = time;
      }
    }
    return count;
  }
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
  const wait = this.data.lane.extractItem(items, this, time, positionForBelt);
  if (wait > 0) {
    for (let inputEntity of this.inputEntities) {
      if (inputEntity.state == STATE.itemReady) {
        inputEntity.nextUpdate = time;
      }
    }
  }
  return wait;
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

Entity.prototype.connectInserter = function(other, time) {
  const dx = -(this.direction - 2) % 2;
  const dy = (this.direction - 1) % 2;
  if (other.x <= this.x + dx &&
      other.x + other.width > this.x + dx &&
      other.y <= this.y + dy &&
      other.y + other.height > this.y + dy) {
    if (other.inputInventory || other.type == TYPE.belt) {
      this.outputEntities.push(other);
      other.inputEntities.push(this);
      if (this.state == STATE.noOutput ||
          this.state == STATE.outputFull ||
          this.state == STATE.itemReady) {
        this.nextUpdate = time;
      }
    }
  } else if (other.x <= this.x - dx &&
      other.x + other.width > this.x - dx &&
      other.y <= this.y - dy &&
      other.y + other.height > this.y - dy) {
    if (other.outputInventory || other.type == TYPE.belt) {
      this.inputEntities.push(other);
      other.outputEntities.push(this);
      if (this.state == STATE.missingItem) {
        this.nextUpdate = time;
      }
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
  if (this.state == STATE.noOutput ||
      this.state == STATE.outputFull ||
      this.state == STATE.itemReady) {
    this.state = STATE.itemReady;
    this.nextUpdate = time;
  }
};

Entity.prototype.setRecipe = function(recipe, time) {
  if (this.type != TYPE.assembler ||
      this.data.recipe == recipe) return;
  
  this.inputInventory.items.length = 0;
  this.inputInventory.amounts.length = 0;
  this.outputInventory.items.length = 0;
  this.outputInventory.amounts.length = 0;
  if (!recipe) {
    this.inputInventory.capacity = 0;
    this.inputInventory.setFilters();
    this.outputInventory.capacity = 0;
    this.outputInventory.setFilters();
  } else {
    this.inputInventory.capacity = recipe.inputs.length;
    this.inputInventory.setFilters(recipe.inputs);
    this.outputInventory.capacity = recipe.outputs.length;
    this.outputInventory.setFilters(recipe.outputs);
  }
  
  this.data.recipe = recipe;
  this.state = recipe ? STATE.missingItem : STATE.noRecipe;
  this.nextUpdate = NEVER;
  if (recipe) {
    for (let inputEntity of this.inputEntities) {
      if (inputEntity.state == STATE.outputFull ||
          inputEntity.state == STATE.itemReady) {
        inputEntity.nextUpdate = time;
      }
    }
  }
};

export {Entity};

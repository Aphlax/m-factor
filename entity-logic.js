import {TYPE, NEVER, STATE, ENERGY, FUEL_FILTERS} from './entity-properties.js';
import {ITEMS} from './item-definitions.js';


export function insert(item, amount, time) {
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
 * What does this entiry want to have inserted?
 * Either an array of items or -1 for anything.
 */
export function insertWants() {
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

export function extract(item, amount, time) {
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
 * Returns the expected wait time in ms until the belt is free to take the item.
 * If 0, the item was put on the belt.
 */
export function beltInsert(item, time, positionForBelt) {
  const wait = this.data.lane.insertItem(item, this, time, positionForBelt);
  if (!wait) {
    for (let outputEntity of this.outputEntities) {
      if (outputEntity.state == STATE.missingItem) {
        outputEntity.nextUpdate = time;
      }
    }
  }
  return wait;
}

/**
 * items is a filter, -1 for any, otherwise an array of allowed items
 * positionForBelt determines which lane is considered first.
 *
 * returns a negative item id if extracted.
 * returns a positive wait time in ms if no item.
 */
export function beltExtract(items, time, positionForBelt) {
  const wait = this.data.lane.extractItem(items, this, time, positionForBelt);
  if (wait > 0) {
    for (let inputEntity of this.inputEntities) {
      if (inputEntity.state == STATE.itemReady) {
        inputEntity.nextUpdate = time;
      }
    }
  }
  return wait;
}

export function connectBelt(other, time, transportNetwork) {
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
}

/**
 * Computes the belt connection input and output of this belt.
 * Returns true iff the input of this belt changed.
 */
export function beltInputOutput() {
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
}

export function updateBeltSprites() {
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
}

export function connectInserter(other, time) {
  const dx = -(this.direction - 2) % 2;
  const dy = (this.direction - 1) % 2;
  if (other.x <= this.x + dx &&
      other.x + other.width > this.x + dx &&
      other.y <= this.y + dy &&
      other.y + other.height > this.y + dy) {
    if (other.inputInventory || other.fuelInventory ||
        other.type == TYPE.belt) {
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
}

export function connectMine(other, time) {
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
}

export function setRecipe(recipe, time) {
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
}

export function connectPipe(other) {
  for (let i = 0; i < this.data.pipeConnections.length; i++) {
    const p1 = this.data.pipeConnections[i];
    if (this.x + p1.x < other.x ||
        this.x + p1.x >= other.x + other.width ||
        this.y + p1.y < other.y ||
        this.y + p1.y >= other.y + other.height) continue;
    for (let j = 0; j < other.data.pipeConnections.length; j++) {
      const p2 = other.data.pipeConnections[j];
      if (other.x + p2.x < this.x ||
          other.x + p2.x >= this.x + this.width ||
          other.y + p2.y < this.y ||
          other.y + p2.y >= this.y + this.height ||
          (other.x + p2.x != this.x + p1.x &&
          other.y + p2.y != this.y + p1.y)) continue;
      this.data.pipes[i] = other;
      other.data.pipes[j] = this;
      return true;
    }
  }
}

export function disconnectPipe() {
  for (let i = 0; i < this.data.pipeConnections.length; i++) {
    const other = this.data.pipes[i];
    if (!other) continue;
    this.data.pipes[i] = undefined;
    if (other.data.pipeConnections) {
      for (let j = 0; j < other.data.pipeConnections.length; j++) {
        if (other.data.pipes[j] != this) continue;
        other.data.pipes[j] = undefined;
        other.updatePipeSprites();
      }
    }
  }
}

export function updatePipeSprites() {
  if (this.type != TYPE.pipe) return;
  let count = 0, direction, notdirection;
  for (let i = 0; i < 4; i++) {
    if (this.data.pipes[i]) {
      count++;
      direction = i;
    } else {
      notdirection = i;
    }
  }
  if (!count) {
    this.sprite = this.data.pipeSprites[0];
  } else if (count == 1) {
    this.sprite = this.data.pipeSprites[direction + 1];
  } else if (count == 2) {
    if (this.data.pipes[0] && this.data.pipes[2]) {
      this.sprite = this.data.pipeSprites[5];
    } else if (this.data.pipes[1] && this.data.pipes[3]) {
      this.sprite = this.data.pipeSprites[6];
    } else if (this.data.pipes[0] && this.data.pipes[3]) {
      this.sprite = this.data.pipeSprites[7];
    } else {
      this.sprite = this.data.pipeSprites[direction + 7];
    }
  } else if (count == 3) {
    this.sprite = this.data
        .pipeSprites[((notdirection + 2) % 4) + 11];
  } else {
    this.sprite = this.data.pipeSprites[15];
  }
}

/** Returns true if this is an invalid connection and it should be removed. */
export function connectFluidOutput(pipe) {
  for (let i = 0; i < this.outputFluidTank.pipeConnections.length; i++) {
    const p1 = this.outputFluidTank.pipeConnections[i];
    if (this.x + p1.x < pipe.x ||
        this.x + p1.x >= pipe.x + pipe.width ||
        this.y + p1.y < pipe.y ||
        this.y + p1.y >= pipe.y + pipe.height) continue;
    for (let j = 0; j < pipe.data.pipeConnections.length; j++) {
      const p2 = pipe.data.pipeConnections[j];
      if (pipe.x + p2.x < this.x ||
          pipe.x + p2.x >= this.x + this.width ||
          pipe.y + p2.y < this.y ||
          pipe.y + p2.y >= this.y + this.height ||
          (this.x + p1.x != pipe.x + p2.x &&
          this.y + p1.y != pipe.y + p2.y)) continue;
      pipe.inputEntities.push(this);
      this.outputEntities.push(pipe);
      pipe.data.pipes[j] = this;
      pipe.updatePipeSprites();
      if (pipe.data.channel) {
        // After a pipe is created, we first add
        // input/output before it gets its channel.
        return pipe.data.channel.addInputEntity(this, i);
      }
    }
    
  }
}

/** Returns true if this is an invalid connection and it should be removed. */
export function connectFluidInput(pipe) {
  if (this.inputFluidTank.internalInlet) return;
  for (let i = 0; i < this.inputFluidTank.pipeConnections.length; i++) {
    const p1 = this.inputFluidTank.pipeConnections[i];
    if (this.x + p1.x < pipe.x ||
        this.x + p1.x >= pipe.x + pipe.width ||
        this.y + p1.y < pipe.y ||
        this.y + p1.y >= pipe.y + pipe.height) continue;
    for (let j = 0; j < pipe.data.pipeConnections.length; j++) {
      const p2 = pipe.data.pipeConnections[j];
      if (pipe.x + p2.x < this.x ||
          pipe.x + p2.x >= this.x + this.width ||
          pipe.y + p2.y < this.y ||
          pipe.y + p2.y >= this.y + this.height ||
          (this.x + p1.x != pipe.x + p2.x &&
          this.y + p1.y != pipe.y + p2.y)) continue;
      pipe.outputEntities.push(this);
      this.inputEntities.push(pipe);
      pipe.data.pipes[j] = this;
      pipe.updatePipeSprites();
      if (pipe.data.channel) {
        // After a pipe is created, we first add
        // input/output before it gets its channel.
        return pipe.data.channel.addOutputEntity(this, i);
      }
    }
    
  }
}

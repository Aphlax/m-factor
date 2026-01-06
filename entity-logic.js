import {TYPE, NEVER, STATE, ENERGY, FUEL_FILTERS, MINE_PATTERN} from './entity-properties.js';


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
  }
  return 0;
};

/**
 * Returns the itemId of an allowed item,
 * otherwise returns -1 if the ouputEntity
 * is full or 0 if none of the items can be
 * inserted.
 */
export function inserterAllowsItems(a, b, c) {
  const filters = this.data.itemFilters;
  if (filters) {
    if (c && filters.includes(c) == !this.data.filterMode) {
      c = 0;
    }
    if (b && filters.includes(b) == !this.data.filterMode) {
      b = c; c = 0;
    }
    if (filters.includes(a) == !this.data.filterMode) {
      a = b; b = c; c = 0;
    }
  }
  if (!a) return 0;
  const [outputEntity] = this.outputEntities;
  if (outputEntity.type == TYPE.belt ||
      outputEntity.type == TYPE.undergroundBelt ||
      outputEntity.type == TYPE.splitter) {
    return a;
  } else if (outputEntity.type == TYPE.assembler) {
    const out = outputEntity.outputInventory;
    if (!out.filters) return 0;
    let full = true;
    for (let i = 0; i < out.filters.length; i++) {
      if (!out.items[i] ||
          out.amounts[i] < out.filters[i].amount * 2) {
        full = false;
      }
    }
    if (full) return -1;
    return outputEntity.inputInventory.allowsItems(a, b, c);
  } else if (outputEntity.inputInventory &&
      outputEntity.energySource == ENERGY.burner) {
    const input = outputEntity.inputInventory.allowsItems(a, b, c);
    if (input > 0) return input;
    const fuel = outputEntity.fuelInventory.allowsItems(a, b, c);
    if (fuel > 0) return fuel;
    return input && fuel ? -1 : 0;
  } else if (outputEntity.energySource == ENERGY.burner) {
    return outputEntity.fuelInventory.allowsItems(a, b, c);
  } else if (outputEntity.inputInventory) {
    return outputEntity.inputInventory.allowsItems(a, b, c);
  }
  return 0;
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
export function beltInsert(item, time, origin, positionForBelt) {
  let lane;
  if (this.type != TYPE.splitter) {
    lane = this.data.lane;
  } else if (this.direction&0x1 ? (origin.y <= this.y) == (this.direction == 1) : (origin.x <= this.x) == (this.direction == 0)) {
    lane = this.data.leftInLane;
  } else {
    lane = this.data.rightInLane;
  }
  const wait = lane.insertItem(item, this, time, positionForBelt);
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
export function beltExtract(inserter, time, positionForBelt) {
  let lane;
  if (this.type != TYPE.splitter) {
    lane = this.data.lane;
  } else if (this.direction&0x1 ? (inserter.y <= this.y) == (this.direction == 1) : (inserter.x <= this.x) == (this.direction == 0)) {
    lane = this.data.leftOutLane;
  } else {
    lane = this.data.rightOutLane;
  }
  const waitOrItem = lane.extractItem(inserter, this, time, positionForBelt);
  if (waitOrItem < 0) {
    for (let inputEntity of this.inputEntities) {
      if (inputEntity.state == STATE.itemReady) {
        inputEntity.nextUpdate = time;
      }
    }
  }
  return waitOrItem;
}

export function connectBelt(other, transportNetwork) {
  if ((other.direction + 2) % 4 == this.direction) {
    return;
  }
  
  // Front of this
  let dx = 0, dy = 0;
  if (this.direction&0x1) dx = 2 - this.direction;
  else dy = this.direction - 1;
  
  const x = this.x + dx, y = this.y + dy;
  if (x < other.x + other.width &&
      x + this.width > other.x &&
      y < other.y + other.height &&
      y + this.height > other.y &&
      !(this.type == TYPE.undergroundBelt &&
      !this.data.undergroundUp)) {
    if (other.type == TYPE.undergroundBelt &&
        other.direction == this.direction &&
        other.data.undergroundUp)
      return;
    if (other.type == TYPE.splitter &&
        this.direction != other.direction)
      return;
    this.outputEntities.push(other);
    other.inputEntities.push(this);
    transportNetwork.computeBeltConnections(other);
    return true;
  }
  
  // Front of other
  let dx2 = 0, dy2 = 0;
  if (other.direction&0x1) dx2 = 2 - other.direction;
  else dy2 = other.direction - 1;
  
  const x2 = other.x + dx2, y2 = other.y + dy2;
  if (x2 < this.x + this.width &&
      x2 + other.width > this.x &&
      y2 < this.y + this.height &&
      y2 + other.height > this.y &&
      !(other.type == TYPE.undergroundBelt &&
      !other.data.undergroundUp)) {
    if (this.type == TYPE.undergroundBelt &&
        this.direction == other.direction &&
        this.data.undergroundUp)
      return;
    if (this.type == TYPE.splitter &&
        this.direction != other.direction)
      return;
    this.inputEntities.push(other);
    other.outputEntities.push(this);
    transportNetwork.computeBeltConnections(this);
    return true;
  }
}

export function connectUndergroundBelt(other, transportNetwork) {
  if (this.data.undergroundUp == other.data.undergroundUp ||
      this.direction != other.direction ||
      this.name != other.name)
    return;
  const input = this.data.undergroundUp ? other : this,
      output = this.data.undergroundUp ? this : other;
  const dx = output.x - input.x,
      dy = output.y - input.y;
  if (this.direction % 2 == 0 ?
      !(dx == 0 && dy * ((this.direction - 1) % 2) >= 0 &&
      dy * ((this.direction - 1) % 2) <= this.data.maxUndergroundGap + 1) :
      !(dy == 0 && dx * -((this.direction - 2) % 2) >= 0 &&
      dx * -((this.direction - 2) % 2) <= this.data.maxUndergroundGap + 1))
    return;
  input.outputEntities.push(output);
  output.inputEntities.push(input);
  transportNetwork.computeBeltConnections(output);
}

export function updateBeltSprites() {
  if (this.type == TYPE.splitter) {
    this.data.beltBeginSprite =
        (this.direction < 2 ? this.data.leftBeltInput : this.data.rightBeltInput) ? 0 :
        this.data.beltEndSprites[0];
    this.data.otherBeltBeginSprite =
        (this.direction >= 2 ? this.data.leftBeltInput : this.data.rightBeltInput) ? 0 :
        this.data.beltEndSprites[0];
    this.data.beltEndSprite =
        (this.direction < 2 ? this.data.leftBeltOutput : this.data.rightBeltOutput) ? 0 :
        this.data.beltEndSprites[1];
    this.data.otherBeltEndSprite =
        (this.direction >= 2 ? this.data.leftBeltOutput : this.data.rightBeltOutput) ? 0 :
        this.data.beltEndSprites[1];
    return;
  }
  let right = false, left = false;
  for (let other of this.inputEntities) {
    if (other == this.data.beltInput) continue;
    if (other.type != TYPE.belt &&
        other.type != TYPE.undergroundBelt &&
        other.type != TYPE.splitter) continue;
    if (!right &&
        (this.direction - other.direction + 4) % 4 == 1) {
      right = true;
    } else if (!left &&
        (this.direction - other.direction + 4) % 4 == 3) {
      left = true;
    }
  }
  this.data.beltExtraRightSprite = right ? this.data.beltEndSprites[2] : 0;
  this.data.beltExtraLeftSprite = left ? this.data.beltEndSprites[3] : 0;
  if (this.type == TYPE.belt) {
    if (!this.data.beltInput) {
      this.data.beltSprite = this.data.beltSprites[0];
    } else {
      const curve = (this.direction - this.data.beltInput.direction + 4) % 4;
      this.data.beltSprite = this.data.beltSprites[curve == 3 ? 2 : curve];
    }
  } else {
    this.data.beltSprite = !this.data.undergroundUp ?
        this.data.beltSprites[0] :
        this.data.beltSprites[1];
  }
  if (!this.data.beltInput) {
    this.data.beltBeginSprite =
      this.type == TYPE.undergroundBelt && this.data.undergroundUp ?
      0 : this.data.beltEndSprites[0];
  } else {
    this.data.beltBeginSprite = 0;
  }
  if (!this.data.beltOutput &&
      !(this.type == TYPE.undergroundBelt && !this.data.undergroundUp)) {
    this.data.beltEndSprite = this.data.beltEndSprites[1];
  } else {
    this.data.beltEndSprite = 0;
  }
  if (this.type == TYPE.undergroundBelt) {
    const sideLoaded = left || right ? 2 : 0;
    this.sprite = this.data.undergroundUp ?
        this.data.beltSprites[3 + sideLoaded] :
        this.data.beltSprites[2 + sideLoaded];
  }
}

export function connectInserter(other, time) {
  const dx = (-(this.direction - 2) % 2) *
      this.data.inserterReach;
  const dy = ((this.direction - 1) % 2) *
      this.data.inserterReach;
  if (other.x <= this.x + dx &&
      other.x + other.width > this.x + dx &&
      other.y <= this.y + dy &&
      other.y + other.height > this.y + dy) {
    if (other.inputInventory || other.fuelInventory ||
        other.type == TYPE.belt ||
        other.type == TYPE.undergroundBelt ||
        other.type == TYPE.splitter) {
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
    if (other.outputInventory ||
        other.type == TYPE.belt ||
        other.type == TYPE.undergroundBelt ||
        other.type == TYPE.splitter) {
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

export function connectResources(gameMap) {
  this.data.mineResources.push(
      ...MINE_PATTERN[this.data.drillArea].map(({x, y}) =>
      gameMap.getResourceAt(this.x + x, this.y + y)));
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
  this.taskDuration = recipe.duration / this.data.processingSpeed;
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

export function connectPipeToGround(other, fluidNetwork) {
  if ((this.direction - other.direction + 4) % 4 != 2 ||
      this.name != other.name)
    return;
  const dx = this.x - other.x,
      dy = this.y - other.y;
  if (this.direction % 2 == 0 ?
      !(dx == 0 && dy * ((this.direction - 1) % 2) >= 0 &&
      dy * ((this.direction - 1) % 2) <= this.data.maxUndergroundGap + 1) :
      !(dy == 0 && dx * -((this.direction - 2) % 2) >= 0 &&
      dx * -((this.direction - 2) % 2) <= this.data.maxUndergroundGap + 1))
    return;
  this.data.undergroundPipes.push(other);
  other.data.undergroundPipes.push(this);
  
  // Set data.pipes connection.
  const cc = this.data.pipes[1],
      oc = other.data.pipes[1],
      dist = Math.abs(this.x - other.x + this.y - other.y);
  if (cc &&
      Math.abs(cc.x - this.x + cc.y - this.y) < dist) {
    return;
  }
  if (oc &&
      Math.abs(oc.x - other.x + oc.y - other.y) < dist) {
    if (cc) {
      cc.data.pipes[1] = undefined;
      this.data.pipes[1] = undefined;
    }
    return;
  }
  if (cc) {
    cc.data.pipes[1] = undefined;
  }
  if (oc) {
    other.data.pipes[1] = undefined;
    oc.data.pipes[1] = undefined;
    const segment =
        other.data.channel.split(other, undefined, oc);
    if (segment)
      fluidNetwork.channels.push(segment);
  }
  for (let p of this.data.undergroundPipes) {
    if (Math.abs(p.x - this.x + p.y - this.y) < dist)
      return;
  }
  this.data.pipes[1] = other;
  other.data.pipes[1] = this;
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

export function disconnectPipeToGround() {
  for (let other of this.data.undergroundPipes) {
    other.data.undergroundPipes.splice(
        other.data.undergroundPipes.indexOf(this), 1);
  }
  const other = this.data.pipes[1];
  if (!other) return;
  let closest = undefined;
  for (let oc of other.data.undergroundPipes) {
    if (closest &&
        Math.abs(closest.x - other.x + closest.y - other.y) <
        Math.abs(oc.x - other.x + oc.y - other.y))
      continue;
    closest = oc;
  }
  if (closest && !closest.data.pipes[1]) {
    other.data.pipes[1] = closest;
    closest.data.pipes[1] = other;
    other.data.channel.join(other.data.pipes[1].data.channel);
  } else {
    other.data.pipes[1] = undefined;
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
      return;
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
      return;
    }
  }
}

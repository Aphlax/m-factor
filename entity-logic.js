import {TYPE, NEVER, STATE, ADJACENT} from './entity-properties.js';
import {ITEMS} from './item-definitions.js';

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

export function connectPipe(other, time) {
  for (let direction = 0; direction < ADJACENT.length; direction++) {
    const {dx, dy} = ADJACENT[direction];
    if (this.x + dx == other.x && this.y + dy == other.y) {
      this.data.pipes[direction] = other;
      other.data.pipes[(direction + 2) % 4] = this;
      break;
    }
  }
}

export function disconnectPipe() {
  for (let direction = 0; direction < 4; direction++) {
    const other = this.data.pipes[direction];
    if (other) {
      this.data.pipes[direction] = undefined;
      if (other.type == TYPE.pipe) {
        other.data.pipes[(direction + 2) % 4] = undefined;
        other.updatePipeSprites();
      }
    }
  }
}

export function updatePipeSprites() {
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

export function connectFluidOutput(pipe) {
  for (let p of this.outputFluidTank.connectionPoints) {
    if (pipe.x == this.x + p.x &&
        pipe.y == this.y + p.y) {
      pipe.inputEntities.push(this);
      this.outputEntities.push(pipe);
      pipe.data.pipes[(p.direction + 2) % 4] = this;
      pipe.updatePipeSprites();
      if (pipe.data.channel) {
        pipe.data.channel.addInputEntity(this, pipe);
      }
    }
  }
}

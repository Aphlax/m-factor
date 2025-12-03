import {Inventory} from './inventory.js';
import {FluidTank} from './fluid-tank.js';
import {ENTITIES} from './entity-definitions.js';
import {TYPE, MAX_SIZE, NEVER, STATE, MINE_PATTERN, MINE_PRODUCTS, INSERTER_PICKUP_BEND, LAB_FILTERS, FUEL_FILTERS, ENERGY, MIN_SATISFACTION, DIRECTION} from './entity-properties.js';
import {ITEMS, I} from './item-definitions.js';
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
  this.taskDuration = 0;
  this.taskEnd = 0;
  this.nextUpdate = 0;
  this.state = 0;
  this.data = {};
  this.energySource = 0;
  this.energyStored = 0; // kJ.
  this.energyDrain = 0; // kW.
  this.energyConsumption = 0; // kW.
  // Inventories.
  this.inputInventory = undefined;
  this.outputInventory = undefined;
  this.fuelInventory = undefined;
  this.inputFluidTank = undefined;
  this.outputFluidTank = undefined;
  // Connected entities.
  this.inputEntities = [];
  this.outputEntities = [];
  this.electricConnections = [];
}

Entity.prototype.setup = function(name, x, y, direction, time, data) {
  const def = ENTITIES.get(name);
  this.name = name;
  this.type = def.type;
  this.label = def.label;
  this.x = x;
  this.y = y;
  direction = def.rotatable || def.type == TYPE.offshorePump ?
      direction : DIRECTION.north;
  if (!def.size) {
    this.width = def.width;
    this.height = def.height;
  } else {
    this.width = def.size[direction].width;
    this.height = def.size[direction].height;
  }
  this.direction = direction;
  this.energySource = ENERGY.none;
  this.sprite = def.sprites[direction][0];
  this.spriteShadow = def.sprites[direction][1];
  this.animation = 0;
  this.animationLength = def.animationLength ?? 0;
  this.animationSpeed = def.animationSpeed ?? 1;
  this.spriteShadowAnimation = !def.noShadowAnimation;
  this.inputEntities.length = 0;
  this.outputEntities.length = 0;
  this.electricConnections.length = 0;
  
  if (this.type == TYPE.belt) {
    this.nextUpdate = NEVER;
    this.data.beltAnimation = def.beltAnimation;
    this.data.beltAnimationSpeed = def.beltAnimationSpeed;
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
    this.energySource = def.energySource;
    this.energyDrain = def.energyDrain;
    this.energyConsumption = def.energyConsumption;
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
    this.sprite = def.idleAnimation[direction][0];
    this.data.processingSpeed = def.processingSpeed;
    this.data.recipe = undefined;
    this.data.idleAnimation = def.idleAnimation[direction][0];
    this.data.workingAnimation = def.sprites[direction][0];
    this.data.smokeX = def.smokePosition.x;
    this.data.smokeY = def.smokePosition.y;
    this.inputInventory = new Inventory(1)
        .setFilters(FURNACE_FILTERS);
    this.outputInventory = new Inventory(1);
    this.energySource = def.energySource;
    if (def.energySource == ENERGY.burner) {
      this.fuelInventory = new Inventory(1)
          .setFilters(FUEL_FILTERS);
      this.energyConsumption = def.energyConsumption;
    } else if (def.energySource == ENERGY.electric) {
      this.energyDrain = def.energyDrain;
      this.energyConsumption = def.energyConsumption;
    }
  } else if (this.type == TYPE.assembler) {
    this.state = STATE.noRecipe;
    this.nextUpdate = NEVER;
    this.data.processingSpeed = def.processingSpeed;
    this.data.recipe = undefined;
    this.inputInventory = new Inventory(0);
    this.outputInventory = new Inventory(0);
    this.energySource = def.energySource;
    this.energyDrain = def.energyDrain;
    this.energyConsumption = def.energyConsumption;
  } else if (this.type == TYPE.chest) {
    this.inputInventory = this.outputInventory =
        new Inventory(def.capacity);
  } else if (this.type == TYPE.lab) {
    this.state = STATE.missingItem;
    this.nextUpdate = NEVER;
    this.taskStart = NEVER;
    this.taskEnd = NEVER;
    this.taskDuration = def.taskDuration;
    this.inputInventory = this.outputInventory =
        new Inventory(1).setFilters(LAB_FILTERS);
    this.energySource = ENERGY.electric;
    this.energyDrain = 0;
    this.energyConsumption = def.energyConsumption;
    this.data.grid = undefined;
  } else if (this.type == TYPE.pipe) {
    this.data.pipeConnections = def.pipeConnections[direction];
    this.data.pipes = {};
    this.data.capacity = def.capacity;
    this.data.pipeSprites = def.pipeSprites;
  } else if (this.type == TYPE.offshorePump) {
    this.state = STATE.running;
    this.nextUpdate = time;
    this.taskDuration = def.recipe.duration;
    this.data.outputAmount = def.recipe.outputs[0].amount;
    this.outputFluidTank = new FluidTank()
        .setTanklets([I.water])
        .setPipeConnections(def.fluidOutputs[direction]);
    this.outputFluidTank.tanklets[0].capacity =
        def.recipe.outputs[0].amount *
        1000 / def.recipe.duration;
  } else if (this.type == TYPE.boiler) {
    this.state = STATE.missingItem;
    this.nextUpdate = NEVER;
    this.energySource = def.energySource;
    this.energyConsumption = def.energyConsumption;
    this.data.pipeConnections = def.pipeConnections[direction];
    this.data.pipes = {};
    this.data.capacity = def.capacity;
    this.data.inputAmount = def.recipe.inputs[0].amount;
    this.data.outputAmount = def.recipe.outputs[0].amount;
    this.taskDuration = def.recipe.duration;
    this.energySource = def.energySource;
    this.energyConsumption = def.energyConsumption;
    this.data.workingAnimation = def.sprites[direction][0];
    this.data.idleAnimation = def.idleAnimation[direction][0];
    this.data.smokeX = def.smokePosition.x;
    this.data.smokeY = def.smokePosition.y;
    this.sprite = this.data.idleAnimation;
    this.outputFluidTank = new FluidTank()
        .setTanklets([def.recipe.outputs[0].item])
        .setPipeConnections(def.fluidOutputs[direction]);
    this.inputFluidTank = new FluidTank()
        .setTanklets([def.recipe.inputs[0].item])
        .setInternalInlet(true);
    if (def.energySource == ENERGY.burner) {
      this.fuelInventory = new Inventory(1)
          .setFilters(FUEL_FILTERS);
    }
  } else if (this.type == TYPE.generator) {
    this.state = STATE.idle;
    this.nextUpdate = NEVER;
    this.data.pipeConnections = def.pipeConnections[direction];
    this.data.pipes = {};
    this.data.capacity = def.capacity;
    this.data.fluidConsumption = def.fluidConsumption;
    this.data.powerOutput = def.powerOutput;
    this.inputFluidTank = new FluidTank()
        .setTanklets([I.steam])
        .setInternalInlet(true);
  } else if (this.type == TYPE.electricPole) {
    this.nextUpdate = NEVER;
    this.data.wireReach = def.wireReach;
    this.data.powerSupplyArea = def.powerSupplyArea;
    this.data.grid = undefined;
    this.data.wires = new Set();
    this.data.wireConnectionPointX = def.wireConnectionPoint.x;
    this.data.wireConnectionPointY = def.wireConnectionPoint.y;
    this.data.wireConnectionPointShadowX = def.wireConnectionPointShadow.x;
    this.data.wireConnectionPointShadowY = def.wireConnectionPointShadow.y;
  } else if (this.type == TYPE.undergroundBelt) {
    this.nextUpdate = NEVER;
    this.data.undergroundUp = !!data?.undergroundUp;
    this.data.maxUndergroundGap = def.maxUndergroundGap;
    this.data.beltAnimation = def.beltAnimation;
    this.data.beltAnimationSpeed = def.beltAnimationSpeed;
    this.data.beltSpeed = def.beltSpeed;
    this.data.beltSprites = def.beltSprites[direction];
    this.data.beltEndSprites = def.beltEndSprites[direction];
    this.data.beltInput = undefined;
    this.data.beltOutput = undefined;
    this.data.beltSideLoadMinusWait = 0;
    this.data.beltSideLoadPlusWait = 0;
    this.updateBeltSprites();
  } else if (this.type == TYPE.pipeToGround) {
    this.nextUpdate = NEVER;
    this.data.pipeConnections = def.pipeConnections[direction];
    this.data.pipes = {};
    this.data.capacity = def.capacity;
    this.data.maxUndergroundGap = def.maxUndergroundGap;
    this.data.undergroundPipes = [];
  }
  return this;
};

Entity.prototype.update = function(gameMap, time) {
  if (this.type == TYPE.inserter) {
    let state, nextUpdate = NEVER;
    inserter: {
      if ((this.state == STATE.running && !this.data.inserterItem) ||
          this.state == STATE.missingItem ||
          this.state == STATE.noOutput ||
          this.state == STATE.outputFull) {
        if (!this.outputEntities.length || !this.inputEntities.length) {
          state = !this.outputEntities.length ?
              STATE.noOutput : STATE.missingItem;
          break inserter;
        }
        const [inputEntity] = this.inputEntities;
        const [outputEntity] = this.outputEntities;
        let inserterItem = undefined;
        
        const wants = outputEntity.insertWants();
        if (wants != -1 && !wants.length) {
          state = STATE.outputFull;
          break inserter;
        }
        if (inputEntity.type == TYPE.belt ||
            inputEntity.type == TYPE.undergroundBelt) {
          const positionForBelt = this.direction * 3 + 1;
          const waitOrItem = inputEntity.beltExtract(
              wants, this.nextUpdate, positionForBelt);
          if (waitOrItem >= 0) {
            state = STATE.missingItem;
            nextUpdate = this.nextUpdate + waitOrItem;
            break inserter;
          }
          inserterItem = -waitOrItem;
        } else {
          for (let i = 0; i < inputEntity.outputInventory.items.length; i++) {
            const item = inputEntity.outputInventory.items[i];
            if ((i && item == inputEntity.outputInventory.items[i - 1]) ||
                (wants != -1 && !wants.includes(item))) {
              continue;
            }
            if (inputEntity.extract(item, 1, this.nextUpdate)) {
              inserterItem = item;
              break;
            }
          }
          if (!inserterItem) {
            state = STATE.missingItem;
            break inserter;
          }
        }
        this.data.inserterItem = inserterItem;
        state = STATE.running;
        this.taskStart = this.nextUpdate;
        const sat = this.energySource == ENERGY.electric ?
            this.data.grid?.satisfaction ?? 0 : 1;
        this.taskEnd = nextUpdate =
            sat < MIN_SATISFACTION ? NEVER :
            this.taskStart + this.taskDuration / sat;
        break inserter;
      } else if (this.state == STATE.running ||
          this.state == STATE.itemReady) {
        // We arrived at the target with the hand holding an item.
        if (!this.outputEntities.length) {
          state = STATE.itemReady;
          break inserter;
        }
        const [outputEntity] = this.outputEntities;
        if (outputEntity.type == TYPE.belt ||
            outputEntity.type == TYPE.undergroundBelt) {
          const positionForBelt = this.direction * 3 + 1;
          const wait = outputEntity.beltInsert(
              this.data.inserterItem,
              this.taskEnd, positionForBelt);
          if (wait) {
            state = STATE.itemReady;
            nextUpdate = this.nextUpdate + wait;
            break inserter;
          }
        } else {
          const amount = outputEntity.insert(this.data.inserterItem, 1, this.taskEnd);
          if (!amount) {
            state = STATE.itemReady;
            break inserter;
          }
        }
        this.data.inserterItem = undefined;
        state = STATE.running;
        this.taskStart = this.nextUpdate;
        const sat = this.energySource == ENERGY.electric ?
            this.data.grid?.satisfaction ?? 0 : 1;
        this.taskEnd = nextUpdate =
            sat < MIN_SATISFACTION ? NEVER :
            this.taskStart + this.taskDuration / sat;
        break inserter;
      }
    } // break inserter:
    if (this.energySource == ENERGY.electric && this.data.grid) {
      if (this.state != STATE.running && state == STATE.running) {
        this.data.grid.consumerss.get(this.energyDrain).delete(this);
        this.data.grid.consumerss.get(this.energyConsumption).add(this);
      }
      if (this.state == STATE.running && state != STATE.running) {
        this.data.grid.consumerss.get(this.energyConsumption).delete(this);
        this.data.grid.consumerss.get(this.energyDrain).add(this);
      }
    }
    this.state = state;
    this.nextUpdate = nextUpdate;
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
      if (outputEntity.type == TYPE.belt ||
          outputEntity.type == TYPE.undergroundBelt) {
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
    let state = this.state, nextUpdate = NEVER;
    furnace: {
      if (this.energySource == ENERGY.burner &&
          ((state == STATE.running &&
          this.nextUpdate != this.taskEnd) ||
          state == STATE.outOfEnergy)) {
        const p = (this.nextUpdate - this.taskStart) /
            (this.taskEnd - this.taskStart);
        const item = this.fuelInventory.items[0];
        if (!item || !this.fuelInventory.extract(item, 1, true)) {
          if (state == STATE.running) {
            this.taskStart = this.nextUpdate - p * NEVER;
            this.taskEnd = this.nextUpdate + (1 - p) * NEVER;
            state = STATE.outOfEnergy;
          }
          break furnace;
        }
        this.energyStored += ITEMS.get(item).fuelValue;
        for (let inputEntity of this.inputEntities) {
          if (inputEntity.state == STATE.outputFull ||
              inputEntity.state == STATE.itemReady) {
            inputEntity.nextUpdate = this.nextUpdate;
          }
        }
        if (state != STATE.running) {
          this.taskStart = this.nextUpdate - p * this.taskDuration;
          this.taskEnd = this.nextUpdate + (1 - p) * this.taskDuration;
          state = STATE.running;
        }
        nextUpdate = this.taskEnd;
        break furnace;
      }
      if (state == STATE.running ||
          state == STATE.itemReady) {
        if (state == STATE.running &&
            this.energySource == ENERGY.burner) {
          this.energyStored -= (this.nextUpdate - this.taskStart) /
              1000 * this.energyConsumption;
        }
        if (state == STATE.running && this.animationLength) {
          this.animation = Math.floor(this.animation +
            (time - this.taskStart) * this.animationSpeed / 60) %
            this.animationLength;
        }
        const output = this.data.recipe.outputs[0];
        if (!this.outputInventory.insert(output.item, output.amount)) {
          state = STATE.itemReady;
          break furnace;
        }
        for (let outputEntity of this.outputEntities) {
          if (outputEntity.state == STATE.missingItem) {
            outputEntity.nextUpdate = this.nextUpdate;
          }
        }
        state = STATE.missingItem;
      }
      if (state == STATE.missingItem ||
          state == STATE.noEnergy) {
        if (this.energySource == ENERGY.burner &&
            this.energyStored <= 0) {
          const item = this.fuelInventory.items[0];
          if (!item || !this.fuelInventory.extract(item, 1, true)) {
            state = STATE.noEnergy;
            break furnace;
          }
          this.energyStored = ITEMS.get(item).fuelValue;
          for (let inputEntity of this.inputEntities) {
            if (inputEntity.state == STATE.outputFull ||
                inputEntity.state == STATE.itemReady) {
              inputEntity.nextUpdate = this.nextUpdate;
            }
          }
          state = STATE.missingItem;
        }
        const item = this.inputInventory.items[0];
        if (!this.data.recipe ||
            this.data.recipe.inputs[0].item != item) {
          this.data.recipe = RECIPES.filter(r =>
               r.entities.includes(this.name) &&
               r.inputs[0].item == item)[0];
          this.taskDuration = (this.data.recipe?.duration ?? NEVER) / this.data.processingSpeed;
        }
        if (!this.data.recipe) {
          break furnace;
        }
        if (!this.inputInventory.extract(
            item, this.data.recipe.inputs[0].amount,
            true /* onlyFullAmount */)) {
          break furnace;
        }
        for (let inputEntity of this.inputEntities) {
          if (inputEntity.state == STATE.outputFull ||
              inputEntity.state == STATE.itemReady) {
            inputEntity.nextUpdate = this.nextUpdate;
          }
        }
        state = STATE.running;
        this.taskStart = this.nextUpdate;
        const sat = this.energySource == ENERGY.electric ?
            this.data.grid?.satisfaction ?? 0 : 1;
        this.taskEnd = nextUpdate =
            sat < MIN_SATISFACTION ? NEVER :
            this.taskStart + this.taskDuration / sat;
        break furnace;
      }
    } // break furnace:
    if (this.state != STATE.running && state == STATE.running) {
      this.sprite = this.data.workingAnimation;
      if (this.energySource == ENERGY.electric && this.data.grid) {
        this.data.grid.consumerss.get(this.energyDrain).delete(this);
        this.data.grid.consumerss.get(this.energyConsumption).add(this);
      }
    }
    if (this.state == STATE.running && state != STATE.running) {
      this.sprite = this.data.idleAnimation;
      this.animation = 0;
      if (this.energySource == ENERGY.electric && this.data.grid) {
        this.data.grid.consumerss.get(this.energyConsumption).delete(this);
        this.data.grid.consumerss.get(this.energyDrain).add(this);
      }
    }
    if (state == STATE.running) {
      if (this.energySource == ENERGY.burner &&
          nextUpdate > this.taskStart +
          this.energyStored / this.energyConsumption * 1000) {
        nextUpdate = this.taskStart +
            this.energyStored / this.energyConsumption * 1000;
      }
      gameMap.createSmoke(this.x + this.data.smokeX,
          this.y + this.data.smokeY, this.nextUpdate,
          nextUpdate - this.nextUpdate);
    }
    this.state = state;
    this.nextUpdate = nextUpdate;
  } else if (this.type == TYPE.assembler) {
    let state = this.state, nextUpdate = NEVER;
    assembler: {
      if (state == STATE.running ||
          state == STATE.itemReady) {
        if (state == STATE.running && this.animationLength) {
          this.animation = Math.floor(this.animation +
            (time - this.taskStart) * this.animationSpeed / 60) %
            this.animationLength;
        }
        if (!this.outputInventory.insertFilters()) {
          state = STATE.itemReady;
          break assembler;
        }
        for (let outputEntity of this.outputEntities) {
          if (outputEntity.state == STATE.missingItem) {
            outputEntity.nextUpdate = this.nextUpdate;
          }
        }
        state = STATE.missingItem;
      }
      if (state == STATE.missingItem) {
        if (!this.inputInventory.extractFilters()) {
          break assembler;
        }
        for (let inputEntity of this.inputEntities) {
          if (inputEntity.state == STATE.outputFull ||
              inputEntity.state == STATE.itemReady) {
            inputEntity.nextUpdate = this.nextUpdate;
          }
        }
        state = STATE.running;
        this.taskStart = this.nextUpdate;
        const sat = this.energySource == ENERGY.electric ?
            this.data.grid?.satisfaction ?? 0 : 1;
        this.taskEnd = nextUpdate =
            sat < MIN_SATISFACTION ? NEVER :
            this.taskStart + this.taskDuration / sat;
        break assembler;
      }
    } // break assembler:
    if (this.energySource == ENERGY.electric && this.data.grid) {
      if (this.state != STATE.running && state == STATE.running) {
        this.data.grid.consumerss.get(this.energyDrain).delete(this);
        this.data.grid.consumerss.get(this.energyConsumption).add(this);
      }
      if (this.state == STATE.running && state != STATE.running) {
        this.data.grid.consumerss.get(this.energyConsumption).delete(this);
        this.data.grid.consumerss.get(this.energyDrain).add(this);
      }
    }
    this.state = state;
    this.nextUpdate = nextUpdate;
  } else if (this.type == TYPE.lab) {
    if (this.state == STATE.running ||
        this.state == STATE.missingItem) {
      if (this.state == STATE.running) {
        this.animation = Math.floor(this.animation +
            (time - this.taskStart) * this.animationSpeed / 60) %
            this.animationLength;
      }
      if (!this.inputInventory.extractFilters()) {
        if (this.data.grid && this.state == STATE.running) {
          this.data.grid.consumerss.get(this.energyConsumption).delete(this);
          this.data.grid.consumerss.get(this.energyDrain).add(this);
        }
        this.state = STATE.missingItem;
        this.nextUpdate = NEVER;
        this.taskStart = this.taskEnd = NEVER;
        this.animation = 0;
        return;
      }
      for (let inputEntity of this.inputEntities) {
        if (inputEntity.state == STATE.outputFull ||
            inputEntity.state == STATE.itemReady) {
          inputEntity.nextUpdate = this.nextUpdate;
        }
      }
      if (this.data.grid && this.state != STATE.running) {
        this.data.grid.consumerss.get(this.energyDrain).delete(this);
        this.data.grid.consumerss.get(this.energyConsumption).add(this);
      }
      this.state = STATE.running;
      this.taskStart = this.nextUpdate;
      const sat = this.data.grid?.satisfaction ?? 0;
      this.taskEnd = this.nextUpdate =
          sat < MIN_SATISFACTION ? NEVER :
          this.taskStart + this.taskDuration / sat;
      this.animationSpeed = sat < MIN_SATISFACTION ?
          1 / NEVER : sat;
    }
  } else if (this.type == TYPE.offshorePump) {
    this.outputFluidTank.tanklets[0].amount =
        Math.min(this.outputFluidTank.tanklets[0].capacity,
        this.outputFluidTank.tanklets[0].amount + this.data.outputAmount);
    this.nextUpdate = this.nextUpdate + this.taskDuration;
  } else if (this.type == TYPE.boiler) {
    let continueNextItem = false;
    if (this.state == STATE.running ||
        this.state == STATE.itemReady) {
      if (this.state == STATE.running)
        this.energyStored -= this.taskDuration / 1000 * this.energyConsumption;
      const outputTanklet = this.outputFluidTank.tanklets[0];
      if (outputTanklet.amount + this.data.outputAmount > outputTanklet.capacity) {
        this.state = STATE.itemReady;
        this.nextUpdate = NEVER;
        this.sprite = this.data.idleAnimation;
        this.animation = 0;
        return;
      }
      outputTanklet.amount += this.data.outputAmount;
      continueNextItem = true;
    }
    if (this.state == STATE.missingItem ||
        this.state == STATE.outOfEnergy ||
        continueNextItem) {
      const inputTanklet = this.inputFluidTank.tanklets[0];
      if (inputTanklet.amount < this.data.inputAmount) {
        this.state = STATE.missingItem;
        this.nextUpdate = NEVER;
        this.sprite = this.data.idleAnimation;
        this.animation = 0;
        return;
      }
      while (this.energyStored < this.taskDuration / 1000 * this.energyConsumption) {
        if (this.energySource == ENERGY.burner) {
          const item = this.fuelInventory.items[0];
          if (!item || !this.fuelInventory.extract(item, 1, true)) {
            this.state = STATE.outOfEnergy;
            this.nextUpdate = NEVER;
            this.sprite = this.data.idleAnimation;
            this.animation = 0;
            return;
          }
          this.energyStored += ITEMS.get(item).fuelValue;
          for (let inputEntity of this.inputEntities) {
            if (inputEntity.state == STATE.outputFull ||
                inputEntity.state == STATE.itemReady) {
              inputEntity.nextUpdate = this.nextUpdate;
            }
          }
        } else {
          this.state = STATE.outOfEnergy;
          this.nextUpdate = NEVER;
          this.sprite = this.data.idleAnimation;
          this.animation = 0;
          return;
        }
      }
      inputTanklet.amount -= this.data.inputAmount;
      this.state = STATE.running;
      this.taskStart = this.nextUpdate;
      this.taskEnd = this.taskStart + this.taskDuration;
      this.sprite = this.data.workingAnimation;
      gameMap.createSmoke(this.x + this.data.smokeX,
          this.y + this.data.smokeY, this.nextUpdate,
          this.taskEnd - this.nextUpdate);
      this.nextUpdate = this.taskEnd;
      return;
    }
  }
};

export {Entity};

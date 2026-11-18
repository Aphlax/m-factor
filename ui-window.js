import {UiInventory, UiFluidInventory} from './ui-inventory.js';
import {PROGRESS, UiProgress, UiResource, UiFuel, UiWindUp, UiFluidIndicator, UiSplitterPriority, UiInserterFilters, UiTemperature, UiResourceGather, UiLabel, UiNotImplemented} from './ui-components.js';
import {UiButton, BUTTON} from './ui-button.js';
import {UiChoice, CHOICE} from './ui-choice.js';
import {COLOR} from './ui-properties.js';
import {TYPE, NAME, RESOURCE_LABELS, ENERGY, NATURAL} from './entity-properties.js';
import {S} from './sprite-pool.js';
import {SETTINGS} from './storage.js';

const OPEN_HEIGHT = 44 + 2 * 46;
const MIN_Y = 222;

/*
  default buttons:
  edit
    move/rotate menu
    pippette
    inventory
    upgrade
    downgrade
    delete
  info
  module slots
*/


function UiWindow(ui, canvas) {
  this.ui = ui;
  
  this.canvasWidth = canvas.width;
  this.canvasHeight = canvas.height;
  this.scroller = new Scroller(0, this.canvasHeight / 2);
  this.scrollerX = new Scroller(-this.canvasWidth, 0);
  this.x = 0;
  this.y = this.canvasHeight;
  this.height = 0;
  
  this.selectedEntity = undefined;
  this.entityUis = new Map();
  this.entityUi = undefined;
  this.defaultUi = {};
  this.showDefaultUi = true;
}

UiWindow.prototype.scrollX = function(position) {
  this.scrollerX.scrollTo(position);
};

UiWindow.prototype.scrollY = function(position) {
  this.scroller.scrollTo(position);
};

UiWindow.prototype.update = function(dt) {
  this.scrollerX.update(dt);
  this.scroller.update(dt);
  this.x = this.scrollerX.pos;
  this.y = this.canvasHeight - this.scroller.pos;
  this.height = this.canvasHeight - Math.max(this.y, MIN_Y);
  if (this.scroller.pos < 50 && this.scroller.velocity == 0) {
    this.set();
  }
};

UiWindow.prototype.draw = function(ctx, playTime) {
  const width = this.canvasWidth,
      height = this.canvasHeight;
  if (this.y >= height - 1) return;
  
  const y = Math.floor(height - this.height);
  ctx.fillStyle = COLOR.background2;
  ctx.fillRect(0, y + 32, width, height - y - 32);
  ctx.fillStyle = this.headerDrag ? COLOR.backgroundDrag : COLOR.background1;
  ctx.fillRect(0, y, width, 32);
  ctx.strokeStyle = COLOR.border1;
  ctx.lineWidth = 1;
  ctx.strokeRect(-2, y, width + 4, 32);
  window.numberOtherDraws++;
  
  const entity = this.selectedEntity;
  if (entity) {
    ctx.font = "20px monospace";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLOR.primary;
    const label = entity.label ||
        RESOURCE_LABELS[entity.id] ||
        "Tree";
    ctx.fillText(label, 8, y + 17);
    window.numberOtherDraws++;
    
    if (SETTINGS.debugInfo) {
      const info = entity.type ?
          entity.x + " " + entity.y :
          entity.x.toFixed(1) + " " + entity.y.toFixed(1);
      ctx.fillText(info, width / 2 + 10, y + 17);
    }
  }
  
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y + 32, width, height - y - 32);
  ctx.clip();
  if (this.entityUi) {
    for (let c of this.entityUi.all) {
      c.draw(ctx, playTime);
    }
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.draw(ctx, playTime);
    }
  }
  ctx.restore();
};

UiWindow.prototype.inBounds = function(t) {
  return t.clientY >= this.canvasHeight - this.height; 
};

UiWindow.prototype.touchStart = function(e, doubleTap) {
  if (e.touches.length == 1 && !doubleTap) {
    this.scroller.startDrag(e.touches[0].clientY);
  }
  
  for (let c of this.entityUi.all) {
    c.touchStart?.(e, doubleTap);
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.touchStart?.(e, doubleTap);
    }
  }
};

UiWindow.prototype.touchMove = function(e, longTouch, doubleTap) {
  if (this.scroller.isDragging) {
    this.scroller.moveDrag(e.touches[0].clientY);
    if (this.scroller.pos < 50) {
      this.scroller.endDrag();
      this.set();
    }
  }
  
  for (let c of this.entityUi.all) {
    c.touchMove?.(e, longTouch, doubleTap);
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.touchMove?.(e, longTouch, doubleTap);
    }
  }
};

UiWindow.prototype.touchEnd = function(e, shortTouch, doubleTap) {
  this.scroller.endDrag();
  
  for (let c of this.entityUi.all) {
    c.touchEnd?.(e, shortTouch, doubleTap);
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.touchEnd?.(e, shortTouch, doubleTap);
    }
  }
};

UiWindow.prototype.touchLong = function(e, doubleTap) {
  if (this.scroller.isDragging) {
    this.scroller.endDrag();
  }
  
  for (let c of this.entityUi.all) {
    c.touchLong?.(e, doubleTap);
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.touchLong?.(e, doubleTap);
    }
  }
}

UiWindow.prototype.initialize = function() {
  const padding = (this.canvasWidth - 362) / 2;
  this.defaultUi = {
    deleteEntity: new UiButton(this, this.canvasWidth - 40 - padding, 40)
        .setButton(BUTTON.deleteEntity, S.crossIcon),
    fuelInventory: new UiInventory(this, padding, 40),
    fuel: new UiFuel(this, padding + 44, 40),
    windUpButton: new UiButton(this, padding, 40)
        .setButton(BUTTON.windUp, S.windUpIcon),
    windUp: new UiWindUp(this, padding + 44, 40),
    inventoryLabel: new UiLabel(this, padding, 84)
        .set("Inventory", COLOR.secondary, "16px sans", "small-caps"),
    inventory: new UiInventory(this, padding, 96)
        .setWrap(8),
  };
  this.defaultUi.all = Object.values(this.defaultUi);
  
  this.entityUis.set(NATURAL.resource, {
    resource: new UiResource(this, padding, 40),
    gather: new UiResourceGather(this, this.canvasWidth / 2, 40)
        .setType(NATURAL.resource).setMaxProgress(2),
  });
  
  this.entityUis.set(NATURAL.tree, {
    gather: new UiResourceGather(this, this.canvasWidth / 2, 40)
        .setType(NATURAL.tree).setMaxProgress(3),
  });
  
  this.entityUis.set(TYPE.mine, {
    progress: new UiProgress(this, padding, 40)
        .setWidth(this.canvasWidth - 2 * padding),
  });
  
  this.entityUis.set(TYPE.chest, {
    inventory: new UiInventory(this, padding, 40)
        .setWrap(8),
  });
  
  this.entityUis.set(TYPE.logisticContainer, {
    inventory: new UiInventory(this, padding, 40)
        .setWrap(8),
  });
  
  this.entityUis.set(TYPE.offshorePump, {});
  this.entityUis.set(TYPE.boiler, {
    temperature: new UiTemperature(this, padding, 40),
    fluidIndicator: new UiFluidIndicator(this, padding + 100, 40),
  });
  this.entityUis.set(TYPE.electricPole, {});
  this.entityUis.set(TYPE.pump, {});
  
  this.entityUis.set(TYPE.belt, {
    snake: new UiButton(this, this.canvasWidth - padding - 86, 40)
        .setButton(BUTTON.snakeBelt, S.snakeIcon),
  });
  
  this.entityUis.set(TYPE.undergroundBelt, {
    connectUnderground: new UiButton(this, this.canvasWidth - padding - 86, 40)
        .setButton(BUTTON.connectUnderground, S.undergroundConnectIcon),
  });
  
  this.entityUis.set(TYPE.splitter, {
    priority: new UiSplitterPriority(this, padding, 40),
    filterChoice: new UiChoice(this, this.canvasWidth + padding, 40)
        .setWidth(this.canvasWidth - 2 * padding),
  });
  
  this.entityUis.set(TYPE.inserter, {
    filters: new UiInserterFilters(this, padding, 40),
    filterChoice: new UiChoice(this, this.canvasWidth + padding, 40)
        .setWidth(this.canvasWidth - 2 * padding),
    notImplemented: new UiNotImplemented(this, padding, 86),
  });
  
  this.entityUis.set(TYPE.pipeToGround, {
    connectUnderground: new UiButton(this, this.canvasWidth - padding - 86, 40)
        .setButton(BUTTON.connectUnderground, S.undergroundConnectIcon),
    fluidIndicator: new UiFluidIndicator(this, padding, 40),
  });
  
  this.entityUis.set(TYPE.furnace, {
    input: new UiInventory(this, padding, 40),
    output: new UiInventory(this, this.canvasWidth - padding - 40, 40)
        .setIsOutput(true),
    progress: new UiProgress(this, padding + 46, 40)
        .setWidth(this.canvasWidth - 2 * padding - 92),
  });
  
  this.entityUis.set(TYPE.assembler, {
    input: new UiInventory(this, padding, 40),
    output: new UiInventory(this, this.canvasWidth - padding - 40, 40)
        .setIsOutput(true),
    fluidInput: new UiFluidInventory(this, padding, 40),
    fluidOutput: new UiFluidInventory(this, this.canvasWidth - padding - 40, 40),
    progress: new UiProgress(this, padding + 46, 40)
        .setWidth(this.canvasWidth - padding - 148),
    recipe: new UiButton(this, this.canvasWidth - padding - 86, 86)
        .setButton(BUTTON.assemblerRecipe, S.gearIcon),
    recipeChoice: new UiChoice(this, this.canvasWidth + padding, 40)
        .setWidth(this.canvasWidth - 2 * padding),
  });
  
  this.entityUis.set(TYPE.lab, {
    inventory: new UiInventory(this, padding, 40),
    progress: new UiProgress(this, padding + 46, 40)
        .setWidth(this.canvasWidth - 2 * padding - 46),
  });
  
  this.entityUis.set(TYPE.pipe, {
    fluidIndicator: new UiFluidIndicator(this, padding, 40),
  });
  
  this.entityUis.set(TYPE.generator, {
    input: new UiFluidInventory(this, padding, 40),
  });
  
  this.entityUis.set(TYPE.rocketSilo, {
    input: new UiInventory(this, padding, 40),
    progress: new UiProgress(this, padding + 46, 40)
        .setWidth(this.canvasWidth - padding - 102),
    scienceInput: new UiInventory(this, padding, 86),
    rocketProgress: new UiProgress(this, padding + 46, 86)
        .setWidth(this.canvasWidth - padding - 78)
        .setMode(PROGRESS.rocket),
    output: new UiInventory(this, this.canvasWidth - padding - 40, 86)
        .setIsOutput(true),
  });
  
  this.entityUis.set(TYPE.rail, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.trainStop, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.railSignal, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.accumulator, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.radar, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.constantCombinator, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.arithmeticCombinator, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.deciderCombinator, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.powerSwitch, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.programmableSpeaker, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  this.entityUis.set(TYPE.lamp, {});
  this.entityUis.set(TYPE.solarPanel, {
    notImplemented: new UiNotImplemented(this, padding, 40),
  });
  
  this.entityUis.set(TYPE.roboport, {
    inventory: new UiInventory(this, padding, 40),
    notImplemented: new UiNotImplemented(this, padding, 86),
  });
  
  this.entityUis.set(TYPE.reactor, {
    inventory: new UiInventory(this, padding, 40),
    temperature: new UiTemperature(this, padding + 50, 40),
    progress: new UiProgress(this, this.canvasWidth - padding - 178, 40).setWidth(86),
    outputInventory: new UiInventory(this, this.canvasWidth - padding - 86, 40),
  });
  
  this.entityUis.set(TYPE.heatPipe, {
    temperature: new UiTemperature(this, padding, 40),
  });
  
  
  for (let ui of this.entityUis.values()) {
    ui.all = Object.values(ui);
  }
};

UiWindow.prototype.set = function(entity, scrollToOpenHeight) {
  const padding = (this.canvasWidth - 362) / 2;
  this.selectedEntity = entity;
  if (!entity) {
    this.scroller.scrollTo(0);
    return;
  }
  if (this.scroller.pos == 0 || scrollToOpenHeight) {
    this.scroller.scrollTo(OPEN_HEIGHT);
  }
  this.scrollerX.pos = 0;
  const ui = this.entityUi = this.entityUis.get(entity.type);
  let usedRows = ui?.all.length ? 1 : 0;
  
  if (!entity.type) {
    if (entity.id) {
      this.entityUi = this.entityUis.get(NATURAL.resource);
      this.entityUi.resource.set(entity);
      this.entityUi.gather.set(entity);
    } else if (entity) {
      this.entityUi = this.entityUis.get(NATURAL.tree);
      this.entityUi.gather.set(entity);
    }
  } else if (entity.type == TYPE.mine) {
    ui.progress.set(entity);
  } else if (entity.type == TYPE.chest) {
    ui.inventory.set(entity.inputInventory);
    usedRows = Math.ceil(entity.inputInventory.capacity / 8);
  } else if (entity.type == TYPE.furnace) {
    ui.input.set(entity.inputInventory);
    ui.output.set(entity.outputInventory);
    ui.progress.set(entity);
  } else if (entity.type == TYPE.assembler) {
    ui.input.set(entity.inputInventory);
    ui.fluidInput.set(entity.inputFluidTank);
    ui.fluidInput.x = padding +
        entity.inputInventory.capacity * 46;
    ui.output.set(entity.outputInventory);
    ui.output.x = this.canvasWidth - padding + 6 -
        (entity.outputInventory.capacity +
        (entity.outputFluidTank?.tanklets.length ?? 0)) * 46;
    ui.fluidOutput.set(entity.outputFluidTank);
    ui.fluidOutput.x = this.canvasWidth - padding + 6 -
        (entity.outputFluidTank?.tanklets.length ?? 0) * 46;
    ui.progress.set(entity);
    ui.progress.x = padding +
        (entity.inputInventory.capacity +
        (entity.inputFluidTank?.tanklets.length ?? 0)) * 46;
    ui.progress.width = this.canvasWidth - 2 * padding -
        46 * (entity.inputInventory.capacity +
        entity.outputInventory.capacity +
        (entity.inputFluidTank?.tanklets.length ?? 0) +
        (entity.outputFluidTank?.tanklets.length ?? 0));
    if (!entity.data.recipe) {
      this.scrollerX.pos = -this.canvasWidth;
      ui.recipeChoice.openChoice(
          CHOICE.assemblerRecipe, entity);
    }
  } else if (entity.type == TYPE.lab) {
    ui.inventory.set(entity.inputInventory);
    ui.progress.set(entity);
  } else if (entity.type == TYPE.pipe) {
    ui.fluidIndicator.set(entity);
    usedRows = 0;
  } else if (entity.type == TYPE.boiler) {
    ui.temperature.set(entity);
    ui.fluidIndicator.set(this.ui.game.settings.debugPipes ?
        entity : undefined);
    usedRows = 0;
  } else if (entity.type == TYPE.generator) {
    ui.input.set(this.ui.game.settings.debugPipes ?
        entity.inputFluidTank : undefined);
    usedRows = 0;
  } else if (entity.type == TYPE.belt) {
    usedRows = 0;
  } else if (entity.type == TYPE.undergroundBelt) {
    ui.connectUnderground.setButton(
        (entity.data.undergroundUp ?
        !entity.data.beltInput :
        !entity.data.beltOutput) ?
        BUTTON.connectUnderground : BUTTON.none);
    usedRows = 0;
  } else if (entity.type == TYPE.pipeToGround) {
    ui.fluidIndicator.set(entity);
    ui.connectUnderground.setButton(
        !entity.data.pipes[1] ?
        BUTTON.connectUnderground : BUTTON.none);
    usedRows = 0;
  } else if (entity.type == TYPE.splitter) {
    ui.priority.set(entity);
  } else if (entity.type == TYPE.inserter) {
    ui.filters.set(entity);
    ui.notImplemented.set(entity.name == NAME.bulkInserter)
  } else if (entity.type == TYPE.rocketSilo) {
    const {recipe, science} = entity.data;
    ui.input.set(entity.inputInventory)
      .setPart(0, recipe.inputs.length);
    ui.progress.set(entity);
    ui.progress.x = padding +
        (recipe.inputs.length) * 46;
    ui.progress.width = this.canvasWidth - 2 * padding -
        46 * (recipe.inputs.length);
    ui.scienceInput.set(entity.inputInventory)
      .setPart(recipe.inputs.length, 100);
    ui.rocketProgress.set(entity);
    ui.rocketProgress.x = padding +
        (science.inputs.length) * 46;
    ui.rocketProgress.width = this.canvasWidth - 2 * padding - 46 -
        46 * (science.inputs.length +
        entity.outputInventory.capacity);
    ui.output.set(entity.outputInventory);
    ui.output.x = this.canvasWidth - padding - 40 -
        (entity.outputInventory.capacity) * 46;
  } else if (entity.type == TYPE.logisticContainer) {
    ui.inventory.set(entity.inputInventory);
    usedRows = Math.ceil(entity.inputInventory.capacity / 8);
  } else if (entity.type == TYPE.roboport) {
    ui.inventory.set(entity.inputInventory);
  } else if (entity.type == TYPE.reactor) {
    ui.inventory.set(entity.inputInventory);
    ui.progress.set(entity);
    ui.temperature.set(entity);
    ui.outputInventory.set(entity.outputInventory);
    usedRows = 0;
  } else if (entity.type == TYPE.heatPipe) {
    ui.temperature.set(entity);
    usedRows = 0;
  }
  
  if (!(this.showDefaultUi = !!entity.type)) {
    this.scroller.max = padding + 126;
    return;
  }
  const defaultY = usedRows * 46 + 40;
  for (let c of this.defaultUi.all) {
    c.y = defaultY;
  }
  if (entity.energySource == ENERGY.burner) {
    this.defaultUi.fuelInventory.set(entity.fuelInventory);
    this.defaultUi.fuel.set(entity);
  } else {
    this.defaultUi.fuelInventory.set();
    this.defaultUi.fuel.set();
  }
  if (entity.energySource == ENERGY.windUp) {
    this.defaultUi.windUpButton.setButton(BUTTON.windUp);
    this.defaultUi.windUp.set(entity);
  } else {
    this.defaultUi.windUpButton.setButton(BUTTON.none);
    this.defaultUi.windUp.set();
  }
  
  const charInventory = this.ui.world.character.inventory;
  this.defaultUi.inventory.set(charInventory);
  this.defaultUi.inventoryLabel.y += 30;
  this.defaultUi.inventory.y += 60;
  
  this.scroller.max = defaultY + padding + 54 +
      Math.ceil(charInventory.capacity / 8) * 46;
};

const FRICTION = 16;
const MIN_VELOCITY = 5;

function Scroller(min, max) {
  this.min = min;
  this.max = max;
  this.pos = 0;
  this.lastPos = 0;
  this.velocity = 0;
  this.isDragging = false;
  this.lastPoint = 0;
}

Scroller.prototype.scrollTo = function(target) {
  const d = target - this.pos;
  if (!d) return this.velocity = 0;
  this.velocity = d * FRICTION;// + Math.sign(d) * MIN_VELOCITY;
}

Scroller.prototype.startDrag = function(point) {
  this.isDragging = true;
  this.lastPoint = point;
  this.velocity = 0;
};

Scroller.prototype.moveDrag = function(point) {
  let delta = this.lastPoint - point;
  this.lastPoint = point;

  const over = this.pos < this.min ? this.pos - this.min :
      this.pos > this.max ? this.pos - this.max : 0;
  if (over !== 0 && Math.sign(delta) === Math.sign(over)) {
    delta /= 1 + Math.abs(over);
  }
  this.pos += delta;
};

Scroller.prototype.endDrag = function() {
  this.isDragging = false;
};

Scroller.prototype.update = function(dt) {
  if (this.isDragging) {
    const v = (this.pos - this.lastPos) / (dt / 1000);
    this.velocity += (v - this.velocity) * 0.5;
  } else if (this.pos < this.min || this.pos > this.max) {
    const over = this.pos - (this.pos < this.min ? this.min : this.max);
    const accel = -300 * over - 35 * this.velocity;
    this.velocity += accel * dt / 1000;
    this.pos += this.velocity * dt / 1000;

    if (Math.abs(over) < 0.5 && Math.abs(this.velocity) < MIN_VELOCITY) {
      this.pos = Math.max(this.min, Math.min(this.max, this.pos));
      this.velocity = 0;
    }
  } else if (this.velocity) {
    this.pos += this.velocity * dt / 1000;
    this.velocity *= Math.exp(-FRICTION * dt / 1000);
    if (Math.abs(this.velocity) < MIN_VELOCITY) {
      this.pos = Math.round(this.pos);
      this.velocity = 0;
    }
  }

  this.lastPos = this.pos;
};

export {UiWindow};

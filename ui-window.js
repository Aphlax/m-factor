import {UiInventory, UiFluidInventory} from './ui-inventory.js';
import {PROGRESS, UiProgress, UiResource, UiFuel, UiWindUp, UiFluidIndicator, UiSplitterPriority, UiInserterFilters, UiTree} from './ui-components.js';
import {UiButton, BUTTON} from './ui-button.js';
import {UiChoice, CHOICE} from './ui-choice.js';
import {COLOR} from './ui-properties.js';
import {TYPE, RESOURCE_LABELS, ENERGY, NATURAL} from './entity-properties.js';
import {S} from './sprite-pool.js';
import {SETTINGS} from './storage.js';

const OPEN_HEIGHT = 44 + 2 * 46;
const ANIMATION_SPEED = OPEN_HEIGHT / 100;
const MIN_Y = 150;

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
  this.x = 0;
  this.y = this.canvasHeight;
  this.xTarget = this.x;
  this.yTarget = this.y;
  
  this.headerDrag = 0;
  this.animationSpeed = ANIMATION_SPEED;
  
  this.selectedEntity = undefined;
  this.entityUis = new Map();
  this.entityUi = undefined;
  this.defaultUi = {};
  this.showDefaultUi = true;
}

UiWindow.prototype.update = function(time, dt) {
  if (this.x != this.xTarget) {
    let diff = this.xTarget - this.x;
    if (Math.abs(diff) > 2 * dt) {
      diff = 2 * dt * Math.sign(diff);
    }
    this.x = Math.floor(this.x + diff);
  }
  if (this.y != this.yTarget) {
    let diff = this.yTarget - this.y;
    if (Math.abs(diff) > Math.abs(this.animationSpeed) * dt) {
      diff = this.animationSpeed * dt;
    }
    this.y = Math.floor(this.y + diff);
    if (this.y == this.canvasHeight && this.selectedEntity) {
      this.set();
    }
  }
};

UiWindow.prototype.draw = function(ctx, time) {
  if (this.y >= this.canvasHeight - 1) return;
  
  const width = this.canvasWidth;
  const y = Math.floor(this.y);
  ctx.fillStyle = COLOR.background2;
  ctx.fillRect(0, y + 32, width, this.canvasHeight - y - 32);
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
  
  // Grip icon.
  ctx.beginPath();
  ctx.moveTo(width / 2 - 2, y + 16);
  ctx.lineTo(width / 2 + 2, y + 16);
  ctx.strokeStyle = COLOR.primary;
  ctx.lineWidth = 4;
  ctx.lineCaps = "round";
  ctx.stroke();
  window.numberOtherDraws++;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 2, y + 11);
  ctx.lineTo(width / 2 + 2, y + 11);
  ctx.moveTo(width / 2 - 2, y + 21);
  ctx.lineTo(width / 2 + 2, y + 21);
  ctx.strokeStyle = COLOR.primary;
  ctx.lineWidth = 1;
  ctx.lineCaps = "butt";
  ctx.stroke();
  window.numberOtherDraws++;
  
  if (this.entityUi) {
    for (let c of this.entityUi.all) {
      c.draw(ctx, time);
    }
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.draw(ctx, time);
    }
  }
};

UiWindow.prototype.touchStart = function(e) {
  if (e.touches[0].clientY < this.y + 32) {
    this.headerDrag = e.touches[0].clientY;
    this.animationSpeed = 0;
  }
  for (let c of this.entityUi.all) {
    c.touchStart?.(e);
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.touchStart?.(e);
    }
  }
};

UiWindow.prototype.touchMove = function(e, longTouch) {
  if (this.headerDrag) {
    this.y = this.yTarget =
        this.y + e.touches[0].clientY - this.headerDrag;
    this.animationSpeed = (e.touches[0].clientY - this.headerDrag) / 11;
    this.headerDrag = e.touches[0].clientY;
    if (this.y < MIN_Y) {
      this.y = this.yTarget = MIN_Y;
    }
    if (this.y >= this.canvasHeight - 50) {
      this.headerDrag = 0;
      this.animationSpeed = 2;
      this.set();
    }
  }
  for (let c of this.entityUi.all) {
    c.touchMove?.(e, longTouch);
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.touchMove?.(e);
    }
  }
};

UiWindow.prototype.touchEnd = function(e, shortTouch) {
  if (this.headerDrag && !e.touches.length) {
    this.headerDrag = 0;
    if (Math.abs(this.animationSpeed) > 0.8) {
      this.yTarget = this.y + this.animationSpeed * 120;
      this.animationSpeed *= 0.8;
      if (this.yTarget < MIN_Y + 100) {
        this.yTarget = MIN_Y;
      }
      if (this.yTarget >= this.canvasHeight - 100) {
        this.yTarget = this.canvasHeight;
      }
      if (this.yTarget >= this.canvasHeight - OPEN_HEIGHT - 50 &&
          this.yTarget < this.canvasHeight - OPEN_HEIGHT + 50) {
        this.yTarget = this.canvasHeight - OPEN_HEIGHT;
      }
    }
  }
  for (let c of this.entityUi.all) {
    c.touchEnd?.(e, shortTouch);
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.touchEnd?.(e, shortTouch);
    }
  }
};

UiWindow.prototype.touchLong = function(e) {
  if (this.headerDrag) {
    this.headerDrag = 0;
  }
  for (let c of this.entityUi.all) {
    c.touchLong?.(e);
  }
  if (this.showDefaultUi) {
    for (let c of this.defaultUi.all) {
      c.touchLong?.(e);
    }
  }
}

UiWindow.prototype.initialize = function() {
  this.defaultUi = {
    deleteEntity: new UiButton(this, this.canvasWidth - 50, 40)
        .setButton(BUTTON.deleteEntity, S.crossIcon),
    fuelInventory: new UiInventory(this, 10, 40),
    fuel: new UiFuel(this, 54, 40),
    windUpButton: new UiButton(this, 10, 40)
        .setButton(BUTTON.windUp, S.windUpIcon),
    windUp: new UiWindUp(this, 54, 40),
  };
  this.defaultUi.all = Object.values(this.defaultUi);
  
  this.entityUis.set(NATURAL.resource, {
    resource: new UiResource(this, 10, 40),
  });
  
  this.entityUis.set(NATURAL.tree, {
    tree: new UiTree(this, this.canvasWidth / 2, 40)
        .setMaxProgress(3),
  });
  
  this.entityUis.set(TYPE.mine, {
    progress: new UiProgress(this, 10, 40)
        .setWidth(this.canvasWidth - 20),
  });
  
  this.entityUis.set(TYPE.chest, {
    inventory: new UiInventory(this, (this.canvasWidth - 362) / 2, 40)
        .setWrap(8),
  });
  
  this.entityUis.set(TYPE.logisticContainer, {
    inventory: new UiInventory(this, (this.canvasWidth - 362) / 2, 40)
        .setWrap(8),
  });
  
  this.entityUis.set(TYPE.offshorePump, {});
  this.entityUis.set(TYPE.boiler, {});
  this.entityUis.set(TYPE.electricPole, {});
  this.entityUis.set(TYPE.pump, {});
  this.entityUis.set(TYPE.rail, {});
  this.entityUis.set(TYPE.trainStop, {});
  this.entityUis.set(TYPE.railSignal, {});
  this.entityUis.set(TYPE.accumulator, {});
  this.entityUis.set(TYPE.radar, {});
  this.entityUis.set(TYPE.constantCombinator, {});
  this.entityUis.set(TYPE.arithmeticCombinator, {});
  this.entityUis.set(TYPE.deciderCombinator, {});
  this.entityUis.set(TYPE.powerSwitch, {});
  this.entityUis.set(TYPE.programmableSpeaker, {});
  this.entityUis.set(TYPE.lamp, {});
  this.entityUis.set(TYPE.solarPanel, {});
  
  this.entityUis.set(TYPE.belt, {
    snake: new UiButton(this, this.canvasWidth - 96, 86)
        .setButton(BUTTON.snakeBelt, S.snakeIcon),
  });
  
  this.entityUis.set(TYPE.undergroundBelt, {
    connectUnderground: new UiButton(this, this.canvasWidth - 96, 86)
        .setButton(BUTTON.connectUnderground, S.undergroundConnectIcon),
  });
  
  this.entityUis.set(TYPE.splitter, {
    priority: new UiSplitterPriority(this, 10, 40),
    filterChoice: new UiChoice(this, this.canvasWidth + 10, 40)
        .setWidth(this.canvasWidth - 20),
  });
  
  this.entityUis.set(TYPE.inserter, {
    filters: new UiInserterFilters(this, 10, 40),
    filterChoice: new UiChoice(this, this.canvasWidth + 10, 40)
        .setWidth(this.canvasWidth - 20),
  });
  
  this.entityUis.set(TYPE.pipeToGround, {
    connectUnderground: new UiButton(this, this.canvasWidth - 96, 86)
        .setButton(BUTTON.connectUnderground, S.undergroundConnectIcon),
    fluidIndicator: new UiFluidIndicator(this, 10, 40),
  });
  
  this.entityUis.set(TYPE.furnace, {
    input: new UiInventory(this, 10, 40),
    output: new UiInventory(this, this.canvasWidth - 50, 40)
        .setIsOutput(true),
    progress: new UiProgress(this, 56, 40)
        .setWidth(this.canvasWidth - 112),
  });
  
  this.entityUis.set(TYPE.assembler, {
    input: new UiInventory(this, 10, 40),
    output: new UiInventory(this, this.canvasWidth - 96, 40)
        .setIsOutput(true),
    fluidInput: new UiFluidInventory(this, 10, 40),
    fluidOutput: new UiFluidInventory(this, this.canvasWidth - 96, 40),
    progress: new UiProgress(this, 56, 40)
        .setWidth(this.canvasWidth - 158),
    recipe: new UiButton(this, this.canvasWidth - 50, 40)
        .setButton(BUTTON.assemblerRecipe, S.gearIcon),
    recipeChoice: new UiChoice(this, this.canvasWidth + 10, 40)
        .setWidth(this.canvasWidth - 20),
  });
  
  this.entityUis.set(TYPE.lab, {
    inventory: new UiInventory(this, 10, 40),
    progress: new UiProgress(this, 56, 40)
        .setWidth(this.canvasWidth - 66),
  });
  
  this.entityUis.set(TYPE.pipe, {
    fluidIndicator: new UiFluidIndicator(this, 10, 40),
  });
  
  this.entityUis.set(TYPE.generator, {
    input: new UiFluidInventory(this, 10, 40),
  });
  
  this.entityUis.set(TYPE.rocketSilo, {
    input: new UiInventory(this, 10, 40),
    progress: new UiProgress(this, 56, 40)
        .setWidth(this.canvasWidth - 112),
    scienceInput: new UiInventory(this, 10, 86),
    rocketProgress: new UiProgress(this, 56, 86)
        .setWidth(this.canvasWidth - 88)
        .setMode(PROGRESS.rocket),
    output: new UiInventory(this, this.canvasWidth - 50, 86)
        .setIsOutput(true),
  });
  
  this.entityUis.set(TYPE.roboport, {
    inventory: new UiInventory(this, 10, 40),
  });
  
  for (let ui of this.entityUis.values()) {
    ui.all = Object.values(ui);
  }
};

UiWindow.prototype.set = function(entity) {
  this.selectedEntity = entity;
  if (!entity) {
    this.yTarget = this.canvasHeight;
    this.animationSpeed = (this.yTarget - this.y) / 100;
    return;
  }
  if (this.yTarget == this.canvasHeight) {
    this.yTarget = this.canvasHeight - OPEN_HEIGHT;
    this.animationSpeed = (this.yTarget - this.y) / 100;
  }
  this.x = this.xTarget = 0;
  const ui = this.entityUi = this.entityUis.get(entity.type);
  let defaultY =  ui?.all.length ? 86 : 40;
  
  if (!entity.type) {
    if (entity.id) {
      this.entityUi = this.entityUis.get(NATURAL.resource);
      this.entityUi.resource.set(entity);
    } else if (entity) {
      this.entityUi = this.entityUis.get(NATURAL.tree);
      this.entityUi.tree.set(entity);
    }
  } else if (entity.type == TYPE.mine) {
    ui.progress.set(entity);
  } else if (entity.type == TYPE.chest) {
    ui.inventory.set(entity.inputInventory);
    defaultY = Math.ceil(entity.inputInventory.capacity / 8) * 46 + 40;
  } else if (entity.type == TYPE.furnace) {
    ui.input.set(entity.inputInventory);
    ui.output.set(entity.outputInventory);
    ui.progress.set(entity);
  } else if (entity.type == TYPE.assembler) {
    ui.input.set(entity.inputInventory);
    ui.fluidInput.set(entity.inputFluidTank);
    ui.fluidInput.x = 10 +
        entity.inputInventory.capacity * 46;
    ui.output.set(entity.outputInventory);
    ui.output.x = this.canvasWidth - 50 -
        (entity.outputInventory.capacity +
        (entity.outputFluidTank?.tanklets.length ?? 0)) * 46;
    ui.fluidOutput.set(entity.outputFluidTank);
    ui.fluidOutput.x = this.canvasWidth - 50 -
        (entity.outputFluidTank?.tanklets.length ?? 0) * 46;
    ui.progress.set(entity);
    ui.progress.x = 10 +
        (entity.inputInventory.capacity +
        (entity.inputFluidTank?.tanklets.length ?? 0)) * 46;
    ui.progress.width = this.canvasWidth - 66 -
        46 * (entity.inputInventory.capacity +
        entity.outputInventory.capacity +
        (entity.inputFluidTank?.tanklets.length ?? 0) +
        (entity.outputFluidTank?.tanklets.length ?? 0));
    if (!entity.data.recipe) {
      ui.recipeChoice.openChoice(
          CHOICE.assemblerRecipe, entity);
      this.x = this.xTarget = -this.canvasWidth;
    }
  } else if (entity.type == TYPE.lab) {
    ui.inventory.set(entity.inputInventory);
    ui.progress.set(entity);
  } else if (entity.type == TYPE.pipe ||
      entity.type == TYPE.pipeToGround) {
    ui.fluidIndicator.set(entity);
  } else if (entity.type == TYPE.generator) {
    ui.input.set(this.ui.game.settings.debugPipes ?
        entity.inputFluidTank : undefined);
  } else if (entity.type == TYPE.undergroundBelt) {
    ui.connectUnderground.setButton(
        (entity.data.undergroundUp ?
        !entity.data.beltInput :
        !entity.data.beltOutput) ?
        BUTTON.connectUnderground : BUTTON.none);
  } else if (entity.type == TYPE.pipeToGround) {
    ui.connectUnderground.setButton(
        !entity.data.pipes[1] ?
        BUTTON.connectUnderground : BUTTON.none);
  } else if (entity.type == TYPE.splitter) {
    ui.priority.set(entity);
  } else if (entity.type == TYPE.inserter) {
    ui.filters.set(entity);
  } else if (entity.type == TYPE.rocketSilo) {
    const {recipe, science} = entity.data;
    ui.input.set(entity.inputInventory)
      .setPart(0, recipe.inputs.length);
    ui.progress.set(entity);
    ui.progress.x = 10 +
        (recipe.inputs.length) * 46;
    ui.progress.width = this.canvasWidth - 20 -
        46 * (recipe.inputs.length);
    ui.scienceInput.set(entity.inputInventory)
      .setPart(recipe.inputs.length, 100);
    ui.rocketProgress.set(entity);
    ui.rocketProgress.x = 10 +
        (science.inputs.length) * 46;
    ui.rocketProgress.width = this.canvasWidth - 66 -
        46 * (science.inputs.length +
        entity.outputInventory.capacity);
    ui.output.set(entity.outputInventory);
    ui.output.x = this.canvasWidth - 50 -
        (entity.outputInventory.capacity) * 46;
  } else if (entity.type == TYPE.logisticContainer) {
    ui.inventory.set(entity.inputInventory);
    defaultY = Math.ceil(entity.inputInventory.capacity / 8) * 46 + 40;
  } else if (entity.type == TYPE.roboport) {
    ui.inventory.set(entity.inputInventory);
  }
  
  this.showDefaultUi = !!entity.type;
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
};

export {UiWindow};

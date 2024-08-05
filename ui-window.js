import {UiInventory} from './ui-inventory.js';
import {UiProgress, UiResource, UiFuel, UiWindUp} from './ui-components.js';
import {UiButton, BUTTON} from './ui-button.js';
import {UiChoice, CHOICE} from './ui-choice.js';
import {COLOR} from './ui-properties.js';
import {TYPE, RESOURCE_LABELS, ENERGY} from './entity-properties.js';
import {S} from './sprite-pool.js';

const OPEN_HEIGHT = 44 + 2 * 46;
const ANIMATION_SPEED = OPEN_HEIGHT / 100;
const MIN_Y = 150;

/*
  default buttons:
  move/rotate menu
  pippette
  inventory
  upgrade
  downgrade
  delete
  info?
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
  
  if (this.selectedEntity) {
    ctx.font = "20px monospace";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLOR.primary;
    const label = this.selectedEntity.label ||
        RESOURCE_LABELS[this.selectedEntity.id];
    ctx.fillText(label, 8, y + 17);
  }
  
  ctx.beginPath();
  ctx.moveTo(width / 2 - 12, y + 16);
  ctx.lineTo(width / 2 + 12, y + 16);
  ctx.strokeStyle = COLOR.primary;
  ctx.lineWidth = 4;
  ctx.lineCaps = "round";
  ctx.stroke();
  
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
        .setButton(BUTTON.none, S.windUpIcon),
    windUp: new UiWindUp(this, 54, 40),
  };
  this.defaultUi.all = Object.values(this.defaultUi);
  
  this.entityUis.set(-1, { // Resource.
    resource: new UiResource(this, 10, 40),
  });
  
  this.entityUis.set(TYPE.mine, {
    progress: new UiProgress(this, 10, 40)
        .setWidth(this.canvasWidth - 20),
  });
  
  this.entityUis.set(TYPE.chest, {
    inventory: new UiInventory(this, 10, 40),
  });
  
  this.entityUis.set(TYPE.belt, {});
  this.entityUis.set(TYPE.inserter, {});
  
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
    progress: new UiProgress(this, 56, 40)
        .setWidth(this.canvasWidth - 158),
    recipe: new UiButton(this, this.canvasWidth - 50, 40)
        .setButton(BUTTON.assemblerRecipe, S.gearIcon),
    recipeChoice: new UiChoice(this, this.canvasWidth + 10, 40),
  });
  
  this.entityUis.set(TYPE.lab, {
    inventory: new UiInventory(this, 10, 40),
  });
  
  for (let ui of this.entityUis.values()) {
    ui.all = Object.values(ui);
  }
};

UiWindow.prototype.set = function(selectedEntity) {
  this.selectedEntity = selectedEntity;
  if (!selectedEntity) {
    this.yTarget = this.canvasHeight;
    this.animationSpeed = (this.yTarget - this.y) / 100;
    return;
  }
  if (this.yTarget == this.canvasHeight) {
    this.yTarget = this.canvasHeight - OPEN_HEIGHT;
    this.animationSpeed = (this.yTarget - this.y) / 100;
  }
  this.x = this.xTarget = 0;
  this.entityUi = this.entityUis.get(selectedEntity.type);
  
  if (!selectedEntity.type) { // Resource.
    this.entityUi = this.entityUis.get(-1);
    this.entityUi.resource.set(selectedEntity);
  } else if (selectedEntity.type == TYPE.mine) {
    this.entityUi.progress.set(selectedEntity);
  } else if (selectedEntity.type == TYPE.chest) {
    this.entityUi.inventory.set(selectedEntity.inputInventory);
  } else if (selectedEntity.type == TYPE.furnace) {
    this.entityUi.input.set(selectedEntity.inputInventory);
    this.entityUi.output.set(selectedEntity.outputInventory);
    this.entityUi.progress.set(selectedEntity);
  } else if (selectedEntity.type == TYPE.assembler) {
    this.entityUi.input.set(selectedEntity.inputInventory);
    this.entityUi.output.set(selectedEntity.outputInventory);
    this.entityUi.output.x = this.canvasWidth - 50 -
        selectedEntity.outputInventory.capacity * 46;
    this.entityUi.progress.set(selectedEntity);
    this.entityUi.progress.x = 10 +
        selectedEntity.inputInventory.capacity * 46;
    this.entityUi.progress.width = this.canvasWidth - 66 -
        46 * (selectedEntity.inputInventory.capacity +
        selectedEntity.outputInventory.capacity);
    if (!selectedEntity.data.recipe) {
      this.entityUi.recipeChoice.setChoice(
          CHOICE.assemblerRecipe, selectedEntity);
      this.x = this.xTarget = -this.canvasWidth;
      this.yTarget = Math.max(MIN_Y, this.canvasHeight - 50 -
          46 * Math.ceil(this.entityUi.recipeChoice.choices.length / 8));
      this.animationSpeed = (this.yTarget - this.y) / 100;
    }
  } else if (selectedEntity.type == TYPE.lab) {
    this.entityUi.inventory.set(selectedEntity.inputInventory);
  }
  
  this.showDefaultUi = !!selectedEntity.type;
  for (let c of this.defaultUi.all) {
    c.y = this.entityUi.all.length ? 86 : 40;
  }
  if (selectedEntity.energySource == ENERGY.burner) {
    this.defaultUi.fuelInventory.set(selectedEntity.fuelInventory);
    this.defaultUi.fuel.set(selectedEntity);
  } else {
    this.defaultUi.fuelInventory.set();
    this.defaultUi.fuel.set();
  }
  if (selectedEntity.energySource == ENERGY.windUp) {
    this.defaultUi.windUpButton.setButton(BUTTON.windUp);
    this.defaultUi.windUp.set(selectedEntity);
  } else {
    this.defaultUi.windUpButton.setButton(BUTTON.none);
    this.defaultUi.windUp.set();
  }
};

export {UiWindow};

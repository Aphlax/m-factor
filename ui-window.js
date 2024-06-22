import {UiInventory} from './ui-inventory.js';
import {UiProgress, UiResource} from './ui-components.js';
import {COLOR} from './ui-properties.js';
import {TYPE, RESOURCE_LABELS} from './entity-properties.js';

const OPEN_HEIGHT = 44 + 2 * 46;
const ANIMATION_SPEED = OPEN_HEIGHT / 100;

function UiWindow(ui, canvas) {
  this.ui = ui;
  
  this.canvasWidth = canvas.width;
  this.canvasHeight = canvas.height;
  this.x = 0;
  this.y = this.canvasHeight;
  this.xTarget = this.x;
  this.yTarget = this.y;
  this.lastUpdate = 0;
  
  this.selectedEntity = undefined;
  this.entityUis = new Map();
  this.entityUi = undefined;
}

UiWindow.prototype.update = function(time) {
  const dt = time - this.lastUpdate;
  if (this.x != this.xTarget) {
    let diff = this.xTarget - this.x;
    if (Math.abs(diff) > ANIMATION_SPEED * dt) {
      diff *= ANIMATION_SPEED * dt / Math.abs(diff);
    }
    this.x += diff;
  }
  if (this.y != this.yTarget) {
    let diff = this.yTarget - this.y;
    if (Math.abs(diff) > ANIMATION_SPEED * dt) {
      diff *= ANIMATION_SPEED * dt / Math.abs(diff);
    }
    this.y += diff;
  }
  this.lastUpdate = time;
};

UiWindow.prototype.draw = function(ctx, time) {
  if (this.y == this.canvasHeight) return;
  
  const width = this.canvasWidth;
  const y = this.y;
  ctx.fillStyle = COLOR.background2;
  ctx.fillRect(0, y + 32, width, this.canvasHeight - y - 32);
  ctx.fillStyle = COLOR.background1;
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
  ctx.moveTo(width / 2 - 22, y + 16);
  ctx.lineTo(width / 2 + 22, y + 16);
  ctx.strokeStyle = COLOR.primary;
  ctx.lineWidth = 4;
  ctx.lineCaps = "round";
  ctx.stroke();
  
  if (this.entityUi) {
    this.entityUi.all.forEach(c => c.draw(ctx, time));
  }
};

UiWindow.prototype.initialize = function() {
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
    output: new UiInventory(this, this.canvasWidth - 50, 40),
    progress: new UiProgress(this, 56, 40)
        .setWidth(this.canvasWidth - 112),
  });
  
  this.entityUis.set(TYPE.assembler, {
    input: new UiInventory(this, 10, 40),
    output: new UiInventory(this, this.canvasWidth - 50, 40),
    progress: new UiProgress(this, 56, 40)
        .setWidth(this.canvasWidth - 112),
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
  if (!this.selectedEntity) {
    this.yTarget = this.canvasHeight;
    return;
  }
  this.yTarget = this.canvasHeight - OPEN_HEIGHT;
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
    this.entityUi.output.x = this.canvasWidth - 4 -
        selectedEntity.outputInventory.capacity * 46;
    this.entityUi.progress.set(selectedEntity);
    this.entityUi.progress.x = 10 +
        selectedEntity.inputInventory.capacity * 46;
    this.entityUi.progress.width = this.canvasWidth - 20 -
        46 * (selectedEntity.inputInventory.capacity +
        selectedEntity.outputInventory.capacity);
  } else if (selectedEntity.type == TYPE.lab) {
    this.entityUi.inventory.set(selectedEntity.inputInventory);
  }
};

export {UiWindow};

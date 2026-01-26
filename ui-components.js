import {COLOR} from './ui-properties.js';
import {STATE, RESOURCE_NAMES} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {CHOICE} from './ui-choice.js';
import {ITEMS, FLUIDS, I} from './item-definitions.js';

function UiProgress(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.entity = undefined;
  this.width = 0;
}

UiProgress.prototype.set = function(entity) {
  this.entity = entity;
};

UiProgress.prototype.setWidth = function(width) {
  this.width = width;
  return this;
};

UiProgress.prototype.draw = function(ctx, time) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  let progress = 0;
  if (this.entity.state == STATE.running ||
      this.entity.state == STATE.outOfEnergy) {
    progress = (time - this.entity.taskStart) /
        (this.entity.taskEnd - this.entity.taskStart)
  } else if (this.entity.state == STATE.outputFull ||
      this.entity.state == STATE.itemReady) {
    progress = 1;
  }
  
  ctx.fillStyle = COLOR.background3;
  ctx.fillRect(x, y, this.width, 40);
  ctx.fillStyle = COLOR.progressBar;
  ctx.fillRect(x + 2, y + 2, (this.width - 4) * progress, 36);
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.strokeRect(x, y, this.width, 40);
  
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "end";
  ctx.fillStyle = this.entity.state == STATE.running ||
      this.entity.state == STATE.itemReady ?
      COLOR.primary : COLOR.secondary;
  ctx.fillText(Math.floor(progress * 100) + "%", x + this.width - 5, y + 21);
  ctx.textAlign = "start";
  window.numberOtherDraws += 3;
};

function UiResource(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.resource = undefined;
}

UiResource.prototype.set = function(resource) {
  this.resource = resource;
};

UiResource.prototype.draw = function(ctx) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  ctx.fillStyle = COLOR.background3;
  ctx.fillRect(x, y, 40, 40);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, 40, 40);
  ctx.clip();
  const sprite = SPRITES.get(this.resource.sprite);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y,
      sprite.width, sprite.height,
      x - 4, y - 4, 48, 48);
  window.numberImageDraws++;
  ctx.restore();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.strokeRect(x, y, 40, 40);
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOR.primary;
  const text = this.resource.amount +
      (this.resource.id == RESOURCE_NAMES.crudeOil ? "/s" : "");
  ctx.fillText(text, x + 48, y + 21);
  window.numberOtherDraws += 3;
};

function UiFuel(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.entity = undefined;
}

UiFuel.prototype.set = function(entity) {
  this.entity = entity;
};

UiFuel.prototype.draw = function(ctx, time) {
  if (!this.entity) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  const fuelItem = this.entity.fuelInventory?.items[0];
  const maxFuel = fuelItem ?
      ITEMS.get(fuelItem).fuelValue : 
      ITEMS.get(I.coal).fuelValue;
  const current = (this.entity.state == STATE.outOfEnergy ? 0 :
      this.entity.energyStored) - 
      (this.entity.state != STATE.running ? 0 :
      Math.max(time - this.entity.taskStart, 0) /
      1000 * this.entity.energyConsumption);
  const height = Math.min(36, Math.max(0,
      Math.ceil(current / maxFuel * 36)));
  
  ctx.fillStyle = COLOR.background3;
  ctx.fillRect(x, y, 6, 40);
  ctx.fillStyle = "#FF7700";
  ctx.fillRect(x + 2, y + 40 - 2 - height, 2, height);
  ctx.strokeStyle = COLOR.border2;
  ctx.strokeRect(x, y, 6, 40);
  window.numberOtherDraws += 3;
};

function UiWindUp(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.entity = undefined;
}

UiWindUp.prototype.set = function(entity) {
  this.entity = entity;
};

UiWindUp.prototype.draw = function(ctx, time) {
  if (!this.entity) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  ctx.fillStyle = COLOR.primary;
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(Math.floor(this.entity.energyStored), x, y + 21);
  window.numberOtherDraws += 1;
};

function UiFluidIndicator(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.entity = undefined;
}

UiFluidIndicator.prototype.set = function(entity) {
  this.entity = entity;
};

UiFluidIndicator.prototype.draw = function(ctx, time) {
  if (!this.entity?.data.channel) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  ctx.fillStyle = COLOR.background3;
  ctx.fillRect(x, y, 40, 40);
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.strokeRect(x, y, 40, 40);
  
  ctx.fillStyle = COLOR.primary;
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  const xOffset =
      ctx.measureText(this.entity.data.channel.capacity).width -
      ctx.measureText(this.entity.data.channel.amount).width;
  const text = this.entity.data.channel.amount +
      "/" + this.entity.data.channel.capacity;
  ctx.fillText(text, x + 46 + xOffset, y + 21);
  window.numberOtherDraws += 3;
  
  if (!this.entity.data.channel.fluid) return;
  const fluid = FLUIDS.get(this.entity.data.channel.fluid);
  const sprite = fluid && SPRITES.get(fluid.sprite);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y,
      sprite.width, sprite.height,
      x + 5, y + 5, 32, 32);
  window.numberImageDraws++;
};

function UiSplitterPriority(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.entity = undefined;
  this.pressed = 0;
}

const SPLITTER_BUTTON_WIDTH = [47, 48, 57];

UiSplitterPriority.prototype.set = function(entity) {
  this.entity = entity;
};

UiSplitterPriority.prototype.draw = function(ctx, time) {
  if (!this.entity) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  ctx.fillStyle = COLOR.background3;
  ctx.fillRect(x + 70, y, 160, 40);
  ctx.fillRect(x + 70, y + 46, 160, 40);
  ctx.fillRect(x + 70 + 164, y, 40, 40);
  
  ctx.fillStyle = COLOR.buttonBackgroundPressed;
  if (this.pressed == 7) {
    ctx.fillRect(x + 70 + 164, y, 40, 40);
  } else if (this.pressed) {
    const sel = (this.pressed - 1) % 3;
    let i = 0, dx = 0, dy = this.pressed <= 3 ? 0 : 46;
    while (i < sel) dx += SPLITTER_BUTTON_WIDTH[i++];
    ctx.fillRect(x + 72 + i * 2 + dx, y + 2 + dy, SPLITTER_BUTTON_WIDTH[i], 36);
  }
  
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.strokeRect(x + 70, y, 160, 40);
  ctx.strokeRect(x + 70, y + 46, 160, 40);
  ctx.strokeRect(x + 70 + 164, y, 40, 40);
  
  ctx.fillStyle = COLOR.buttonBackground;
  ctx.strokeStyle = COLOR.buttonBorder;
  const outSel = 1 + (this.entity.data.outputPriority ?? 0);
  let i = 0, dx = 0;
  while (i < outSel) dx += SPLITTER_BUTTON_WIDTH[i++];
  if (this.pressed != outSel + 1)
    ctx.fillRect(x + 72 + i * 2 + dx, y + 2, SPLITTER_BUTTON_WIDTH[i], 36);
  ctx.strokeRect(x + 72 + i * 2 + dx, y + 2, SPLITTER_BUTTON_WIDTH[i], 36);
  const inSel = 1 + (this.entity.data.inputPriority ?? 0);
  i = 0, dx = 0;
  while (i < inSel) dx += SPLITTER_BUTTON_WIDTH[i++];
  if (this.pressed != inSel + 4)
    ctx.fillRect(x + 72 + i * 2 + dx, y + 48, SPLITTER_BUTTON_WIDTH[i], 36);
  ctx.strokeRect(x + 72 + i * 2 + dx, y + 48, SPLITTER_BUTTON_WIDTH[i], 36);
  
  ctx.fillStyle = COLOR.primary;
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillText("OUTPUT", x, y + 22);
  ctx.fillText("LEFT", x + 76, y + 22);
  ctx.fillText("-", x + 140, y + 22);
  ctx.fillText("RIGHT", x + 176, y + 22);
  ctx.fillText("INPUT", x, y + 68);
  ctx.fillText("LEFT", x + 76, y + 68);
  ctx.fillText("-", x + 140, y + 68);
  ctx.fillText("RIGHT", x + 176, y + 68);
  window.numberOtherDraws += 19;
  
  if (this.entity.data.itemFilter) {
    const item = ITEMS.get(this.entity.data.itemFilter);
    const sprite = item && SPRITES.get(item.sprite);
    ctx.drawImage(sprite.image,
        sprite.x, sprite.y,
        sprite.width, sprite.height,
        x + 70 + 164 + 4, y + 5, 32, 32);
    window.numberImageDraws++;
  }
}

UiSplitterPriority.prototype.touchStart = function(e) {
  if (!this.entity) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  const {clientX: px, clientY: py} = e.touches[0];
 
  if (x + 70 > px || px > x + 274 ||
      y > py || py > y + 86 ||
      (py > y + 40 && py < y + 46)) return;
  if (px > x + 230) {
    this.pressed = py <= y + 40 ? 7 : 0;
    return;
  }
  const dy = py <= y + 40 ? 0 : 3;
  this.pressed = dy + (px < x + 120 ? 1 :
      (px < x + 170 ? 2 : 3));
};

UiSplitterPriority.prototype.touchMove = function(e) {
  if (this.pressed) {
    this.pressed = 0;
  }
};

UiSplitterPriority.prototype.touchEnd = function(e) {
  if (!this.pressed) return;
  if (this.pressed == 7) {
    this.parent.entityUi.filterChoice.openChoice(
        CHOICE.splitterItemFilter, this.entity);
    this.pressed = 0;
    return;
  } else if (this.pressed <= 3) {
    this.entity.data.outputPriority = this.pressed - 2;
    if (this.entity.data.itemFilter &&
        !this.entity.data.outputPriority) {
      this.entity.data.itemFilter = undefined;
    }
  } else {
    this.entity.data.inputPriority = this.pressed - 5;
  }
  this.pressed = 0;
}

function UiInserterFilters(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.entity = undefined;
  this.pressed = 0;
}

UiInserterFilters.prototype.set = function(entity) {
  this.entity = entity;
};

UiInserterFilters.prototype.draw = function(ctx, time) {
  if (!this.entity) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  const filters = this.entity.data.itemFilters;
  const mode = this.entity.data.filterMode;
  
  ctx.fillStyle = COLOR.background3;
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.fillRect(x, y, 126, 40);
  ctx.strokeRect(x, y, 126, 40);
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(x + 130 + i * 44, y, 40, 40);
    ctx.strokeRect(x + 130 + i * 44, y, 40, 40);
  }
  
  if (filters) {
    ctx.fillStyle = COLOR.buttonBackground;
    ctx.strokeStyle = COLOR.buttonBorder;
    ctx.fillRect(x + 2 + (mode ? 0 : 1) * 62, y + 2, 60, 36);
    ctx.strokeRect(x + 2 + (mode ? 0 : 1) * 62, y + 2, 60, 36);
  }
  
  ctx.fillStyle = COLOR.buttonBackgroundPressed;
  if (this.pressed && this.pressed <= 2) {
    ctx.fillRect(x + 2 + (this.pressed - 1) * 62, y + 2, 60, 36);
  } else if (this.pressed) {
    ctx.fillRect(x + 131 + (this.pressed - 3) * 44, y + 1, 38, 38);
  }
  
  ctx.fillStyle = COLOR.primary;
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillText("ALLOW", x + 6, y + 22);
  ctx.fillText("BLOCK", x + 71, y + 22);
  window.numberOtherDraws += 19;
  
  if (filters) {
    for (let i = 0; i < 5; i++) {
      if (!filters[i]) continue;
      const item = ITEMS.get(filters[i]);
      const sprite = item && SPRITES.get(item.sprite);
      ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          x + 130 + i * 44 + 4, y + 5, 32, 32);
      window.numberImageDraws++;
    }
  }
}

UiInserterFilters.prototype.touchStart = function(e) {
  if (!this.entity) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  const {clientX: px, clientY: py} = e.touches[0];
 
  if (px < x || px > x + 347 ||
      py < y || py > y + 40) return;
  if (px < x + 126) {
    this.pressed = 1 + Math.floor((px - x) / 63);
  } else {
    this.pressed = 3 + Math.floor((px - x - 128) / 44);
  }
};

UiInserterFilters.prototype.touchMove = function(e) {
  if (this.pressed) {
    this.pressed = 0;
  }
};

UiInserterFilters.prototype.touchEnd = function(e) {
  if (!this.pressed) return;
  if (this.pressed <= 2) {
    if (!this.entity.data.itemFilters) {
      this.parent.entityUi.filterChoice.openChoice(
          CHOICE.inserterItemFilter, this.entity, 0);
    }
    this.entity.data.filterMode = !(this.pressed - 1);
    this.pressed = 0;
    return;
  }
  if (this.entity.data.filterMode === undefined) {
    this.entity.data.filterMode = true;
  }
  this.parent.entityUi.filterChoice.openChoice(
      CHOICE.inserterItemFilter, this.entity, this.pressed - 3);
  this.pressed = 0;
}

export {UiProgress, UiResource, UiFuel, UiWindUp, UiFluidIndicator, UiSplitterPriority, UiInserterFilters};

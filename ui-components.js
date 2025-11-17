import {COLOR} from './ui-properties.js';
import {STATE} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
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
  ctx.fillStyle = this.entity.state == STATE.running ?
      COLOR.primary : COLOR.secondary;
  ctx.fillText(Math.floor(progress * 100) + "%", x + this.width - 5, y + 21);
  ctx.textAlign = "start";
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
  ctx.restore();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.strokeRect(x, y, 40, 40);
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText(this.resource.amount, x + 48, y + 21);
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
  const current = this.entity.energyStored - 
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
  
  if (!this.entity.data.channel.fluid) return;
  const fluid = FLUIDS.get(this.entity.data.channel.fluid);
  const sprite = fluid && SPRITES.get(fluid.sprite);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y,
      sprite.width, sprite.height,
      x + 5, y + 5, 32, 32);
};

export {UiProgress, UiResource, UiFuel, UiWindUp, UiFluidIndicator};

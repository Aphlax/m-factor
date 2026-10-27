import {COLOR} from './ui-properties.js';
import {ITEMS, FLUIDS} from './item-definitions.js';
import {SPRITES} from './sprite-pool.js';

function UiInventory(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.inventory = undefined;
  this.isOutput = false;
  this.wrap = 100;
  this.start = 0;
  this.end = 100;
}

UiInventory.prototype.set = function(inventory) {
  this.inventory = inventory;
  return this;
};

UiInventory.prototype.setIsOutput = function(isOutput) {
  this.isOutput = isOutput;
  return this;
};

UiInventory.prototype.setWrap = function(wrap) {
  this.wrap = wrap;
  return this;
};

UiInventory.prototype.setPart = function(start, end) {
  this.start = start;
  this.end = end ?? 100;
  return this;
};

UiInventory.prototype.draw = function(ctx) {
  if (!this.inventory) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.font = "16px monospace";
  ctx.textAlign = "end";
  ctx.textBaseline = "middle";
  const amount = (this.end < this.inventory.capacity ? this.end : this.inventory.capacity) - this.start;
  const rows = Math.ceil(amount / this.wrap);
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < this.wrap && i + row * this.wrap < amount; i++) {
      const j = this.start + i + row * this.wrap;
      const isFull = this.inventory.amounts[j] >= this.inventory.filters?.[j]?.amount * 2;
      ctx.fillStyle = isFull && this.isOutput ?
          "#686028" : COLOR.background3;
      ctx.fillRect(x + i * 46, y + row * 46, 40, 40);
      ctx.strokeRect(x + i * 46, y + row * 46, 40, 40);
      if (!this.inventory.items[j] && 
          this.inventory.filters?.length != this.inventory.capacity)
        continue;
      const item = this.inventory.items[j] ?? this.inventory.filters[j].item;
      if (item <= 0) continue;
      const itemDef = ITEMS.get(item);
      const sprite = SPRITES.get(itemDef.sprite);
      if (!this.inventory.items[j]) {
        ctx.globalAlpha = 0.4;
      }
      ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          x + i * 46 + 5, y + row * 46 + 5, 32, 32);
      if (!this.inventory.items[j]) {
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = COLOR.primary;
        ctx.fillText(this.inventory.amounts[j],
            x + i * 46 + 37, y + row * 46 + 32);
      }
    }
  }
  ctx.textAlign = "start";
};

function UiFluidInventory(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.tank = undefined;
}

UiFluidInventory.prototype.set = function(tank) {
  this.tank = tank;
};

UiFluidInventory.prototype.draw = function(ctx) {
  if (!this.tank) return;
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.font = "16px monospace";
  ctx.textAlign = "end";
  ctx.textBaseline = "middle";
  for (let i = 0; i < this.tank.tanklets.length; i++) {
    const tanklet = this.tank.tanklets[i];
    ctx.fillStyle = COLOR.background3;
    ctx.fillRect(x + i * 46, y, 40, 40);
    ctx.strokeRect(x + i * 46, y, 40, 40);
    const itemDef = FLUIDS.get(tanklet.fluid);
    const sprite = SPRITES.get(itemDef.sprite);
    ctx.drawImage(sprite.image,
        sprite.x, sprite.y,
        sprite.width, sprite.height,
        x + i * 46 + 5, y + 5, 32, 32);
    window.numberImageDraws++;
    ctx.fillStyle = COLOR.primary;
    ctx.fillText(Math.floor(tanklet.amount),
        x + i * 46 + 37, y + 32);
    window.numberOtherDraws += 3;
  }
  ctx.textAlign = "start";
};

export {UiInventory, UiFluidInventory};

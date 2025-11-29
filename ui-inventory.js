import {COLOR} from './ui-properties.js';
import {ITEMS, FLUIDS} from './item-definitions.js';
import {SPRITES} from './sprite-pool.js';

function UiInventory(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.inventory = undefined;
  this.isOutput = false;
}

UiInventory.prototype.set = function(inventory) {
  this.inventory = inventory;
};

UiInventory.prototype.setIsOutput = function(isOutput) {
  this.isOutput = isOutput;
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
  for (let i = 0; i < this.inventory.capacity; i++) {
    const isFull = this.inventory.amounts[i] >= this.inventory.filters?.[i]?.amount * 2;
    ctx.fillStyle = isFull && this.isOutput ?
        "#686028" : COLOR.background3;
    ctx.fillRect(x + i * 46, y, 40, 40);
    ctx.strokeRect(x + i * 46, y, 40, 40);
    if (this.inventory.items[i] || this.inventory.filters?.length == this.inventory.capacity) {
      const item = this.inventory.items[i] ?? this.inventory.filters[i].item;
      const itemDef = ITEMS.get(item);
      const sprite = SPRITES.get(itemDef.sprite);
      if (!this.inventory.items[i]) {
        ctx.globalAlpha = 0.4;
      }
      ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          x + i * 46 + 5, y + 5, 32, 32);
      if (!this.inventory.items[i]) {
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = COLOR.primary;
        ctx.fillText(this.inventory.amounts[i],
            x + i * 46 + 37, y + 32);
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

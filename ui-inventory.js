import {COLOR} from './ui-properties.js';
import {ITEMS} from './item-definitions.js';
import {SPRITES} from './sprite-pool.js';

function UiInventory(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  this.inventory = undefined;
}

UiInventory.prototype.set = function(inventory) {
  this.inventory = inventory;
};

UiInventory.prototype.draw = function(ctx) {
  const x = this.parent.x + this.x,
        y = this.parent.y + this.y;
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.font = "16px monospace";
  ctx.textAlign = "end";
  ctx.textBaseline = "middle";
  for (let i = 0; i < this.inventory.capacity; i++) {
    ctx.fillStyle = COLOR.background3;
    ctx.fillRect(x + i * 46, y, 40, 40);
    ctx.strokeRect(x + i * 46, y, 40, 40);
    if (this.inventory.items[i]) {
      const itemDef = ITEMS.get(this.inventory.items[i]);
      const sprite = SPRITES.get(itemDef.sprite);
      ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          x + i * 46 + 5, y + 5, 32, 32);
      ctx.fillStyle = COLOR.primary;
      ctx.fillText(this.inventory.amounts[i],
          x + i * 46 + 37, y + 32);
    }
  }
  ctx.textAlign = "start";
};

export {UiInventory};

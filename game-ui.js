import {TYPE, RESOURCE_LABELS} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';


const EXPAND_HEIGHT = 90;
const COLOR = {
  background1: "#333335",
  background2: "#373739",
  background3: "#454550",
  border1: "#282830",
  border2: "#555565",
  primary: "#FFFBF8",
  yellowHighlight: "#EEEE00",
  yellowHighlightBorder: "#FFAA00",
};

function GameUi(gameMap) {
  this.gameMap = gameMap;
  this.extended = false;
  this.animationEnd = 0;
}

GameUi.prototype.update = function(time) {
  if (!!this.gameMap.selectedEntity != this.extended) {
    this.extended = !!this.gameMap.selectedEntity;
    this.animationEnd = time + 100;
  }
}

GameUi.prototype.drawSelection = function(ctx, view, selection) {
  const x = selection.x * view.scale - view.x;
  const width = (selection.width ?? 1) * view.scale;
  const y = selection.y * view.scale - view.y;
  const height = (selection.height ?? 1) * view.scale;
  if (x + width <= -2 || x > view.width + 2 ||
      y + height <= -2 || y > view.height + 2)
    return;
  const d = 0.3 * view.scale;
  ctx.beginPath();
  ctx.moveTo(x, y + d);
  ctx.lineTo(x, y);
  ctx.lineTo(x + d, y);
  ctx.moveTo(x + width, y + d);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width - d, y);
  ctx.moveTo(x, y + height - d);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + d, y + height);
  ctx.moveTo(x + width, y + height - d);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width - d, y + height);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = COLOR.yellowHighlightBorder;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = COLOR.yellowHighlight;
  ctx.lineWidth = 2;
  ctx.stroke();
}

GameUi.prototype.draw = function(ctx, time) {
  let height;
  if (time > this.animationEnd) {
    height = this.extended ? EXPAND_HEIGHT : 0;
  } else {
    height = (this.animationEnd - time) / 100 * EXPAND_HEIGHT;
    if (this.extended) {
      height = EXPAND_HEIGHT - height;
    }
  }
  
  const width = ctx.canvas.width;
  const y = ctx.canvas.height - height;
  ctx.fillStyle = COLOR.background2;
  ctx.fillRect(0, y + 32, width, height - 32);
  ctx.fillStyle = COLOR.background1;
  ctx.fillRect(0, y, width, 32);
  ctx.strokeStyle = COLOR.border1;
  ctx.lineWidth = 1;
  ctx.strokeRect(-2, y, width + 4, 32);
  
  ctx.beginPath();
  ctx.moveTo(width / 2 - 22, y + 16);
  ctx.lineTo(width / 2 + 22, y + 16);
  ctx.strokeStyle = COLOR.primary;
  ctx.lineWidth = 4;
  ctx.lineCaps = "round";
  ctx.stroke();
  
  if (this.gameMap.selectedEntity?.type) {
    this.drawEntityUi(ctx, this.gameMap.selectedEntity,
        0, y, width, height);
  } else if (this.gameMap.selectedEntity?.id) {
    this.drawResourceUi(ctx, this.gameMap.selectedEntity,
        0, y, width, height);
  }
};

GameUi.prototype.drawEntityUi = function(ctx, entity, x, y, width, height) {
  ctx.font = "20px monospace";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText(entity.label, 8, y + 17);
  if (entity.type == TYPE.mine) {
    
  } else if (entity.type == TYPE.chest) {
    this.drawInventory(ctx, entity.inputInventory,
        x + 16, y + 40, width - 32, height - 64);
  }
};

GameUi.prototype.drawResourceUi = function(ctx, resource, x, y, width, height) {
  ctx.font = "20px monospace";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText(RESOURCE_LABELS[resource.id], 8, y + 17);
  ctx.fillStyle = COLOR.background3;
  ctx.fillRect(x + 10, y + 40, 40, 40);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 10, y + 40, 40, 40);
  ctx.clip();
  const sprite = SPRITES.get(resource.sprite);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y,
      sprite.width, sprite.height,
      x + 6, y + 36, 48, 48);
  ctx.restore();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.strokeRect(x + 10, y + 40, 40, 40);
  ctx.font = "16px monospace";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText(resource.amount, 58, y + 38 + 23);
};

GameUi.prototype.drawInventory = function(ctx, inventory, x, y, width, height) {
  for (let i = 0; i < inventory.capacity; i++) {
    ctx.fillStyle = COLOR.background3;
    ctx.fillRect(x + i * 46, y, 40, 40);
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLOR.border2;
    ctx.strokeRect(x + i * 46, y, 40, 40);
    if (inventory.items[i]) {
      const itemDef = ITEMS.get(inventory.items[i]);
      const sprite = SPRITES.get(itemDef.sprite);
      ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          x + i * 46 + 5, y + 5, 32, 32);
      ctx.font = "16px monospace";
      ctx.textAlign = "end";
      ctx.textBaseline = "middle";
      ctx.fillStyle = COLOR.primary;
      ctx.fillText(inventory.amounts[i],
          x + i * 46 + 37, y + 32);
      ctx.textAlign = "start";
    }
  }
};


export {GameUi};

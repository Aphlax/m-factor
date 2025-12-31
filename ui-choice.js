import {COLOR} from './ui-properties.js';
import {RECIPES} from './recipe-definitions.js';
import {ITEMS} from './item-definitions.js';
import {SPRITES, S} from './sprite-pool.js';

const CHOICE = {
  assemblerRecipe: 1,
  splitterItemFilter: 2,
};

function UiChoice(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  
  this.mode = 0;
  this.entity = undefined;
  this.choices = [];
  this.width = 10000;
  
  this.pressedIndex = -1;
}

UiChoice.prototype.setChoice = function(choice, entity) {
  this.mode = choice;
  if (entity.name != this.entity?.name) {
    let i = 0;
    if (choice == CHOICE.assemblerRecipe) {
      for (let r of RECIPES) {
        if (r.entities.includes(entity.name)) {
          const itemDef = ITEMS.get(r.outputs[0].item);
          const sprite = SPRITES.get(itemDef.sprite);
          if (!this.choices[i]) {
            this.choices.push({sprite, value: r});
          } else {
            this.choices[i].sprite = sprite;
            this.choices[i].value = r;
          }
          i++;
        }
      }
    } else if (choice == CHOICE.splitterItemFilter) {
      if (!this.choices[0]) this.choices[0] = {};
      this.choices[0].sprite = SPRITES.get(S.crossIcon);
      this.choices[0].value = undefined;
      i++;
      for (let itemDef of ITEMS.values()) {
        const sprite = SPRITES.get(itemDef.sprite);
        if (!this.choices[i]) {
          this.choices.push({sprite, value: itemDef.name});
        } else {
          this.choices[i].sprite = sprite;
          this.choices[i].value = itemDef.name;
        }
        i++;
      }
    }
    this.choices.length = i;
  }
  this.entity = entity;
  return this;
};

UiChoice.prototype.setWidth = function(width) {
  this.width = width;
  return this;
};

UiChoice.prototype.draw = function(ctx) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.buttonBorder;
  const columns = Math.floor((this.width + 6) / 46);
  const rows = Math.ceil(this.choices.length / columns);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const index = i * columns + j;
      if (index >= this.choices.length) return;
      ctx.fillStyle = index == this.pressedIndex ?
          COLOR.buttonBackgroundPressed : COLOR.buttonBackground;
      ctx.fillRect(x + j * 46, y + i * 46, 40, 40);
      ctx.strokeRect(x + j * 46, y + i * 46, 40, 40);
      window.numberOtherDraws += 2;
      const sprite = this.choices[index].sprite;
      ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          x + j * 46 + 5, y + i * 46 + 5, 32, 32);
      window.numberImageDraws++;
    }
  }
};

UiChoice.prototype.touchStart = function(e) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  const t = e.touches[0];
  const columns = Math.floor((this.width + 6) / 46);
  const rows = Math.ceil(this.choices.length / columns);
 
  if (x > t.clientX || t.clientX > x + 46 * columns - 6 ||
      y > t.clientY || t.clientY > y + 46 * rows - 6) return;
  
  if ((t.clientX - x) % 46 > 40) return;
  if ((t.clientY - y) % 46 > 40) return;
  
  const column = Math.floor((t.clientX - x) / 46);
  const row = Math.floor((t.clientY - y) / 46);
  if (row * columns + column >= this.choices.length) return;
  this.pressedIndex = row * columns + column;
};

UiChoice.prototype.touchMove = function(e) {
  if (this.pressedIndex != -1) {
    this.pressedIndex = -1;
  }
};

UiChoice.prototype.touchEnd = function(e) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  const t = e.changedTouches[0];
  const columns = Math.floor((this.width + 6) / 46);
  const rows = Math.ceil(this.choices.length / columns);
  
  if (x > t.clientX || t.clientX > x + 46 * columns - 6 ||
      y > t.clientY || t.clientY > y + 46 * rows - 6) return;
  
  if (this.pressedIndex == -1) return;
  
  if (this.mode == CHOICE.assemblerRecipe) {
    this.entity.setRecipe(
        this.choices[this.pressedIndex].value,
        this.parent.ui.game.playTime);
    // This extends the window to default height.
    this.parent.yTarget = this.parent.canvasHeight;
    this.parent.set(this.entity);
    this.parent.x = -this.parent.canvasWidth;
  } else if (this.mode == CHOICE.splitterItemFilter) {
    this.entity.data.itemFilter = 
        this.choices[this.pressedIndex].value;
    if (!this.entity.data.outputPriority) {
      this.entity.data.outputPriority = -1;
    }
    // This extends the window to default height.
    this.parent.yTarget = this.parent.canvasHeight;
    this.parent.set(this.entity);
    this.parent.x = -this.parent.canvasWidth;
  }
  
  this.pressedIndex = -1;
};

UiChoice.prototype.touchLong = function(e) {
  if (this.pressedIndex != -1) {
    this.pressedIndex = -1;
  }
};


export {UiChoice, CHOICE};

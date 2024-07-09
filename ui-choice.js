import {COLOR} from './ui-properties.js';
import {RECIPES} from './recipe-definitions.js';
import {NAME} from './entity-definitions.js';
import {ITEMS} from './item-definitions.js';
import {SPRITES} from './sprite-pool.js';

const CHOICE = {
  assemblerRecipe: 1,
};

function UiChoice(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  
  this.mode = 0;
  this.entity = undefined;
  this.choices = [];
  
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
    }
    this.choices.length = i;
  }
  this.entity = entity;
  return this;
};

UiChoice.prototype.draw = function(ctx) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.buttonBorder;
  for (let i = 0; i < this.choices.length; i++) {
    ctx.fillStyle = i == this.pressedIndex ?
      COLOR.buttonBackgroundPressed : COLOR.buttonBackground;
    ctx.fillRect(x + i * 46, y, 40, 40);
    ctx.strokeRect(x + i * 46, y, 40, 40);
    const sprite = this.choices[i].sprite;
    ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          x + i * 46 + 5, y + 5, 32, 32);
  }
};

UiChoice.prototype.touchStart = function(e) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  const t = e.touches[0];
 
  if (x > t.clientX || t.clientX > x + 46 * this.choices.length ||
      y > t.clientY || t.clientY > y + 40) return;
  
  if ((t.clientX - x) % 46 > 40) return;
  
  this.pressedIndex = Math.floor((t.clientX - x) / 46);
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
 
  if (x > t.clientX || t.clientX > x + 46 * this.choices.length - 6 ||
      y > t.clientY || t.clientY > y + 40) return;
  
  if (this.pressedIndex == -1) return;
  
  if (this.mode == CHOICE.assemblerRecipe) {
    this.entity.setRecipe(
        this.choices[this.pressedIndex].value,
        this.parent.ui.game.playTime);
    // This extends the window to default height.
    this.parent.yTarget = this.parent.canvasHeight;
    this.parent.set(this.entity);
    this.parent.x = -this.parent.canvasWidth;
  }
  
  this.pressedIndex = -1;
};

export {UiChoice, CHOICE};

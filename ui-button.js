import {COLOR} from './ui-properties.js';
import {SPRITES} from './sprite-pool.js';
import {CHOICE} from './ui-choice.js';

const BUTTON = {
  assemblerRecipe: 1,
  deleteEntity: 2,
  gameMenu: 3,
};

function UiButton(parent, x, y) {
  this.parent = parent;
  this.x = x;
  this.y = y;
  
  this.name = 0;
  this.sprite = 0;
  
  this.pressed = false;
}

UiButton.prototype.setButton = function(name, sprite) {
  this.name = name;
  this.sprite = sprite;
  return this;
};

UiButton.prototype.draw = function(ctx, time) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  
  ctx.fillStyle = this.pressed ?
      COLOR.buttonBackgroundPressed : COLOR.buttonBackground;
  ctx.fillRect(x, y, 40, 40);
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.buttonBorder;
  ctx.strokeRect(x, y, 40, 40);
  
  const sprite = SPRITES.get(this.sprite);
  ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          x + 4, y + 4, 32, 32)
};

UiButton.prototype.inBounds = function(t) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
 
  return !(x > t.clientX || t.clientX > x + 40 ||
      y > t.clientY || t.clientY > y + 40);
};

UiButton.prototype.touchStart = function(e) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  const t = e.touches[0];
 
  if (x > t.clientX || t.clientX > x + 40 ||
      y > t.clientY || t.clientY > y + 40) return;
  
  this.pressed = true;
};

UiButton.prototype.touchMove = function(e) {
  if (this.pressed) {
    this.pressed = false;
  }
};

UiButton.prototype.touchEnd = function(e) {
  const x = Math.floor(this.parent.x + this.x),
        y = Math.floor(this.parent.y + this.y);
  const t = e.changedTouches[0];
 
  if (x > t.clientX || t.clientX > x + 40 ||
      y > t.clientY || t.clientY > y + 40) return;
  
  if (!this.pressed) return;
  this.pressed = false;
  
  if (this.name == BUTTON.assemblerRecipe) {
    this.parent.entityUi.recipeChoice.setChoice(
        CHOICE.assemblerRecipe, this.parent.selectedEntity);
    this.parent.xTarget = -this.parent.canvasWidth;
    this.parent.yTarget = Math.max(150, this.parent.canvasHeight - 50 -
          46 * Math.ceil(this.parent.entityUi.recipeChoice.choices.length / 8));
    this.parent.animationSpeed = (this.parent.yTarget - this.parent.y) / 100;
  } else if(this.name == BUTTON.deleteEntity) {
    this.parent.ui.game.gameMap.deleteEntity(this.parent.selectedEntity);
    this.parent.set();
  } else if(this.name == BUTTON.gameMenu) {
    //this.parent.ui.game.saveGame();
    this.parent.ui.game.loadGame();
  }
};

UiButton.prototype.touchLong = function() {
  
};

export {UiButton, BUTTON};

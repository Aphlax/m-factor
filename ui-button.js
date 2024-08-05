import {COLOR} from './ui-properties.js';
import {SPRITES} from './sprite-pool.js';
import {CHOICE} from './ui-choice.js';
import {TYPE, STATE} from './entity-properties.js';

const BUTTON = {
  none: 0,
  assemblerRecipe: 1,
  deleteEntity: 2,
  gameMenu: 3,
  windUp: 4,
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
  this.sprite = sprite ?? this.sprite;
  return this;
};

UiButton.prototype.draw = function(ctx, time) {
  if (!this.name) return;
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
  if (!this.name) return;
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
  if (!this.name) return;
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
  } else if (this.name == BUTTON.deleteEntity) {
    this.parent.ui.game.gameMap.deleteEntity(this.parent.selectedEntity);
    this.parent.set();
  } else if (this.name == BUTTON.gameMenu) {
    this.parent.ui.game.openMenu();
  } else if (this.name == BUTTON.windUp) {
    const entity = this.parent.selectedEntity;
    entity.energyStored += Math.round(1 / entity.energyConsumption);
    const limit = entity.type == TYPE.mine ? 150 : 10;
    if (entity.energyStored > limit) {
      entity.energyStored = limit;
    }
    if (entity.state == STATE.noEnergy) {
      entity.nextUpdate = this.parent.ui.game.playTime;
    }
  }
};

UiButton.prototype.touchLong = function() {
  
};

export {UiButton, BUTTON};

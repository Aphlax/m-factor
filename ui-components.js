import {COLOR} from './ui-properties.js';
import {STATE} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';

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
  const x = this.parent.x + this.x,
        y = this.parent.y + this.y;
  
  let progress = 0;
  if (this.entity.state == STATE.running) {
    progress = (time - this.entity.taskStart) /
        (this.entity.nextUpdate - this.entity.taskStart)
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
  ctx.fillStyle = COLOR.primary;
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
  const x = this.parent.x + this.x,
        y = this.parent.y + this.y;
  
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
      x - 4, y -4, 48, 48);
  ctx.restore();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border2;
  ctx.strokeRect(x, y, 40, 40);
  ctx.font = "16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText(this.resource.amount, x + 48, y + 21);
};

export {UiProgress, UiResource};

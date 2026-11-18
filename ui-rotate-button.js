import {COLOR, SHORT_VIBRATE} from './ui-properties.js';
import {DIRECTION} from './entity-properties.js';


function UiRotateButton(ui, canvas) {
  this.ui = ui;
  this.x = canvas.width / 2 + 146;
  this.y = canvas.height - 155;
  
  this.direction = DIRECTION.north;
}

UiRotateButton.prototype.draw = function(ctx) {
  if (this.ui.window.height > 150) return false;
  ctx.globalAlpha = Math.max(0, Math.min(1, 1 - (this.ui.window.height - 50) / 100));
  ctx.fillStyle = COLOR.buildBackground;
  ctx.strokeStyle = COLOR.buildBorder;
  ctx.beginPath();
  ctx.arc(this.x, this.y, 40, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLOR.buildSingleBackground;
  ctx.strokeStyle = COLOR.buildSingleBorder;
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  const start = (2.5 + this.direction) * 0.5 * Math.PI;
  ctx.arc(this.x, this.y, 40, start, start + 0.5 * Math.PI);
  ctx.lineTo(this.x, this.y);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;
  window.numberOtherDraws += 4;
};

UiRotateButton.prototype.inBounds = function(t) {
  if (this.ui.window.height > 100) return false;
  const d = (t.clientX - this.x) ** 2 +
      (t.clientY - this.y) ** 2;
  return d < 1600;
};

UiRotateButton.prototype.touchStart = function(e) {
  if (e.touches.length == 1) {
    this.setDirectionFromTouch(e.touches[0]);
  }
};

UiRotateButton.prototype.touchMove = function(e, longTouch) {
  this.setDirectionFromTouch(e.touches[0]);
};

UiRotateButton.prototype.touchEnd = function(e, shortTouch) {
  this.setDirectionFromTouch(e.changedTouches[0]);
};

UiRotateButton.prototype.touchLong = function(e) {
  
};

UiRotateButton.prototype.setDirectionFromTouch = function(t) {
  const dx = t.clientX - this.x, dy = t.clientY - this.y;
  const oldDirection = this.direction;
  if (Math.abs(dx) > Math.abs(dy)) {
    this.direction = dx > 0 ? DIRECTION.east : DIRECTION.west;
  } else {
    this.direction = dy > 0 ? DIRECTION.south : DIRECTION.north;
  }
  if (oldDirection != this.direction) {
    navigator.vibrate(SHORT_VIBRATE);
  }
};

export {UiRotateButton};

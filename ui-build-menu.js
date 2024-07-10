import {COLOR} from './ui-properties.js';
import {S, SPRITES} from './sprite-pool.js';
import {NAME, ENTITIES} from './entity-definitions.js';

const BUILD_MENU = [
  NAME.burnerDrill,
  NAME.woodenChest,
  NAME.transportBelt,
  NAME.inserter,
  NAME.stoneFurnace,
  NAME.assemblingMachine1,
  NAME.lab,
];

function UiBuildMenu(ui, canvas) {
  this.ui = ui;
  
  this.canvasWidth = canvas.width;
  this.canvasHeight = canvas.height;
  
  this.x = 2;
  this.oldX = -1;
  this.dx = 0;
  this.dragX = 2;
  
  this.menu = BUILD_MENU.map(name => {
    const entity = ENTITIES.get(name);
    const x = 0, y = 0, size = 0;
    return {sprite: entity.icon, entity, x, y, size};
  });
  
  this.selectedIndex = -1;
}

UiBuildMenu.prototype.update = function(time, dt) {
  const target = Math.max(0, Math.min(this.menu.length - 1,
      Math.round(this.x + this.dx * 200)));
  if (this.x != target && !this.dragX) {
    const dx = target - this.x;
    this.x += Math.abs(dx) > 0.005 * dt ? dx / Math.abs(dx) * 0.005 * dt : dx;
    if (this.dx) {
      this.dx = Math.abs(this.dx) > 0.005 ? this.dx - Math.sign(this.dx) * 0.001 : 0;
    }
  }
  if (this.x != this.oldX) {
    const x = this.canvasWidth * 0.5,
        y = this.canvasHeight - 96;
    
    // Magnet to round numbers.
    const dmx = Math.round(this.x) - this.x;
    let mx = Math.abs(dmx) > 0.07 ? 0 :
        Math.sign(dmx) * 0.07 - dmx;
    if (Math.abs(mx) > Math.abs(dmx)) {
      mx *= Math.abs(dmx) / Math.abs(mx);
    }
    mx *= 0.9;
  
    for (let i = 0; i < this.menu.length; i++) {
      const d = Math.abs(i - this.x - mx);
      const size = (8 - d) * 4;
      if (size < 20) {
        if (this.menu[i].size) {
          this.menu[i].x = this.menu[i].y = 0;
          this.menu[i].size = 0;
        }
        continue;
      }
      const dy = 16 * d ** 2;
      const dx = (i - this.x - mx) * 80 *
          ((d / 3) * 0.8 + (1 - (d / 3)));
      this.menu[i].x = x + dx - size - 4;
      this.menu[i].y = y + dy - size - 4;
      this.menu[i].size = size * 2 + 8;
    }
    if (this.dragX) {
      this.dx = (this.x - this.oldX) / dt;
    }
    this.oldX = this.x;
  }
};

UiBuildMenu.prototype.draw = function(ctx) {
  for (let i = 0; i < this.menu.length; i++) {
    const size = this.menu[i].size;
    if (!size || this.menu[i].y >= this.canvasHeight) continue;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = i == this.selectedIndex ?
        COLOR.buildSingleBackground : COLOR.buildBackground;
    ctx.fillRect(this.menu[i].x, this.menu[i].y, size, size);
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = i == this.selectedIndex ?
        COLOR.buildSingleBorder : COLOR.buildBorder;
    ctx.lineWidth = i == this.selectedIndex ? 2 : 1;
    ctx.strokeRect(this.menu[i].x, this.menu[i].y, size, size);
    ctx.globalAlpha = 1;
    const sprite = SPRITES.get(this.menu[i].sprite);
    ctx.drawImage(sprite.image,
          sprite.x, sprite.y,
          sprite.width, sprite.height,
          this.menu[i].x + 4, this.menu[i].y + 4,
          size - 8, size - 8);
  }
  // return;
  ctx.beginPath();
  ctx.moveTo(0, this.canvasHeight - 30);
  ctx.lineTo(150, this.canvasHeight - 180);
  ctx.lineTo(243, this.canvasHeight - 180);
  ctx.lineTo(this.canvasWidth, this.canvasHeight - 30);
  ctx.stroke();
};

UiBuildMenu.prototype.inBounds = function(t) {
  const w = this.canvasWidth, h = this.canvasHeight;
  const a = Math.abs(t.clientX - w / 2) + Math.abs(t.clientY - (h - 30));
  const b1 = Math.abs(t.clientX - (w / 2 - 197)) + Math.abs(t.clientY - (h - 197 - 30));
  const b2 = Math.abs(t.clientX - (w / 2 + 197)) + Math.abs(t.clientY - (h - 197 - 30));
  return a < b1 && a < b2 && t.clientY > h - 180;
};

UiBuildMenu.prototype.touchStart = function(e) {
  this.dragX = e.touches[0].clientX + this.x * 60;
};

UiBuildMenu.prototype.touchMove = function(e, longTouch) {
  if (!longTouch) {
    this.x = Math.max(0, Math.min(this.menu.length - 1,
        (this.dragX - e.touches[0].clientX) / 60));
  }
};

UiBuildMenu.prototype.touchEnd = function(e, shortTouch) {
  if (shortTouch) {
    const t = e.changedTouches[0];
    for (let i = 0; i < this.menu.length; i++) {
      const r = this.menu[i];
      if (!r.size) continue;
      if (r.x <= t.clientX && t.clientX <= r.x + r.size &&
          r.y <= t.clientY && t.clientY <= r.y + r.size) {
        this.selectedIndex = i;
        break;
      }
    }
  }
  if (this.dragX) {
    this.dragX = 0;
  }
};

UiBuildMenu.prototype.touchLong = function(e) {
  
};

UiBuildMenu.prototype.getSelectedEntity = function() {
  return this.menu[this.selectedIndex]?.entity;
};

UiBuildMenu.prototype.entityBuilt = function() {
  this.selectedIndex = -1;
};

export {UiBuildMenu};

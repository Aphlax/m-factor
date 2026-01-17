import {COLOR, TOOL} from './ui-properties.js';
import {S, SPRITES} from './sprite-pool.js';
import {NAME} from './entity-properties.js';
import {ENTITIES} from './entity-definitions.js';

const TOOL_ICON = new Map([
  [TOOL.copy, S.copyIcon],
  [TOOL.paste, S.pasteIcon],
  [TOOL.bulldoze, S.bulldozeIcon],
]);

const BUILD_MENU = [
  TOOL.bulldoze,
  TOOL.paste,
  TOOL.copy,
  NAME.woodenChest,
  NAME.transportBelt,
  NAME.undergroundBelt,
  NAME.splitter,
  NAME.burnerInserter,
  NAME.inserter,
  NAME.fastInserter,
  NAME.longHandedInserter,
  NAME.smallElectricPole,
  NAME.pipe,
  NAME.pipeToGround,
  NAME.assemblingMachine1,
  NAME.burnerDrill,
  NAME.electricMiningDrill,
  NAME.stoneFurnace,
  NAME.electricFurnace,
  NAME.lab,
  NAME.offshorePump,
  NAME.boiler,
  NAME.steamEngine,
];
const DEACC = 50;

/*
  create blueprint, copy, paste, delete, upgrade, downgrade 6
  cliff explosives,
  chests, logistic chests, roboport 9
  belts, splitters, underground 9
  inserters, powerpoles 10
  assemblers, refinery, chem, lab, rocket silo 7
  pipes, pump, offshore pump 4
  rails, rail signals, train stop, loc, wagons 7
  mines, furnaces, pumpjack 6
  turbines, solars, boilers, accumulator, light, powerpoles 9
  atomic reactor & co 4
  logic, speaker, light, wire 7
  walls, turrets 7
*/

function UiBuildMenu(ui, canvas) {
  this.ui = ui;
  this.canvasWidth = canvas.width;
  this.canvasHeight = canvas.height;
  
  this.menu = BUILD_MENU.map(entry => {
    const x = 0, y = 0, size = 0;
    if (entry > 0) {
      const entity = ENTITIES.get(entry);
      if (!entity) throw new Error(`Can not find ${entry}.`);
      return {sprite: entity.icon, entity, x, y, size};
    } else {
      const sprite = TOOL_ICON.get(entry);
      return {sprite, tool: entry, x, y, size};
    }
  });
  
  this.x = 4;
  this.oldX = 0;
  this.dx = 0;
  this.dragX = 0;
  
  this.selectedIndex = -1;
}

UiBuildMenu.prototype.update = function(time, dt) {
  if (!this.dragX && this.dx) {
    const pos = this.x + this.dx * 0.5 * Math.abs(this.dx) / DEACC;
    const target = Math.max(0, Math.min(this.menu.length - 1,
        Math.round(pos)));
    if (Math.abs(pos - target) > 0.001) {
      this.dx = Math.sign(target - this.x) *
          Math.sqrt(Math.abs(target - this.x) * 2 * DEACC);
    }
    this.x += this.dx * dt * 0.001;
    if (Math.abs(this.dx) < DEACC * 0.05) {
      this.x = Math.round(this.x);
      this.dx = 0;
    } else {
      this.dx -= Math.sign(this.dx) * DEACC * dt * 0.001;
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
      this.dx = (this.x - this.oldX) / (dt * 0.001);
    }
    this.oldX = this.x;
  }
};

UiBuildMenu.prototype.draw = function(ctx) {
  for (let i = 0; i < this.menu.length; i++) {
    const size = this.menu[i].size;
    if (!size || this.menu[i].y >= this.canvasHeight) continue;
    ctx.fillStyle = i == this.selectedIndex ?
        COLOR.buildSingleBackground : COLOR.buildBackground;
    ctx.fillRect(this.menu[i].x, this.menu[i].y, size, size);
    ctx.strokeStyle = i == this.selectedIndex ?
        COLOR.buildSingleBorder : COLOR.buildBorder;
    ctx.lineWidth = i == this.selectedIndex ? 2 : 1;
    ctx.strokeRect(this.menu[i].x, this.menu[i].y, size, size);
    window.numberOtherDraws += 2;
    const sprite = SPRITES.get(this.menu[i].sprite);
    ctx.drawImage(sprite.image,
        sprite.x, sprite.y,
        sprite.width, sprite.height,
        this.menu[i].x + 4, this.menu[i].y + 4,
        size - 8, size - 8);
    window.numberImageDraws++;
  }
  // return;
  ctx.beginPath();
  ctx.moveTo(0, this.canvasHeight - 30);
  ctx.lineTo(150, this.canvasHeight - 180);
  ctx.lineTo(243, this.canvasHeight - 180);
  ctx.lineTo(this.canvasWidth, this.canvasHeight - 30);
  ctx.stroke();
  window.numberOtherDraws++;
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
        if (this.selectedIndex == i) {
          this.setSelectedEntry();
          break;
        }
        this.setSelectedEntry(r);
        break;
      }
    }
  }
  if (this.dragX) {
    this.dragX = 0;
  }
};

UiBuildMenu.prototype.touchLong = function(e) {
  const t = e.touches[0];
  for (let i = 0; i < this.menu.length; i++) {
    const r = this.menu[i];
    if (!r.size) continue;
    if (r.x <= t.clientX && t.clientX <= r.x + r.size &&
        r.y <= t.clientY && t.clientY <= r.y + r.size) {
      this.setSelectedEntry(r);
      break;
    }
  }
};

UiBuildMenu.prototype.setSelectedEntry = function(entry) {
  if (!entry) {
    this.selectedIndex = -1;
    this.ui.gameMapInput.resetMode();
    return;
  }
  const i = this.menu.indexOf(entry);
  if (i == -1) return;
  this.selectedIndex = i;
  if (this.x != i) {
    this.dx = Math.sign(i - this.x) * Math.sqrt(Math.abs(i - this.x) * 2 * DEACC);
  }
  
  if (entry.entity?.name == NAME.offshorePump) {
    this.ui.gameMapInput.setOffshorePumpMode(entry.entity);
  } else if (entry.tool == TOOL.paste) {
    this.ui.gameMapInput.setPasteTool();
  } else {
    this.ui.gameMapInput.resetMode();
  }
};

UiBuildMenu.prototype.getSelectedEntry = function() {
  return this.menu[this.selectedIndex];
};

UiBuildMenu.prototype.trySelectEntry = function(name) {
  if (!name) return;
  for (let entry of this.menu) {
    if (entry.entity?.name == name || entry.tool == name) {
      this.setSelectedEntry(entry);
      break;
    }
  }
};

UiBuildMenu.prototype.entityBuilt = function() {
  
};

UiBuildMenu.prototype.reset = function() {
  this.setSelectedEntry();
};

export {UiBuildMenu};

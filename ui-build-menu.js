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
  NAME.ironChest,
  NAME.steelChest,
  NAME.storageChest,
  NAME.passiveProviderChest,
  NAME.requesterChest,
  NAME.activeProviderChest,
  NAME.bufferChest,
  NAME.roboport,
  NAME.transportBelt,
  NAME.undergroundBelt,
  NAME.splitter,
  NAME.fastTransportBelt,
  NAME.fastUndergroundBelt,
  NAME.fastSplitter,
  NAME.expressTransportBelt,
  NAME.expressUndergroundBelt,
  NAME.expressSplitter,
  NAME.burnerInserter,
  NAME.inserter,
  NAME.fastInserter,
  NAME.longHandedInserter,
  NAME.smallElectricPole,
  NAME.mediumElectricPole,
  NAME.bigElectricPole,
  NAME.substation,
  NAME.accumulator,
  NAME.solarPanel,
  NAME.pipe,
  NAME.pipeToGround,
  NAME.storageTank,
  NAME.pump,
  NAME.assemblingMachine1,
  NAME.assemblingMachine2,
  NAME.assemblingMachine3,
  NAME.oilRefinery,
  NAME.chemicalPlant,
  NAME.centrifuge,
  NAME.burnerDrill,
  NAME.electricMiningDrill,
  NAME.pumpjack,
  NAME.stoneFurnace,
  NAME.steelFurnace,
  NAME.electricFurnace,
  NAME.lab,
  NAME.offshorePump,
  NAME.boiler,
  NAME.steamEngine,
  NAME.rail,
  NAME.trainStop,
  NAME.railSignal,
  NAME.railChainSignal,
  NAME.rocketSilo,
  NAME.radar,
  NAME.constantCombinator,
  NAME.arithmeticCombinator,
  NAME.deciderCombinator,
  NAME.powerSwitch,
  NAME.programmableSpeaker,
  NAME.lamp,
  NAME.nuclearReactor,
  NAME.heatPipe,
  NAME.heatExchanger,
  NAME.steamTurbine,
];
const DEACC = 50;

/*
  create blueprint, copy, paste, delete, upgrade, downgrade 6
  chests, logistic chests, roboport 9
  belts, splitters, underground 9
  inserters 4
  powerpoles 5
  assemblers, refinery, chem, lab, rocket silo 7
  pipes, pump, offshore pump 4
  rails, rail signals, train stop, loc, wagons 7
  mines, furnaces, pumpjack 6
  turbines, solars, boilers, accumulator, powerpoles 9
  nuclear reactor & co 5
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
  
  this.scroller = new Scroller(BUILD_MENU.length, 23)
  
  this.selectedIndex = -1;
}

UiBuildMenu.prototype.update = function(time, dt) {
  if (!this.scroller.update(dt)) return;
  const x = this.canvasWidth * 0.5,
      y = this.canvasHeight - 96;
  
  // Magnet to round numbers.
  const dmx = Math.round(this.scroller.pos) - this.scroller.pos;
  let mx = Math.abs(dmx) > 0.07 ? 0 :
      Math.sign(dmx) * 0.07 - dmx;
  if (Math.abs(mx) > Math.abs(dmx)) {
    mx *= Math.abs(dmx) / Math.abs(mx);
  }
  mx *= 0.9;

  for (let i = 0; i < this.menu.length; i++) {
    const d = Math.abs(i - this.scroller.pos - mx);
    const size = (8 - d) * 4;
    if (size < 20) {
      if (this.menu[i].size) {
        this.menu[i].x = this.menu[i].y = 0;
        this.menu[i].size = 0;
      }
      continue;
    }
    const dy = 16 * d ** 2;
    const dx = (i - this.scroller.pos - mx) * 80 *
        ((d / 3) * 0.8 + (1 - (d / 3)));
    this.menu[i].x = x + dx - size - 4;
    this.menu[i].y = y + dy - size - 4;
    this.menu[i].size = size * 2 + 8;
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
  ctx.beginPath();
  ctx.moveTo(0, this.canvasHeight - 30);
  ctx.lineTo(this.canvasWidth / 2 - 45, this.canvasHeight - 180);
  ctx.lineTo(this.canvasWidth / 2 + 45, this.canvasHeight - 180);
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
  this.scroller.startDrag(e.touches[0].clientX)
};

UiBuildMenu.prototype.touchMove = function(e, longTouch) {
  if (!longTouch) {
    this.scroller.moveDrag(e.touches[0].clientX);
  }
};

UiBuildMenu.prototype.touchEnd = function(e, shortTouch) {
  this.scroller.endDrag();
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
  this.scroller.scrollTo(i);
  
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

const DECELERATION = 50;
const DRAG_PX_PER_ITEM = 60;

function Scroller(size, initialValue) {
  this.size = size;
  this.pos = initialValue;
  this.lastPos = 0;
  this.velocity = 0;
  this.isDragging = false;
  this.dragStart = 0;
}

Scroller.prototype.startDrag = function(clientX) {
  this.isDragging = true;
  this.dragStart = clientX +
      this.pos * DRAG_PX_PER_ITEM;
};

Scroller.prototype.moveDrag = function(clientX) {
  this.pos = Math.max(0, Math.min(this.size - 1,
    (this.dragStart - clientX) / DRAG_PX_PER_ITEM));
};

Scroller.prototype.endDrag = function() {
  this.isDragging = false;
};

Scroller.prototype.scrollTo = function(index) {
  if (this.pos == index) return;
  const dist = Math.abs(index - this.pos);
  this.velocity = Math.sign(index - this.pos) *
      Math.sqrt(dist * 2 * DECELERATION);
};

Scroller.prototype.update = function(dt) {
  if (!this.isDragging && this.velocity) {
    const pos = this.pos +
        this.velocity * Math.abs(this.velocity) * 0.5 / DECELERATION;
    const target = Math.max(0, Math.min(this.size - 1,
        Math.round(pos)));
    if (Math.abs(pos - target) > 0.001) {
      this.velocity = Math.sign(target - this.pos) *
          Math.sqrt(Math.abs(target - this.pos) * 2 * DECELERATION);
    }
    this.pos += this.velocity * dt / 1000;
    if (Math.abs(this.velocity) < DECELERATION * 0.05) {
      this.pos = Math.round(this.pos);
      this.velocity = 0;
    } else {
      this.velocity -= Math.sign(this.velocity) * DECELERATION * dt / 1000;
    }
  }
  if (this.pos == this.lastPos) return false;
  if (this.isDragging) {
    this.velocity = (this.pos - this.lastPos) / (dt / 1000);
  }
  this.lastPos = this.pos;
  return true;
};

export {UiBuildMenu};

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
  [
    TOOL.bulldoze,
    TOOL.paste,
    TOOL.copy,
  ], [
    NAME.woodenChest,
    NAME.ironChest,
    NAME.steelChest,
    NAME.activeProviderChest,
    NAME.bufferChest,
    NAME.storageChest,
    NAME.passiveProviderChest,
    NAME.requesterChest,
    NAME.roboport,
  ], [
    NAME.transportBelt,
    NAME.undergroundBelt,
    NAME.splitter,
    NAME.fastTransportBelt,
    NAME.fastUndergroundBelt,
    NAME.fastSplitter,
    NAME.expressTransportBelt,
    NAME.expressUndergroundBelt,
    NAME.expressSplitter,
  ], [
    NAME.burnerInserter,
    NAME.inserter,
    NAME.fastInserter,
    NAME.longHandedInserter,
  ], [
    NAME.accumulator,
    NAME.solarPanel,
    NAME.smallElectricPole,
    NAME.mediumElectricPole,
    NAME.bigElectricPole,
    NAME.substation,
  ], [
    NAME.boiler,
    NAME.steamEngine,
    NAME.storageTank,
    NAME.pipe,
    NAME.pipeToGround,
    NAME.pump,
  ], [
    NAME.lab,
    NAME.rocketSilo,
    NAME.assemblingMachine1,
    NAME.assemblingMachine2,
    NAME.assemblingMachine3,
    NAME.oilRefinery,
    NAME.chemicalPlant,
  ], [
    NAME.burnerDrill,
    NAME.electricMiningDrill,
    NAME.offshorePump,
    NAME.pumpjack,
    NAME.stoneFurnace,
    NAME.steelFurnace,
    NAME.electricFurnace,
  ], [
    NAME.rail,
    NAME.trainStop,
    NAME.railSignal,
    NAME.railChainSignal,
  ], [
    NAME.powerSwitch,
    NAME.programmableSpeaker,
    NAME.radar,
    NAME.constantCombinator,
    NAME.arithmeticCombinator,
    NAME.deciderCombinator,
    NAME.lamp,
  ], [
    NAME.centrifuge,
    NAME.nuclearReactor,
    NAME.heatPipe,
    NAME.heatExchanger,
    NAME.steamTurbine,
  ],
];

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
  
  this.menu = BUILD_MENU.map(group => {
    const entries = group.map(entry => {
      const x = 0, y = 0, size = 0, alpha = 1;
      if (entry > 0) {
        const entity = ENTITIES.get(entry);
        if (!entity) throw new Error(`Can not find ${entry}.`);
        return {sprite: entity.icon, entity, x, y, size, alpha};
      } else {
        const sprite = TOOL_ICON.get(entry);
        return {sprite, tool: entry, x, y, size, alpha};
      }
    });
    const scroller = new Scroller(entries.length, 30, entries.length - 3)
    return {entries, scroller, visible: false, x: 0};
  });
  
  this.dragStartX = 0;
  this.dragStartY = 0;
  this.dragX = false;
  this.scrollingGroup = -1;
  this.scroller = new Scroller(BUILD_MENU.length, 60, 3);
  
  this.selectedEntry = undefined;
}

UiBuildMenu.prototype.update = function(time, dt) {
  this.scroller.update(dt);
  for (let group of this.menu) {
    group.scroller.update(dt);
  }
  
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
    if (this.menu[i].visible != (d <= 3.2)) {
      this.menu[i].visible = d <= 3.2;
    }
    if (d > 3.2) continue;
    const dx = (i - this.scroller.pos - mx) * 80 *
        (1 - (d / 15));
    const gx = this.menu[i].x = this.canvasWidth * 0.5 + dx;
    const gy = this.canvasHeight - 96 + 16 * d ** 2;
    const size = (9 - d) * 8;
    const scroller = this.menu[i].scroller;
    for (let j = 0; j < this.menu[i].entries.length; j++) {
      const entry = this.menu[i].entries[j];
      const d = Math.abs(j - scroller.pos);
      if (d > 3.5) {
        entry.size = 0;
        continue;
      }
      entry.x = gx;
      entry.y = gy - (j - scroller.pos) * 40 *
          Math.max(0, 1 - (d / 15)) * size / 88;
      entry.size = size * Math.max(0, 1 - (d / 4.5));
      entry.alpha = Math.max(0, Math.min(2, 3.5 - d)) / 2;
    }
  }
};

UiBuildMenu.prototype.draw = function(ctx) {
  for (let i = 0; i < this.menu.length; i++) {
    const group = this.menu[i];
    if (!group.visible) continue;
    let j = 0, k = group.entries.length - 1;
    while (j <= k) {
      const l = group.entries[j].size <= group.entries[k].size ? j : k;
      const {x, y, size, alpha, sprite} = group.entries[l];
      const selected = group.entries[l] == this.selectedEntry;
      if (l == j) j++; else k--;
      if (!size || y - size / 2 >= this.canvasHeight) continue;
      if (ctx.globalAlpha != alpha) ctx.globalAlpha = alpha;
      ctx.fillStyle = selected ?
          COLOR.buildSingleBackground : COLOR.buildBackground;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.strokeStyle = selected ?
          COLOR.buildSingleBorder : COLOR.buildBorder;
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      window.numberOtherDraws += 2;
      const s = SPRITES.get(sprite);
      ctx.drawImage(s.image,
          s.x, s.y, s.width, s.height,
          x - size / 2 + 4, y - size / 2 + 4, size - 8, size - 8);
      window.numberImageDraws++;
    }
  }
  ctx.beginPath();
  ctx.moveTo(0, this.canvasHeight - 30);
  ctx.lineTo(this.canvasWidth / 2 - 45, this.canvasHeight - 180);
  ctx.lineTo(this.canvasWidth / 2 + 45, this.canvasHeight - 180);
  ctx.lineTo(this.canvasWidth, this.canvasHeight - 30);
  ctx.strokeStyle = COLOR.buildBorder;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 1;
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
  this.dragStartX = e.touches[0].clientX;
  this.dragStartY = e.touches[0].clientY;
};

UiBuildMenu.prototype.touchMove = function(e, longTouch) {
  if (!longTouch) {
    const dx = Math.abs(e.touches[0].clientX - this.dragStartX);
    const dy = Math.abs(e.touches[0].clientY - this.dragStartY);
    if (!this.dragX && dx > 10) {
      this.scroller.startDrag(this.dragStartX);
      this.dragX = true;
    }
    if (this.scrollingGroup == -1 && dy > 10 + 0.1 * dx) {
      if (this.dragX && dx > 50) {
        this.scrollingGroup = Math.round(this.scroller.pos);
      } else {
        let minDist = 1000;
        for (let i = 0; i < this.menu.length; i++) {
          const d = Math.abs(e.touches[0].clientX - this.menu[i].x);
          if (d < minDist) {
            minDist = d;
            this.scrollingGroup = i;
          }
        }
      }
      this.menu[this.scrollingGroup].scroller.startDrag(-this.dragStartY);
    }
    if (this.dragX) {
      this.scroller.moveDrag(e.touches[0].clientX);
    }
    if (this.scrollingGroup != -1) {
      this.menu[this.scrollingGroup].scroller.moveDrag(-e.touches[0].clientY);
    }
  }
};

UiBuildMenu.prototype.touchEnd = function(e, shortTouch) {
  if (this.dragX) this.scroller.endDrag();
  if (this.scrollingGroup != -1) {
    this.menu[this.scrollingGroup].scroller.endDrag();
  }
  this.dragX = false;
  this.scrollingGroup = -1;
  if (!shortTouch) return;
  const t = e.changedTouches[0];
  let entry = undefined;
  for (let i = 0; i < this.menu.length; i++) {
    const group = this.menu[i];
    for (let j = 0; j < group.entries.length; j++) {
      const {x, y, size} = group.entries[j];
      if (!size ||
          x - size / 2 > t.clientX || t.clientX > x + size / 2 ||
          y - size / 2 > t.clientY || t.clientY > y + size / 2) continue;
      if (entry && entry.size > size) break;
      entry = group.entries[j];
    }
  }
  if (this.selectedEntry == entry) {
    this.setSelectedEntry();
    return;
  }
  this.setSelectedEntry(entry);
};

UiBuildMenu.prototype.touchLong = function(e) {
  const t = e.touches[0];
  let entry = undefined;
  for (let i = 0; i < this.menu.length; i++) {
    const group = this.menu[i];
    for (let j = 0; j < group.entries.length; j++) {
      const {x, y, size} = group.entries[j];
      if (!size ||
          x - size / 2 > t.clientX || t.clientX > x + size / 2 ||
          y - size / 2 > t.clientY || t.clientY > y + size / 2) continue;
      if (entry && entry.size > size) break;
      entry = group.entries[j];
    }
  }
  if (this.selectedEntry == entry) {
    this.setSelectedEntry();
    return;
  }
  this.setSelectedEntry(entry);
};

UiBuildMenu.prototype.setSelectedEntry = function(entry) {
  if (!entry) {
    this.selectedEntry = undefined;
    this.ui.gameMapInput.resetMode();
    return;
  }
  let i = 0, j = 0;
  find: for (; i < this.menu.length; i++) {
    const group = this.menu[i];
    for (j = 0; j < group.entries.length; j++) {
      if (group.entries[j] == entry) break find;
    }
  }
  if (i == this.menu.length) return;
  this.selectedEntry = entry;
  this.scroller.scrollTo(i);
  this.menu[i].scroller.scrollTo(j);
  
  if (entry.entity?.name == NAME.offshorePump) {
    this.ui.gameMapInput.setOffshorePumpMode(entry.entity);
  } else if (entry.tool == TOOL.paste) {
    this.ui.gameMapInput.setPasteTool();
  } else {
    this.ui.gameMapInput.resetMode();
  }
};

UiBuildMenu.prototype.getSelectedEntry = function() {
  return this.selectedEntry;
};

UiBuildMenu.prototype.trySelectEntry = function(name) {
  if (!name) return;
  for (let group of this.menu) {
    for (let entry of group.entries) {
      if (entry.entity?.name == name || entry.tool == name) {
        this.setSelectedEntry(entry);
        break;
      }
    }
  }
};

UiBuildMenu.prototype.entityBuilt = function() {
  
};

UiBuildMenu.prototype.reset = function() {
  this.setSelectedEntry();
};

const DECELERATION = 50;

function Scroller(size, itemLength, initialValue) {
  this.size = size;
  this.pos = initialValue;
  this.lastPos = 0;
  this.velocity = 0;
  this.isDragging = false;
  this.dragStart = 0;
  this.itemLength = itemLength;
}

Scroller.prototype.startDrag = function(clientX) {
  this.isDragging = true;
  this.dragStart = clientX +
      this.pos * this.itemLength;
};

Scroller.prototype.moveDrag = function(clientX) {
  this.pos = Math.max(0, Math.min(this.size - 1,
    (this.dragStart - clientX) / this.itemLength));
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
  if (this.pos == this.lastPos) return;
  if (this.isDragging) {
    this.velocity = (this.pos - this.lastPos) / (dt / 1000);
  }
  this.lastPos = this.pos;
};

export {UiBuildMenu};

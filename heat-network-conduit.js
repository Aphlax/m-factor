import {TYPE, STATE, ENERGY, HEAT_ENERGY} from './entity-properties.js';

const MAX_HEAT_DIST = 200;
const P_MAX_TEMP = 0.8;

function Conduit(parts) {
  this.parts = parts;
  this.reactors = new Set();
  this.consumers = new Set();
  
  this.amount = 0;
  this.capacity = 0;
  
  this.centerX = 0;
  this.centerY = 0;
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Conduit.fromPart = function(part) {
  const conduit = new Conduit(new Set());
  conduit.add(part);
  return conduit;
};

Conduit.prototype.update = function(time, dt) {
  provide: {
    let need = 0;
    const p = this.amount / this.capacity / P_MAX_TEMP;
    for (let consumer of this.consumers) {
      const {energyStored, energyConsumption, x, y, width, height} = consumer;
      if (energyStored >= energyConsumption) continue;
      const dist = Math.sqrt((x + width / 2 - this.centerX) ** 2 +
          (y + height / 2 - this.centerY) ** 2);
      const temp = p * (1 - (dist / MAX_HEAT_DIST)) * 1000;
      if (temp < 500) continue;
      // Store 1s worth of energy in this entity.
      need += consumer.energyConsumption - consumer.energyStored;
    }
    if (!need) break provide;
    const transfer = Math.min(1, this.amount / (need * HEAT_ENERGY));
    for (let consumer of this.consumers) {
      const {energyStored, energyConsumption, x, y, width, height} = consumer;
      if (energyStored >= energyConsumption) continue;
      const dist = Math.sqrt((x + width / 2 - this.centerX) ** 2 +
          (y + height / 2 - this.centerY) ** 2);
      const temp = p * (1 - (dist / MAX_HEAT_DIST)) * 1000;
      if (temp < 500) continue;
      consumer.energyStored += transfer * (consumer.energyConsumption - consumer.energyStored);
      if (consumer.state == STATE.noEnergy) {
        consumer.nextUpdate = time;
      }
    }
    this.amount -= Math.min(this.amount, need * HEAT_ENERGY);
  }
  for (let reactor of this.reactors) {
    const {state, data, x, y, width, height} = reactor;
    if (state != STATE.running) continue;
    let bonus = 1;
    for (let i = 0; i < data.heatConnections.length; i += 3) {
      const other = data.heatParts[i];
      if (data.heatParts[i + 1] != other ||
          data.heatParts[i + 2] != other ||
          other?.state != STATE.running) continue;
      bonus++;
    }
    this.amount += bonus * data.powerOutput
        / 1000 * dt * HEAT_ENERGY;
    this.centerX = 0.99 * this.centerX +
        0.01 * (x + width / 2);
    this.centerY = 0.99 * this.centerY +
        0.01 * (y + height / 2);
  }
  if (this.amount > this.capacity) {
    this.amount = this.capacity;
  }
};

Conduit.prototype.draw = function(ctx, view) {
  const {x: vx, y: vy, scale: s} = view;
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let part of this.parts) {
    const x = (part.x + part.width / 2) * s - vx,
        y = (part.y + part.height / 2) * s - vy,
        r = (part.width + part.height) / 4 * s;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + Math.PI / 6;
      if (i == 0) {
        ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      } else {
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
    }
    ctx.closePath();
  }
  const x = this.centerX * s - vx,
      y = this.centerY * s - vy;
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x, y + 20);
  ctx.stroke();
  window.numberOtherDraws++;
};

Conduit.prototype.getTemp = function(entity) {
  const {x, y, width, height} = entity;
  const p = this.amount / this.capacity / P_MAX_TEMP;
  const dist = Math.sqrt((x + width / 2 - this.centerX) ** 2 +
      (y + height / 2 - this.centerY) ** 2);
  return Math.min(1000, Math.max(15,
      p * (1 - (dist / MAX_HEAT_DIST)) * 1000));
};

Conduit.prototype.add = function(part) {
  if (!this.parts.size) {
    this.centerX = part.x + part.width / 2;
    this.centerY = part.y + part.height / 2;
  }
  
  this.parts.add(part);
  part.data.conduit = this;
  
  if (part.type == TYPE.reactor) {
    this.reactors.add(part);
  }
  if (part.energySource == ENERGY.heat) {
    this.consumers.add(part);
  }
  
  this.capacity += part.data.heatCapacity;
};

Conduit.prototype.remove = function(part) {
  this.parts.delete(part);
  part.data.conduit = undefined;
  
  if (part.type == TYPE.reactor) {
    this.reactors.delete(part);
  }
  if (part.energySource == ENERGY.heat) {
    this.consumers.delete(part);
  }
  
  this.capacity -= part.data.heatCapacity;
  if (this.amount > this.capacity) {
    this.amount = this.capacity;
  }
};

Conduit.prototype.join = function(other) {
  if (other == this) return;
  if (other.parts.size > this.parts.size) {
    other.join(this);
    return;
  }
  this.centerX = (this.centerX * this.parts.size +
      other.centerX * other.parts.size) /
      (this.parts.size + other.parts.size);
  this.centerY = (this.centerY * this.parts.size +
      other.centerY * other.parts.size) /
      (this.parts.size + other.parts.size);
  
  for (let part of other.parts) {
    this.parts.add(part);
    part.data.conduit = this;
    
    if (part.type == TYPE.reactor) {
      this.reactors.add(part);
    }
    if (part.energySource == ENERGY.heat) {
      this.consumers.add(part);
    }
  }
  other.parts.clear();
  other.reactors.clear();
  other.consumers.clear();
  
  this.capacity += other.capacity;
  this.amount += other.amount;
  
};

Conduit.prototype.split = function(part, not, a, b, c) {
  const stack = [part], parts = new Set();
  while (stack.length) {
    const p = stack.pop();
    if (p == a || p == b || p == c) return;
    parts.add(p);
    for (let i = 0; i < p.data.heatConnections.length; i++) {
      const other = p.data.heatParts[i];
      if (other && other != not &&
          !parts.has(other)) {
        for (let j = 0; j < other.data.heatConnections.length; j ++) {
          if (other.data.heatParts[j] == p) {
            stack.push(other);
            break;
          }
        }
      }
    }
  }
  const segment = new Conduit(parts);
  for (let p of parts) {
    p.data.conduit = segment;
    this.parts.delete(p);
    
    if (part.type == TYPE.reactor) {
      other.reactors.add(part);
      this.reactors.delete(part);
    }
    if (part.energySource == ENERGY.heat) {
      other.consumers.add(part);
      this.consumers.delete(part);
    }
    
    this.capacity -= p.data.heatCapacity;
    segment.capacity += p.data.heatCapacity;
  }
  
  const transfer = Math.floor(this.amount /
      (1 + this.capacity / segment.capacity));
  segment.amount = Math.min(transfer, segment.capacity);
  this.amount = Math.min(this.amount - transfer, this.capacity);
  
  return segment;
};

export {Conduit};

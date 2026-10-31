import {TYPE, STATE} from './entity-properties.js';
 
function Conduit(parts) {
  this.parts = parts;
  
  this.amount = 0;
  this.capacity = 0;
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Conduit.fromPart = function(part) {
  const conduit = new Conduit(new Set());
  conduit.add(part);
  return conduit;
};

Conduit.prototype.update = function(time, dt) {
  
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
  ctx.stroke();
  window.numberOtherDraws++;
};

Conduit.prototype.getHeat = function(entity) {
  return 500;
}

Conduit.prototype.add = function(part) {
  this.parts.add(part);
  part.data.conduit = this;
  
  this.capacity += part.data.heatCapacity;
};

Conduit.prototype.remove = function(part) {
  this.parts.delete(part);
  part.data.conduit = undefined;
  
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
  
  for (let part of other.parts) {
    this.parts.add(part);
    part.data.conduit = this;
  }
  other.parts.clear();
  
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

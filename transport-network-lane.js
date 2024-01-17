import {TYPE} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';

function Lane(belts, nodes) {
  this.belts = belts;
  this.nodes = nodes;
  this.circular = false;
  
  this.minusItem = undefined;
  this.minusFlow = [];
}

Lane.fromBelt = function(belt) {
  const lane = new Lane([belt],
      [new Node(belt.x, belt.y, belt.direction, 1)]);
  belt.data.lane = lane;
  return lane;
}

Lane.prototype.insertItem = function(item, belt, time, positionForBelt) {
  if (this.minusItem && this.minusItem != item) return false;
  if (!this.minusItem) {
    this.minusItem = item;
  }
  let distanceToEnd = 0, direction = undefined;
  for (let i = 0; i < this.nodes.length; i++) {
    if (distanceToEnd) {
      distanceToEnd += this.nodes[i].length;
    }
    if (this.nodes[i].contains(belt)) {
      const d = Math.abs(this.nodes[i].x - belt.x) +
          Math.abs(this.nodes[i].y - belt.y);
      distanceToEnd = this.nodes[i].length - d - 0.5;
    }
  }
  
  for (let i = 0; i < this.minusFlow.length; i++) {
    if (distanceToEnd >= this.minusFlow[i] + 0.25) {
      distanceToEnd -= this.minusFlow[i] + 0.25;
      continue;
    }
    if (distanceToEnd >= this.minusFlow[i]) {
      return false;
    }
    this.minusFlow[i] -= distanceToEnd + 0.25;
    this.minusFlow.splice(i, 0, distanceToEnd);
    return true;
  }
  this.minusFlow.push(distanceToEnd);
  return true;
};

Lane.prototype.update = function(time, dt) {
  let movement = dt * 0.001;
  let i = 0;
  while (movement && i < this.minusFlow.length) {
    if (this.minusFlow[i] >= movement) {
      this.minusFlow[i] -= movement;
      break;
    }
    if (this.minusFlow[i]) {
      movement -= this.minusFlow[i];
      this.minusFlow[i] = 0;
    }
    i++;
  }
  if (this.minusFlow.length && !this.minusFlow[0]) {
    const belt = this.belts[this.belts.length - 1];
    for (let entity of belt.outputEntities) {
      if (entity.type == TYPE.belt) {
        if (entity.insert(this.minusItem, 1, time, ((belt.direction + 2) % 4) * 3 + 2)) {
          this.minusFlow.shift();
          if (this.minusFlow.length) {
            this.minusFlow[0] += 0.25;
          } else {
            this.minusItem = undefined;
          }
        }
      }
    }
  }
};

Lane.prototype.draw = function(ctx, view) {
  if (this.minusFlow.length) {
    const itemDef = ITEMS.get(this.minusItem);
    const sprite = SPRITES.get(itemDef.sprite);
    let dte = 0, n = this.nodes.length - 1;
    for (let flow of this.minusFlow) {
      dte += flow + 0.125;
      while (dte > this.nodes[n].length) {
        dte -= this.nodes[n--].length;
      }
      const x = this.nodes[n].x + 0.5 +
          ((this.nodes[n].direction - 1) % 2) * 0.25 -
          ((this.nodes[n].direction - 2) % 2) *
          (this.nodes[n].length - dte - 0.5);
      const y = this.nodes[n].y + 0.5 +
          ((this.nodes[n].direction - 2) % 2) * 0.25 +
          ((this.nodes[n].direction - 1) % 2) *
          (this.nodes[n].length - dte - 0.5);
      ctx.drawImage(sprite.image,
          sprite.rect.x, sprite.rect.y,
          sprite.rect.width, sprite.rect.height,
          (x - 0.25) * view.scale - view.x,
          (y - 0.25) * view.scale - view.y,
          view.scale / 2, view.scale / 2);
      dte += 0.125;
    }
  }
  
  // Debug.
  ctx.beginPath();
  ctx.moveTo(
      (this.nodes[0].x + 0.5) * view.scale - view.x,
      (this.nodes[0].y + 0.5) * view.scale - view.y);
  for (let node of this.nodes) {
    ctx.lineTo(
        (node.x + 0.5) * view.scale - view.x,
        (node.y + 0.5) * view.scale - view.y);
  }
  const node = this.nodes[this.nodes.length - 1];
  const x = node.x - ((node.direction - 2) % 2) * (node.length - 0.6);
  const y = node.y + ((node.direction - 1) % 2) * (node.length - 0.6);
  ctx.lineTo(
      (x + 0.5) * view.scale - view.x,
      (y + 0.5) * view.scale - view.y);
  ctx.strokeStyle = this.circular ? "#FF00FF" : "#00FFFF";
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;
};

Lane.prototype.extendEnd = function(belt) {
  belt.data.lane = this;
  this.belts.push(belt);
  if (this.nodes[this.nodes.length - 1].direction == belt.direction) {
    this.nodes[this.nodes.length - 1].length++;
    return this;
  }
  this.nodes.push(new Node(belt.x, belt.y, belt.direction, 1));
  return this;
};

Lane.prototype.extendBegin = function(belt) {
  belt.data.lane = this;
  this.belts.unshift(belt);
  if (this.circular) {
    this.circular = false;
  }
  if (this.nodes[0].direction == belt.direction) {
    this.nodes[0].x += (belt.direction - 2) % 2;
    this.nodes[0].y += -(belt.direction - 1) % 2;
    this.nodes[0].length++;
    return this;
  }
  this.nodes.unshift(new Node(belt.x, belt.y, belt.direction, 1));
  return this;
};

Lane.prototype.removeEnd = function() {
  this.belts.pop().data.lane = undefined;
  if (this.circular) {
    this.circular = false;
  }
  if (!--this.nodes[this.nodes.length - 1].length) {
    this.nodes.pop();
  }
};

Lane.prototype.removeBegin = function() {
  this.belts.shift().data.lane = undefined;
  if (this.circular) {
    this.circular = false;
  }
  if (--this.nodes[0].length) {
    this.nodes[0].x += -(this.nodes[0].direction - 2) % 2;
    this.nodes[0].y += (this.nodes[0].direction - 1) % 2;
    return;
  }
  this.nodes.shift();
};

Lane.prototype.appendLaneEnd = function(other) {
  if (other == this) {
    this.circular = true;
    return;
  }
  if (this.nodes[this.nodes.length - 1].direction == other.nodes[0].direction) {
    this.nodes[this.nodes.length - 1].length += other.nodes[0].length;
    for (let i = 1; i < other.nodes.length; i++) {
      this.nodes.push(other.nodes[i]);
    }
  } else {
    this.nodes.push(...other.nodes);
  }
  this.belts.push(...other.belts);
  other.belts.forEach(b => b.data.lane = this);
  other.nodes.length = 0;
  other.belts.length = 0;
  return;
};

/**
 * Splits a lane just before the given belt.
 */
Lane.prototype.split = function(belt) {
  const n = this.nodes.findIndex(n => n.contains(belt));
  const nodes = this.nodes.slice(n);
  const d = Math.abs(this.nodes[n].x - belt.x) +
      Math.abs(this.nodes[n].y - belt.y);
  if (d) {
    nodes[0] = new Node(
        nodes[0].x - ((nodes[0].direction - 2) % 2) * d,
        nodes[0].y + ((nodes[0].direction - 1) % 2) * d,
        nodes[0].direction,
        nodes[0].length - d);
    this.nodes[n].length = d;
  }
  this.nodes.length = n + (d ? 1 : 0);
  
  const b = this.belts.indexOf(belt);
  const belts = this.belts.splice(b);
  const lane = new Lane(belts, nodes);
  lane.belts.forEach(b => b.data.lane = lane);
  
  if (this.circular) {
    this.circular = false;
    lane.appendLaneEnd(this);
  }
  
  return lane;
}

function Node(x, y, direction, length) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.length = length;
}

Node.prototype.contains = function(belt) {
  const x = (belt.x - this.x) * (this.direction == 3 ? -1 : 1);
  const y = (belt.y - this.y) * (this.direction == 0 ? -1 : 1);
  return this.direction % 2 ?
      x >= 0 && x < this.length && y == 0 :
      x == 0 && y >= 0 && y < this.length;
}

export {Lane};
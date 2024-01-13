import {TYPE} from './entity-properties.js';

function TransportNetwork() {
  this.lastUpdate = 0;
  this.lanes = [];
}

TransportNetwork.prototype.reset = function() {
  this.lanes.length = 0;
}
TransportNetwork.prototype.addBelt = function(belt) {
  if (belt.data.beltInput) {
    const lane = belt.data.beltInput.data.lane.extendEnd(belt);
    if (belt.data.beltOutput) {
      lane.appendLaneEnd(belt.data.beltOutput.data.lane);
    }
    return;
  } else if (belt.data.beltOutput) {
    return belt.data.beltOutput.data.lane.extendBegin(belt);
  }
  this.lanes.push(Lane.fromBelt(belt));
};

TransportNetwork.prototype.beltInputChanged = function(belt) {
  if (!belt.data.lane || belt.data.lane.belts[0] == belt) return;
  this.lanes.push(belt.data.lane.split(belt));
  if (belt.data.beltInput?.lane) {
    belt.data.beltInput.data.lane.appendLaneEnd(belt.data.lane);
  }
};

TransportNetwork.prototype.update = function(time) {
  const dt = time - this.lastUpdate;
  this.lastUpdate = time;
  for (let lane of this.lanes) {
    if (!lane.nodes.length) continue;
    lane.update(time, dt);
  }
};

TransportNetwork.prototype.draw = function(ctx, view) {
  ctx.globalAlpha = 0.5;
  for (let lane of this.lanes) {
    if (!lane.nodes.length) continue;
    lane.draw(ctx, view);
  }
  ctx.globalAlpha = 1;
};

function Lane(belts, nodes) {
  this.belts = belts;
  this.nodes = nodes;
}

Lane.fromBelt = function(belt) {
  const lane = new Lane([belt],
      [new Node(belt.x, belt.y, belt.direction, 1)]);
  belt.data.lane = lane;
  return lane;
}

Lane.prototype.update = function(time, dt) {
  
};

Lane.prototype.draw = function(ctx, view) {
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
  ctx.strokeStyle = "#00FFFF";
  ctx.lineWidth = 2;
  ctx.stroke();
};

Lane.prototype.extendEnd = function(belt) {
  belt.data.lane = this;
  if (this.nodes[this.nodes.length - 1].direction == belt.direction) {
    this.nodes[this.nodes.length - 1].length++;
    this.belts.push(belt);
    return this;
  }
  this.nodes.push(new Node(belt.x, belt.y, belt.direction, 1));
  this.belts.push(belt);
  return this;
};

Lane.prototype.extendBegin = function(belt) {
  belt.data.lane = this;
  if (this.nodes[0].direction == belt.direction) {
    this.nodes[0].x += (belt.direction - 2) % 2;
    this.nodes[0].y += -(belt.direction - 1) % 2;
    this.nodes[0].length++;
    this.belts.unshift(belt);
    return this;
  }
  this.nodes.unshift(new Node(belt.x, belt.y, belt.direction, 1));
  this.belts.unshift(belt);
  return this;
};

Lane.prototype.appendLaneEnd = function(other) {
  if (other == this) return;
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
  return other;
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

export {TransportNetwork};

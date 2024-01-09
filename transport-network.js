import {TYPE} from './entity-properties.js';

function TransportNetwork() {
  this.lastUpdate = 0;
  this.lanes = [];
}

TransportNetwork.prototype.reset = function() {
  this.lanes.length = 0;
}
TransportNetwork.prototype.add = function(belt) {
  if (belt.data.beltInput) {
    const lane = belt.data.beltInput.data.lane.extendEnd(belt);
    if (belt.data.beltOutput?.data.beltInput == belt) {
      lane.appendEnd(belt.data.beltOutput.data.lane);
    }
    return lane;
  } else if (belt.data.beltOutput?.data.beltInput == belt) {
    return belt.data.beltOutput.data.lane.extendBegin(belt);
  }
  const lane = new Lane(belt);
  this.lanes.push(lane);
  return lane;
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


function Lane(belt) {
  this.belts = [belt];
  this.nodes = [new Node(belt.x, belt.y, belt.direction, 1)];
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

Lane.prototype.appendEnd = function(other) {
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

function Node(x, y, direction, length) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.length = length;
}

export {TransportNetwork};

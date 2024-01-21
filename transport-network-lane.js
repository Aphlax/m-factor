import {TYPE} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';

const FLOW = {
  minus: -1, plus: 1
};
const FLOWS = [FLOW.minus, FLOW.plus];

function Lane(belts, nodes) {
  this.belts = belts;
  this.nodes = nodes;
  this.circular = false;
  
  this.minusItem = undefined;
  this.minusFlow = [];
  this.plusItem = undefined;
  this.plusFlow = [];
}

Lane.fromBelt = function(belt) {
  const lane = new Lane([belt],
      [new Node(belt.x, belt.y, belt.direction, 1)]);
  belt.data.lane = lane;
  return lane;
}

Lane.prototype.insertItem = function(item, belt, time, positionForBelt) {
  let flow, flowSign;
  if (positionForBelt >= 0) {
    flowSign = FLOW.minus;
    flow = this.minusFlow;
    if (this.minusItem && this.minusItem != item) return false;
    if (!this.minusItem) {
      this.minusItem = item;
    }
  } else {
    flowSign = FLOW.plus;
    flow = this.plusFlow;
    if (this.plusItem && this.plusItem != item) return false;
    if (!this.plusItem) {
      this.plusItem = item;
    }
  }
  
  let dte = 0;
  for (let n = this.nodes.length - 1; n >= 0; n--) {
    dte += this.nodes[n].length;
    if (this.nodes[n].contains(belt)) {
      const d = Math.abs(this.nodes[n].x - belt.x) +
          Math.abs(this.nodes[n].y - belt.y);
      dte -= d + 0.5;
      break;
    }
    if (n) {
      const turn = ((this.nodes[n].direction -
          this.nodes[n - 1].direction + 4) % 4) - 2;
      dte += flowSign * turn * 0.5;
    }
  }
  
  for (let i = 0; i < flow.length; i++) {
    if (dte < flow[i]) {
      flow[i] -= dte + 0.25;
      flow.splice(i, 0, dte);
      return true;
    }
    if (dte < flow[i] + 0.25) {
      return false;
    }
    dte -= flow[i] + 0.25;
  }
  flow.push(dte);
  return true;
};

Lane.prototype.update = function(time, dt) {
  const total = dt * 0.001 * this.belts[0].data.beltSpeed;
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    let movement = total, i = 0;
    while (i < flow.length) {
      if (flow[i] > movement) {
        flow[i] -= movement;
        movement = 0;
      } else if (flow[i] > 0) {
        movement -= flow[i];
        flow[i] = 0;
      } else if (flow[i] < 0) {
        const old = flow[i];
        flow[i] = Math.min(flow[i] + total - movement, 0);
        movement += flow[i] - old;
      }
      i++;
    }
    if (flow.length && !flow[0]) {
      const belt = this.belts[this.belts.length - 1];
      for (let entity of belt.outputEntities) {
        if (entity.type == TYPE.belt) {
          const positionForBelt = ((belt.direction + 2) % 4) * 3 + 1 - flowSign;
          const item = flowSign == FLOW.minus ? this.minusItem : this.plusItem;
          if (entity.insert(item, 1, time, positionForBelt)) {
            flow.shift();
            if (flow.length) {
              flow[0] += 0.25;
            } else {
              if (flowSign == FLOW.minus) {
                this.minusItem = undefined;
              } else {
                this.plusItem = undefined;
              }
            }
          }
        }
      }
    }
  }
};

Lane.prototype.draw = function(ctx, view) {
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    const item = flowSign == FLOW.minus ? this.minusItem : this.plusItem;
    if (flow.length) {
      const itemDef = ITEMS.get(item);
      const sprite = SPRITES.get(itemDef.sprite);
      let dte = 0, n = this.nodes.length - 1;
      for (let distanceToPrevious of flow) {
        dte += distanceToPrevious + 0.125;
        let len;
        while (n && dte > (len = (this.nodes[n].length +
            (((this.nodes[n].direction -
            this.nodes[n - 1].direction + 4) % 4) - 2) *
            flowSign * 0.5))) {
          dte -= len;
          n--;
        }
        let x, y;
        if (n && dte > this.nodes[n].length - 1) {
          const large = ((this.nodes[n].direction -
              this.nodes[n - 1].direction + 4) % 4) ==
              2 + flowSign;
          const angle =
              ((1 - (dte - this.nodes[n].length + 1) /
              (large ? 1.5 : 0.5)) *
              (large ? -1 : 1) * flowSign +
              (this.nodes[n].direction + 1)) *
              Math.PI / 2;
          x = this.nodes[n].x + 0.5 +
              ((this.nodes[n].direction - 2) % 2) * -0.5 +
              ((this.nodes[n - 1].direction - 2) % 2) * 0.5 +
              (large ? 0.73 : 0.27) * Math.cos(angle);
          y = this.nodes[n].y + 0.5 +
              ((this.nodes[n].direction - 1) % 2) * 0.5 +
              ((this.nodes[n - 1].direction - 1) % 2) * -0.5 +
              (large ? 0.73 : 0.27) * Math.sin(angle);
        } else {
          x = this.nodes[n].x + 0.5 - flowSign *
              ((this.nodes[n].direction - 1) % 2) * 0.23 -
              ((this.nodes[n].direction - 2) % 2) *
              (this.nodes[n].length - dte - 0.5);
          y = this.nodes[n].y + 0.5 - flowSign *
              ((this.nodes[n].direction - 2) % 2) * 0.23 +
              ((this.nodes[n].direction - 1) % 2) *
              (this.nodes[n].length - dte - 0.5);
        }
        if ((x + 0.24) * view.scale >= view.x &&
            (y + 0.24) * view.scale >= view.y &&
            (x - 0.24) * view.scale < view.x + view.width &&
            (y - 0.24) * view.scale < view.y + view.height) {
          ctx.drawImage(sprite.image,
              sprite.x, sprite.y,
              sprite.width, sprite.height,
              (x - 0.24) * view.scale - view.x,
              (y - 0.24) * view.scale - view.y,
              view.scale * 0.48, view.scale * 0.48);
        }
        dte += 0.125;
      }
    }
  }
  
  return;
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
  if (this.minusFlow.length) {
    this.minusFlow[0]++;
  }
  if (this.plusFlow.length) {
    this.plusFlow[0]++;
  }
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
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    let removal = 1, i = 0;
    while (i < flow.length && removal > flow[i]) {
      removal -= flow[i++] + 0.25;
    }
    if (i < flow.length && removal > 0) {
      flow[i] -= removal;
    }
    if (i) {
      flow.splice(0, i);
    }
  }
  if (this.circular) {
    this.circular = false;
  }
  if (!--this.nodes[this.nodes.length - 1].length) {
    this.nodes.pop();
  }
};

Lane.prototype.removeBegin = function() {
  this.belts.shift().data.lane = undefined;
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    let laneLength = -1;
    for (let n = 0; n < this.nodes.length; n++) {
      laneLength += this.nodes[n].length;
      if (n) {
        const turn = ((this.nodes[n].direction -
            this.nodes[n - 1].direction + 4) % 4) - 2;
        laneLength += flowSign * turn * 0.5;
      }
    }
    let i = 0;
    while (i < flow.length && laneLength >= flow[i] + 0.25) {
      laneLength -= flow[i++] + 0.25;
    }
    if (i < flow.length && laneLength < flow[i] + 0.25) {
      flow.length = i;
    }
  }
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
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    const otherFlow = flowSign == FLOW.minus ? other.minusFlow : other.plusFlow;
    if (!flow.length) {
      flow.push(...otherFlow);
      otherFlow.length = 0;
      continue;
    }
    let laneLength = 0;
    for (let n = 0; n < other.nodes.length; n++) {
      laneLength += other.nodes[n].length;
      if (n) {
        const turn = ((other.nodes[n].direction -
            other.nodes[n - 1].direction + 4) % 4) - 2;
        laneLength += flowSign * turn * 0.5;
      }
    }
    for (let i = 0; i < otherFlow.length; i++) {
      laneLength -= otherFlow[i] + 0.25;
    }
    flow[0] += laneLength;
    flow.unshift(...otherFlow);
    otherFlow.length = 0;
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
  
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    const laneFlow = flowSign == FLOW.minus ? lane.minusFlow : lane.plusFlow;
    let laneLength = 0;
    for (let n = 0; n < lane.nodes.length; n++) {
      laneLength += lane.nodes[n].length;
      if (n) {
        const turn = ((lane.nodes[n].direction -
            lane.nodes[n - 1].direction + 4) % 4) - 2;
        laneLength += flowSign * turn * 0.5;
      }
    }
    let i = 0;
    while (i < flow.length && laneLength >= flow[i] + 0.25) {
      laneLength -= flow[i++] + 0.25;
    }
    if (i < flow.length && laneLength < flow[i] + 0.25) {
      laneFlow.push(...flow.splice(0, i));
      flow[0] -= laneLength;
    } else {
      laneFlow.push(...flow);
      flow.length = 0;
    }
  }
  
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

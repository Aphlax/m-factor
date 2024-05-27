import {TYPE} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';

const FLOW = {
  minus: -1, plus: 1
};
const FLOWS = [FLOW.minus, FLOW.plus];
/**
 *  The 12 insertion positions from inserters
 *  and side loading start from north TODO
 */
const BELT_POSITION =
    [0.0, 0.25, 0.0, 0.25, 0.5, 0.75,
     1.0, 0.75, 1.0, 0.75, 0.5, 0.25];
const LEFT_TURN_BELT_POSITION =
    [0.0, 0.25, 0.0, 0.25, 0.5, 0.75,
     0.75, 1.0, 1.25, 1.5, 0.25, 0.5];
const RIGHT_TURN_BELT_POSITION =
    [0.0, 0.25, 0.0, 0.5, 1.25, 1.5,
     1.25, 1.0, 0.75, 0.75, 0.5, 0.25];


// TODO: do more bookkeeping where in a
// flow each belt is. Mostly during update,
// but also when inserting and extracting.
// All lane changes should not interfere.

// maybe also not. this requires us to go
// through all belts of a lane each update.
// it may be cheaper to just do this for
// inserts and extracts.

function Lane(belts, nodes) {
  this.belts = belts;
  this.nodes = nodes;
  this.circular = false;
  
  // For belts going north, minus side is left.
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

/**
 * Returns the expected wait time in ms until the lane is free to take the item.
 * If 0, the item was put on the belt.
 */
Lane.prototype.insertItem = function(item, belt, time, positionForBelt) {
  let flow, flowSign;
  let minusSide;
  const turnBelt = (belt.direction -
      (belt.data.beltInput?.direction ??
      belt.direction) + 4) % 4;
  const normalPos = (positionForBelt -
        belt.direction * 3 + 12) % 12;
  if (!turnBelt) {
    minusSide = !normalPos || normalPos >= 7;
  } else {
    if (turnBelt == 1) {
      minusSide = !normalPos || normalPos >= 4;
    } else {
      minusSide = !normalPos || normalPos >= 10;
    }
  }
  if (minusSide) {
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
      let exactPosition;
      if (!turnBelt) {
        exactPosition = BELT_POSITION[normalPos];
      } else {
        if (turnBelt == 1) {
          exactPosition = RIGHT_TURN_BELT_POSITION[normalPos];
        } else {
          exactPosition = LEFT_TURN_BELT_POSITION[normalPos];
        }
      }
      dte -= d + 1 - exactPosition;
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
      return 0; // Item inserted, 0 wait.
    }
    if (dte < flow[i] + 0.25) {
      // Item can't be inserted here,
      // calculate how much wait until potential gap.
      let wait = flow[i] + 0.25 - dte;
      while (++i < flow.length && !flow[i] && wait < 1) {
        wait += 0.25;
      }
      return Math.ceil(wait / belt.data.beltSpeed * 1000);
    }
    dte -= flow[i] + 0.25;
  }
  flow.push(dte);
  return 0; // Item inserted, 0 wait.
};

/**
 * items is a filter, -1 for any, otherwise an array of allowed items
 * positionForBelt determines which lane is considered first.
 *
 * returns a negative item id if extracted.
 * returns a positive wait time in ms if no item.
 */
Lane.prototype.extractItem = function(items, belt, time, positionForBelt) {
  let minusSide;
  const turnBelt = (belt.direction -
      (belt.data.beltInput?.direction ??
      belt.direction) + 4) % 4;
  const normalPos = (positionForBelt -
        belt.direction * 3 + 12) % 12;
  if (!turnBelt) {
    minusSide = !normalPos || normalPos >= 7;
  } else {
    if (turnBelt == 1) {
      minusSide = !normalPos || normalPos >= 4;
    } else {
      minusSide = !normalPos || normalPos >= 10;
    }
  }
  const startFlowSign = minusSide ? FLOW.minus : FLOW.plus;
  let waitTime = Math.ceil(1000 / belt.data.beltSpeed);
  
  laneLoop:
  for (let flowSign of FLOWS) {
    flowSign *= -startFlowSign;
    const flow = flowSign == FLOW.minus ?
        this.minusFlow : this.plusFlow;
    const flowItem = flowSign == FLOW.minus ?
        this.minusItem : this.plusItem;
    if (items != -1 && !items.includes(flowItem))
      continue;
    
    let dte = 0, dteLength = 1;
    if (turnBelt) {
      dteLength = turnBelt * flowSign == 1 ? 0.5 : 1.5;
    }
    for (let n = this.nodes.length - 1; n >= 0; n--) {
      dte += this.nodes[n].length;
      if (this.nodes[n].contains(belt)) {
        dte -= Math.abs(this.nodes[n].x - belt.x) +
            Math.abs(this.nodes[n].y - belt.y) - 1;
        break;
      }
      if (n) {
        const turn = ((this.nodes[n].direction -
            this.nodes[n - 1].direction + 4) % 4) - 2;
        dte += flowSign * turn * 0.5;
      }
    }
    
    for (let i = 0; i < flow.length; i++) {
      const itemPos = flow[i] + 0.125;
      if (itemPos > dte + dteLength) {
        const wait = Math.ceil(Math.min(itemPos - dte - dteLength, 1) / belt.data.beltSpeed * 1000);
        if (wait < waitTime) {
          waitTime = wait;
        }
        continue laneLoop;
      }
      if (itemPos > dte && itemPos <= dte + dteLength) {
        if (i + 1 < flow.length && itemPos + flow[i + 1] + 0.25 < dte + dteLength * 0.5) {
          dte -= flow[i] + 0.25;
          continue;
        }
        // Extract this item.
        const [len] = flow.splice(i, 1);
        if (i < flow.length) {
          flow[i] += len + 0.25;
        }
        return -flowItem;
      }
      dte -= flow[i] + 0.25;
    }
  }
  return waitTime;
}

Lane.prototype.update = function(time, dt) {
  const total = dt * 0.001 * this.belts[0].data.beltSpeed;
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    let movement = total;
    for (let i = 0; i < flow.length; i++) {
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
    }
    if (flow.length && !flow[0]) {
      const belt = this.belts[this.belts.length - 1];
      for (let entity of belt.outputEntities) {
        if (entity.type == TYPE.belt) {
          const positionForBelt = ((belt.direction + 2) % 4) * 3 + 1 - flowSign;
          const item = flowSign == FLOW.minus ? this.minusItem : this.plusItem;
          const wait = entity.beltInsert(item, time, positionForBelt);
          if (!wait) {
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
          const largeTurn = ((this.nodes[n].direction -
              this.nodes[n - 1].direction + 4) % 4) ==
              2 + flowSign;
          const angle =
              ((1 - (dte - this.nodes[n].length + 1) /
              (largeTurn ? 1.5 : 0.5)) *
              (largeTurn ? -1 : 1) * flowSign +
              (this.nodes[n].direction + 1)) *
              Math.PI / 2;
          x = this.nodes[n].x + 0.5 +
              ((this.nodes[n].direction - 2) % 2) * -0.5 +
              ((this.nodes[n - 1].direction - 2) % 2) * 0.5 +
              (largeTurn ? 0.73 : 0.27) * Math.cos(angle);
          y = this.nodes[n].y + 0.5 +
              ((this.nodes[n].direction - 1) % 2) * 0.5 +
              ((this.nodes[n - 1].direction - 1) % 2) * -0.5 +
              (largeTurn ? 0.73 : 0.27) * Math.sin(angle);
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
        if ((x + 0.234375) * view.scale >= view.x &&
            (y + 0.234375) * view.scale >= view.y &&
            (x - 0.234375) * view.scale < view.x + view.width &&
            (y - 0.234375) * view.scale < view.y + view.height) {
          ctx.drawImage(sprite.image,
              sprite.x, sprite.y,
              sprite.width, sprite.height,
              (x - 0.234375) * view.scale - view.x,
              (y - 0.234375) * view.scale - view.y,
              view.scale * 0.46875, view.scale * 0.46875);
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

import {TYPE} from './entity-properties.js';
import {SPRITES} from './sprite-pool.js';
import {ITEMS} from './item-definitions.js';

const FLOW = {
  minus: -1, plus: 1
};
const FLOWS = [FLOW.minus, FLOW.plus];
/**
 *  The 12 insertion positions from inserters
 *  and side loading for a belt facing north.
 *
 *     0         2
 *          1
 *  11             3
 *
 *    10         4
 *
 *  9              5
 *          7
 *     8         6
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

function Lane(belts, nodes) {
  this.belts = belts;
  this.nodes = nodes;
  this.circular = false;
  
  // For belts going north, minus side is left.
  this.minusItems = [];
  this.minusFlow = [];
  this.plusItems = [];
  this.plusFlow = [];
  
  this.endSplitterData = undefined;
  
  const c = Math.ceil(Math.random() * 255 * 2);
  this.color = `rgb(${Math.abs(c-255)}, ${Math.abs((c+170)%510-255)}, ${Math.abs((c+340)%510-255)})`;
}

Lane.fromBelt = function(belt) {
  const lane = new Lane([belt],
      [new Node(belt.x, belt.y, belt.direction, 1)]);
  belt.data.lane = lane;
  return lane;
}

Lane.fromSplitter = function(belt, input, left) {
  const dx = (left ? belt.direction == 2 : belt.direction == 0) ? 1 : 0;
  const dy = (left ? belt.direction == 3 : belt.direction == 1) ? 1 : 0;
  const lane = new Lane([belt],
      [new Node(belt.x + dx, belt.y + dy, belt.direction, 1)]);
  lane.endSplitterData = input ? belt.data : undefined;
  if (input) {
    if (left) belt.data.leftInLane = lane;
    else belt.data.rightInLane = lane;
  } else {
    if (left) belt.data.leftOutLane = lane;
    else belt.data.rightOutLane = lane;
  }
  return lane;
}

/**
 * Returns the expected wait time in ms until the lane is free to take the item.
 * If 0, the item was put on the belt.
 */
Lane.prototype.insertItem = function(item, belt, time, positionForBelt) {
  let flow, flowSign, items;
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
    items = this.minusItems;
  } else {
    flowSign = FLOW.plus;
    flow = this.plusFlow;
    items = this.plusItems;
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
      items.splice(i, 0, item);
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
  items.push(item);
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
    const flowItems = flowSign == FLOW.minus ?
        this.minusItems : this.plusItems;
    
    let dte = 0, dteLength = 1;
    if (turnBelt) {
      dteLength = (turnBelt == 1) == (flowSign == 1) ? 0.5 : 1.5;
    }
    for (let n = this.nodes.length - 1; n >= 0; n--) {
      dte += this.nodes[n].length;
      if (this.nodes[n].contains(belt)) {
        dte -= Math.abs(this.nodes[n].x - belt.x) +
            Math.abs(this.nodes[n].y - belt.y) + 1;
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
      if (itemPos > dte && itemPos <= dte + dteLength &&
          (items == -1 || items.includes(flowItems[i]))) {
        // Check if next item has better position.
        if (i + 1 < flow.length && itemPos + flow[i + 1] + 0.25 < dte + dteLength * 0.5 &&
            (items == -1 || items.includes(flowItems[i + 1]))) {
          dte -= flow[i] + 0.25;
          continue;
        }
        // Extract this item.
        const [len] = flow.splice(i, 1),
            [item] = flowItems.splice(i, 1);
        if (i < flow.length) {
          flow[i] += len + 0.25;
        }
        return -item;
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
    // Belt side loading.
    if (!flow.length || flow[0]) {
      continue;
    }
    const belt = this.belts[this.belts.length - 1];
    if ((flowSign == FLOW.minus ?
        belt.data.beltSideLoadMinusWait :
        belt.data.beltSideLoadPlusWait) > time) {
      continue;
    }
    for (let entity of belt.outputEntities) {
      if (entity.type != TYPE.belt &&
          entity.type != TYPE.undergroundBelt)
        continue;
      if (entity.type == TYPE.undergroundBelt &&
          ((((belt.direction - entity.direction + 4) % 4) == 1) ==
          (entity.data.undergroundUp != (flowSign == FLOW.minus))))
        continue;
      const positionForBelt = ((belt.direction + 2) % 4) * 3 + 1 - flowSign;
      const items = flowSign == FLOW.minus ? this.minusItems : this.plusItems;
      const wait = entity.beltInsert(items[0], time, positionForBelt);
      if (!wait) {
        flow.shift();
        items.shift();
        if (flow.length) {
          flow[0] += 0.25;
        }
      } else {
        if (flowSign == FLOW.minus) {
          belt.data.beltSideLoadMinusWait = time + wait;
        } else {
          belt.data.beltSideLoadPlusWait = time + wait;
        }
      }
      break;
    }
  }
};

Lane.prototype.draw = function(ctx, view) {
  const sprites = new Map();
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    const items = flowSign == FLOW.minus ? this.minusItems : this.plusItems;
    if (!flow.length) continue;
    let dte = 0, n = this.nodes.length - 1,
        gapIndex = this.nodes[n].gaps.length - 2;
    for (let i = 0; i < flow.length; i++) {
      dte += flow[i] + 0.125;
      let len;
      while (n && dte > (len = (this.nodes[n].length +
          (((this.nodes[n].direction -
          this.nodes[n - 1].direction + 4) % 4) - 2) *
          flowSign * 0.5))) {
        dte -= len;
        n--;
        gapIndex = this.nodes[n].gaps.length - 2;
      }
      const pos = this.nodes[n].length - dte;
      while (gapIndex >= 0 &&
          pos < this.nodes[n].gaps[gapIndex]) {
        gapIndex -= 2;
      }
      if ((gapIndex >= 0 && pos > this.nodes[n].gaps[gapIndex] + 0.7 &&
          pos < this.nodes[n].gaps[gapIndex] + this.nodes[n].gaps[gapIndex + 1] + 0.3) ||
          (n == 0 && pos < 0.3 && this.belts[0].type == TYPE.undergroundBelt &&
          this.belts[0].data.undergroundUp) ||
          (n == this.nodes.length - 1 && pos > this.nodes[n].length - 0.3 &&
          this.belts[this.belts.length - 1].type == TYPE.undergroundBelt &&
          !this.belts[this.belts.length - 1].data.undergroundUp)) {
        dte += 0.125;
        continue;
      }
      let x, y;
      if ((n || (this.circular &&
          this.belts[this.belts.length - 1].direction != this.belts[0].direction)) &&
          dte > this.nodes[n].length - 1) {
        const prevDir = this.nodes[n ? n - 1 : this.nodes.length - 1].direction;
        const largeTurn = ((this.nodes[n].direction -
            prevDir + 4) % 4) == 2 + flowSign;
        const angle =
            ((1 - (dte - this.nodes[n].length + 1) /
            (largeTurn ? 1.5 : 0.5)) *
            (largeTurn ? -1 : 1) * flowSign +
            (this.nodes[n].direction + 1)) *
            Math.PI / 2;
        x = this.nodes[n].x + 0.5 +
            ((this.nodes[n].direction - 2) % 2) * -0.5 +
            ((prevDir - 2) % 2) * 0.5 +
            (largeTurn ? 0.73 : 0.27) * Math.cos(angle);
        y = this.nodes[n].y + 0.5 +
            ((this.nodes[n].direction - 1) % 2) * 0.5 +
            ((prevDir - 1) % 2) * -0.5 +
            (largeTurn ? 0.73 : 0.27) * Math.sin(angle);
      } else {
        x = this.nodes[n].x + 0.5 - flowSign *
            ((this.nodes[n].direction - 1) % 2) * 0.23 -
            ((this.nodes[n].direction - 2) % 2) *
            (pos - 0.5);
        y = this.nodes[n].y + 0.5 - flowSign *
            ((this.nodes[n].direction - 2) % 2) * 0.23 +
            ((this.nodes[n].direction - 1) % 2) *
            (pos - 0.5);
      }
      if ((x + 0.234375) * view.scale >= view.x &&
          (y + 0.234375) * view.scale >= view.y &&
          (x - 0.234375) * view.scale < view.x + view.width &&
          (y - 0.234375) * view.scale < view.y + view.height) {
        let sprite = sprites.get(items[i]);
        if (!sprite) {
          const itemDef = ITEMS.get(items[i]);
          sprite = SPRITES.get(itemDef.sprite);
          sprites.set(items[i], sprite);
        }
        ctx.drawImage(sprite.image,
            sprite.x, sprite.y,
            sprite.width, sprite.height,
            (x - 0.234375) * view.scale - view.x,
            (y - 0.234375) * view.scale - view.y,
            view.scale * 0.46875, view.scale * 0.46875);
        window.numberImageDraws++;
      }
      dte += 0.125;
    }
  }
  
  //return;
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
      
  for (let entity of this.belts[this.belts.length - 1].outputEntities) {
    if (entity.type != TYPE.belt &&
        entity.type != TYPE.undergroundBelt) {
      continue;
    }
    const vx = 0.2 * -((node.direction - 2) % 2),
        vy = 0.2 * ((node.direction - 1) % 2),
        px = -vy, py = vx;
    ctx.moveTo(
        (x + 0.5 - vx - px) * view.scale - view.x,
        (y + 0.5 - vy - py) * view.scale - view.y);
    ctx.lineTo(
        (x + 0.5) * view.scale - view.x,
        (y + 0.5) * view.scale - view.y);
    ctx.lineTo(
        (x + 0.5 - vx + px) * view.scale - view.x,
        (y + 0.5 - vy + py) * view.scale - view.y);
    break;
  }
  ctx.strokeStyle = this.circular ? "#FF000088" : this.color;
  ctx.lineWidth = 2;
  ctx.stroke();
  window.numberOtherDraws++;
};

Lane.prototype.extendEnd = function(belt) {
  if (belt.type == TYPE.splitter) {
    this.endSplitterData = belt.data;
  }
  const last = this.belts[this.belts.length - 1];
  this.belts.push(belt);
  if (last.direction == belt.direction) {
    const diff = belt.type != TYPE.undergroundBelt ||
        last.type != TYPE.undergroundBelt ? 1 :
        Math.abs(last.x - belt.x + last.y - belt.y);
    const node = this.nodes[this.nodes.length - 1];
    if (diff > 1) node.gaps.push(node.length - 1, diff);
    node.length += diff;
    if (this.minusFlow.length) {
      this.minusFlow[0] += diff;
    }
    if (this.plusFlow.length) {
      this.plusFlow[0] += diff;
    }
    return this;
  }
  const turn = (((belt.direction - last.direction + 4) % 4) - 2) * 0.5;
  if (this.minusFlow.length) {
    this.minusFlow[0] += 1 - turn;
  }
  if (this.plusFlow.length) {
    this.plusFlow[0] += 1 + turn;
  }
  this.nodes.push(new Node(belt.x, belt.y, belt.direction, 1));
  return this;
};

Lane.prototype.extendBegin = function(belt) {
  const first = this.belts[0];
  this.belts.unshift(belt);
  if (this.circular) {
    this.circular = false;
  }
  if (first.direction == belt.direction) {
    const diff = belt.type != TYPE.undergroundBelt ||
        first.type != TYPE.undergroundBelt ? 1 :
        Math.abs(first.x - belt.x + first.y - belt.y);
    for (let i = 0; i < this.nodes[0].gaps.length; i += 2) {
      this.nodes[0].gaps[i] += diff;
    }
    if (diff > 1) this.nodes[0].gaps.unshift(0, diff);
    this.nodes[0].x += ((belt.direction - 2) % 2) * diff;
    this.nodes[0].y += (-(belt.direction - 1) % 2) * diff;
    this.nodes[0].length += diff;
    return this;
  }
  this.nodes.unshift(new Node(belt.x, belt.y, belt.direction, 1));
  return this;
};

Lane.prototype.removeEnd = function() {
  const belt = this.belts.pop();
  if (this.endSplitterData) {
    this.endSplitterData = undefined;
  }
  const last = this.belts[this.belts.length - 1];
  const diff = belt.type != TYPE.undergroundBelt ||
      last.type != TYPE.undergroundBelt ? 1 :
      Math.abs(last.x - belt.x + last.y - belt.y);
  const turnBelt =
      (belt.direction - last.direction + 4) % 4;
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    const items = flowSign == FLOW.minus ? this.minusItems : this.plusItems;
    let removal = diff, i = 0;
    if (turnBelt) {
      removal += (turnBelt == 1 ? -0.5 : 0.5) * flowSign;
    }
    while (i < flow.length && removal > flow[i]) {
      removal -= flow[i++] + 0.25;
    }
    if (i < flow.length && removal > 0) {
      flow[i] -= removal;
    }
    if (i) {
      flow.splice(0, i);
      items.splice(0, i);
    }
  }
  if (this.circular) {
    this.circular = false;
  }
  const node = this.nodes[this.nodes.length - 1];
  if (diff > 1) node.gaps.length -= 2;
  if (!(node.length -= diff)) {
    this.nodes.pop();
  }
};

Lane.prototype.removeBegin = function() {
  const belt = this.belts.shift();
  const first = this.belts[0];
  const diff = belt.type != TYPE.undergroundBelt ||
      first.type != TYPE.undergroundBelt ? 1 :
      Math.abs(first.x - belt.x + first.y - belt.y);
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    const items = flowSign == FLOW.minus ? this.minusItems : this.plusItems;
    let laneLength = -diff;
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
      items.length = i;
    }
  }
  if (this.circular) {
    this.circular = false;
  }
  if (this.nodes[0].length -= diff) {
    if (diff > 1) this.nodes[0].gaps.splice(0, 2);
    for (let i = 0; i < this.nodes[0].gaps.length; i += 2) {
      this.nodes[0].gaps[i] -= diff;
    }
    this.nodes[0].x += -((this.nodes[0].direction - 2) % 2) * diff;
    this.nodes[0].y += ((this.nodes[0].direction - 1) % 2) * diff;
    return;
  }
  this.nodes.shift();
};

Lane.prototype.appendLaneEnd = function(other) {
  if (other == this) {
    this.circular = true;
    return;
  }
  if (other.endSplitterData) {
    this.endSplitterData = other.endSplitterData;
  }
  const last = this.belts[this.belts.length - 1];
  const diff = last.type != TYPE.undergroundBelt ||
      other.belts[0].type != TYPE.undergroundBelt ? 0 :
      Math.abs(other.belts[0].x - last.x + other.belts[0].y - last.y) - 1;
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    const otherFlow = flowSign == FLOW.minus ? other.minusFlow : other.plusFlow;
    const items = flowSign == FLOW.minus ? this.minusItems : this.plusItems;
    const otherItems = flowSign == FLOW.minus ? other.minusItems : other.plusItems;
    if (!flow.length) {
      flow.push(...otherFlow);
      otherFlow.length = 0;
      items.push(...otherItems);
      otherItems.length = 0;
      continue;
    }
    let laneLength = diff;
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
    items.unshift(...otherItems);
    otherItems.length = 0;
  }
  const node = this.nodes[this.nodes.length - 1];
  if (node.direction == other.nodes[0].direction) {
    if (diff > 0) node.gaps.push(node.length - 1, diff + 1);
    for (let i = 0; i < other.nodes[0].gaps.length; i += 2) {
      node.gaps.push(node.length + diff +
          other.nodes[0].gaps[i], other.nodes[0].gaps[i + 1]);
    }
    node.length += other.nodes[0].length + diff;
    for (let i = 1; i < other.nodes.length; i++) {
      this.nodes.push(other.nodes[i]);
    }
  } else {
    this.nodes.push(...other.nodes);
  }
  this.belts.push(...other.belts);
  for (let b of other.belts) {
    if (b.type != TYPE.splitter) {
      b.data.lane = this;
    } else if (b.data.leftInLane == other) {
      b.data.leftInLane = this;
    } else {
      b.data.rightInLane = this;
    }
  }
  other.nodes.length = 0;
  other.belts.length = 0;
  return;
};

/**
 * Splits a lane just before the given belt.
 */
Lane.prototype.split = function(belt) {
  const n = belt.type == TYPE.splitter ? this.nodes.length - 1 :
      this.nodes.findIndex(n => n.contains(belt));
  const nodes = this.nodes.slice(n);
  const d = Math.abs(this.nodes[n].x - belt.x + this.nodes[n].y - belt.y);
  const b = belt.type == TYPE.splitter ? this.belts.length - 1 :
      this.belts.indexOf(belt);
  const diff = belt.type != TYPE.undergroundBelt ||
      this.belts[b - 1].type != TYPE.undergroundBelt ? 0 :
      Math.abs(this.belts[b - 1].x - belt.x + this.belts[b - 1].y - belt.y) - 1;
  if (d) {
    nodes[0] = new Node(
        nodes[0].x - ((nodes[0].direction - 2) % 2) * d,
        nodes[0].y + ((nodes[0].direction - 1) % 2) * d,
        nodes[0].direction,
        nodes[0].length - d);
    let gapsLength = this.nodes[n].gaps.length;
    for (let i = 0; i < this.nodes[n].gaps.length; i += 2) {
      if (this.nodes[n].gaps[i] < d - diff - 1) continue;
      if (i < gapsLength) gapsLength = i;
      if (this.nodes[n].gaps[i] < d) continue;
      nodes[0].gaps.push(this.nodes[n].gaps[i] - d,
          this.nodes[n].gaps[i + 1]);
    }
    this.nodes[n].gaps.length = gapsLength;
    this.nodes[n].length = d - diff;
  }
  this.nodes.length = n + (d ? 1 : 0);
  
  const belts = this.belts.splice(b);
  // lane is the end half of the original.
  const lane = new Lane(belts, nodes);
  for (let b of lane.belts) {
    if (b.type != TYPE.splitter) {
      b.data.lane = lane;
    } else if (b.data.leftInLane == this) {
      b.data.leftInLane = lane;
    } else {
      b.data.rightInLane = lane;
    }
  }
  if (this.endSplitterData) {
    lane.endSplitterData = this.endSplitterData;
    this.endSplitterData = undefined;
  }
  
  for (let flowSign of FLOWS) {
    const flow = flowSign == FLOW.minus ? this.minusFlow : this.plusFlow;
    const laneFlow = flowSign == FLOW.minus ? lane.minusFlow : lane.plusFlow;
    const items = flowSign == FLOW.minus ? this.minusItems : this.plusItems;
    const laneItems = flowSign == FLOW.minus ? lane.minusItems : lane.plusItems;
    let laneLength = 0;
    for (let n = 0; n < lane.nodes.length; n++) {
      laneLength += lane.nodes[n].length;
      if (n || (this.circular && lane.nodes[0].direction !=
            this.nodes[this.nodes.length - 1].direction)) {
        const turn = ((lane.nodes[n].direction -
            (n ? lane.nodes[n - 1] : this.nodes[this.nodes.length - 1]).direction + 4) % 4) - 2;
        laneLength += flowSign * turn * 0.5;
      }
    }
    let i = 0;
    while (i < flow.length && laneLength > flow[i]) {
      laneLength -= flow[i++] + 0.25;
    }
    if (i < flow.length && laneLength < flow[i] + 0.25) {
      laneFlow.push(...flow.splice(0, i));
      laneItems.push(...items.splice(0, i));
      if (diff) {
        i = 0; laneLength += diff; 
        while (i < flow.length && laneLength > flow[i]) {
          laneLength -= flow[i++] + 0.25;
        }
        flow.splice(0, i);
        items.splice(0, i);
      }
      flow[0] -= laneLength;
    } else {
      laneFlow.push(...flow);
      flow.length = 0;
      laneItems.push(...items);
      items.length = 0;
    }
  }
  
  if (this.circular) {
    lane.appendLaneEnd(this);
    lane.circular = true;
  }
  
  return lane;
}

function Node(x, y, direction, length) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.length = length;
  this.gaps = [];
}

Node.prototype.contains = function(belt) {
  const x = (belt.x - this.x) * (this.direction == 3 ? -1 : 1);
  const y = (belt.y - this.y) * (this.direction == 0 ? -1 : 1);
  const dv = this.direction % 2 ? x : y;
  if (this.direction % 2 ? y != 0 : x != 0)
    return false;
  for (let i = 0; i < this.gaps.length; i += 2) {
    if (dv > this.gaps[i] && dv < this.gaps[i] + this.gaps[i + 1])
      return false;
  }
  return dv >= 0 && dv < this.length;
}

export {Lane};

import {TYPE} from './entity-properties.js';
import {Lane} from './transport-network-lane.js';

function TransportNetwork() {
  this.lanes = [];
}

TransportNetwork.prototype.reset = function() {
  this.lanes.length = 0;
}

/**
 * Computes the belt connection input of this belt.
 * Returns true iff the input of this belt changed.
 */
TransportNetwork.prototype.computeBeltConnections = function(belt) {
  const oldBeltInput = belt.data.beltInput;
  compute: {
    if (belt.type == TYPE.undergroundBelt &&
        belt.data.undergroundUp) {
      let closest = undefined;
      for (let input of belt.inputEntities) {
        if (input.type != TYPE.undergroundBelt ||
            input.direction != belt.direction ||
            (closest && Math.abs(belt.x - input.x + belt.y - input.y) >
            Math.abs(belt.x - closest.x + belt.y - closest.y)))
          continue;
        closest = input;
      }
      if (!closest) {
        belt.data.beltInput = undefined;
        break compute;
      }
      const other = closest.data.beltOutput;
      if (other && other != belt) {
        if (Math.abs(belt.x - closest.x + belt.y - closest.y) >
            Math.abs(other.x - closest.x + other.y - closest.y)) {
          belt.data.beltInput = undefined;
          break compute;
        }
        closest.data.beltOutput = undefined;
        other.data.beltInput = undefined;
        this.beltInputChanged(other, other.data.lane);
      }
      if (belt.data.beltInput) {
        // This is always an underground belt.
        belt.data.beltInput.data.beltOutput = undefined;
      }
      closest.data.beltOutput = belt;
      belt.data.beltInput = closest;
      break compute;
    }
    if (belt.type == TYPE.splitter) {
      const oldLeft = belt.data.leftBeltInput,
          oldRight = belt.data.rightBeltInput;
      let left = false, right = false;
      for (let i = 0; i < belt.inputEntities.length; i++) {
        const other = belt.inputEntities[i];
        if (other.type != TYPE.belt &&
            other.type != TYPE.undergroundBelt &&
            other.type != TYPE.splitter)
          continue;
        if (other.type != TYPE.splitter) {
          if (belt.direction&1 ? (belt.y == other.y) == (belt.direction == 1) : (belt.x == other.x) == (belt.direction == 0)) {
            belt.data.leftBeltInput = other;
            left = true;
          } else {
            belt.data.rightBeltInput = other;
            right = true;
          }
          other.data.beltOutput = belt;
        } else {
          // Both splitters align perfectly.
          if (belt.direction&1 ? belt.y == other.y : belt.x == other.x) {
            belt.data.leftBeltInput = other;
            belt.data.rightBeltInput = other;
            other.data.leftBeltOutput = belt;
            other.data.rightBeltOutput = belt;
            left = true;
            right = true;
          } else if (belt.direction&1 ? (belt.y > other.y) == (belt.direction == 1) : (belt.x > other.x) == (belt.direction == 0)) {
            belt.data.leftBeltInput = other;
            other.data.rightBeltOutput = belt;
            left = true;
          } else {
            belt.data.rightBeltInput = other;
            other.data.leftBeltOutput = belt;
            right = true;
          }
        }
      }
      if (!left) belt.data.leftBeltInput = undefined;
      if (!right) belt.data.rightBeltInput = undefined;
      if (oldLeft != belt.data.leftBeltInput) {
        this.beltInputChanged(belt, belt.data.leftInLane);
      }
      if (oldRight != belt.data.rightBeltInput) {
        this.beltInputChanged(belt, belt.data.rightInLane);
      }
      return (oldLeft != belt.data.leftBeltInput) ||
          (oldRight != belt.data.rightBeltInput);
    }
    let best = undefined, right = undefined, left = undefined;
    for (let i = 0; i < belt.inputEntities.length; i++) {
      const other = belt.inputEntities[i];
      if (other.type != TYPE.belt &&
          other.type != TYPE.undergroundBelt &&
          other.type != TYPE.splitter)
        continue;
      if (belt.direction == other.direction) {
        best = other;
        break;
      } else if (!right &&
          (belt.direction - other.direction + 4) % 4 == 1) {
        right = other;
      } else if (!left &&
          (belt.direction - other.direction + 4) % 4 == 3) {
        left = other;
      }
    }
    if (!best && !(left && right) &&
        belt.type != TYPE.undergroundBelt) {
      best = left ?? right;
    }
    belt.data.beltInput = best;
    for (let i = 0; i < belt.inputEntities.length; i++) {
      const other = belt.inputEntities[i];
      if (other.type != TYPE.belt &&
          other.type != TYPE.undergroundBelt &&
          other.type != TYPE.splitter)
        continue;
      if (other == best) {
        if (other.type != TYPE.splitter) {
          other.data.beltOutput = belt;
        } else if (other.direction&0x1 ? (belt.y == other.y) == (other.direction == 1) : (belt.x == other.x) == (other.direction == 0)) {
          other.data.leftBeltOutput = belt;
        } else {
          other.data.rightBeltOutput = belt;
        }
      } else {
        if (other.type != TYPE.splitter) {
          other.data.beltOutput = undefined;
        } else if (other.direction&0x1 ? (belt.y == other.y) == (other.direction == 1) : (belt.x == other.x) == (other.direction == 0)) {
          other.data.leftBeltOutput = undefined;
        } else {
          other.data.rightBeltOutput = undefined;
        }
      }
    }
    break compute;
  } // break compute:
  if (oldBeltInput != belt.data.beltInput) {
    this.beltInputChanged(belt, belt.data.lane);
  }
  return oldBeltInput != belt.data.beltInput;
};

TransportNetwork.prototype.addBelt = function(belt) {
  if (belt.type != TYPE.splitter) {
    const before = belt.data.beltInput;
    const after = belt.data.beltOutput;
    if (before) {
      if (before.type != TYPE.splitter) {
        belt.data.lane = before.data.lane.extendEnd(belt);
      } else if (before.data.leftBeltOutput == belt) {
        belt.data.lane = before.data.leftOutLane.extendEnd(belt);
      } else {
        belt.data.lane = before.data.rightOutLane.extendEnd(belt);
      }
      if (after) {
        if (after.type != TYPE.splitter) {
          belt.data.lane.appendLaneEnd(after.data.lane);
        } else if (after.data.leftBeltInput == belt) {
          belt.data.lane.appendLaneEnd(after.data.leftInLane);
        } else {
          belt.data.lane.appendLaneEnd(after.data.rightInLane);
        }
      }
      return;
    } else if (after) {
      if (after.type != TYPE.splitter) {
        belt.data.lane =
          after.data.lane.extendBegin(belt);
      } else if (after.data.leftBeltInput == belt) {
        belt.data.lane =
          after.data.leftInLane.extendBegin(belt);
      } else {
        belt.data.lane =
          after.data.rightInLane.extendBegin(belt);
      }
      return;
    }
    this.lanes.push(Lane.fromBelt(belt));
  } else {
    if (belt.data.leftBeltInput) {
      const other = belt.data.leftBeltInput;
      if (other.type != TYPE.splitter) {
        belt.data.leftInLane =
            other.data.lane.extendEnd(belt);
      } else if (belt.direction&1 ? belt.y == other.y : belt.x == other.x) {
        belt.data.leftInLane =
            other.data.leftOutLane.extendEnd(belt);
      } else {
        belt.data.leftInLane =
            other.data.rightOutLane.extendEnd(belt);
      }
    } else {
      this.lanes.push(Lane.fromSplitter(belt, 1, 1));
    }
    if (belt.data.rightBeltInput) {
      const other = belt.data.rightBeltInput;
      if (other.type != TYPE.splitter) {
        belt.data.rightInLane =
            other.data.lane.extendEnd(belt);
      } else if (belt.direction&1 ? belt.y == other.y : belt.x == other.x) {
        belt.data.rightInLane =
            other.data.rightOutLane.extendEnd(belt);
      } else {
        belt.data.rightInLane =
            other.data.leftOutLane.extendEnd(belt);
      }
    } else {
      this.lanes.push(Lane.fromSplitter(belt, 1, 0));
    }
    if (belt.data.leftBeltOutput) {
      const other = belt.data.leftBeltOutput;
      if (other.type != TYPE.splitter) {
        belt.data.leftOutLane =
            other.data.lane.extendBegin(belt);
      } else if (belt.direction&1 ? belt.y == other.y : belt.x == other.x) {
        belt.data.leftOutLane =
            other.data.leftInLane.extendBegin(belt);
      } else {
        belt.data.leftOutLane =
            other.data.rightInLane.extendBegin(belt);
      }
    } else {
      this.lanes.push(Lane.fromSplitter(belt, 0, 1));
    }
    if (belt.data.rightBeltOutput) {
      const other = belt.data.rightBeltOutput;
      if (other.type != TYPE.splitter) {
        belt.data.rightOutLane =
            other.data.lane.extendBegin(belt);
      } else if (belt.direction&1 ? belt.y == other.y : belt.x == other.x) {
        belt.data.rightOutLane =
            other.data.rightInLane.extendBegin(belt);
      } else {
        belt.data.rightOutLane =
            other.data.leftInLane.extendBegin(belt);
      }
    } else {
      this.lanes.push(Lane.fromSplitter(belt, 0, 0));
    }
  }
};

TransportNetwork.prototype.removeBelt = function(belt) {
  if (belt.type != TYPE.splitter) {
    if (belt.data.lane.belts[0] != belt) {
      if (belt.data.lane.belts[belt.data.lane.belts.length - 1] != belt) {
        this.lanes.push(belt.data.lane.split(belt.data.beltOutput));
      }
      belt.data.lane.removeEnd();
      return;
    } else if (belt.data.lane.belts[belt.data.lane.belts.length - 1] != belt) {
      belt.data.lane.removeBegin();
      return;
    }
    belt.data.lane.belts.length = 0;
    belt.data.lane.nodes.length = 0;
  } else {
    if (belt.data.leftInLane.belts.length > 1) {
      belt.data.leftInLane.removeEnd();
    } else {
      belt.data.leftInLane.belts.length = 0;
      belt.data.leftInLane.nodes.length = 0;
    }
    if (belt.data.rightInLane.belts.length > 1) {
      belt.data.rightInLane.removeEnd();
    } else {
      belt.data.rightInLane.belts.length = 0;
      belt.data.rightInLane.nodes.length = 0;
    }
    if (belt.data.leftOutLane.belts.length > 1) {
      belt.data.leftOutLane.removeBegin();
    } else {
      belt.data.leftOutLane.belts.length = 0;
      belt.data.leftOutLane.nodes.length = 0;
    }
    if (belt.data.rightOutLane.belts.length > 1) {
      belt.data.rightOutLane.removeBegin();
    } else {
      belt.data.rightOutLane.belts.length = 0;
      belt.data.rightOutLane.nodes.length = 0;
    }
  }
};

TransportNetwork.prototype.beltInputChanged = function(belt, lane) {
  if (!lane) return;
  if(lane.belts[0] != belt) {
    this.lanes.push(lane.split(belt));
  }
  if (belt.data.beltInput) {
    if (belt.data.beltInput.type != TYPE.splitter) {
      if (belt.data.beltInput.data.lane) {
        belt.data.beltInput.data.lane.appendLaneEnd(lane);
      }
    } else if (belt.data.beltInput.data.leftBeltOutput == belt) {
      if (belt.data.beltInput.data.leftOutLane) {
        belt.data.beltInput.data.leftOutLane.appendLaneEnd(lane);
      }
    } else {
      if (belt.data.beltInput.data.rightOutLane) {
        belt.data.beltInput.data.rightOutLane.appendLaneEnd(lane);
      }
    }
  }
};

TransportNetwork.prototype.update = function(time, dt) {
  let removedLanes = 0;
  for (let i = 0; i < this.lanes.length; i++) {
    if (!this.lanes[i].nodes.length) {
      removedLanes++;
      continue;
    }
    this.lanes[i].update(time, dt);
    if (removedLanes) {
      this.lanes[i - removedLanes] = this.lanes[i];
    }
  }
  if (removedLanes) {
    this.lanes.length -= removedLanes;
  }
};

TransportNetwork.prototype.draw = function(ctx, view) {
  for (let lane of this.lanes) {
    if (!lane.nodes.length) continue;
    lane.draw(ctx, view);
  }
};

export {TransportNetwork};

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
        this.beltInputChanged(other);
      }
      if (belt.data.beltInput) {
        belt.data.beltInput.data.beltOutput = undefined;
      }
      closest.data.beltOutput = belt;
      belt.data.beltInput = closest;
      break compute;
    }
    let right = undefined, left = undefined;
    for (let i = 0; i < belt.inputEntities.length; i++) {
      const other = belt.inputEntities[i];
      if (other.type != TYPE.belt &&
          other.type != TYPE.undergroundBelt)
        continue;
      if (belt.x + (belt.direction - 2) % 2 == other.x &&
          belt.y - (belt.direction - 1) % 2 == other.y) {
        belt.data.beltInput = other;
        other.data.beltOutput = belt;
        if (right?.data.beltOutput) {
          right.data.beltOutput = undefined;
        }
        if (left?.data.beltOutput) {
          left.data.beltOutput = undefined;
        }
        for (i++; i < belt.inputEntities.length; i++) {
          if (belt.inputEntities[i].type != TYPE.belt ||
              !belt.inputEntities[i].data.beltOutput) continue;
          belt.inputEntities[i].data.beltOutput = undefined;
        }
        break compute;
      } else if (!right &&
          belt.x - (belt.direction - 1) % 2 == other.x &&
          belt.y - (belt.direction - 2) % 2 == other.y) {
        right = other;
      } else if (!left &&
          belt.x + (belt.direction - 1) % 2 == other.x &&
          belt.y + (belt.direction - 2) % 2 == other.y) {
        left = other;
      }
    }
    if ((right && left) ||
        belt.type == TYPE.undergroundBelt) {
      belt.data.beltInput = undefined;
      if (right?.data.beltOutput) {
        right.data.beltOutput = undefined;
      }
      if (left?.data.beltOutput) {
        left.data.beltOutput = undefined;
      }
      break compute;
    }
    belt.data.beltInput = right || left;
    if (belt.data.beltInput) {
      belt.data.beltInput.data.beltOutput = belt;
    }
    break compute;
  } // break compute:
  if (oldBeltInput != belt.data.beltInput) {
    this.beltInputChanged(belt);
  }
  return oldBeltInput != belt.data.beltInput;
};

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

TransportNetwork.prototype.removeBelt = function(belt) {
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
};

TransportNetwork.prototype.beltInputChanged = function(belt) {
  if (!belt.data.lane) return;
  if(belt.data.lane.belts[0] != belt) {
    this.lanes.push(belt.data.lane.split(belt));
  }
  if (belt.data.beltInput?.data.lane) {
    belt.data.beltInput.data.lane.appendLaneEnd(belt.data.lane);
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

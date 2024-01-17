import {TYPE} from './entity-properties.js';
import {Lane} from './transport-network-lane.js';

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

TransportNetwork.prototype.update = function(time) {
  const dt = time - this.lastUpdate;
  this.lastUpdate = time;
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

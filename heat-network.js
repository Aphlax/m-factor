import {Conduit} from './heat-network-conduit.js';
import {TYPE} from './entity-properties.js';
import {SETTINGS} from './storage.js';

function HeatNetwork() {
  this.conduits = [];
}

HeatNetwork.prototype.addPart = function(part) {
  let connected = false;
  for (let i = 0; i < part.data.heatConnections.length; i++) {
    const other = part.data.heatParts[i];
    if (!other) continue;
    
    if (connected) {
      part.data.conduit.join(other.data.conduit);
    } else {
      other.data.conduit.add(part);
      connected = true;
    }
  }
  if (!connected) {
    this.conduits.push(Conduit.fromPart(part));
  }
};

HeatNetwork.prototype.removePart = function(part) {
  if (!part.data.conduit) return;
  let conduit = part.data.conduit,
      previous1 = undefined,
      previous2 = undefined,
      previous3 = undefined;
  conduit.remove(part);
  for (let i = 0; i < part.data.heatConnections.length; i++) {
    const other = part.data.heatParts[i];
    if (!other) continue;
    if (previous1) {
      const segment = other.data.conduit.split(
          other, part, previous1, previous2, previous3);
      if (segment) {
        this.conduits.push(segment);
      }
    }
    if (!previous1) {
      previous1 = other;
    } else if (!previous2) {
      previous2 = other;
    } else {
      previous3 = other;
    }
  }
};

HeatNetwork.prototype.update = function(time, dt) {
  let removedConduits = 0;
  for (let i = 0; i < this.conduits.length; i++) {
    if (!this.conduits[i].parts.size) {
      removedConduits++;
      continue;
    }
    this.conduits[i].update(time, dt);
    if (removedConduits) {
      this.conduits[i - removedConduits] = this.conduits[i];
    }
  }
  if (removedConduits) {
    this.conduits.length -= removedConduits;
  }
};

HeatNetwork.prototype.draw = function(ctx, view) {
  if (!SETTINGS.debugPipes) return;
  for (let conduit of this.conduits) {
    conduit.draw(ctx, view);
  }
};

export {HeatNetwork};

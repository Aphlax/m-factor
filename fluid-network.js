import {Channel} from './fluid-network-channel.js';
import {TYPE} from './entity-properties.js';

function FluidNetwork() {
  this.channels = [];
}

/** Returns true if this is an invalid connection and it should be removed. */
FluidNetwork.prototype.addPipe = function(pipe) {
  let fluid = 0;
  for (let i = 0; i < 4; i++) {
    const other = pipe.data.pipes[i];
    if (other && other.type == TYPE.pipe) {
      if (fluid && other.data.channel.fluid &&
          fluid != other.data.channel.fluid) {
        return true;
      }
      fluid = other.data.channel.fluid;
    }
  }
  let connected = false;
  for (let i = 0; i < 4; i++) {
    const other = pipe.data.pipes[i];
    if (other && other.type == TYPE.pipe) {
      if (connected) {
        pipe.data.channel.join(other.data.channel);
      } else {
        other.data.channel.add(pipe);
        connected = true;
      }
    }
  }
  if (!connected) {
    this.channels.push(Channel.fromPipe(pipe));
  }
};

FluidNetwork.prototype.removePipe = function(pipe) {
  let previous1 = undefined,
      previous2 = undefined,
      previous3 = undefined;
  pipe.data.channel.remove(pipe);
  for (let i = 0; i < 4; i++) {
    const other = pipe.data.pipes[i];
    if (other && other.type == TYPE.pipe) {
      if (previous1) {
        const segment = other.data.channel.split(
            other, pipe, previous1, previous2, previous3);
        if (segment) {
          this.channels.push(segment);
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
  }
};

FluidNetwork.prototype.update = function(time, dt) {
  let removedChannels = 0;
  for (let i = 0; i < this.channels.length; i++) {
    if (!this.channels[i].pipes.size) {
      removedChannels++;
      continue;
    }
    this.channels[i].update(time, dt);
    if (removedChannels) {
      this.channels[i - removedChannels] = this.channels[i];
    }
  }
  if (removedChannels) {
    this.channels.length -= removedChannels;
  }
};

FluidNetwork.prototype.draw = function(ctx, view) {
  for (let channel of this.channels) {
    channel.draw(ctx, view);
  }
};

export {FluidNetwork};

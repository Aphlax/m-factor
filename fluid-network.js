import {Channel} from './fluid-network-channel.js';
import {TYPE} from './entity-properties.js';

function FluidNetwork() {
  this.channels = [];
}

/** Returns true if this is an invalid connection and it should be removed. */
FluidNetwork.prototype.addPipe = function(pipe) {
  let fluid = 0;
  if (pipe.inputFluidTank?.internalInlet) {
    fluid = pipe.inputFluidTank.tanklets[0].fluid;
  }
  for (let i = 0; i < pipe.data.pipeConnections.length; i++) {
    const other = pipe.data.pipes[i];
    if (!other || !other.data.pipeConnections)
      continue;
    let isPipeConnection = false;
    for (let j = 0; j < other.data.pipeConnections.length; j++) {
      if (other.data.pipes[j] == pipe)
        isPipeConnection = true;
    }
    if (!isPipeConnection) continue;
    if (fluid && other.data.channel.fluid &&
        fluid != other.data.channel.fluid) {
      return true; // Invalid connection.
    }
    fluid = other.data.channel.fluid;
  }
  let connected = false;
  for (let i = 0; i < pipe.data.pipeConnections.length; i++) {
    const other = pipe.data.pipes[i];
    if (!other || !other.data.pipeConnections)
      continue;
    let isPipeConnection = false;
    for (let j = 0; j < other.data.pipeConnections.length; j++) {
      if (other.data.pipes[j] == pipe)
        isPipeConnection = true;
    }
    if (!isPipeConnection) continue;
    
    if (connected) {
      pipe.data.channel.join(other.data.channel);
    } else {
      other.data.channel.add(pipe);
      connected = true;
    }
  }
  if (!connected) {
    this.channels.push(Channel.fromPipe(pipe));
  }
};

FluidNetwork.prototype.removePipe = function(pipe) {
  if (!pipe.data.channel) return;
  let channel = pipe.data.channel,
      previous1 = undefined,
      previous2 = undefined,
      previous3 = undefined;
  channel.remove(pipe);
  for (let i = 0; i < pipe.data.pipeConnections.length; i++) {
    const other = pipe.data.pipes[i];
    if (!other || !other.data.pipeConnections ||
        other.data.channel != channel)
      continue;
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
  return;
  for (let channel of this.channels) {
    channel.draw(ctx, view);
  }
};

FluidNetwork.prototype.removeInputFluidTank = function(entity) {
  if (entity.inputFluidTank.internalInlet &&
      entity.data.channel) {
    entity.data.channel.removeOutputEntity(entity);
    return;
  }
  for (let other of entity.inputEntities) {
    if (!other.data.pipeConnections) continue;
    for (let i = 0; i < other.data.pipeConnections.length; i++) {
      if (other.data.pipes[i] != entity) continue;
      other.data.pipes[i] = undefined;
      other.updatePipeSprites();
      other.data.channel.removeOutputEntity(entity);
      break;
    }
  }
};

FluidNetwork.prototype.removeOutputFluidTank = function(entity) {
  for (let other of entity.outputEntities) {
    if (!other.data.pipeConnections) continue;
    for (let i = 0; i < other.data.pipeConnections.length; i++) {
      if (other.data.pipes[i] != entity) continue;
      other.data.pipes[i] = undefined;
      other.updatePipeSprites();
      other.data.channel.removeInputEntity(entity);
      break;
    }
  }
};

export {FluidNetwork};

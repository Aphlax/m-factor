import {SPRITES} from './sprite-pool.js';
import {TYPE, STATE, DIRECTION, MAX_SHADOW} from './entity-properties.js';
import {ITEMS} from './item-definitions.js';

/*
  Optimizations
  
  - Draw terrain on separate canvas, only refresh when changed
  - resources too
  - water terrain?
  - belt sprites chaining
  - item sprites chaining
  
  
*/

const COLOR = {
  greenHighlight: "#33EE00",
  greenHighlightBorder: "#44AA00",
  yellowHighlight: "#EEEE00",
  yellowHighlightBorder: "#FFAA00",
  wire: "#EEAA22",
  shadow: "#000000",
  powerSupplyArea: "#88AAFF40",
};

export function draw(ctx, view, time) {
  if ((this.x + this.width + 1) * view.scale <= view.x)
    return;
  if (this.x * view.scale > view.x + view.width)
    return;
  if ((this.y + this.height) * view.scale <= view.y)
    return;
  if ((this.y - 1) * view.scale > view.y + view.height)
    return;
  let animation = this.animation;
  if (this.animationLength && (this.state == STATE.running)) {
    animation = Math.floor(animation +
        (time - this.taskStart) *
        this.animationSpeed / 60) % this.animationLength;
  }
  const sprite = SPRITES.get(this.sprite + animation);
  if (!sprite) {
    console.log({
      animation,
      time,
      taskStart: this.taskStart,
      thisAnimation: this.animation,
      spriteBase: this.sprite,
      spriteId: this.sprite + animation,
      entity: this,
    });
    throw new Error("Missing sprite!");
  }
  const xScale = this.width * view.scale /
      (sprite.width - sprite.left - sprite.right);
  const yScale = this.height * view.scale /
      (sprite.height - sprite.top - sprite.bottom);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y, sprite.width, sprite.height,
      Math.floor(this.x * view.scale - view.x -
          sprite.left * xScale),
      Math.floor(this.y * view.scale - view.y -
          sprite.top * yScale),
      Math.ceil(sprite.width * xScale),
      Math.ceil(sprite.height * yScale));
};

export function drawShadow(ctx, view, time) {
  if ((this.x + this.width + MAX_SHADOW) * view.scale <= view.x)
    return;
  if (this.x * view.scale > view.x + view.width)
    return;
  if ((this.y + this.height) * view.scale <= view.y)
    return;
  if (this.y * view.scale > view.y + view.height)
    return;
  let animation = this.spriteShadowAnimation ? this.animation : 0;
  if (this.animationLength && this.state == STATE.running && this.spriteShadowAnimation) {
    animation = Math.floor(animation +
        (time - this.taskStart) * this.animationSpeed / 60) %
        this.animationLength;
  }
  const sprite = SPRITES.get(this.spriteShadow + animation);
  if (!sprite) {
    console.log({
      animation,
      time,
      taskStart: this.taskStart,
      thisAnimation: this.animation,
      spriteBase: this.spriteShadow,
      spriteId: this.spriteShadow + animation,
      entity: this,
    });
    throw new Error("Missing shadow sprite!");
  }
  const xScale = this.width * view.scale /
      (sprite.width - sprite.left - sprite.right);
  const yScale = this.height * view.scale /
      (sprite.height - sprite.top - sprite.bottom);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y, sprite.width, sprite.height,
      Math.floor(this.x * view.scale - view.x -
          sprite.left * xScale),
      Math.floor(this.y * view.scale - view.y -
          sprite.top * yScale),
      Math.ceil(sprite.width * xScale),
      Math.ceil(sprite.height * yScale));
};

export function drawBelt(ctx, view, time) {
  if ((this.x + this.width + 0.1) * view.scale <= view.x)
    return;
  if (this.x * view.scale > view.x + view.width)
    return;
  if ((this.y + this.height) * view.scale <= view.y)
    return;
  if ((this.y - 1) * view.scale > view.y + view.height)
    return;
  let animation = Math.floor(
      time * this.animationSpeed / 60) % this.animationLength;
  const sprite = SPRITES.get(this.sprite + animation);
  const xScale = this.width * view.scale /
      (sprite.width - sprite.left - sprite.right);
  const yScale = this.height * view.scale /
      (sprite.height - sprite.top - sprite.bottom);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y, sprite.width, sprite.height,
      Math.floor(this.x * view.scale - view.x -
          sprite.left * xScale),
      Math.floor(this.y * view.scale - view.y -
          sprite.top * yScale),
      Math.ceil(sprite.width * xScale),
      Math.ceil(sprite.height * yScale));
  if (this.data.beltEndSprite) {
    const s = SPRITES.get(this.data.beltEndSprite + animation);
    const x = this.x - (this.direction - 2) % 2;
    const y = this.y + (this.direction - 1) % 2;
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        Math.floor(x * view.scale - view.x - s.left * xScale),
        Math.floor(y * view.scale - view.y - s.top * yScale),
        Math.ceil(s.width * xScale),
        Math.ceil(s.height * yScale));
  }
  if (this.data.beltBeginSprite) {
    const s = SPRITES.get(this.data.beltBeginSprite + animation);
    const x = this.x + (this.direction - 2) % 2;
    const y = this.y - (this.direction - 1) % 2;
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        Math.floor(x * view.scale - view.x - s.left * xScale),
        Math.floor(y * view.scale - view.y - s.top * yScale),
        Math.ceil(s.width * xScale),
        Math.ceil(s.height * yScale));
  }
  if (this.data.beltExtraRightSprite) {
    const s = SPRITES.get(this.data.beltExtraRightSprite + animation);
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        Math.floor(this.x * view.scale - view.x - s.left * xScale),
        Math.floor(this.y * view.scale - view.y - s.top * yScale),
        Math.ceil(s.width * xScale),
        Math.ceil(s.height * yScale));
  }
  if (this.data.beltExtraLeftSprite) {
    const s = SPRITES.get(this.data.beltExtraLeftSprite + animation);
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        Math.floor(this.x * view.scale - view.x - s.left * xScale),
        Math.floor(this.y * view.scale - view.y - s.top * yScale),
        Math.ceil(s.width * xScale),
        Math.ceil(s.height * yScale));
  }
}

export function drawInserterHand(ctx, view, time) {
  if ((this.x + 2) * view.scale <= view.x)
    return;
  if ((this.x - 1) * view.scale > view.x + view.width)
    return;
  if ((this.y + 2) * view.scale <= view.y)
    return;
  if ((this.y - 1) * view.scale > view.y + view.height)
    return;
  const base = SPRITES.get(this.data.inserterHandSprites);
  const hand = SPRITES.get(this.data.inserterHandSprites +
      (this.data.inserterItem ? 2 : 1));
  
  let p;
  if (this.state == STATE.running) {
    p = Math.min((time - this.taskStart) /
        (this.taskEnd - this.taskStart), 1);
    if (!this.data.inserterItem) {
      p = 1 - p;
    }
  } else {
    p = this.state == STATE.itemReady ? 1 : 0;
  }
  const smooth = p < 0.5 ? 2 * p * p : 1 - Math.pow(2 - 2 * p, 2) / 2;
  let angle;
  if (this.direction == DIRECTION.north) {
    angle = 0.5 - smooth;
  } else if (this.direction == DIRECTION.east) {
    angle = 1 + smooth;
  } else if (this.direction == DIRECTION.south) {
    angle = -0.5 + smooth;
  } else if (this.direction == DIRECTION.west) {
    angle = 2 - smooth;
  }
  
  const scale = view.scale / 32;
  const bend = -0.22 * Math.cos(angle * Math.PI);
  const handScale = 0.55 + 0.2 * Math.sin(angle * Math.PI) +
      0.1 * Math.cos(angle * 2 * Math.PI);
  const baseScale = 0.55 - 0.2 * Math.sin(angle * Math.PI);
  ctx.translate(
      (this.x + 0.5) * view.scale - view.x,
      (this.y + 0.5) * view.scale - view.y);
  ctx.rotate((-0.5 + angle + bend) * Math.PI);
  ctx.translate(0, 24 * scale * baseScale);
  ctx.rotate((1 - bend * 1.9) * Math.PI);
  
  if (this.data.inserterItem) {
    ctx.translate(0, -40 * scale * handScale);
    ctx.rotate(this.data.inserterPickupBend * Math.PI);
    const item = SPRITES.get(ITEMS.get(this.data.inserterItem).sprite);
    ctx.drawImage(item.image,
        item.x, item.y, item.width, item.height,
        -8 * scale, -8 * scale,
        16 * scale, 16 * scale);
    ctx.rotate(-this.data.inserterPickupBend * Math.PI);
    ctx.translate(0, 40 * scale * handScale);
  }
  
  ctx.scale(1, handScale);
  ctx.drawImage(hand.image,
      hand.x, hand.y, hand.width, hand.height,
      -9 * scale,
      -40 * scale,
      hand.width * scale,
      hand.height * scale);
  ctx.scale(1, 1 / handScale);
  
  ctx.rotate(bend * 1.9 * Math.PI);
  ctx.scale(1, baseScale);
  ctx.drawImage(base.image,
      base.x, base.y, base.width, base.height,
      -4 * scale,
      -4 * scale,
      base.width * scale,
      base.height * scale);
  ctx.setTransform();
}


export function drawSelection(ctx, view) {
  const x = this.x * view.scale - view.x;
  const width = (this.width ?? 1) * view.scale;
  const y = this.y * view.scale - view.y;
  const height = (this.height ?? 1) * view.scale;
  if (x + width <= -2 || x > view.width + 2 ||
      y + height <= -2 || y > view.height + 2)
    return;
  const d = 0.3 * view.scale;
  ctx.beginPath();
  ctx.moveTo(x, y + d);
  ctx.lineTo(x, y);
  ctx.lineTo(x + d, y);
  ctx.moveTo(x + width, y + d);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width - d, y);
  ctx.moveTo(x, y + height - d);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + d, y + height);
  ctx.moveTo(x + width, y + height - d);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width - d, y + height);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = COLOR.yellowHighlightBorder;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = COLOR.yellowHighlight;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawIO(ctx, view) {
  const s = view.scale * 0.25;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (let entity of this.inputEntities) {
    const direction = this.type == TYPE.inserter ?
        this.direction : entity.direction;
    const dx = -s * ((direction - 2) % 2),
      dy = s * ((direction - 1) % 2),
      px = -dy, py = dx; // Perpendicular vector.
    let x = entity.x, y = entity.y;
    for (let i = 1; i < entity.width; i++) {
      if (Math.abs(entity.x + i - this.x) < Math.abs(x - this.x)) {
        x = entity.x + i;
      }
    }
    for (let i = 1; i < entity.height; i++) {
      if (Math.abs(entity.y + i - this.y) < Math.abs(y - this.y)) {
        y = entity.y + i;
      }
    }
    x = (x + 0.5) * view.scale - view.x + dx * 0.75;
    y = (y + 0.5) * view.scale - view.y + dy * 0.75;
    ctx.beginPath();
    ctx.moveTo(x + px + dx * 0.75, y + py + dy * 0.75);
    ctx.lineTo(x + dx * 1.25, y + dy * 1.25);
    ctx.lineTo(x - px + dx * 0.75, y - py + dy * 0.75);
    ctx.moveTo(x + px, y + py);
    ctx.lineTo(x - px, y - py);
    ctx.strokeStyle = COLOR.greenHighlightBorder;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = COLOR.greenHighlight;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  for (let entity of this.outputEntities) {
    const direction = this.type == TYPE.inserter ||
        this.type == TYPE.mine ||
        this.type == TYPE.offshorePump ||
        this.type == TYPE.boiler ||
        (this.type == TYPE.belt && entity.type == TYPE.belt) ?
        this.direction : entity.direction;
    const dx = -s * ((direction - 2) % 2),
      dy = s * ((direction - 1) % 2),
      px = -dy, py = dx; // Perpendicular vector.
    let x = entity.x, y = entity.y;
    for (let i = 1; i < entity.width; i++) {
      if (Math.abs(entity.x + i - this.x) < Math.abs(x - this.x)) {
        x = entity.x + i;
      }
    }
    for (let i = 1; i < entity.height; i++) {
      if (Math.abs(entity.y + i - this.y) < Math.abs(y - this.y)) {
        y = entity.y + i;
      }
    }
    x = (x + 0.5) * view.scale - view.x - 1.75 * dx;
    y = (y + 0.5) * view.scale - view.y - 1.75 * dy;
    ctx.beginPath();
    ctx.moveTo(x + px, y + py);
    ctx.lineTo(x + dx * 0.5, y + dy * 0.5);
    ctx.lineTo(x - px, y - py);
    ctx.strokeStyle = COLOR.greenHighlightBorder;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = COLOR.greenHighlight;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function drawRecipe(ctx, view, recipe) {
  const x = (this.x + this.width * 0.5) * view.scale - view.x;
  const y = (this.y + this.height * 0.5) * view.scale - view.y;
  const size = Math.min(16, 0.625 * view.scale);
  if (x + size <= 0 || x - size > view.width)
    return;
  if (y + size <= 0 || y - size > view.height)
    return;
  const itemDef = ITEMS.get(recipe.outputs[0].item);
  const sprite = SPRITES.get(itemDef.sprite);
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 8;
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y,
      sprite.width, sprite.height,
      Math.floor(x - size), Math.floor(y - size),
      Math.ceil(size * 2), Math.ceil(size * 2));
  ctx.shadowColor = undefined;
  ctx.shadowBlur = 0;
}

export function drawWireConnections(ctx, view, shadow) {
  ctx.lineCap = "round";
  ctx.strokeStyle = !shadow ? COLOR.wire : COLOR.shadow;
  ctx.lineWidth = 0.03 * view.scale;
  const slack = 0.5, dist = 0.6;
  const slackX = shadow ? slack : 0,
        slackY = shadow ? 0 : slack;
  for (let other of this.data.wires) {
    if (other.y > this.y || (other.y == this.y && other.x > this.x))
      continue;
    
    const tx = this.x + (!shadow ? this.data.wireConnectionPointX : this.data.wireConnectionPointShadowX);
    const ty = this.y + (!shadow ? this.data.wireConnectionPointY : this.data.wireConnectionPointShadowY);
    const ox = other.x + (!shadow ? other.data.wireConnectionPointX : other.data.wireConnectionPointShadowX);
    const oy = other.y + (!shadow ? other.data.wireConnectionPointY : other.data.wireConnectionPointShadowY);
    const tox = ox - tx, toy = oy - ty;
    const l = Math.sqrt(tox * tox + toy * toy) / dist;
    const cp1x = tx + tox / l - slackX,
          cp1y = ty + toy / l + slackY,
          cp2x = ox - tox / l - slackX,
          cp2y = oy - toy / l + slackY;
    
    ctx.beginPath();
    ctx.moveTo(tx * view.scale - view.x, ty * view.scale - view.y);
    ctx.bezierCurveTo(
        cp1x * view.scale - view.x, cp1y * view.scale - view.y,
        cp2x * view.scale - view.x, cp2y * view.scale - view.y,
        ox * view.scale - view.x, oy * view.scale - view.y);
    ctx.stroke();
  }
}

export function drawPowerSupplyArea(ctx, view) {
  const x1 = (this.x - this.data.powerSupplyArea) * view.scale - view.x,
        y1 = (this.y - this.data.powerSupplyArea) * view.scale - view.y,
        x2 = (this.x + this.width + this.data.powerSupplyArea) * view.scale - view.x,
        y2 = (this.y + this.height + this.data.powerSupplyArea) * view.scale - view.y;
  if (x1 > view.width || y1 > view.height ||
      x2 < 0 || y2 < 0) return;
  ctx.fillStyle = COLOR.powerSupplyArea;
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
}

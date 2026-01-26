import {SPRITES} from './sprite-pool.js';
import {TYPE, STATE, DIRECTION, COLOR, MAX_HEIGHT, MAX_SHADOW} from './entity-properties.js';
import {ITEMS} from './item-definitions.js';

/*
  Optimizations
  
  - Draw terrain on separate canvas, only refresh when changed
  - resources too
  - water terrain?
  - belt sprites chaining
  - item sprites chaining
  
  
*/

export function draw(ctx, view, time) {
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  const {x, y, width, height} = this;
  if (x * s > vx + vw || (x + width + 1) * s <= vx)
    return;
  if ((y - MAX_HEIGHT) * s > vy + vh || (y + height) * s <= vy)
    return;
  let animation = this.animation;
  if (this.animationLength && (this.state == STATE.running)) {
    animation = Math.floor(animation +
        (time - this.taskStart) *
        this.animationSpeed / 60) % this.animationLength;
  }
  const sprite = SPRITES.get(this.sprite + animation);
  if (!sprite) {
    ctx.strokeStyle = ctx.fillStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x * s - vx, y * s - vy,
        width * s, height * s);
    ctx.fillText(this.sprite + animation,
        x * s - vx + 10, y * s - vy + 10);
    return;
  }
  const xScale = width * s /
      (sprite.width - sprite.left - sprite.right);
  const yScale = height * s /
      (sprite.height - sprite.top - sprite.bottom);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y, sprite.width, sprite.height,
      Math.floor(x * s - vx -
          sprite.left * xScale),
      Math.floor(y * s - vy -
          sprite.top * yScale),
      Math.ceil(sprite.width * xScale),
      Math.ceil(sprite.height * yScale));
  window.numberImageDraws++;
};

export function drawShadow(ctx, view, time) {
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  const {x, y, width, height} = this;
  if (x * s > vx + vw || (x + width + MAX_SHADOW) * s <= vx)
    return;
  if (y * s > vy + vh || (y + height) * s <= vy)
    return;
  let animation = this.spriteShadowAnimation ? this.animation : 0;
  if (this.animationLength && this.state == STATE.running && this.spriteShadowAnimation) {
    animation = Math.floor(animation +
        (time - this.taskStart) * this.animationSpeed / 60) %
        this.animationLength;
  }
  const sprite = SPRITES.get(this.spriteShadow + animation);
  if (!sprite) {
    ctx.strokeStyle = ctx.fillStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x * s - vx, y * s - vy,
        width * s, height * s);
    ctx.fillText((this.sprite + animation),
        x * s - vx + 10, y * s - vy + 10);
    return;
  }
  const xScale = width * s /
      (sprite.width - sprite.left - sprite.right);
  const yScale = height * s /
      (sprite.height - sprite.top - sprite.bottom);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y, sprite.width, sprite.height,
      Math.floor(x * s - vx -
          sprite.left * xScale),
      Math.floor(y * s - vy -
          sprite.top * yScale),
      Math.ceil(sprite.width * xScale),
      Math.ceil(sprite.height * yScale));
  window.numberImageDraws++;
};

export function drawBelt(ctx, view, time) {
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  const {x, y, width, height, direction: dir} = this;
  if (x * s > vx + vw || (x + width + 0.1) * s <= vx)
    return;
  if ((y - 1) * s > vy + vh || (y + height) * s <= vy)
    return;
  let animation = Math.floor(
      time * this.data.beltAnimationSpeed / 60) % this.data.beltAnimation;
  const sprite = SPRITES.get(this.data.beltSprite + animation);
  const xScale = s /
      (sprite.width - sprite.left - sprite.right);
  const yScale = s /
      (sprite.height - sprite.top - sprite.bottom);
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y, sprite.width, sprite.height,
      Math.floor(x * s - vx -
          sprite.left * xScale),
      Math.floor(y * s - vy -
          sprite.top * yScale),
      Math.ceil(sprite.width * xScale),
      Math.ceil(sprite.height * yScale));
  window.numberImageDraws++;
  if (this.data.beltEndSprite) {
    const spr = SPRITES.get(this.data.beltEndSprite + animation);
    const x2 = x - (dir - 2) % 2;
    const y2 = y + (dir - 1) % 2;
    ctx.drawImage(spr.image,
        spr.x, spr.y, spr.width, spr.height,
        Math.floor(x2 * s - vx - spr.left * xScale),
        Math.floor(y2 * s - vy - spr.top * yScale),
        Math.ceil(spr.width * xScale),
        Math.ceil(spr.height * yScale));
    window.numberImageDraws++;
  }
  if (this.data.beltBeginSprite) {
    const spr = SPRITES.get(this.data.beltBeginSprite + animation);
    const x2 = x + (dir - 2) % 2;
    const y2 = y - (dir - 1) % 2;
    ctx.drawImage(spr.image,
        spr.x, spr.y, spr.width, spr.height,
        Math.floor(x2 * s - vx - spr.left * xScale),
        Math.floor(y2 * s - vy - spr.top * yScale),
        Math.ceil(spr.width * xScale),
        Math.ceil(spr.height * yScale));
    window.numberImageDraws++;
  }
  if (this.type == TYPE.splitter) {
    const dx = dir % 2 ? 0 : 1,
        dy = dir % 2 ? 1 : 0;
    ctx.drawImage(sprite.image,
        sprite.x, sprite.y, sprite.width, sprite.height,
        Math.floor((x + dx) * s - vx -
            sprite.left * xScale),
        Math.floor((y + dy) * s - vy -
            sprite.top * yScale),
        Math.ceil(sprite.width * xScale),
        Math.ceil(sprite.height * yScale));
    window.numberImageDraws++;
    if (this.data.otherBeltEndSprite) {
      const spr = SPRITES.get(this.data.otherBeltEndSprite + animation);
      const x2 = x + dx - (dir - 2) % 2;
      const y2 = y + dy + (dir - 1) % 2;
      ctx.drawImage(spr.image,
          spr.x, spr.y, spr.width, spr.height,
          Math.floor(x2 * s - vx - spr.left * xScale),
          Math.floor(y2 * s - vy - spr.top * yScale),
          Math.ceil(spr.width * xScale),
          Math.ceil(spr.height * yScale));
      window.numberImageDraws++;
    }
    if (this.data.otherBeltBeginSprite) {
      const spr = SPRITES.get(this.data.otherBeltBeginSprite + animation);
      const x2 = x + dx + (dir - 2) % 2;
      const y2 = y + dy - (dir - 1) % 2;
      ctx.drawImage(spr.image,
          spr.x, spr.y, spr.width, spr.height,
          Math.floor(x2 * s - vx - spr.left * xScale),
          Math.floor(y2 * s - vy - spr.top * yScale),
          Math.ceil(spr.width * xScale),
          Math.ceil(spr.height * yScale));
      window.numberImageDraws++;
    }
  }
  if (this.data.beltExtraRightSprite) {
    const spr = SPRITES.get(this.data.beltExtraRightSprite + animation);
    ctx.drawImage(spr.image,
        spr.x, spr.y, spr.width, spr.height,
        Math.floor(x * s - vx - spr.left * xScale),
        Math.floor(y * s - vy - spr.top * yScale),
        Math.ceil(spr.width * xScale),
        Math.ceil(spr.height * yScale));
    window.numberImageDraws++;
  }
  if (this.data.beltExtraLeftSprite) {
    const s = SPRITES.get(this.data.beltExtraLeftSprite + animation);
    ctx.drawImage(s.image,
        s.x, s.y, s.width, s.height,
        Math.floor(x * s - vx - s.left * xScale),
        Math.floor(y * s - vy - s.top * yScale),
        Math.ceil(s.width * xScale),
        Math.ceil(s.height * yScale));
    window.numberImageDraws++;
  }
}

export function drawInserterHand(ctx, view, time) {
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  const {x, y, direction: dir} = this;
  const reach = this.data.inserterReach;
  if ((x + 1 + reach) * s <= vx || (x - reach) * s > vx + vw)
    return;
  if ((y + 1 + reach) * s <= vy || (y - reach) * s > vy + vh)
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
  if (dir == DIRECTION.north) {
    angle = 0.5 - smooth;
  } else if (dir == DIRECTION.east) {
    angle = 1 + smooth;
  } else if (dir == DIRECTION.south) {
    angle = -0.5 + smooth;
  } else if (dir == DIRECTION.west) {
    angle = 2 - smooth;
  }
  
  const scale = s / 32;
  const bend = -0.22 * Math.cos(angle * Math.PI);
  const handScale = 0.55 + 0.2 * Math.sin(angle * Math.PI) +
      0.1 * Math.cos(angle * 2 * Math.PI);
  const baseScale = 0.55 - 0.2 * Math.sin(angle * Math.PI);
  ctx.translate((x + 0.5) * s - vx,
      (y + 0.5) * s - vy);
  ctx.rotate((-0.5 + angle + bend) * Math.PI);
  ctx.translate(0, 24 * scale * baseScale * reach);
  ctx.rotate((1 - bend * 1.9) * Math.PI);
  
  if (this.data.inserterItem) {
    ctx.translate(0, -40 * scale * handScale * reach);
    ctx.rotate(this.data.inserterPickupBend * Math.PI);
    const item = SPRITES.get(ITEMS.get(this.data.inserterItem).sprite);
    ctx.drawImage(item.image,
        item.x, item.y, item.width, item.height,
        -8 * scale, -8 * scale,
        16 * scale, 16 * scale);
    window.numberImageDraws++;
    ctx.rotate(-this.data.inserterPickupBend * Math.PI);
    ctx.translate(0, 40 * scale * handScale * reach);
  }
  
  ctx.scale(1, handScale);
  ctx.drawImage(hand.image,
      hand.x, hand.y, hand.width, hand.height,
      -9 * scale,
      -40 * scale * reach,
      hand.width * scale,
      hand.height * scale * reach);
  window.numberImageDraws++;
  ctx.scale(1, 1 / handScale);
  
  ctx.rotate(bend * 1.9 * Math.PI);
  ctx.scale(1, baseScale);
  ctx.drawImage(base.image,
      base.x, base.y, base.width, base.height,
      -4 * scale,
      -4 * scale,
      base.width * scale,
      base.height * scale * reach);
  window.numberImageDraws++;
  ctx.setTransform();
}

export function drawSelection(ctx, view) {
  const {x: vx, y: vy, width: vw, height: vh, scale: s} = view;
  const {x, y, width, height} = this;
  const sx = x * s - vx, sy = y * s - vy;
  const sw = (width ?? 1) * s,
      sh = (height ?? 1) * s;
  if (sx + sw <= -2 || sx > vw + 2 ||
      sy + sh <= -2 || sy > vh + 2)
    return;
  const eps = 0.3 * s;
  ctx.beginPath();
  ctx.moveTo(sx, sy + eps);
  ctx.lineTo(sx, sy);
  ctx.lineTo(sx + eps, sy);
  ctx.moveTo(sx + sw, sy + eps);
  ctx.lineTo(sx + sw, sy);
  ctx.lineTo(sx + sw - eps, sy);
  ctx.moveTo(sx, sy + sh - eps);
  ctx.lineTo(sx, sy + sh);
  ctx.lineTo(sx + eps, sy + sh);
  ctx.moveTo(sx + sw, sy + sh - eps);
  ctx.lineTo(sx + sw, sy + sh);
  ctx.lineTo(sx + sw - eps, sy + sh);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = COLOR.yellowHighlightBorder;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = COLOR.yellowHighlight;
  ctx.lineWidth = 2;
  ctx.stroke();
  window.numberOtherDraws += 2;
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
    window.numberOtherDraws++;
  }
  for (let entity of this.outputEntities) {
    const direction = this.type == TYPE.inserter ||
        this.type == TYPE.mine ||
        this.type == TYPE.offshorePump ||
        this.type == TYPE.boiler ||
        ((this.type == TYPE.belt ||
        this.type == TYPE.undergroundBelt ||
        this.type == TYPE.splitter) && 
        (entity.type == TYPE.belt ||
        entity.type == TYPE.undergroundBelt ||
        entity.type == TYPE.splitter)) ?
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
    window.numberOtherDraws++;
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
  window.numberImageDraws++;
  ctx.shadowColor = undefined;
  ctx.shadowBlur = 0;
}

export function drawSplitterFilter(ctx, view) {
  const s = view.scale, half = s / 2;
  const ox = -view.x, oy = -view.y;
  const left = this.data.outputPriority == -1;
  const dx = (this.direction == 0 && !left) ||
      (this.direction == 2 && left) ? 1 : 0;
  const dy = (this.direction == 1 && !left) ||
      (this.direction == 3 && left) ? 1 : 0;
  const x = (this.x + dx) * s + ox + half;
  const y = (this.y + dy) * s + oy + half;
  const size = Math.min(8, 0.3125 * view.scale);
  if (x + size <= 0 || x - size > view.width)
    return;
  if (y + size <= 0 || y - size > view.height)
    return;
  const itemDef = ITEMS.get(this.data.itemFilter);
  const sprite = SPRITES.get(itemDef.sprite);
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 8;
  ctx.drawImage(sprite.image,
      sprite.x, sprite.y,
      sprite.width, sprite.height,
      Math.floor(x - size), Math.floor(y - size),
      Math.ceil(size * 2), Math.ceil(size * 2));
  window.numberImageDraws++;
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
    window.numberOtherDraws++;
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
  window.numberOtherDraws++;
}

export function drawMineDrillArea(ctx, view) {
  const x = (this.x - (this.data.drillArea - this.width) / 2) * view.scale - view.x,
        y = (this.y - (this.data.drillArea - this.height) / 2) * view.scale - view.y,
        size = this.data.drillArea * view.scale;
  if (x > view.width || y > view.height ||
      x + size < 0 || y + size < 0) return;
  ctx.fillStyle = COLOR.mineDrillArea;
  ctx.fillRect(x, y, size, size);
  window.numberOtherDraws++;
}

"use strict";

import {MapGenerator} from './map-generator.js';
import {Chunk} from './chunk.js';

function Game(canvas) {
	this.seed = 1274;
    this.mapGenerator = new MapGenerator(this.seed);
    this.mapGenerator.initialize();
    this.chunks = new Map();
    this.dragpos = {x: 0, y: 0};
    this.view = {x: 0, y: 60, width: canvas.width, height: canvas.height, scale: 1};
}

Game.prototype.update = function(time, dt, input) {
    for (let x = 0; x < 5; x++) {
    	for (let y = 0; y < 10; y++) {
    	    if (!this.chunks.has(x)) {
    	        this.chunks.set(x, new Map());
            }
            if (!this.chunks.get(x).has(y)) {
            	this.chunks.get(x).set(y, new Chunk(x, y).generate(this.mapGenerator));
            }
        }
    }
};

Game.prototype.draw = function(time, dt, ctx) {
	/*
    ctx.font = "24px serif";
    ctx.fillStyle = "blue";
    ctx.fillText(1023.567 % 512, 10, 50);
    */
    for (let cols of this.chunks.values()) {
    	for (let chunk of cols.values()) {
    	    chunk.draw(ctx, this.view);
        }
    }
};

Game.prototype.touchStart = function(e) {
	this.dragpos.x = e.touches[0].clientX;
	this.dragpos.y = e.touches[0].clientY;
}
Game.prototype.touchMove = function(e) {
	this.view.x = Math.round(this.view.x + e.touches[0].clientX - this.dragpos.x);
	this.view.y = Math.round(this.view.y + e.touches[0].clientY - this.dragpos.y);
	this.dragpos.x = e.touches[0].clientX;
	this.dragpos.y = e.touches[0].clientY;
}
Game.prototype.touchEnd = function(e) {
	
}


export {Game};
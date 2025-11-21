import React from 'react';
import {GameMap} from '../game-map.js';

const style = document.createElement('style');
style.textContent = `
div, details {margin: 0 10; overflow: auto;}
.success {color: green;}
.success::before {content: '✓ ';}
.failure {color: red;}
.failure::before {content: '✘ ';}
.failure summary {display: inline;}
.failure pre {color: darkgray;}
.skipped, .timing {color: darkgray;}
.skipped::before {content: '// ';}
`;
document.head.appendChild(style);
const tests = [];

function Test(obj) {Object.assign(this, obj);}

export function it(desc, fn) {
  tests.push(new Test({desc, it: fn}));
}
export function sit(desc, fn) {
  tests.push(new Test({sit: 1, desc, it: fn}));
}
export function fit(desc, fn) {
  tests.push(new Test({fit: 1, desc, it: fn}));
}

export const test = IntegrationTest;
function IntegrationTest() {
  const ts = performance.now();
  const results = [];
  const force = tests.some(t => t.fit);
  for (let t of tests) {
    if ((force && !t.fit) || t.sit) {
      results.push(React.createElement('div',
          {className: "skipped"}, t.desc));
    } else {
      try {
        t.it();
        results.push(React.createElement('div',
            {className: "success"}, t.desc));
      } catch (error) {
        results.push(React.createElement('details',
            {className: "failure"},
            React.createElement('summary', null, t.desc + " - " + error),
            React.createElement('pre', null, error.stack)));
      }
    }
  }
  results.push(React.createElement('p',
      {className: "timing"}, Math.floor(performance.now() - ts) + ' ms'));
  return results;
}

export function assertEqual(x, y, qualifier = '') {
  if (x === y)
    return;
  if (typeof x == 'object' &&
      typeof y == 'object' &&
      Object.keys(x).length == Object.keys(y).length) {
    for (let key of Object.keys(x)) {
      assertEqual(x[key], y[key], '.' + key);
    }
    return;
  }
  const error = new Error(`${x} != ${y}` + (qualifier ? ` (in x${qualifier})` : ''));
  console.log(error);
  throw error;
}

export function assertNotEqual(x, y) {
  if (x === y) {
    const error = new Error(`${x} == ${y} (they should be different)`);
    console.log(error);
    throw error;
  }
}

export function assertExists(x) {
  if (x === undefined || x === null) {
    const error = new Error("did not exist!");
    console.log(error);
    throw error;
  }
}

export function assertNotExists(x) {
  if (x !== undefined && x !== null) {
    const error = new Error("did exist! (should not)");
    console.log(error);
    throw error;
  }
}

/** Tests a blueprint. */
export function pasteBlueprint(blueprint, check) {
  const gameMap = new GameMap(0);
  gameMap.initialize();
  const entities = new Array(blueprint.length);
  for (let i = 0; i < blueprint.length; i++) {
    entities[i] =
        gameMap.createEntityNow(blueprint[i]);
  }
  check(entities, gameMap);
}

/** Tests a blueprint with all possible creation orders. */
export function pasteBlueprintAll(blueprint, check) {
  const permutations = createPermutations(blueprint.length);
  for (let perm of permutations) {
    const gameMap = new GameMap(0);
    gameMap.initialize();
    const entities = new Array(perm.length);
    for (let i = 0; i < perm.length; i++) {
      entities[perm[i]] =
          gameMap.createEntityNow(blueprint[perm[i]]);
    }
    check(entities, gameMap, perm);
  }
}

function createPermutations(n) {
  const factorials = [1];
  for (let i = 1; i <= n; i++) {
    factorials[i] = factorials[i - 1] * i;
  }
  
  const result = [];
  for (let i = 0; i < factorials[n]; i++) {
    let code = i;
    const all = new Array(n).fill(0).map((_, i) => i);
    const perm = [];
    for (let j = n; j > 0; j--) {
      let selected = Math.floor(code / factorials[j - 1]);
      perm.push(...all.splice(selected, 1));
      code = code % factorials[j - 1];
    }
    result.push(perm);
  }
  return result;
}

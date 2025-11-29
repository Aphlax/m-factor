import React from 'react';
import {createRoot} from 'react-dom/client';
import {GameMap, MAP} from '../game-map.js';

const style = document.createElement('style');
style.textContent = `
body {font-family: Calibri, sans-serif;}
div, details {margin: 0; overflow: auto;}
.success {color: green;}
.success::before {content: '✓ ';}
.failure {color: red;}
.failure::before {content: '✘ ';}
.failure summary {display: inline;}
.failure pre, .skipped, .timing {color: darkgray;}
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

let assertNr = 0, permutation = undefined;
const el = React.createElement;
export const test = output =>
    createRoot(output).render(el(TestSuite));
function TestSuite() {
  const ts = performance.now();
  const results = [];
  const force = tests.some(t => t.fit);
  for (let test of tests) {
    if ((force && !test.fit) || test.sit) {
      results.push(el('div',
          {className: "skipped"}, test.desc));
    } else {
      try {
        assertNr = 0;
        permutation = undefined;
        test.it();
        results.push(el('div',
            {className: "success"}, test.desc));
      } catch (error) {
        results.push(el('details',
            {className: "failure"},
            el('summary', null, test.desc + " -" +
            (permutation ? " [" + permutation + "]" : "") +
            (assertNr ? " #" + assertNr : "") + " " + error),
            el('pre', null, error.stack.replace(
            /(^(?:(?!Test\.it).|\n)*Test\.it[^\n]*).*/s, '$1'))));
      }
    }
  }
  results.push(el('p', {className: "timing"},
      Math.floor(performance.now() - ts) + ' ms'));
  return results;
}

export function assertEqual(x, y) {
  assertNr++;
  if (x === y) return;
  const error = new Error(`${pp(x)} != ${pp(y)}`);
  console.log(error);
  throw error;
}

export function assertNotEqual(x, y) {
  assertNr++;
  if (x !== y) return;
  const error = new Error(`${pp(x)} == ${pp(y)} (they should be different)`);
  console.log(error);
  throw error;
}

export function assertMatch(x, template, qualifier = '') {
  if (!qualifier) assertNr++;
  if (typeof x == 'object' &&
      typeof template == 'object' &&
      x != template) {
    for (let key of Object.keys(template)) {
      assertMatch(x[key], template[key], qualifier + '.' + key);
    }
    return;
  }
  if (x != template) {
    const error = new Error(`${pp(x)} != ${pp(template)}` + (qualifier ? ` (in x${qualifier})` : ''));
    console.log(error);
    throw error;
  }
}

export function assertExists(x) {
  assertNr++;
  if (x === undefined || x === null) {
    const error = new Error("did not exist!");
    console.log(error);
    throw error;
  }
}

export function assertNotExists(x) {
  assertNr++;
  if (x !== undefined && x !== null) {
    const error = new Error("did exist! (should not)");
    console.log(error);
    throw error;
  }
}

function pp(x) {
  if (typeof x != "object")
    return x;
  if (x.constructor == Array)
    return "[" + x.map(pp).join(",") + "]";
  return "[" + x.constructor.name + "]";
}

/** Tests a blueprint. */
export function blueprint(blueprint, check) {
  const gameMap = new GameMap(0, MAP.test);
  gameMap.initialize();
  const entities = blueprint.map(bp =>
      gameMap.createEntityNow(bp));
  check(entities, gameMap);
}

/** Tests a blueprint with all possible creation orders. */
export function blueprintScrambled(blueprint, check, startPerm) {
  const permutations = createPermutations(blueprint.length);
  if (startPerm) permutations.unshift(startPerm);
  for (let perm of permutations) {
    assertNr = 0;
    permutation = perm;
    const gameMap = new GameMap(0, MAP.test);
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
      let index = Math.floor(code / factorials[j - 1]);
      perm.push(...all.splice(index, 1));
      code = code % factorials[j - 1];
    }
    result.push(perm);
  }
  return result;
}

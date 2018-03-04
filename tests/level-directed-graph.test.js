// @flow

const expect = require('expect');
const uuid = require('uuid');
const LevelDirectedGraphMap = require('../src');

test('Documentation', async () => {
  const map = new LevelDirectedGraphMap([['A', 'B']]);
  await map.ready;
  expect(await map.hasEdge('A', 'B')).toEqual(true); // true
  await map.addEdge('B', 'C');
  expect(await map.hasEdge('B', 'C')).toEqual(true); // true
  expect(await map.getTargets('A')).toEqual(new Set(['B'])); // new Set(["B"]);
  expect(await map.getTargets('B')).toEqual(new Set(['C'])); // new Set(["C"]);
  expect(await map.getTargets('C')).toEqual(new Set()); // new Set();
  expect(await map.getSources('A')).toEqual(new Set()); // new Set();
  expect(await map.getSources('B')).toEqual(new Set(['A'])); // new Set(["A"]);
  expect(await map.getSources('C')).toEqual(new Set(['B'])); // new Set(["B"]);
  await map.removeSource('A');
  expect(await map.hasEdge('A', 'B')).toEqual(false); // false
  expect(await map.getTargets('A')).toEqual(new Set()); // new Set();
  await map.removeTarget('C');
  expect(await map.getTargets('B')).toEqual(new Set()); // new Set();
  expect(await map.hasEdge('B', 'C')).toEqual(false); // false
  await map.addEdge('A', 'B');
  expect(await map.hasEdge('A', 'B')).toEqual(true); // true
  await map.removeEdge('A', 'B');
  expect(await map.hasEdge('A', 'B')).toEqual(false); // false
  await map.close();
});

test('Add and remove pairs', async () => {
  const map = new LevelDirectedGraphMap();
  await map.ready;
  const A = uuid.v4();
  const B = uuid.v4();
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set());
  await map.addEdge(A, B);
  expect(await map.hasEdge(A, B)).toEqual(true);
  expect(await map.getTargets(A)).toEqual(new Set([B]));
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set([A]));
  await map.removeEdge(A, B);
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set());
  expect(await map.sources()).toEqual(new Set());
  expect(await map.targets()).toEqual(new Set());
  await map.close();
});

test('Remove sources', async () => {
  const map = new LevelDirectedGraphMap();
  await map.ready;
  const A = uuid.v4();
  const B = uuid.v4();
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set());
  await map.addEdge(A, B);
  expect(await map.hasEdge(A, B)).toEqual(true);
  expect(await map.getTargets(A)).toEqual(new Set([B]));
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set([A]));
  await map.removeSource(A);
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set());
  expect(await map.sources()).toEqual(new Set());
  expect(await map.targets()).toEqual(new Set());
  await map.close();
});

test('Remove targets', async () => {
  const map = new LevelDirectedGraphMap();
  await map.ready;
  const A = uuid.v4();
  const B = uuid.v4();
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set());
  await map.addEdge(A, B);
  expect(await map.hasEdge(A, B)).toEqual(true);
  expect(await map.getTargets(A)).toEqual(new Set([B]));
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set([A]));
  await map.removeTarget(B);
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set());
  expect(await map.sources()).toEqual(new Set());
  expect(await map.targets()).toEqual(new Set());
  await map.close();
});

test('Add and remove groups pairs', async () => {
  const map = new LevelDirectedGraphMap();
  await map.ready;
  const A = uuid.v4();
  const B = uuid.v4();
  const C = uuid.v4();
  const D = uuid.v4();
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.hasEdge(B, C)).toEqual(false);
  expect(await map.hasEdge(C, D)).toEqual(false);
  expect(await map.hasEdge(D, A)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getTargets(C)).toEqual(new Set());
  expect(await map.getTargets(D)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set());
  expect(await map.getSources(C)).toEqual(new Set());
  expect(await map.getSources(D)).toEqual(new Set());
  await map.addEdge(A, B);
  await map.addEdge(B, C);
  await map.addEdge(C, D);
  await map.addEdge(D, A);
  expect(await map.hasEdge(A, B)).toEqual(true);
  expect(await map.hasEdge(B, C)).toEqual(true);
  expect(await map.hasEdge(C, D)).toEqual(true);
  expect(await map.hasEdge(D, A)).toEqual(true);
  expect(await map.getTargets(A)).toEqual(new Set([B]));
  expect(await map.getTargets(B)).toEqual(new Set([C]));
  expect(await map.getTargets(C)).toEqual(new Set([D]));
  expect(await map.getTargets(D)).toEqual(new Set([A]));
  expect(await map.getSources(A)).toEqual(new Set([D]));
  expect(await map.getSources(B)).toEqual(new Set([A]));
  expect(await map.getSources(C)).toEqual(new Set([B]));
  expect(await map.getSources(D)).toEqual(new Set([C]));
  await map.removeEdge(A, B);
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.hasEdge(B, C)).toEqual(true);
  expect(await map.hasEdge(C, D)).toEqual(true);
  expect(await map.hasEdge(D, A)).toEqual(true);
  expect(await map.getTargets(A)).toEqual(new Set([]));
  expect(await map.getTargets(B)).toEqual(new Set([C]));
  expect(await map.getTargets(C)).toEqual(new Set([D]));
  expect(await map.getTargets(D)).toEqual(new Set([A]));
  expect(await map.getSources(A)).toEqual(new Set([D]));
  expect(await map.getSources(B)).toEqual(new Set([]));
  expect(await map.getSources(C)).toEqual(new Set([B]));
  expect(await map.getSources(D)).toEqual(new Set([C]));
  await map.removeSource(B);
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.hasEdge(B, C)).toEqual(false);
  expect(await map.hasEdge(C, D)).toEqual(true);
  expect(await map.hasEdge(D, A)).toEqual(true);
  expect(await map.getTargets(A)).toEqual(new Set([]));
  expect(await map.getTargets(B)).toEqual(new Set([]));
  expect(await map.getTargets(C)).toEqual(new Set([D]));
  expect(await map.getTargets(D)).toEqual(new Set([A]));
  expect(await map.getSources(A)).toEqual(new Set([D]));
  expect(await map.getSources(B)).toEqual(new Set([]));
  expect(await map.getSources(C)).toEqual(new Set([]));
  expect(await map.getSources(D)).toEqual(new Set([C]));
  await map.removeTarget(D);
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.hasEdge(B, C)).toEqual(false);
  expect(await map.hasEdge(C, D)).toEqual(false);
  expect(await map.hasEdge(D, A)).toEqual(true);
  expect(await map.getTargets(A)).toEqual(new Set([]));
  expect(await map.getTargets(B)).toEqual(new Set([]));
  expect(await map.getTargets(C)).toEqual(new Set([]));
  expect(await map.getTargets(D)).toEqual(new Set([A]));
  expect(await map.getSources(A)).toEqual(new Set([D]));
  expect(await map.getSources(B)).toEqual(new Set([]));
  expect(await map.getSources(C)).toEqual(new Set([]));
  expect(await map.getSources(D)).toEqual(new Set([]));
  await map.removeEdge(D, A);
  expect(await map.hasEdge(A, B)).toEqual(false);
  expect(await map.hasEdge(B, C)).toEqual(false);
  expect(await map.hasEdge(C, D)).toEqual(false);
  expect(await map.hasEdge(D, A)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B)).toEqual(new Set());
  expect(await map.getTargets(C)).toEqual(new Set());
  expect(await map.getTargets(D)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B)).toEqual(new Set());
  expect(await map.getSources(C)).toEqual(new Set());
  expect(await map.getSources(D)).toEqual(new Set());
  expect(await map.sources()).toEqual(new Set());
  expect(await map.targets()).toEqual(new Set());
  await map.close();
});

test('Add and remove pairs', async () => {
  const map = new LevelDirectedGraphMap();
  await map.ready;
  const A = uuid.v4();
  const B1 = uuid.v4();
  const B2 = uuid.v4();
  expect(await map.hasEdge(A, B1)).toEqual(false);
  expect(await map.hasEdge(A, B2)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B1)).toEqual(new Set());
  expect(await map.getTargets(B2)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B1)).toEqual(new Set());
  expect(await map.getSources(B2)).toEqual(new Set());
  await map.addEdge(A, B1);
  await map.addEdge(A, B2);
  expect(await map.hasEdge(A, B1)).toEqual(true);
  expect(await map.hasEdge(A, B2)).toEqual(true);
  expect(await map.getTargets(A)).toEqual(new Set([B1, B2]));
  expect(await map.getTargets(B1)).toEqual(new Set());
  expect(await map.getTargets(B2)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B1)).toEqual(new Set([A]));
  expect(await map.getSources(B2)).toEqual(new Set([A]));
  await map.removeEdge(A, B2);
  expect(await map.hasEdge(A, B1)).toEqual(true);
  expect(await map.hasEdge(A, B2)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set([B1]));
  expect(await map.getTargets(B1)).toEqual(new Set());
  expect(await map.getTargets(B2)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B1)).toEqual(new Set([A]));
  expect(await map.getSources(B2)).toEqual(new Set([]));
  await map.removeEdge(A, B1);
  expect(await map.hasEdge(A, B1)).toEqual(false);
  expect(await map.hasEdge(A, B2)).toEqual(false);
  expect(await map.getTargets(A)).toEqual(new Set());
  expect(await map.getTargets(B1)).toEqual(new Set());
  expect(await map.getTargets(B2)).toEqual(new Set());
  expect(await map.getSources(A)).toEqual(new Set());
  expect(await map.getSources(B1)).toEqual(new Set());
  expect(await map.getSources(B2)).toEqual(new Set());
  await map.close();
});

test('Initialize with edges', async () => {
  const A = uuid.v4();
  const B = uuid.v4();
  const C = uuid.v4();
  const map = new LevelDirectedGraphMap([[A, B], [B, C]]);
  await map.ready;
  expect(await map.hasEdge(A, B)).toEqual(true);
  expect(await map.hasEdge(B, C)).toEqual(true);
  expect(await map.hasEdge(A, C)).toEqual(false);
  await map.close();
});

test('Remove edges that do not exist', async () => {
  const A = uuid.v4();
  const B = uuid.v4();
  const map = new LevelDirectedGraphMap();
  await map.ready;
  expect(await map.hasEdge(A, B)).toEqual(false);
  await map.removeEdge(A, B);
  expect(await map.hasEdge(A, B)).toEqual(false);
  await map.removeSource(A);
  expect(await map.hasEdge(A, B)).toEqual(false);
  await map.removeTarget(B);
  expect(await map.hasEdge(A, B)).toEqual(false);
  await map.close();
});

test('Get edges, sources, and targets', async () => {
  const A = uuid.v4();
  const B = uuid.v4();
  const C = uuid.v4();
  const map = new LevelDirectedGraphMap([[A, B], [B, C]]);
  await map.ready;
  expect(await map.edges()).toEqual(expect.arrayContaining([[A, B], [B, C]]));
  expect(await map.sources()).toEqual(new Set([A, B]));
  expect(await map.targets()).toEqual(new Set([B, C]));
  // $FlowFixMe: computed property
  let iterator = map[Symbol.iterator]();
  while (true) {
    const { value, done } = await iterator.next();
    if (done) {
      break;
    }
    const [source, target] = value;
    if (source === A) {
      expect(target).toEqual(B);
    } else if (source === B) {
      expect(target).toEqual(C);
    } else {
      throw new Error('Unknown edge.');
    }
  }
  await map.removeEdge(A, B);
  expect(await map.edges()).toEqual(expect.arrayContaining([[B, C]]));
  expect(await map.sources()).toEqual(new Set([B]));
  expect(await map.targets()).toEqual(new Set([C]));
  // $FlowFixMe: computed property
  iterator = map[Symbol.iterator]();
  while (true) {
    const { value, done } = await iterator.next();
    if (done) {
      break;
    }
    const [source, target] = value;
    if (source === B) {
      expect(target).toEqual(C);
    } else {
      throw new Error('Unknown edge.');
    }
  }
  await map.removeEdge(B, C);
  expect(await map.edges()).toEqual([]);
  expect(await map.sources()).toEqual(new Set());
  expect(await map.targets()).toEqual(new Set());
  // $FlowFixMe: computed property
  iterator = map[Symbol.iterator]();
  while (true) {
    const { done } = await iterator.next();
    if (done) {
      break;
    }
    throw new Error('Unknown edge.');
  }
  await map.close();
});


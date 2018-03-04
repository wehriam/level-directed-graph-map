// @flow

const expect = require('expect');
const uuid = require('uuid');
const LevelDirectedGraphMap = require('../src');
const level = require('level');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');

let db;

beforeAll(async () => {
  const location = path.join(os.tmpdir(), uuid.v4());
  await fs.ensureDir(location);
  db = level(location);
});

afterAll(async () => {
  await db.close();
});

test('Documentation', async () => {
  const map = new LevelDirectedGraphMap(db, [['A', 'B']], { namespace: uuid.v4() });
  await map.ready;
  expect(await map.hasEdge('A', 'B')).toEqual(true); // true
  expect(await map.hasSource('B')).toEqual(false); // true
  expect(await map.hasTarget('C')).toEqual(false); // true
  await map.addEdge('B', 'C');
  expect(await map.hasEdge('B', 'C')).toEqual(true); // true
  expect(await map.hasSource('B')).toEqual(true); // true
  expect(await map.hasTarget('C')).toEqual(true); // true
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
});

test('Add and remove pairs', async () => {
  const map = new LevelDirectedGraphMap(db, [], { namespace: uuid.v4() });
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
});

test('Remove sources', async () => {
  const map = new LevelDirectedGraphMap(db, [], { namespace: uuid.v4() });
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
});

test('Remove targets', async () => {
  const map = new LevelDirectedGraphMap(db, [], { namespace: uuid.v4() });
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
});

test('Add and remove groups pairs', async () => {
  const map = new LevelDirectedGraphMap(db, [], { namespace: uuid.v4() });
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
});

test('Add and remove pairs', async () => {
  const map = new LevelDirectedGraphMap(db, [], { namespace: uuid.v4() });
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
});

test('Initialize with edges', async () => {
  const A = uuid.v4();
  const B = uuid.v4();
  const C = uuid.v4();
  const map = new LevelDirectedGraphMap(db, [[A, B], [B, C]], { namespace: uuid.v4() });
  await map.ready;
  expect(await map.hasEdge(A, B)).toEqual(true);
  expect(await map.hasEdge(B, C)).toEqual(true);
  expect(await map.hasEdge(A, C)).toEqual(false);
});

test('Remove edges that do not exist', async () => {
  const A = uuid.v4();
  const B = uuid.v4();
  const map = new LevelDirectedGraphMap(db, [], { namespace: uuid.v4() });
  await map.ready;
  expect(await map.hasEdge(A, B)).toEqual(false);
  await map.removeEdge(A, B);
  expect(await map.hasEdge(A, B)).toEqual(false);
  await map.removeSource(A);
  expect(await map.hasEdge(A, B)).toEqual(false);
  await map.removeTarget(B);
  expect(await map.hasEdge(A, B)).toEqual(false);
});

test('Get edges, sources, and targets', async () => {
  const A = uuid.v4();
  const B = uuid.v4();
  const C = uuid.v4();
  const map = new LevelDirectedGraphMap(db, [[A, B], [B, C]], { namespace: uuid.v4() });
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
});

test('Large graph', async () => {
  const map = new LevelDirectedGraphMap(db, [], { namespace: uuid.v4() });
  await map.ready;
  const set = new Set(Array(10000).fill().map(() => uuid.v4()));
  for (const x of set) {
    await map.addEdge(x, x);
  }
  expect(await map.size()).toEqual(10000);
  // $FlowFixMe: computed property
  const iterator = map[Symbol.iterator]();
  while (true) {
    const { value, done } = await iterator.next();
    if (done) {
      break;
    }
    const [source, target] = value;
    expect(source).toEqual(target);
    set.delete(source);
  }
});


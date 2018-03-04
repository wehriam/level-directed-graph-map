# LevelDB Directed Graph Map

[![CircleCI](https://circleci.com/gh/wehriam/level-directed-graph-map.svg?style=svg)](https://circleci.com/gh/wehriam/level-directed-graph-map) [![npm version](https://badge.fury.io/js/level-directed-graph-map.svg)](http://badge.fury.io/js/level-directed-graph-map) [![codecov](https://codecov.io/gh/wehriam/level-directed-graph-map/branch/master/graph/badge.svg)](https://codecov.io/gh/wehriam/level-directed-graph-map)

Directed graph data structure [implemented](https://github.com/wehriam/level-directed-graph-map/blob/master/src/index.js) using LevelDB. Similiar to multi-key maps or bidirectional maps.

See [directed-graph-map](https://www.npmjs.com/package/directed-graph-map) for a synchronous, in-memory version.

```js
const dg = new LevelDirectedGraphMap([], './optional-db-path', {});

const run = async () => {
                              //  A
  await dg.addEdge('A', 'X'); //  ├── X
  await dg.addEdge('A', 'Y'); //  ├── Y
  await dg.addEdge('A', 'Z'); //  └── Z

  await dg.getTargets('A');   //  X, Y, Z

  await dg.size(); // 3
  await dg.edges(); // [['A', 'X'], ['A', 'Y'], ['A', 'Z']]
  await dg.sources(); // ['A']
  await dg.targets(); // ['X', 'Y', 'z']

}

run();
```

## Install

`yarn add level-level-directed-graph-map`

## Usage

```js
const LevelDirectedGraphMap = require('level-directed-graph-map');

const dgm = new LevelDirectedGraphMap([['A', 'B']], './optional-db-path', {});

const run = async () => {
  //  A
  //  └── B
  
  await dgm.hasEdge('A', 'B'); // true
  
  await dgm.addEdge('B', 'C');
  
  //  A
  //  └── B
  //      └── C
  
  await  dgm.hasEdge('B', 'C'); // true
  await  dgm.getTargets('A'); // new Set(['B']);
  await  dgm.getTargets('B'); // new Set(['C']);
  await  dgm.getTargets('C'); // new Set();
  await  dgm.getSources('A'); // new Set();
  await  dgm.getSources('B'); // new Set(['A']);
  await  dgm.getSources('C'); // new Set(['B']);
  
  await  dgm.removeSource('A');
  
  //  B
  //  └── C
  
  await dgm.hasEdge('A', 'B'); // false
  await dgm.getTargets('A'); // new Set();
  
  await dgm.removeTarget('C');
  
  //  Empty
  
  await dgm.getTargets('B'); // new Set();
  await dgm.hasEdge('B', 'C'); // false
  
  await dgm.addEdge('A', 'B');
  
  //  A
  //  └── B
  
  await dgm.hasEdge('A', 'B'); // true
  
  await dgm.removeEdge('A', 'B');
  
  //  Empty
  
  await dgm.hasEdge('A', 'B'); // false
}

run();
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [LevelDirectedGraphMap](#leveldirectedgraphmap)
    -   [addEdge](#addedge)
    -   [removeEdge](#removeedge)
    -   [hasEdge](#hasedge)
    -   [removeSource](#removesource)
    -   [removeTarget](#removetarget)
    -   [getSources](#getsources)
    -   [getTargets](#gettargets)
-   [LevelDirectedGraphMap#edges](#leveldirectedgraphmapedges)
-   [LevelDirectedGraphMap#size](#leveldirectedgraphmapsize)
-   [LevelDirectedGraphMap#sources](#leveldirectedgraphmapsources)
-   [LevelDirectedGraphMap#targets](#leveldirectedgraphmaptargets)

### LevelDirectedGraphMap

Class representing a Level Directed Graph Map

**Parameters**

-   `edges` **Iterable&lt;\[S, T]>** Iterable containing source -> target pairs (optional, default `[]`)
-   `location` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Path to the underlying LevelDB (optional, default `''`)
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options passed on to the underlying LevelDB store (optional, default `{}`)

#### addEdge

Add an edge to the graph map.

**Parameters**

-   `source` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Source of the edge
-   `target` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Target of the edge

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void>** 

#### removeEdge

Remove an edge from the graph map.

**Parameters**

-   `source` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Source of the edge
-   `target` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Target of the edge

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void>** 

#### hasEdge

Test if a edge exists in the graph map.

**Parameters**

-   `source` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Source of the edge
-   `target` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Target of the edge

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** Whether the edge exists in the graph map.

#### removeSource

Remove all edges from a source.

**Parameters**

-   `source` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Source of the edge

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void>** 

#### removeTarget

Remove all edges to a target.

**Parameters**

-   `target` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Target of the edge

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void>** 

#### getSources

Get all sources with edges to a target.

**Parameters**

-   `target` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Target of the edge

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>>** Set of sources

#### getTargets

Get all targets with edges from a source.

**Parameters**

-   `source` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Source of the edge

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>>** Set of targets

### LevelDirectedGraphMap#edges

Array of edges

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;\[S, T]>>** 

### LevelDirectedGraphMap#size

Edge count. Costly operation, use sparingly.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)>** 

### LevelDirectedGraphMap#sources

Set of sources

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>>** 

### LevelDirectedGraphMap#targets

Set of targets

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>>** 

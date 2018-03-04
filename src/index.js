// @flow

const level = require('level');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid');

/**
 * Class representing a Level Directed Graph Map
 */
class LevelDirectedGraphMap<S, T> {
  sourceMap:Map<S, Set<T>>;
  targetMap:Map<T, Set<S>>;
  ready:Promise<void>;
  db:Object;
  boundClose: Function;
  removeDatabaseOnClose: boolean;
  location: string;
  /**
   * Create a directed graph map.
   * @param {Iterable<[S, T]>} [edges=[]] - Iterable containing source -> target pairs
   */
  constructor(edges?:Iterable<[S, T]> = [], location?: string, options?:Object) {
    this.sourceMap = new Map();
    this.targetMap = new Map();
    this.removeDatabaseOnClose = !location;
    this.ready = this.init(edges, location || path.join(os.tmpdir(), uuid.v4()), options || {});
    this.boundClose = this._close.bind(this); // eslint-disable-line no-underscore-dangle
  }

  async init(edges:Iterable<[S, T]> = [], location:string, options: Object) {
    this.location = location;
    await fs.ensureDir(location);
    this.db = level(location, options);
    process.on('exit', this.boundClose);
    const addEdgePromises = [];
    for (const [source, target] of edges) {
      addEdgePromises.push(this.addEdge(source, target));
    }
    await Promise.all(addEdgePromises);
  }

  close() {
    process.removeListener('exit', this.boundClose);
    return this._close(); // eslint-disable-line no-underscore-dangle
  }

  async _close() {
    if (!this.db) {
      return;
    }
    await this.db.close();
    delete this.db;
    if (this.removeDatabaseOnClose) {
      await fs.remove(this.location);
    }
  }

  /**
   * Add an edge to the graph map.
   * @param {S} source - Source of the edge
   * @param {T} target - Target of the edge
   * @return {void}
   */
  async addEdge(source:S, target:T):Promise<void> {
    const sources = this.sourceMap.get(source) || new Set();
    const targets = this.targetMap.get(target) || new Set();
    sources.add(target);
    targets.add(source);
    this.sourceMap.set(source, sources);
    this.targetMap.set(target, targets);
  }

  /**
   * Remove an edge from the graph map.
   * @param {S} source - Source of the edge
   * @param {T} target - Target of the edge
   * @return {void}
   */
  async removeEdge(source:S, target:T):Promise<void> {
    const sources = this.sourceMap.get(source);
    const targets = this.targetMap.get(target);
    if (!sources || !targets) {
      return;
    }
    sources.delete(target);
    targets.delete(source);
    if (sources.size === 0) {
      this.sourceMap.delete(source);
    }
    if (targets.size === 0) {
      this.targetMap.delete(target);
    }
  }

  /**
   * Test if a edge exists in the graph map.
   * @param {S} source - Source of the edge
   * @param {T} target - Target of the edge
   * @return {boolean} - Whether the edge exists in the graph map.
   */
  async hasEdge(source:S, target:T):Promise<boolean> {
    const sources = this.sourceMap.get(source);
    if (!sources) {
      return false;
    }
    return sources.has(target);
  }

  /**
   * Remove all edges from a source.
   * @param {S} source - Source of the edge
   * @return {void}
   */
  async removeSource(source:S):Promise<void> {
    if (!this.sourceMap.has(source)) {
      return;
    }
    const sources = this.sourceMap.get(source);
    if (sources) {
      for (const target of sources) {
        this.removeEdge(source, target);
      }
    }
    this.sourceMap.delete(source);
  }

  /**
   * Remove all edges to a target.
   * @param {T} target - Target of the edge
   * @return {void}
   */
  async removeTarget(target:T):Promise<void> {
    if (!this.targetMap.has(target)) {
      return;
    }
    const targets = this.targetMap.get(target);
    if (targets) {
      for (const source of targets) {
        this.removeEdge(source, target);
      }
    }
    this.targetMap.delete(target);
  }

  /**
   * Get all sources with edges to a target.
   * @param {T} target - Target of the edge
   * @return {Set<S>} - Set of sources
   */
  async getSources(target:T):Promise<Set<S>> {
    return new Set(this.targetMap.get(target));
  }

  /**
   * Get all targets with edges from a source.
   * @param {S} source - Source of the edge
   * @return {Set<T>} - Set of targets
   */
  async getTargets(source:S):Promise<Set<T>> {
    return new Set(this.sourceMap.get(source));
  }

  /* :: @@iterator(): Iterator<[S, T]> { return ({}: any); } */
  // $FlowFixMe: computed property
  [Symbol.iterator]() {
    const edgesPromise = this.edges();
    let i = 0;
    const next = async () => {
      const edges = await edgesPromise;
      const length = edges.length;
      return i < length ? { value: edges[i++], done: false } : { done: true };
    };
    return { next };
  }

  /**
   * Array of edges
   *
   * @name LevelDirectedGraphMap#edges
   * @return Array<[S, T]>
   */
  async edges():Promise<Array<[S, T]>> {
    const edges = [];
    for (const [source, targets] of this.sourceMap) {
      for (const target of targets) {
        edges.push([source, target]);
      }
    }
    return edges;
  }

  /**
   * Edge count
   *
   * @name LevelDirectedGraphMap#size
   * @return number
   */
  async size():Promise<number> {
    const edges = await this.edges();
    return edges.length;
  }

  /**
   * Set of sources
   *
   * @name LevelDirectedGraphMap#sources
   * @return Set<S>
   */
  async sources():Promise<Set<S>> {
    return new Set(this.sourceMap.keys());
  }

  /**
   * Set of targets
   *
   * @name LevelDirectedGraphMap#targets
   * @return Set<T>
   */
  async targets():Promise<Set<T>> {
    return new Set(this.targetMap.keys());
  }
}

module.exports = LevelDirectedGraphMap;

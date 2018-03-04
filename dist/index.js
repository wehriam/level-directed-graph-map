//      

const level = require('level');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid');

/**
 * Class representing a Level Directed Graph Map
 */
class LevelDirectedGraphMap       {
                                
                                
                      
            
                       
                                 
                   
  /**
   * Create a directed graph map.
   * @param {Iterable<[S, T]>} [edges=[]] - Iterable containing source -> target pairs
   * @param {string} [location=''] - Path to the underlying LevelDB
   * @param {Object} [options={}] - Options passed on to the underlying LevelDB store
   */
  constructor(edges                             = [], location         , options        ) {
    this.removeDatabaseOnClose = !location;
    this.ready = this.init(edges, location || path.join(os.tmpdir(), uuid.v4()), options || {});
    this.boundClose = this._close.bind(this); // eslint-disable-line no-underscore-dangle
  }

  async init(edges                            = [], location       , options        ) {
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
   * @return {Promise<void>}
   */
  async addEdge(source       , target       )               {
    await Promise.all([
      this.db.put(`>${source}|${target}`, 1),
      this.db.put(`<${target}|${source}`, 1),
    ]);
  }

  /**
   * Remove an edge from the graph map.
   * @param {S} source - Source of the edge
   * @param {T} target - Target of the edge
   * @return {Promise<void>}
   */
  async removeEdge(source       , target       )               {
    await Promise.all([
      this.db.del(`>${source}|${target}`, 1),
      this.db.del(`<${target}|${source}`, 1),
    ]);
  }

  /**
   * Test if a edge exists in the graph map.
   * @param {S} source - Source of the edge
   * @param {T} target - Target of the edge
   * @return {Promise<boolean>} - Whether the edge exists in the graph map.
   */
  async hasEdge(source       , target       )                  {
    try {
      await this.db.get(`>${source}|${target}`);
      return true;
    } catch (error) {
      if (error.notFound) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Remove all edges from a source.
   * @param {S} source - Source of the edge
   * @return {Promise<void>}
   */
  async removeSource(source       )               {
    const promises = [];
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `>${source}`, lt: `>${source}~` })
        .on('data', ({ key }) => {
          const [s, t] = key.slice(1).split('|');
          promises.push(this.removeEdge(s, t));
        }).on('error', (error) => {
          reject(error);
        }).on('close', () => {
          resolve();
        });
    });
    await Promise.all(promises);
  }

  /**
   * Remove all edges to a target.
   * @param {T} target - Target of the edge
   * @return {Promise<void>}
   */
  async removeTarget(target       )               {
    const promises = [];
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `<${target}`, lt: `<${target}~` })
        .on('data', ({ key }) => {
          const [t, s] = key.slice(1).split('|');
          promises.push(this.removeEdge(s, t));
        }).on('error', (error) => {
          reject(error);
        }).on('close', () => {
          resolve();
        });
    });
    await Promise.all(promises);
  }

  /**
   * Get all sources with edges to a target.
   * @param {T} target - Target of the edge
   * @return {Promise<Set<string>>} - Set of sources
   */
  async getSources(target       )                      {
    const sources = new Set();
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `<${target}`, lt: `<${target}~` })
        .on('data', ({ key }) => {
          sources.add(key.split('|')[1]);
        }).on('error', (error) => {
          reject(error);
        }).on('close', () => {
          resolve();
        });
    });
    return sources;
  }

  /**
   * Get all targets with edges from a source.
   * @param {S} source - Source of the edge
   * @return {Promise<Set<string>>} - Set of targets
   */
  async getTargets(source       )                      {
    const targets = new Set();
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `>${source}`, lt: `>${source}~` })
        .on('data', ({ key }) => {
          targets.add(key.split('|')[1]);
        }).on('error', (error) => {
          reject(error);
        }).on('close', () => {
          resolve();
        });
    });
    return targets;
  }

  /* :: @@iterator(): Iterator<[S, T]> { return ({}: any); } */
  // $FlowFixMe: computed property
  [Symbol.iterator]() {
    const pairs = [];
    let lastKey = '>';
    const next = async () => {
      if (pairs.length > 0) {
        return { value: pairs.shift(), done: false };
      }
      await new Promise((resolve, reject) => {
        this.db.createReadStream({ gt: lastKey, limit: 100, lt: '?' })
          .on('data', ({ key }) => {
            const [source, target] = key.slice(1).split('|');
            pairs.push([source, target]);
          }).on('error', (error) => {
            reject(error);
          }).on('close', () => {
            resolve();
          });
      });
      if (pairs.length > 0) {
        const lastPair = pairs[pairs.length - 1];
        lastKey = `>${lastPair[0]}|${lastPair[1]}`;
      } else {
        return { done: true };
      }
      return next();
    };
    return { next };
  }

  /**
   * Array of edges
   *
   * @name LevelDirectedGraphMap#edges
   * @return {Promise<Array<[S, T]>>}
   */
  async edges()                        {
    const edges = [];
    // $FlowFixMe: computed property
    const iterator = this[Symbol.iterator]();
    while (true) {
      const { value, done } = await iterator.next();
      if (done) {
        break;
      }
      edges.push(value);
    }
    return edges;
  }

  /**
   * Edge count. Costly operation, use sparingly.
   *
   * @name LevelDirectedGraphMap#size
   * @return {Promise<number>}
   */
  async size()                 {
    let i = 0;
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: '>', lt: '?' })
        .on('data', () => {
          i += 1;
        }).on('error', (error) => {
          reject(error);
        }).on('close', () => {
          resolve();
        });
    });
    return i;
  }

  /**
   * Set of sources
   *
   * @name LevelDirectedGraphMap#sources
   * @return {Promise<Set<string>>}
   */
  async sources()                      {
    const sources = new Set();
    // $FlowFixMe: computed property
    const iterator = this[Symbol.iterator]();
    while (true) {
      const { value, done } = await iterator.next();
      if (done) {
        break;
      }
      sources.add(value[0]);
    }
    return sources;
  }

  /**
   * Set of targets
   *
   * @name LevelDirectedGraphMap#targets
   * @return {Promise<Set<string>>}
   */
  async targets()                      {
    const targets = new Set();
    // $FlowFixMe: computed property
    const iterator = this[Symbol.iterator]();
    while (true) {
      const { value, done } = await iterator.next();
      if (done) {
        break;
      }
      targets.add(value[1]);
    }
    return targets;
  }
}

module.exports = LevelDirectedGraphMap;

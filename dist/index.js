//      


/**
 * Class representing a Level Directed Graph Map
 */
class LevelDirectedGraphMap {
                                     
                                     
                      
            
                       
                                 
                   
                    
                       
  /**
   * Create a directed graph map.
   * @param {Object} [db] - Object implementing the LevelUp interface
   * @param {Iterable<[string, string]>} [edges=[]] - Iterable containing source -> target pairs
   * @param {Object} [options={}] - Options object
   * @param {string} [options.namespace=''] - Prefix used to namespace LevelDB keys
   */
  constructor(db       , edges                             = [], options          = {}) {
    this.removeDatabaseOnClose = !location;
    this.db = db;
    this.namespace = options.namespace || '';
    this.prefixLength = this.namespace.length + 1;
    this.ready = this.init(edges);
  }

  /**
   * Resolves when the map is initialized and ready for use
   *
   * @name LevelDirectedGraphMap#ready
   * @type Promise<void>
   * @readonly
   */

  async init(edges                            = []) {
    const addEdgePromises = [];
    for (const [source, target] of edges) {
      addEdgePromises.push(this.addEdge(source, target));
    }
    await Promise.all(addEdgePromises);
  }

  /**
   * Add an edge to the graph map.
   * @param {string} source - Source of the edge
   * @param {string} target - Target of the edge
   * @return {Promise<void>}
   */
  async addEdge(source       , target       )               {
    await Promise.all([
      this.db.put(`${this.namespace}>${source}|${target}`, 1),
      this.db.put(`${this.namespace}<${target}|${source}`, 1),
    ]);
  }

  /**
   * Remove an edge from the graph map.
   * @param {string} source - Source of the edge
   * @param {string} target - Target of the edge
   * @return {Promise<void>}
   */
  async removeEdge(source       , target       )               {
    await Promise.all([
      this.db.del(`${this.namespace}>${source}|${target}`, 1),
      this.db.del(`${this.namespace}<${target}|${source}`, 1),
    ]);
  }

  /**
   * Test if a edge exists in the graph map.
   * @param {string} source - Source of the edge
   * @param {string} target - Target of the edge
   * @return {Promise<boolean>} - Whether the edge exists in the graph map.
   */
  async hasEdge(source       , target       )                  {
    try {
      await this.db.get(`${this.namespace}>${source}|${target}`);
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
   * @param {string} source - Source of the edge
   * @return {Promise<void>}
   */
  async removeSource(source       )               {
    const promises = [];
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `${this.namespace}>${source}`, lt: `${this.namespace}>${source}~` })
        .on('data', ({ key }) => {
          const [s, t] = key.slice(this.prefixLength).split('|');
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
   * @param {string} target - Target of the edge
   * @return {Promise<void>}
   */
  async removeTarget(target       )               {
    const promises = [];
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `${this.namespace}<${target}`, lt: `${this.namespace}<${target}~` })
        .on('data', ({ key }) => {
          const [t, s] = key.slice(this.prefixLength).split('|');
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
   * Test if a source exists in the graph map.
   * @param {string} source - Source of the edge
   * @return {Promise<boolean>} - Whether the source exists in the graph map.
   */
  async hasSource(source       )                  {
    let exists = false;
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `${this.namespace}>${source}`, lt: `${this.namespace}>${source}~`, limit: 1 })
        .on('data', () => {
          exists = true;
        }).on('error', (error) => {
          reject(error);
        }).on('close', () => {
          resolve();
        });
    });
    return exists;
  }

  /**
   * Test if a target exists in the graph map.
   * @param {string} target - Target of the edge
   * @return {Promise<boolean>} - Whether the target exists in the graph map.
   */
  async hasTarget(target       )                  {
    let exists = false;
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `${this.namespace}<${target}`, lt: `${this.namespace}<${target}~`, limit: 1 })
        .on('data', () => {
          exists = true;
        }).on('error', (error) => {
          reject(error);
        }).on('close', () => {
          resolve();
        });
    });
    return exists;
  }

  /**
   * Get all sources with edges to a target.
   * @param {string} target - Target of the edge
   * @return {Promise<Set<string>>} - Set of sources
   */
  async getSources(target       )                      {
    const sources = new Set();
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `${this.namespace}<${target}`, lt: `${this.namespace}<${target}~` })
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
   * @param {string} source - Source of the edge
   * @return {Promise<Set<string>>} - Set of targets
   */
  async getTargets(source       )                      {
    const targets = new Set();
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `${this.namespace}>${source}`, lt: `${this.namespace}>${source}~` })
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

  /* :: @@iterator(): Iterator<[string, string]> { return ({}: any); } */
  // $FlowFixMe: computed property
  [Symbol.iterator]() {
    const pairs = [];
    let lastKey = `${this.namespace}>`;
    const next = async () => {
      if (pairs.length > 0) {
        return { value: pairs.shift(), done: false };
      }
      await new Promise((resolve, reject) => {
        this.db.createReadStream({ gt: lastKey, limit: 100, lt: `${this.namespace}?` })
          .on('data', ({ key }) => {
            const [source, target] = key.slice(this.prefixLength).split('|');
            pairs.push([source, target]);
          }).on('error', (error) => {
            reject(error);
          }).on('close', () => {
            resolve();
          });
      });
      if (pairs.length > 0) {
        const lastPair = pairs[pairs.length - 1];
        lastKey = `${this.namespace}>${lastPair[0]}|${lastPair[1]}`;
      } else {
        return { done: true };
      }
      return next();
    };
    const iterable = {
      [Symbol.iterator]() { return this; },
      next,
    };
    return iterable;
  }

  /**
   * Array of edges
   *
   * @return {Promise<Array<[string, string]>>}
   */
  async edges()                                  {
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
   * @return {Promise<number>}
   */
  async size()                 {
    let i = 0;
    await new Promise((resolve, reject) => {
      this.db.createReadStream({ gt: `${this.namespace}>`, lt: `${this.namespace}?` })
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

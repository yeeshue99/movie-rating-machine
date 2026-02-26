/**
 * IndexedDbConnector.tsx
 *
 * IDatabaseConnector implementation backed by the browser's IndexedDB API.
 *
 * @example
 * const connector = new IndexedDbConnector({
 *   name: 'movie-rating-machine',
 *   version: 1,
 *   stores: [
 *     {
 *       name: 'movies',
 *       options: { keyPath: 'id', autoIncrement: true },
 *       indexes: [
 *         { name: 'by_title',  keyPath: 'title' },
 *         { name: 'by_rating', keyPath: 'rating' },
 *       ],
 *     },
 *   ],
 * })
 *
 * <DatabaseProvider connector={connector}>
 *   <App />
 * </DatabaseProvider>
 */

import type { DbKey, IDatabaseConnector } from "./Database";

// ─── Schema Types ──────────────────────────────────────────────────────────────

export interface IndexSchema {
  /** Name of the index (used in getByIndex calls). */
  name: string;
  /** The record property (or array of properties) to index on. */
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

export interface StoreSchema {
  /** Name of the object store (the "table"). */
  name: string;
  options?: IDBObjectStoreParameters;
  indexes?: IndexSchema[];
}

export interface IndexedDbConfig {
  /** The IDB database name. */
  name: string;
  /**
   * Schema version. Increment whenever you add/remove stores or indexes —
   * the onupgradeneeded callback will apply the changes automatically.
   */
  version: number;
  /** Declarative description of every object store needed. */
  stores: StoreSchema[];
}

// ─── Connector ────────────────────────────────────────────────────────────────

export class IndexedDbConnector implements IDatabaseConnector {
  private db: IDBDatabase | null = null;
  private readonly config: IndexedDbConfig;
  private _isReady = false;

  constructor(config: IndexedDbConfig) {
    this.config = config;
  }

  get isReady(): boolean {
    return this._isReady;
  }

  // ── initialize ─────────────────────────────────────────────────────────────

  initialize(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const txn = (event.target as IDBOpenDBRequest).transaction!;

        for (const storeSchema of this.config.stores) {
          let store: IDBObjectStore;

          if (db.objectStoreNames.contains(storeSchema.name)) {
            // Store already exists — access it through the upgrade transaction
            // so we can add any new indexes.
            store = txn.objectStore(storeSchema.name);
          } else {
            store = db.createObjectStore(storeSchema.name, storeSchema.options);
          }

          for (const idx of storeSchema.indexes ?? []) {
            if (!store.indexNames.contains(idx.name)) {
              store.createIndex(idx.name, idx.keyPath, idx.options);
            }
          }
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        this._isReady = true;

        // Surface unexpected errors that occur after initial open.
        this.db.onerror = (ev) => {
          console.error("[IndexedDbConnector] Database error:", ev);
        };

        resolve();
      };

      request.onerror = () => {
        reject(
          new Error(
            `Failed to open IndexedDB "${this.config.name}": ${request.error?.message ?? "unknown error"}`,
          ),
        );
      };

      request.onblocked = () => {
        console.warn(
          `[IndexedDbConnector] Opening "${this.config.name}" is blocked — ` +
            "close other tabs using this database.",
        );
      };
    });
  }

  // ── close ──────────────────────────────────────────────────────────────────

  close(): void {
    this.db?.close();
    this.db = null;
    this._isReady = false;
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private getDb(): IDBDatabase {
    if (!this.db)
      throw new Error("Database is not open. Call initialize() first.");
    return this.db;
  }

  private transaction(
    storeNames: string | string[],
    mode: IDBTransactionMode,
  ): IDBTransaction {
    return this.getDb().transaction(storeNames, mode);
  }

  /** Wrap an IDBRequest in a Promise. */
  private request<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () =>
        reject(new Error(req.error?.message ?? "IDB request failed"));
    });
  }

  /** Wrap an IDBRequest that returns a cursor, collecting all records. */
  private cursorAll<T>(
    req: IDBRequest<IDBCursorWithValue | null>,
  ): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const results: T[] = [];
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          results.push(cursor.value as T);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () =>
        reject(new Error(req.error?.message ?? "IDB cursor failed"));
    });
  }

  // ── IDatabaseConnector implementation ─────────────────────────────────────

  getAll<T = unknown>(storeName: string): Promise<T[]> {
    const store = this.transaction(storeName, "readonly").objectStore(
      storeName,
    );
    return this.request<T[]>(store.getAll());
  }

  get<T = unknown>(storeName: string, key: DbKey): Promise<T | undefined> {
    const store = this.transaction(storeName, "readonly").objectStore(
      storeName,
    );
    return this.request<T | undefined>(store.get(key));
  }

  put<T = unknown>(storeName: string, value: T, key?: DbKey): Promise<DbKey> {
    const store = this.transaction(storeName, "readwrite").objectStore(
      storeName,
    );
    return this.request<DbKey>(
      key !== undefined ? store.put(value, key) : store.put(value),
    );
  }

  delete(storeName: string, key: DbKey): Promise<void> {
    const store = this.transaction(storeName, "readwrite").objectStore(
      storeName,
    );
    return this.request<undefined>(store.delete(key)).then(() => undefined);
  }

  clear(storeName: string): Promise<void> {
    const store = this.transaction(storeName, "readwrite").objectStore(
      storeName,
    );
    return this.request<undefined>(store.clear()).then(() => undefined);
  }

  getByIndex<T = unknown>(
    storeName: string,
    indexName: string,
    query: DbKey | IDBKeyRange,
  ): Promise<T[]> {
    const store = this.transaction(storeName, "readonly").objectStore(
      storeName,
    );
    const index = store.index(indexName);
    return this.cursorAll<T>(index.openCursor(query));
  }
}

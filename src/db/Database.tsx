/**
 * Database.tsx
 *
 * Defines the generic IDatabaseConnector interface, the DatabaseProvider
 * component, and the useDatabase hook.
 *
 * Any connector (IndexedDB, sql.js, in-memory, …) implements IDatabaseConnector
 * and is passed to <DatabaseProvider connector={…}>.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Connector Interface ───────────────────────────────────────────────────────

/** Opaque key type accepted by IndexedDB. */
export type DbKey = IDBValidKey;

/**
 * Generic database connector interface.
 * All methods are async and storage-backend agnostic.
 */
export interface IDatabaseConnector {
  /** Whether initialize() has completed successfully. */
  readonly isReady: boolean;

  /**
   * Open / migrate the underlying database.
   * Called automatically by DatabaseProvider on mount.
   */
  initialize(): Promise<void>;

  /** Retrieve every record in a store, in insertion order. */
  getAll<T = unknown>(storeName: string): Promise<T[]>;

  /** Retrieve a single record by its primary key. */
  get<T = unknown>(storeName: string, key: DbKey): Promise<T | undefined>;

  /**
   * Insert or update a record.
   * @returns The primary key of the stored record.
   */
  put<T = unknown>(storeName: string, value: T, key?: DbKey): Promise<DbKey>;

  /** Delete a record by its primary key. */
  delete(storeName: string, key: DbKey): Promise<void>;

  /** Delete every record in a store without removing the store itself. */
  clear(storeName: string): Promise<void>;

  /**
   * Retrieve records matching a key or range on a named index.
   * Useful for filtering by a non-primary field (e.g. rating, genre).
   */
  getByIndex<T = unknown>(
    storeName: string,
    indexName: string,
    query: DbKey | IDBKeyRange,
  ): Promise<T[]>;

  /** Close the underlying connection and release resources. */
  close(): void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

export interface DatabaseContextValue {
  /** The connector passed to DatabaseProvider. */
  connector: IDatabaseConnector;
  /** True while initialize() is running. */
  isLoading: boolean;
  /** Error message if initialize() failed, otherwise null. */
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

interface DatabaseProviderProps {
  /** Any object that satisfies IDatabaseConnector. */
  connector: IDatabaseConnector;
  children: React.ReactNode;
}

/**
 * Wraps your application (or a subtree) and makes the connector available
 * via useDatabase().
 *
 * @example
 * const connector = new IndexedDbConnector({ name: 'movies', version: 1, stores: [...] })
 *
 * <DatabaseProvider connector={connector}>
 *   <App />
 * </DatabaseProvider>
 */
export function DatabaseProvider({
  connector,
  children,
}: DatabaseProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep the connector in a ref so the effect below never re-runs because of a
  // re-render that produces a new object reference with the same connector.
  const connectorRef = useRef(connector);

  useEffect(() => {
    connectorRef.current = connector;
  });

  useEffect(() => {
    let cancelled = false;

    connectorRef.current
      .initialize()
      .then(() => {
        if (!cancelled) setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      connectorRef.current.close();
    };
    // Only re-initialize if the connector instance itself changes.
  }, [connector]);

  return (
    <DatabaseContext.Provider value={{ connector, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns the active database connector and its loading/error state.
 * Must be called inside a <DatabaseProvider>.
 *
 * @example
 * const { connector, isLoading, error } = useDatabase()
 * const movies = await connector.getAll<Movie>('movies')
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error("useDatabase() must be called inside a <DatabaseProvider>");
  }
  return ctx;
}

import initSqlJs from 'sql.js';

export type DatabaseType = 'sqlite' | 'none';

interface DatabaseConfig {
  type: DatabaseType;
  sqlite?: {
    filename: string;
  };
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private SQL: any;
  private db: any;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private databaseType: DatabaseType = 'none';
  private config: DatabaseConfig = {
    type: 'none'
  };

  private constructor() {
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getDatabaseType(): DatabaseType {
    return this.databaseType;
  }

  public async init(config?: DatabaseConfig): Promise<void> {
    if (this.initialized && !config) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (config) {
          this.config = config;
        }

        if (this.config.type === 'sqlite' && this.config.sqlite) {
          console.log('Initializing SQLite database...');

          this.SQL = await initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
          });

          const savedDb = localStorage.getItem('dashboardDb');
          if (savedDb) {
            try {
              console.log('Loading database from localStorage...');
              const uint8Array = new Uint8Array(savedDb.split(',').map(Number));
              this.db = new this.SQL.Database(uint8Array);
              console.log('Database loaded successfully');
            } catch (err) {
              console.error('Failed to load database from localStorage:', err);
              console.log('Creating new database...');
              this.db = new this.SQL.Database();
            }
          } else {
            console.log('No saved database found, creating new one...');
            this.db = new this.SQL.Database();
          }

          this.databaseType = 'sqlite';
          await this.initTables();
          this.initialized = true;
        } else {
          this.databaseType = 'none';
          this.initialized = true;
        }
      } catch (err) {
        console.error('Database initialization error:', err);
        this.databaseType = 'none';
        this.initialized = false;
        this.initPromise = null;
        throw err;
      }
    })();

    return this.initPromise;
  }

  private async initTables(): Promise<void> {
    if (this.databaseType !== 'sqlite' || !this.db) return;

    try {
      console.log('Initializing database tables...');

      this.executeSQL(`
          CREATE TABLE IF NOT EXISTS users
          (
              id
              INTEGER
              PRIMARY
              KEY
              AUTOINCREMENT,
              username
              TEXT
              UNIQUE
              NOT
              NULL,
              email
              TEXT
              UNIQUE
              NOT
              NULL,
              password
              TEXT
              NOT
              NULL,
              role
              TEXT
              NOT
              NULL
              DEFAULT
              'user',
              created_at
              TIMESTAMP
              DEFAULT
              CURRENT_TIMESTAMP,
              updated_at
              TIMESTAMP
              DEFAULT
              CURRENT_TIMESTAMP
          )
      `);

      this.executeSQL(`
          CREATE TABLE IF NOT EXISTS prompts
          (
              id
              INTEGER
              PRIMARY
              KEY
              AUTOINCREMENT,
              title
              TEXT
              NOT
              NULL,
              prompt
              TEXT
              NOT
              NULL,
              keywords
              TEXT,
              expected_runs
              INTEGER
              DEFAULT
              0,
              successful_runs
              INTEGER
              DEFAULT
              0,
              created_at
              TIMESTAMP
              DEFAULT
              CURRENT_TIMESTAMP
          )
      `);

      this.executeSQL(`
          CREATE TABLE IF NOT EXISTS layouts
          (
              id
              INTEGER
              PRIMARY
              KEY
              AUTOINCREMENT,
              layout
              TEXT
              NOT
              NULL,
              created_at
              TIMESTAMP
              DEFAULT
              CURRENT_TIMESTAMP,
              updated_at
              TIMESTAMP
              DEFAULT
              CURRENT_TIMESTAMP
          )
      `);

      console.log('Tables initialized successfully');
      this.saveToLocalStorage();
    } catch (err) {
      console.error('Failed to initialize tables:', err);
      throw err;
    }
  }

  public executeSQL(sql: string, params: any[] = []): void {
    if (!this.initialized || this.databaseType !== 'sqlite' || !this.db) {
      throw new Error('Database not initialized');
    }
    try {
      console.log('Executing SQL:', sql, 'with params:', params);
      this.db.run(sql, params);
      this.saveToLocalStorage();
    } catch (err) {
      console.error('SQL execution error:', err);
      throw err;
    }
  }

  private saveToLocalStorage(): void {
    if (this.databaseType === 'sqlite' && this.db) {
      try {
        console.log('Saving database to localStorage...');
        const data = this.db.export();
        const array = Array.from(data);
        localStorage.setItem('dashboardDb', array.toString());
        console.log('Database saved successfully');
      } catch (err) {
        console.error('Failed to save database to localStorage:', err);
      }
    }
  }

  public async query<T = any>(table: string, options: {
    select?: string;
    eq?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  } = {}): Promise<T[]> {
    if (!this.initialized || this.databaseType !== 'sqlite' || !this.db) {
      throw new Error('Database not initialized');
    }

    try {
      let sql = '';
      const values: any[] = [];

      if (options.select === 'CREATE TABLE IF NOT EXISTS') {
        return [];
      }

      sql = `SELECT ${options.select || '*'}
             FROM ${table}`;

      if (options.eq) {
        const conditions = Object.entries(options.eq)
          .map(([key], index) => `${key} = $${index + 1}`)
          .join(' OR ');
        sql += ` WHERE ${conditions}`;
        values.push(...Object.values(options.eq));
      }

      if (options.order) {
        sql += ` ORDER BY ${options.order.column} ${options.order.ascending ? 'ASC' : 'DESC'}`;
      }

      if (options.limit) {
        sql += ` LIMIT ${options.limit}`;
      }

      console.log('Executing query:', sql, 'with values:', values);
      const stmt = this.db.prepare(sql);
      const results: T[] = [];

      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }

      stmt.free();
      console.log('Query results:', results);
      return results;
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  }

  public async insert<T = any>(table: string, data: Record<string, any>): Promise<T | null> {
    if (!this.initialized || this.databaseType !== 'sqlite' || !this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const columns = Object.keys(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`);
      const values = Object.values(data);

      const sql = `
          INSERT INTO ${table} (${columns.join(', ')})
          VALUES (${placeholders.join(', ')})
      `;

      console.log('Executing insert:', sql, 'with values:', values);
      this.db.run(sql, values);

      const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
      const result = this.db.exec(`SELECT *
                                   FROM ${table}
                                   WHERE id = ${lastId}`)[0];

      this.saveToLocalStorage();

      if (!result) return null;

      const row = result.columns.reduce((obj: any, col: string, i: number) => {
        obj[col] = result.values[0][i];
        return obj;
      }, {});

      console.log('Insert result:', row);
      return row as T;
    } catch (err) {
      console.error('Insert error:', err);
      throw err;
    }
  }

  public async update<T = any>(table: string, id: string | number, data: Record<string, any>): Promise<T | null> {
    if (!this.initialized || this.databaseType !== 'sqlite' || !this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const setClause = Object.keys(data)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
      const values = [...Object.values(data), id];

      const sql = `
          UPDATE ${table}
          SET ${setClause}
          WHERE id = $${values.length}
      `;

      console.log('Executing update:', sql, 'with values:', values);
      this.db.run(sql, values);

      const result = this.db.exec(`SELECT *
                                   FROM ${table}
                                   WHERE id = ${id}`)[0];

      this.saveToLocalStorage();

      if (!result) return null;

      const row = result.columns.reduce((obj: any, col: string, i: number) => {
        obj[col] = result.values[0][i];
        return obj;
      }, {});

      return row as T;
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  }

  public async delete(table: string, id: string | number): Promise<boolean> {
    if (!this.initialized || this.databaseType !== 'sqlite' || !this.db) {
      throw new Error('Database not initialized');
    }

    try {
      this.db.run(`DELETE
                   FROM ${table}
                   WHERE id = ?`, [id]);
      this.saveToLocalStorage();
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.db) {
      this.saveToLocalStorage();
      this.db.close();
      this.db = null;
      this.initialized = false;
      this.databaseType = 'none';
    }
  }
}

export const db = DatabaseManager.getInstance();
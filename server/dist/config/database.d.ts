import sqlite3 from 'sqlite3';
export declare class Database {
    private db;
    private dbPath;
    constructor();
    init(): Promise<void>;
    private initTables;
    getDatabase(): sqlite3.Database;
    run(sql: string, params?: any[]): Promise<{
        changes: number;
        lastID: number;
    }>;
    get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
    all<T = any>(sql: string, params?: any[]): Promise<T[]>;
    close(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map
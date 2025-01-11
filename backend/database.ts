import { Machine } from './sharedTypes';
import moment from 'moment-timezone';

export class Database {

    constructor(private db: any) {
        this.initialize();
    }

    private async initialize() {
        await this.createMachinesTable();
        await this.createWeightTable();
    }

    getMachinesAndData(machineId?: number): Promise<Array<Machine>> {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT m.id as machineId, m.name, m.type, w.weight, w.date
                FROM machines m
                LEFT JOIN weight w ON m.id = w.machineId
                AND (w.date >= DATE('now', '-6 months') OR w.date IS NULL)
            `;
            
            const params: any[] = [];
            if (machineId !== undefined) {
                query += ` WHERE m.id = ?`;
                params.push(machineId);
            }
    
            this.db.all(query, params, (error: any, rows: any) => {
                if (error) {
                    reject(error);
                } else {
                    const machinesMap: { [key: number]: Machine } = {};
    
                    rows.forEach((row: any) => {
                        if (!machinesMap[row.machineId]) {
                            machinesMap[row.machineId] = {
                                id: row.machineId,
                                name: row.name,
                                type: row.type,
                                data: []
                            };
                        }
    
                        if (row.weight !== null && row.date !== null) {
                            machinesMap[row.machineId].data.push({
                                weight: row.weight,
                                date: row.date
                            });
                        }
                    });
    
                    // Sort the data array for each machine by date
                    Object.values(machinesMap).forEach(machine => {
                        machine.data.sort((a, b) => a.date.localeCompare(b.date));
                    });
    
                    resolve(Object.values(machinesMap));
                }
            });
        });
    }

    newMachine(name: string, type: string): Promise<Machine> {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO machines (name, type) VALUES (?, ?)`,
                [name, type],
                function (this: any, error: any) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({
                            id: this.lastID,
                            name,
                            type,
                            data: []
                        });
                    }
                }
            );
        });
    }

    newWeight(machineId: number, weight: number, date: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO weight (machineId, weight, date) VALUES (?, ?, ?)
                 ON CONFLICT(machineId, date) DO UPDATE SET weight = excluded.weight`,
                [machineId, weight, date],
                function(error: any) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    private createMachinesTable() {
        return new Promise((resolve, reject) => {
            this.db.run(
              `CREATE TABLE IF NOT EXISTS machines (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  type TEXT
              )`,
              (error: any) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(null);
                }
              }
            );
          });
    }

    private async createWeightTable() {
        return new Promise((resolve, reject) => {
            this.db.run(
                `CREATE TABLE IF NOT EXISTS weight (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    machineId INTEGER,
                    date TEXT,
                    weight INTEGER,
                    FOREIGN KEY(machineId) REFERENCES machines(id),
                    UNIQUE(machineId, date) ON CONFLICT REPLACE
                )`,
              (error: any) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(null);
                }
              }
            );
          });
    }

}
//#region - Imports and setup
var cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');

import { Machine } from './sharedTypes';
const app = express();
app.use(cors());
app.use(express.json())
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// initilaize sqlite3 database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
//#endregion



//#region - Database
import { Database } from './database';
const database = new Database(db);

app.get('/machines', async (req: any, res: any) => {
  const machines: Array<Machine> = await database.getMachinesAndData();
  res.status(200).send(machines);
});

app.post('/new-machine', async (req: any, res: any) => {
  const { name, type } = req.body;
  const machine: Machine = await database.newMachine(name, type);
  res.status(200).send(machine);
});

app.post('/new-weight', async (req: any, res: any) => {
  const { machineId, weight, date } = req.body;
  await database.newWeight(machineId, weight, date);
  res.status(200).send();
});

app.post('/get-machine', async (req: any, res: any) => {
  const { machineId } = req.body;
  const machineData = (await database.getMachinesAndData(machineId)).pop();
  if (!machineData) {
    return res.status(404).send({ error: 'Machine not found' });
  }
  const machine: Machine = machineData;
  res.status(200).send(machine);
});
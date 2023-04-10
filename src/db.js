import { createPool } from "mysql2/promise";
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "./config.js";

// export const pool = createPool({
//     host: 'containers-us-west-139.railway.app',//
//     user: 'root',
//     password: 'xGnJ3QCUFhpNbtTLOmUi',
//     port: 7625,
//     database: 'railway'
// })

export const pool = createPool({
  host: DB_HOST, //
  user: DB_USER,
  password: DB_PASSWORD,
  port: DB_PORT,
  database: DB_DATABASE,
});

//https://railway.app/project/34fa05f4-0909-490d-aedc-f62382f615c3/plugin/be6790fd-725b-4b6e-84cb-6d82927960a3/Connect

import pg from 'pg';

const { Pool } = pg;

const user = 'postgres';
const password = 'h4ck3rismo';
const host = 'localhost';
const port = 5432;
const database = 'mywallet';

const connection = new Pool({
  user,
  password,
  host,
  port,
  database
});

export default connection

import bcrypt from 'bcrypt';
import express from 'express';
import cors from 'cors';
import connection from './database.js'
import { v4 as uuid } from 'uuid';
const app = express();
app.use(cors());
app.use(express.json());

app.post("/sign-up", async (req, res) => {
    const { name, email, password } = req.body;
    console.log(email)
    const isNewEmail = await connection.query(`
        SELECT *
        FROM clients
        WHERE email='${email}'
    `);
    if(isNewEmail.rowCount > 0){
      res.sendStatus(409)
    }
    else{
    const passwordHash = bcrypt.hashSync(password, 10);

    await connection.query(`
        INSERT INTO clients
        ("name", email, password)
        VALUES ('${name}', '${email}', '${passwordHash}')`);

    res.sendStatus(201);
  }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    const result = await connection.query(`
        SELECT * FROM clients
        WHERE email = $1
    `,[email]);

    const user = result.rows[0];
    if (email && password){
      if(user){
        if(bcrypt.compareSync(password, user.password)) {
            const token = uuid();
            await connection.query(`
              INSERT INTO sessions (client_id, token, created_at)
              VALUES ($1, $2, NOW())
            `, [user.id, token]);

            res.status(201).send(token);
        }
        else {
          res.sendStatus(403)
        }
      }
      else {
          res.sendStatus(401);
      }
    }
    else {
      res.sendStatus(400)
    }
});

app.get("/transactions", async (req,res) => {
  const authorization = req.headers['authorization'];
  const token = authorization?.replace('Bearer ', '');

  if(!token) return res.sendStatus(401);
  else{
    const idQuery = await connection.query(`
      SELECT client_id
      FROM sessions
      WHERE token='${token}'
    `);
    const result = await connection.query(`
      SELECT *
      FROM transactions
      WHERE client_id = '${idQuery.client_id}'
    `);

    res.status(200).send(result.rows);
  }
});

app.post("/transactions", async (req,res) => {
  const authorization = req.headers['authorization'];
  const token = authorization?.replace('Bearer ', '');
  const {value, comment} = req.body;
  if(!token) return res.sendStatus(401);

  const result = await connection.query(`
    SELECT client_id
    FROM sessions
    WHERE token = '${token}'
  `);
  console.log(result.rows[0])
  if (result.rows[0].client_id && value){
    if(comment){
      await connection.query(`
        INSERT INTO transactions (client_id, "value", comment, created_at)
        VALUES sessions
        (${result.rows[0].client_id}, ${value}, '${comment}', NOW())
      `);
    }
    else{
      await connection.query(`
        INSERT INTO transactions (client_id, "value", comment, created_at)
        VALUES sessions
        (${result.rows[0].client_id}, ${value}, '', NOW())
      `);
    }
    res.sendStatus(201);
  }
  else {
    res.sendStatus(400);
  }
});


export default app
const express = require("express");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const costumers = [];

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
 */

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  const id = uuidv4();

  costumers.push({
    cpf,
    name,
    id,
    statement: [],
  });

  return res.status(201).send(costumers);
});

app.listen(3333);

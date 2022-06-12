const express = require("express");

// importação do v4 da uuid, utilizamos a função v4 para gerar um uuid aleatório
const { v4: uuidv4 } = require("uuid");

const app = express();

// app.use(express.json()) para permitir que a aplicação receba no
// body um objeto json
app.use(express.json());

// um array vazio que armazena os dados gerados no método post
const customers = [];

/**
 * DADOS GERAIS DE COSTUMERS
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
 */

// Middleware de verificação de conta por CPF
function verifyIfExistsAccountCPF(req, res, next) {
  // desestruturo o objeto de customer que vai ser passado pelo header
  const { cpf } = req.headers;

  // faço uma busca de usuário utilizando o find passando o cpf
  const customer = customers.find((customer) => customer.cpf === cpf);

  // aqui é a validação, se não encontrar nada então retorna um erro
  if (!customer) {
    return res.status(404).json({ error: "The customer doesn't exist!" });
  }

  // caso não caia no erro eu retorno o usuário encontrado
  req.customer = customer;

  // e retorno o método next, que significa que a requisição pode continuar
  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return (acc += operation.amount);
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance - 0;
}

// método de criação de usuário
app.post("/account", (req, res) => {
  // desestruturação do objeto passando pelo body
  const { cpf, name } = req.body;

  // criei uma constante que faz a comparação de dados passando como parâmetro
  // o cpf passsado e verifica se esse cpf retorna um customer
  const costumerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  // aqui valida se a constante retorna um boolean true e retorna um erro
  if (costumerAlreadyExists) {
    return res.status(409).json({ error: "Customer already exists!" });
  }

  // atualização da constante costumers com os novos dados
  customers.push({
    cpf,
    name,
    // id gerado aleatoriamente pelo uuid
    id: uuidv4(),
    statement: [],
  });

  // retorna como status o código 201 - created -  e também o novo costumer
  return res.status(201).json(customers);
});

// método GET user by cpf
app.get("/statement/", verifyIfExistsAccountCPF, (req, res) => {
  // busco o customer com base no retorno do middleware
  const { customer } = req;

  // retorno o statement do usuário caso o usuário seja encontrado
  // passando pelo middleware
  return res.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body;

  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  const balance = getBalance(customer.statement);

  if (balance === 0) {
    return res.status(201).json({
      message: `Deposit successfully made! Your new balance is: ${balance}, because it was negative.`,
    });
  }

  return res.status(201).json({
    message: `Deposit successfully made! Your new balance is: ${balance}`,
  });
});

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;

  const { customer } = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    res.status(400).json({ error: "Insufficient funds!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);
  return res.status(201).send();
});

app.get("/statement/date", verifyIfExistsAccountCPF, (req, res) => {
  // busco o customer com base no retorno do middleware
  const { customer } = req;

  const { date } = req.query;

  // a data é MM/DD/AAAA
  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  if (statement.length < 1) {
    return res
      .status(404)
      .json({ error: "No data has found using this date params!" });
  }

  return res.json(statement);
});

app.put("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { name } = req.body;

  const { customer } = req;

  customer.name = name;

  return res.status(201).send(customer);
});

app.get("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  return res.status(201).send(customer);
});

app.delete("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  // splice function serve para apagar um dado de dentro do array e recebe
  // dois parâmetros: onde vai iniciar e onde vai parar
  // passei o próprio customer encontrado como parâmetro de início da função
  // e passei como segundo parâmetro o próximo índice de dentro do array de customers
  
  customers.splice(customer, 1);

  return res.status(201).send();
});

// inicia a aplicação na porta 3333
app.listen(3333);

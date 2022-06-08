const { response } = require("express");
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

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) =>{

  const { description, amount } = req.body;

  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type:"credit"
  }

  customer.statement.push(statementOperation)

  return res.status(201).send(`Deposit successfully made! Data: ${JSON.stringify(statementOperation)}`)
})

// inicia a aplicação na porta 3333
app.listen(3333);

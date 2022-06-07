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

// método POST da aplicação
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
  return res.status(201).send(customers);
});

// inicia a aplicação na porta 3333
app.listen(3333);

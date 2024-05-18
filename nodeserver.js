// Importando as bibliotecas necessárias.
const mysql = require('mysql');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const bodyParser = require('body-parser');
const express = require('express');

// Inicializando e configurando o servidor Express
const app = express();
const portNumber = 3000;

// Configurando a conexão com o banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cadsaude'
});

// Configuração do bodyParser para processar formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conectando ao banco de dados
connection.connect((err) => {
  console.log('Tentando se conectar com o banco de dados...')
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    console.log('---------------------------');
    throw err;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
  console.log('---------------------------');
});

// Listar as portas seriais disponíveis
SerialPort.SerialPort.list().then(ports => {
  console.log('Portas seriais disponíveis:');
  ports.forEach(port => {
    console.log('- Caminho:', port.path);
    console.log('- Fabricante:', port.manufacturer);
    console.log('- ID do Produto:', port.productId);
    console.log('-------------------------');
  });
}).catch(err => {
  console.error('Erro ao listar portas seriais:', err);
});

// Configura a porta serial
const port = new SerialPort.SerialPort({
  path: 'COM1',
  baudRate: 9600 // Ajuste a taxa de transmissão conforme necessário
});

// Cria um parser para ler os dados da porta serial
const parser = port.pipe(new Readline.ReadlineParser({ delimiter: '\r\n' }));
 
// Evento disparado quando a porta é aberta com sucesso
port.on('open', () => {
  console.log('Comunicação com porta serial estabelecida com sucesso!.');
  console.log('-------------------------');
});
 
// Evento disparado em caso de erro na comunicação
port.on('error', (err) => {
  console.error('Erro na comunicação com porta serial, Tipo do erro: ', err.message);
  console.log('-------------------------');
});
 
// Evento disparado quando dados são recebidos pela porta serial
parser.on('data', (data) => {
  console.log('Dados recebidos:', data);
  console.log('-------------------------');
});

// Configurando o endpoint para receber os dados da porta serial
app.post('/api/leitura', (req, res) => {
  parser.on('data', async (data) => {
    // Salvando os dados no banco de dados
    const query = `INSERT INTO leituras (conteudo) VALUES ('${data}')`;

    connection.query(query, (err, result) => {
      if (err) {
        console.error('Erro ao inserir os dados no banco de dados:', err);
        res.status(500).send('Erro interno do servidor');
        console.log('-------------------------');
        return;
      }
      console.log('Dados inseridos com sucesso no banco de dados:', result);
      res.status(200).send('Dados inseridos com sucesso no banco de dados');
      console.log('-------------------------');
    });
  });
});

// Endpoint para receber dados do formulário de Pacientes
app.post('/api/pacientes', (req, res) => {
  const { nome, cpf, email, endereco, cidade, estado } = req.body;
  const query = `INSERT INTO pacientes (nome, cpf, email, endereco, cidade, estado) VALUES
   ('${nome}', '${cpf}', '${email}', '${endereco}', '${cidade}', '${estado}')`;

  connection.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao inserir os dados no banco de dados:', err);
      console.log('-------------------------');
      res.status(500).send('Erro interno do servidor');
      console.log('-------------------------');
      return;
    }
    res.status(200).send('Dados de paciente inseridos com sucesso');
    console.log('-------------------------');
  });
});

// Endpoint para receber dados do formulário de Fichas Médicas
app.post('/api/fichas', (req, res) => {
  const { cpf, data, hora, sintomas, alergias, registros, notas } = req.body;
  const query = `INSERT INTO fichas_medicas (cpf, data_emissao, hora_emissao, sintomas, alergias, 
    registros_anteriores, notas_medicas) VALUES ('${cpf}', '${data}', '${hora}', 
    '${sintomas}', '${alergias}', '${registros}', '${notas}')`;

  connection.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao inserir os dados no banco de dados:', err);
      console.log('-------------------------');
      res.status(500).send('Erro interno do servidor');
      console.log('-------------------------');
      return;
    }
    res.status(200).send('Dados da ficha médica inseridos com sucesso');
    console.log('-------------------------');
  });
});

// Iniciando o servidor
console.log('---// Seja bem vindo ao servidor do CadSaude //---');
console.log('Tentando ouvir servidor...')
app.listen(portNumber, () => {
  console.log(`Servidor ouvindo na porta : ${portNumber}`);
  console.log('-------------------------------');
});

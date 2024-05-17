// Importando as bibliotecas necessárias
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const mysql = require('mysql');
const express = require('express');

// Configurando a conexão com o banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cadsaude'
});

// Conectando ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw err;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida com sucesso');
});

// Configura a porta serial
const port = new SerialPort.SerialPort({
  path: 'COM4', ///dev/ttyACM0 <--- para linux
  baudRate: 9600 // Ajuste a taxa de transmissão conforme necessário
});
 
// Cria um parser para ler os dados da porta serial
const parser = port.pipe(new Readline.ReadlineParser({ delimiter: '\r\n' }));
 
// Evento disparado quando a porta é aberta com sucesso
port.on('open', () => {
  console.log('Porta serial aberta.');
});
 
// Evento disparado em caso de erro na comunicação
port.on('error', (err) => {
  console.error('Erro: ', err.message);
});
 
// Evento disparado quando dados são recebidos pela porta serial
parser.on('data', (data) => {
  console.log('Dados recebidos:', data);
});
// Inicializando o servidor Express
const app = express();
const portNumber = 3000;

// Configurando o endpoint para receber os dados da porta serial
app.post('/api/leitura', (req, res) => {
  parser.on('data', async (data) => {
    // Salvando os dados no banco de dados
    const query = `INSERT INTO leituras (conteudo) VALUES ('${data}')`;
    connection.query(query, (err, result) => {
      if (err) {
        console.error('Erro ao inserir os dados no banco de dados:', err);
        res.status(500).send('Erro interno do servidor');
        return;
      }
      console.log('Dados inseridos com sucesso no banco de dados:', result);
      res.status(200).send('Dados inseridos com sucesso no banco de dados');
    });
  });
});

// Iniciando o servidor
app.listen(portNumber, () => {
  console.log(`Servidor ouvindo na porta ${portNumber}`);
});

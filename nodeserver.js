// Importando as bibliotecas necessárias.
const mysql = require('mysql');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

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

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurando o servidor para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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
app.post('/api/uid', (req, res) => {
  parser.on('data', async (conteudo) => {
    // Salvando os dados no banco de dados
    const query = `INSERT INTO uid (conteudo) VALUES ('${data}')`;

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

//----------------------- Módulo de Login Inicio --------------------------//
// Endpoint para login de administrador
app.post('/public/loginadmin', async (req, res) => {
  const { username, password } = req.body;
  // Verifique as credenciais do administrador no banco de dados
  const query = `SELECT * FROM admin WHERE username = ?`;

  connection.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    if (results.length === 0) {
      return res.status(401).send('Usuário não encontrado');
    }

    // Verifique se a senha está correta usando bcrypt
    const admin = results[0];
    const validPassword = await bcrypt.compare(password, admin.password);
    if (validPassword) {
      // Autenticação bem-sucedida, redirecione ou envie uma resposta adequada
      res.redirect(`/dashboardadm?admin=${username}`);
    } else {
      res.status(401).send('Senha incorreta');
    }
  });
});
// Rota para o dashboard após o login do administrador
app.get('/dashboardadm', (req, res) => {
  // Renderize o arquivo HTML do dashboard ou envie uma resposta adequada
  res.sendFile(path.join(__dirname, 'public/dashadmin.html'));
});

// Endpoint para login de usuário comum
app.post('/public/loginuser', async (req, res) => {
  const { username, password } = req.body;
  // Verifique as credenciais do usuário comum no banco de dados
  const query = `SELECT * FROM users WHERE username = ?`;

  connection.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    if (results.length === 0) {
      return res.status(401).send('Usuário não encontrado');
    }

    // Verifique se a senha está correta usando bcrypt
    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      // Autenticação bem-sucedida, redirecione ou envie uma resposta adequada
      res.status(200).send('Login de usuário comum bem-sucedido');
    } else {
      res.status(401).send('Senha incorreta');
    }
  });
});
//----------------------- Módulo de Login Fim --------------------------//

//----------------------- Módulo do Cadastro de Usuários Inicio--------------------------//
// Endpoint para cadastrar usuário comum
app.post('/public/caduser', async (req, res) => {
  const { username, password } = req.body;
  // Verifique se todos os campos necessários estão presentes
  if (!username || !password) {
    return res.status(400).send('Nome de usuário e senha são obrigatórios.');
  }
  // Verifique se o nome de usuário já está em uso
  const checkQuery = `SELECT * FROM users WHERE username = ?`;
  connection.query(checkQuery, [username], async (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    if (results.length > 0) {
      return res.status(400).send('Nome de usuário já em uso.');
    }
    // Crie um hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insira o usuário no banco de dados
    const insertQuery = `INSERT INTO users (username, password) VALUES (?, ?)`;
    connection.query(insertQuery, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar usuário:', err);
        return res.status(500).send('Erro interno do servidor');
      }
      console.log(`Usuário ${username} cadastrado com sucesso.`);
      res.status(200).send('Usuário cadastrado com sucesso.');
    });
  });
});

// Endpoint para cadastrar usuário administrador
app.post('/public/cadadmin', async (req, res) => {
  const { username, password } = req.body;
  // Verifique se todos os campos necessários estão presentes
  if (!username || !password) {
    return res.status(400).send('Nome de usuário e senha são obrigatórios.');
  }
  // Verifique se o nome de usuário já está em uso
  const checkQuery = `SELECT * FROM admin WHERE username = ?`;
  connection.query(checkQuery, [username], async (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    if (results.length > 0) {
      return res.status(400).send('Nome de usuário já em uso.');
    }
    // Crie um hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insira o usuário no banco de dados
    const insertQuery = `INSERT INTO admin (username, password) VALUES (?, ?)`;
    connection.query(insertQuery, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar usuário administrador:', err);
        return res.status(500).send('Erro interno do servidor');
      }
      console.log(`Usuário administrador ${username} cadastrado com sucesso.`);
      res.status(200).send('Usuário administrador cadastrado com sucesso.');
    });
  });
});
//----------------------- Módulo do Cadastro de Usuários Fim--------------------------//

//----------------------- Módulo de Deletar Inicio--------------------------//
//Busca administradores e lista eles para deletar
app.get('/api/listaradmins', (req, res) => {
  const sqlSelect = "SELECT * FROM admin";
  connection.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Erro ao buscar os administradores.' });
    } else {
      res.json(result);
    }
  });
});
//Busca usuarios comuns e lista eles para deletar
app.get('/api/listarusers', (req, res) => {
  const sqlSelect = "SELECT * FROM users";
  connection.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Erro ao buscar os usuários.' });
    } else {
      res.json(result);
    }
  });
});
//Deleta um administrador
app.delete('/api/listaradmins/:id', (req, res) => {
  const protectedAdminId = '1'; //Achava que podia simplesmente deletar o mestre do sistema ?
  if (req.params.id === protectedAdminId) {
    res.json({ message: 'Ninguém simplesmente apaga o mestre supremo do sistema...' });
    return;
  }
  const sqlDelete = "DELETE FROM admin WHERE id = ?";
  connection.query(sqlDelete, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Erro ao deletar o administrador.' });
    } else {
      console.log(`Administrador com ID ${req.params.id} foi deletado.`);
      res.json({ message: 'Administrador deletado com sucesso.' });
    }
  });
});
//Deleta um usuário comum
app.delete('/api/listarusers/:id', (req, res) => {
  const sqlDelete = "DELETE FROM users WHERE id = ?";
  connection.query(sqlDelete, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Erro ao deletar o usuário.' });
    } else {
      console.log(`Usuário com ID ${req.params.id} foi deletado.`);
      res.json({ message: 'Usuário deletado com sucesso.' });
    }
  });
});
//----------------------- Módulo de Deletar fim--------------------------//

// Endpoint para receber dados do formulário de Pacientes
app.post('/api/paciente', (req, res) => {
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
app.post('/api/ficha', (req, res) => {
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
// Registra a data e a hora do início do servidor
console.log('-------------------------------');
console.log('Tentando ouvir servidor...')
app.listen(portNumber, () => {
  console.log(`Servidor ouvindo na porta : ${portNumber}`);
  const serverStartupTime = new Date();
  console.log(`O servidor Node.js foi iniciado em ${serverStartupTime}`);
  console.log('-------------------------------');
});

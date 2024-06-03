// Importando o módulo gerador de bancos do arquivo "geradorbanco.js"
const gerarBanco = require('./geradorbanco');
// Importando as bibliotecas necessárias.
const mysql = require('mysql');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Inicializando e configurando o servidor Express
const app = express();
const portNumber = 3000;

// Configurando a conexão com o banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
});

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

  // Criando o banco de dados cadsaude se ele não existir
  connection.query('CREATE DATABASE IF NOT EXISTS cadsaude', (err) => {
    if (err) {
      console.error('Erro ao criar o banco de dados:', err);
      return;
    }
    console.log('Banco de dados cadsaude criado ou já existente.');

    // Selecionando o banco de dados cadsaude
    connection.changeUser({database : 'cadsaude'}, (err) => {
      if (err) {
        console.error('Erro ao selecionar o banco de dados:', err);
        return;
      }
      console.log('Banco de dados cadsaude selecionado com sucesso.');

      // Chama a função para gerar as tabelas
      gerarBanco(connection);
    });
  });
});

//Configura a sessão express com o segredo de sessão
const secret = crypto.randomBytes(64).toString('hex');
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Defina como true se estiver em um ambiente de produção com HTTPS
}));
//

// Configuração do bodyParser para processar formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurando o servidor para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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
  path: 'COM3',
  baudRate: 9600 // Ajuste a taxa de transmissão conforme necessário
});
 
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
      req.session.username = username; // armazene o nome de usuário na sessão
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
      req.session.username = username; // armazene o nome de usuário na sessão
      res.redirect(`/dashboarduser?user=${username}`);
    } else {
      res.status(401).send('Senha incorreta');
    }
  });
});
// Rota para o dashboard após o login do usuário comum
app.get('/dashboarduser', (req, res) => {
  // Renderize o arquivo HTML do dashboard ou envie uma resposta adequada
  res.sendFile(path.join(__dirname, 'public/dashuser.html'));
});

//----------------------- Módulo de Login fim --------------------------//

//----------------------- Módulo do Cadastro de Usuários inicio--------------------------//
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
//----------------------- Módulo do Cadastro de Usuários fim--------------------------//

//----------------------- Módulo de Deletar inicio--------------------------//
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

//----------------------- Módulo de Alterar inicio--------------------------//
// Endpoint para buscar todos os administradores
app.get('/api/listaradmins', (req, res) => {
  const sqlSelect = "SELECT * FROM admin";
  connection.query(sqlSelect, (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Erro ao buscar os administradores.' });
      }
      res.json(result);
  });
});

// Endpoint para buscar todos os usuários comuns
app.get('/api/listarusers', (req, res) => {
  const sqlSelect = "SELECT * FROM users";
  connection.query(sqlSelect, (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Erro ao buscar os usuários.' });
      }
      res.json(result);
  });
});

// Endpoint para atualizar administrador
app.put('/api/updateadmin', async (req, res) => {
  const { id, username, password } = req.body;

  if (!id || !username || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updateQuery = 'UPDATE admin SET username = ?, password = ? WHERE id = ?';
  connection.query(updateQuery, [username, hashedPassword, id], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Erro ao atualizar administrador.' });
      }
      res.status(200).json({ message: 'Administrador atualizado com sucesso.' });
  });
});

// Endpoint para atualizar usuário comum
app.put('/api/updateuser', async (req, res) => {
  const { id, username, password } = req.body;

  if (!id || !username || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updateQuery = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
  connection.query(updateQuery, [username, hashedPassword, id], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
      }
      res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
  });
});
// Rota para servir a página HTML de atualização de usuários
app.get('/updateUser', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/alterarusuario.html'));
});
//----------------------- Módulo de Alterar fim--------------------------//

//----------------------- Módulo para Dashboards inicio ----------------//
//Função para mostrar o ID logado no canto da tela.
app.get('/getAdminId', function(req, res) {
  const adminName = req.query.admin; // Obter o nome do administrador da URL

  // Consulta para obter a ID do administrador
  connection.query('SELECT id FROM admin WHERE username = ?', [adminName], function(error, results, fields) {
    if (error) throw error;

    // Enviar a ID do administrador para o front-end
    res.json({ adminId: results[0].id });
  });
});

//Configuração do Gráfico chart.js
app.get('/grafico', (req, res) => {
  const tables = ['pacientes', 'users', 'fichas_medicas', 'uid', 'admin'];
  let results = [];
  let completedQueries = 0;

  tables.forEach(table => {
    const query = `SELECT COUNT(*) as count FROM ${table}`;
    connection.query(query, (err, result) => {
      if (err) throw err;
      results.push({ table, count: result[0].count });
      completedQueries++;

      if (completedQueries === tables.length) {
        res.json(results);
      }
    });
  });
});

// Endpoint para cadastrar dados do formulário de Pacientes
app.post('/api/paciente', (req, res) => {
  const { nome, cpf, email, endereco, cidade, estado } = req.body;
  // Verifique se todos os campos necessários estão presentes
  if (!nome || !cpf || !email || !endereco || !cidade || !estado) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
  // Verifique se o CPF já está em uso
  const checkQuery = `SELECT * FROM pacientes WHERE cpf = ?`;
  connection.query(checkQuery, [cpf], (err, results) => {
    if (err) {
      console.error('Erro ao verificar paciente:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'CPF já em uso.' });
    }
    // Insira o paciente no banco de dados
    const insertQuery = `INSERT INTO pacientes (nome, cpf, email, endereco, cidade, estado) VALUES (?, ?, ?, ?, ?, ?)`;
    connection.query(insertQuery, [nome, cpf, email, endereco, cidade, estado], (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar paciente:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      console.log(`Paciente ${nome} cadastrado com sucesso.`);
      res.status(200).json({ message: 'Paciente cadastrado com sucesso.' });
    });
  });
});

// Rota e funcionalidade para a tela de buscar pacientes
app.get('/api/buscarpacientes', (req, res) => {
  connection.query('SELECT * FROM pacientes', (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});
// Rota para criar uma ficha médica para um paciente
app.post('/pacientes/:id/fichas_medicas', (req, res) => {
    const pacienteId = req.params.id;
    const { cpf, data_emissao, hora_emissao, sintomas, alergias, registros_anteriores, notas_medicas } = req.body;

    const query = 'INSERT INTO fichas_medicas (cpf, data_emissao, hora_emissao, sintomas, alergias, registros_anteriores, notas_medicas) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [cpf, data_emissao, hora_emissao, sintomas, alergias, registros_anteriores, notas_medicas], (err, result) => {
        if (err) throw err;
        res.send('Ficha médica criada com sucesso!');
    });
});

// Rota para criar um UID
app.post('/uid', (req, res) => {
    const { conteudo } = req.body;

    const query = 'INSERT INTO uid (conteudo) VALUES (?)';
    connection.query(query, [conteudo], (err, result) => {
        if (err) throw err;
        res.send('UID criado com sucesso!');
    });
});
//--------------------- Módulo para Dashboards fim --------------------//

//--------------------- Módulo para Leitura de RFID inicio --------------------//
//Inicializando o CORS (Cross-Origin Resource Sharing)
app.use(cors());

//Conectando cors com a pagina de leitura.
app.use(express.static(path.join(__dirname, 'public')));
app.get('/salvarrfid', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/salvarrfid.html'));
});

// Cria um parser para ler os dados da porta serial
const parser = port.pipe(new Readline.ReadlineParser({ delimiter: '\r\n' }));

// Variável para armazenar o último UID lido
let lastUID = '';

// Evento disparado quando dados são recebidos pela porta serial
parser.on('data', (data) => {
  console.log('Dados recebidos: ', data);
  let splitData = data.split('UID: ');
  if (splitData.length > 1) {
    lastUID = splitData[1].trim(); // Isso irá armazenar apenas o número do UID, sem o prefixo "UID: "
  }
});

// Rota para servir a página HTML
app.get('/api/uid', (req, res) => {
  if (lastUID) {
    res.json({ uid: lastUID });
  } else {
    res.status(404).json({ message: 'Nenhum UID lido ainda' });
  }
});

// Rota para salvar o rfid lido
app.post('/api/save', (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ message: 'UID é necessário' });
  }
  const query = 'INSERT INTO uid (conteudo) VALUES (?)';
  connection.query(query, [uid], (err, result) => {
    if (err) {
      console.error('Erro ao salvar UID no banco de dados:', err);
      return res.status(500).json({ message: 'Erro ao salvar UID' });
    }
    res.status(200).json({ message: 'UID salvo com sucesso' });
  });
});

//--------------------- Módulo para Leitura de RFID fim--------------------//

//--------------------- Módulo para Comandos node fim --------------------//
// Interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//Função para lidar com consultas no banco
function executarQuery(sql, params, callback) {
  connection.query(sql, params, function (error, results, fields) {
    if (error) throw error;
    callback(results);
  });
}

//Função para limpar as Tabelas do banco com comando 
const limparTabelas = () => {
  rl.question('Tem certeza que deseja limpar todas as tabelas do banco de dados cadsaude? (sim/nao) ', resposta => {
    if (resposta.toLowerCase() === 'sim') {
      // Lista de tabelas para limpar
      const tabelasParaLimpar = ['uid', 'admin', 'users', 'pacientes', 'fichas_medicas'];

      tabelasParaLimpar.forEach(tabela => {
        executarQuery(`TRUNCATE TABLE ${tabela};`, () => console.log(`Tabela ${tabela} limpa com sucesso!`));
      });

      console.log('Todas as tabelas foram limpas.');
    } else {
      console.log('Ação de limpar tabelas cancelada.');
    }
  });
};


// Função para adicionar/atualizar um administrador com comando
const adicionarSuperAdmin = () => {
  const adminId = 1;
  const username = 'admincadsaude';
  const senhaPlana = '123456';

  // Verificar se o usuário admincadsaude com ID 1 já existe
  const queryVerificar = 'SELECT * FROM admin WHERE id = ?;';
  executarQuery(queryVerificar, [adminId], results => {
    if (results.length > 0 && bcrypt.compareSync(senhaPlana, results[0].password)) {
      console.log('O usuário admincadsaude com ID 1 já existe.');
    } else {
      console.log('Criando o usuário admincadsaude com ID 1...');
      // Se o usuário não existe, adicionar como novo administrador
      bcrypt.hash(senhaPlana, 10, (err, hash) => {
        if (err) throw err;
        const queryAdicionar = 'INSERT INTO admin (id, username, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE username = ?, password = ?;';
        executarQuery(queryAdicionar, [adminId, username, hash, username, hash], () => console.log('Administrador com ID 1 adicionado/atualizado com sucesso!'));
      });
    }
  });
};

//Funcao para comando de apagar o banco de dados e encerrar o nodeserver.js
function dropDatabaseAndExit() {
  connection.query('DROP DATABASE IF EXISTS cadsaude', (error, results, fields) => {
      if (error) throw error;
      console.log('Banco de dados cadsaude apagado com sucesso.');
  });

  connection.end((err) => {
      if (err) throw err;
      console.log('Conexão encerrada com sucesso.');
      process.exit();
  });
}

// Função para listar todos os comandos possíveis
const helpComando = () =>{
  console.log('Comandos:');
  console.log('limparbanco (Limpa todas as tabelas)\ncriarsuperuser (Adiciona um super-usuario administrador)\napagarbanco(Apaga o banco cadsaude e desliga o server)');
};

// Listener para comandos
rl.on('line', input => {
  switch (input) {
    case 'limparbanco':
      limparTabelas();
      break;
    case 'criarsuperuser':
      adicionarSuperAdmin();
      break;
    case 'apagarbanco':
      dropDatabaseAndExit();
      break;
    case 'help':
      helpComando();
      break; 
    default:
      console.log('Comando não reconhecido. Digite help para listar todos os comandos disponiveis.');
  }
});
//--------------------- Módulo para Comandos node fim --------------------//

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
  console.log('Gerando sessão...');
console.log('Segredo:', secret);
console.log('-------------------------------');
});

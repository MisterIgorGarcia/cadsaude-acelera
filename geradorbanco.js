// Função para gerar o banco de dados e tabelas
const gerarBanco = (connection) => {
    // Cria a tabela uid
    connection.query('CREATE TABLE IF NOT EXISTS uid (id INT AUTO_INCREMENT PRIMARY KEY, conteudo VARCHAR(255))', (err) => {
      if (err) throw err;
      console.log('Tabela uid criada ou já existente.');
  
      // Cria a tabela admin
      connection.query('CREATE TABLE IF NOT EXISTS admin (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) UNIQUE, password VARCHAR(255))', (err) => {
        if (err) throw err;
        console.log('Tabela admin criada ou já existente.');
  
        // Cria a tabela users
        connection.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) UNIQUE, password VARCHAR(255))', (err) => {
          if (err) throw err;
          console.log('Tabela users criada ou já existente.');
  
          // Cria a tabela pacientes
          connection.query('CREATE TABLE IF NOT EXISTS pacientes (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255), cpf VARCHAR(14), email VARCHAR(255), endereco VARCHAR(255), cidade VARCHAR(255), estado VARCHAR(255))', (err) => {
            if (err) throw err;
            console.log('Tabela pacientes criada ou já existente.');
  
            // Cria a tabela fichas_medicas
            connection.query('CREATE TABLE IF NOT EXISTS fichas_medicas (id INT AUTO_INCREMENT PRIMARY KEY, cpf VARCHAR(14), data_emissao DATE, hora_emissao TIME, sintomas TEXT, alergias TEXT, registros_anteriores TEXT, notas_medicas TEXT)', (err) => {
              if (err) throw err;
              console.log('Tabela fichas_medicas criada ou já existente.');
            });
          });
        });
      });
    });
  };
  module.exports = gerarBanco;
  
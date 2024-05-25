CREATE TABLE IF NOT EXISTS uid (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conteudo VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    cpf VARCHAR(14),
    email VARCHAR(255),
    endereco VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS fichas_medicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(14),
    data_emissao DATE,
    hora_emissao TIME,
    sintomas TEXT,
    alergias TEXT,
    registros_anteriores TEXT,
    notas_medicas TEXT
);

CREATE TABLE IF NOT EXISTS relacao_paciente_uid (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT,
    uid_id INT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (uid_id) REFERENCES uid(id)
);

CREATE TABLE IF NOT EXISTS relacao_paciente_ficha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT,
    ficha_id INT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (ficha_id) REFERENCES fichas_medicas(id)
);

<h1 align ='center'># 🏥 CadSaúde</div>

<div style="text-align: center;">
  <img src="https://github.com/MisterIgorGarcia/cadsaude-acelera/assets/131496741/0985160d-8f85-4dd7-93cb-4a4e24f63fd4" alt="cadsaude_logo">
</div>

<div align="center">

![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/MisterIgorGarcia/cadsaude-acelera?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/MisterIgorGarcia/cadsaude-acelera?style=for-the-badge)

**Sistema de gestão de saúde para controle de acesso e registro de pacientes via RFID.**

[📂 Repositório](https://github.com/MisterIgorGarcia/cadsaude-acelera) · [🐛 Reportar um problema](https://github.com/MisterIgorGarcia/cadsaude-acelera/issues)

</div>

---

## 📖 Sobre o Projeto

O **CadSaúde** é um sistema de gestão de saúde desenvolvido para clínicas, hospitais ou empresas. O projeto integra software e hardware para realizar o controle de acesso de pacientes e o registro destes em cartões RFID. 

O sistema é composto por um servidor **Node.js** integrado a um banco de dados **MySQL**, telas em **HTML e JavaScript**, e um leitor de cartões físico construído com **Arduino (C++)**. O sistema permanece na mesa do funcionário para agilizar o atendimento e o registro de dados.

---

## ✨ Funcionalidades

- **📇 Leitura e Gravação de Cartões RFID:** Registro de pacientes em cartões através do leitor Arduino.
- **🔐 Módulo Administrativo:** Área restrita para administradores realizarem login seguro.
- **📊 Visão Geral do Banco de Dados:** Acesso total ao conteúdo do banco de dados pelos administradores.
- **👥 Gestão de Usuários:** Cadastro, alteração e remoção de usuários do sistema.
- **🖥️ Interface de Atendimento:** Sistema desktop para controle de acesso de pacientes no dia a dia.
- **🔌 Integração Hardware-Software:** Comunicação serial entre o leitor físico e o servidor Node.js.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| **HTML5 & JavaScript** | Estruturação das telas e interatividade do cliente. |
| **Node.js** | Servidor backend responsável pelas regras de negócio e comunicação serial. |
| **MySQL** | Banco de dados relacional para armazenamento das informações. |
| **C++ (Arduino)** | Linguagem utilizada no desenvolvimento do leitor de cartões RFID. |
| **Bibliotecas Node.js** | `mysql`, `serialport`, `cors`, `body-parser`, `express`, `express-session`, `bcrypt`, `crypto`, `readline`, `@serialport/parser-readline`. |
| **Bibliotecas Arduino** | `MFRC522.h` (Comunicação RFID) e `SPI.h` (Comunicação Serial Peripheral Interface). |

---

## 🔌 Detalhes do Hardware (Arduino)

O leitor de cartões foi montado utilizando os seguintes componentes:

- **1 Arduino Mega 2560:** O sistema principal onde o código é armazenado e executado.
- **1 Sensor RFID MFRC522:** Responsável pela leitura dos cartões dos pacientes.
- **1 Protoboard:** Para suportar a ligação dos pinos e o sensor.
- **1 Cabo USB AM/BM:** Para conectar o Arduino ao computador ou servidor.
- **7 Pinos de Conexão:** Ligados em: GND, VCC (3.3V), RST (Pino 49), SDA (Pino 53), SCK (Pino 52), MOSI (Pino 51), MISO (Pino 50).

---

## 🚀 Como Executar

### Pré-requisitos
- Sistema Operacional com **Node.js** instalado.
- Servidor local **MySQL** instalado e configurado.

### Passo a Passo
1. Clone o repositório para a sua máquina.
2. Dentro da pasta root do projeto (onde o `nodeserver.js` está localizado), instale as dependências executando o comando abaixo no terminal:

```bash
npm install mysql serialport @serialport/parser-readline cors body-parser express express-session bcrypt

<h1 style="text-align: center;">CadSaúde</h1>
<div style="text-align: center;">
  <img src="https://github.com/MisterIgorGarcia/cadsaude-acelera/assets/131496741/0985160d-8f85-4dd7-93cb-4a4e24f63fd4" alt="cadsaude_logo">
</div>

## Descrição:
Este projeto se trata de um sistema de gestão de saúde chamado CadSaude, desenvolvido utilizando Node.js e MySQL.

- As linguagens utilizadas foram: HTML e JavaScripts para as telas, Javascript para o servidor Node.js e C++ para o leitor de cartões Arduíno.
  
- No servidor Node.js, utilizamos as seguintes bibliotecas:
  
**mysql:** Usado para conectar e interagir com o banco de dados MySQL.

**SerialPort:** Utilizado para comunicação serial, permitindo a leitura de dados de uma porta serial.

**@serialport/parser-readline:** Um parser para processar dados recebidos da porta serial em linhas delimitadas.

**cors:** Uma biblioteca usada para configurar o Cross-Origin Resource Sharing (CORS), permitindo solicitações entre diferentes origens.

**body-parser:** Utilizado para analisar os corpos das solicitações HTTP e disponibilizar os dados do corpo em req.body.

**path:** Usado para manipular e transformar caminhos de arquivo.

**express:** Framework web para Node.js, utilizado para criar e configurar o servidor web.

**express-session:** Middleware de sessão para Express, usado para gerenciar sessões de usuário.

**crypto:** Biblioteca interna do Node.js utilizada para gerar valores hash e chaves criptográficas.

**bcrypt:** Biblioteca para hashing de senhas, usada para armazenar senhas de forma segura no banco de dados.

**readline:** Módulo interno do Node.js para leitura de dados de entrada do usuário via linha de comando.

- No Arduino Utilizamos:
  
**MFRC522.h:** Biblioteca para comunicação com o módulo MFRC522.

**SPI.h:** Biblioteca para comunicação SPI (Serial Peripheral Interface).

**1 Sensor de leitura RFID:** Para a leitura dos cartões dos pacientes.

**7 Pinos de Conecção:** Ligados em: GRD, VCC 3.3 volts, RST ligado ao pino 49, SDA ligado ao pino 53, SCK ligado ao pino 52, MOSI ligado ao pino 51, MISO ligado ao pino 50.

**1 Protoboard:** Para suportar a ligação dos pinos e o sensor.

**1 Arduino Mega 2560:** O sistema todo onde irá ser armazenado o código e rodar os leitores.

**1 Cabo USB AM/BM:** Para conectar o arduino ao USB do computador ou servidor que irá roda-lo.

## Funcionalidade:

O Sistema é projetado para permanecer na mesa do funcionário da empresa, clinica ou hospital para que ele possa realizar o controle de acesso de pacientes, e o registro deles em cartões RFID.

O Sistema também contém um módulo administrativo onde os administradores podem logar em suas contas e terem uma visão geral do contéudo total do banco de dados e também cadastrar, alterar e remover usuarios existentes no sistema.

## Dependencias:

**Sistema Operacional :** Necessita instalar um servidor local MySQL e um Node.js.

**nodeserver.js :**

Para baixa-las digite no terminal ou prompt dentro da pasta root do projeto(pasta onde o nodeserver.js esta localizado):
*npm install mysql serialport @serialport/parser-readline cors body-parser express express-session bcrypt*

### Integrantes do projeto: ### 

**Igor: Criador do servidor node, telas, interface e banco de dados e também realizei ajustes em geral no projeto.**

**Matheus : Criador da Documentação e o logotipo do projeto.**

**Amaury: Desenvolvedor do código arduino.**

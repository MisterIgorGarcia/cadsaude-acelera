#include <MFRC522.h>
#include <MFRC522Extended.h>
#include <deprecated.h>
#include <require_cpp11.h>

// Importação das bibliotecas necessárias
#include <MFRC522.h>
#include <SPI.h>

// Define os pinos de conexão
#define PINO_RST 49 // Pino reset 49
#define PINO_SDA 53 // Pino Serial 53

// Inicializa a biblioteca com os pinos associados a ela
MFRC522 rfid(PINO_SDA, PINO_RST);

// Variável para armazenar o último UID lido
String ultimoUID = "";

// Configura a placa e seus periféricos
void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();  
  Serial.println("Aproxime a sua tag...");
  Serial.println();
}

void loop() {
  // Procura nova tag
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  
  // Seleciona uma tag
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Mostra UID na serial se for diferente do último lido
  String conteudo = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    conteudo.concat(String(rfid.uid.uidByte[i] < 0x10 ? "0" : ""));
    conteudo.concat(String(rfid.uid.uidByte[i], HEX)); 
  }

  // Verifica se o UID lido é diferente do último UID armazenado
  if (conteudo != ultimoUID) {
    Serial.print("UID: ");
    Serial.println(conteudo);
    // Atualiza o último UID armazenado
    ultimoUID = conteudo;
  }
}

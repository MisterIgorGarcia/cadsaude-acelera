#include <MFRC522.h>
#include <SPI.h>

#define PINO_RST 49
#define PINO_SDA 53

MFRC522 rfid(PINO_SDA, PINO_RST);

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
    delay(1000);
    return;
  }
  
  // Seleciona uma tag
  if (!rfid.PICC_ReadCardSerial()) {
    delay(1000);
    return;
  }
  
  // Mostra UID na serial
  Serial.print("UID: ");
  String conteudo = "";

  for (byte i = 0; i < rfid.uid.size; i++) {
     conteudo.concat(String(rfid.uid.uidByte[i] < HEX ? "0" : "")); 
     conteudo.concat(String(rfid.uid.uidByte[i], HEX)); 
  }

  Serial.println(conteudo);

  // Envia o UID da tag via comunicação serial
  Serial.println(conteudo);
  
  delay(1000);
}

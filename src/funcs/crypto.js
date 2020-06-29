import { JSEncrypt } from "jsencrypt";

let crypt = null;

export function generateKeyPair() {
  let keySize = 1024;
  crypt = new JSEncrypt({ default_key_size: keySize });
  crypt.getKey();
  let prikey = crypt.getPrivateKey();
  let pubkey = crypt.getPublicKey();

  return { prikey, pubkey };
}

export function encrypt(text, pubkey) {
  if (text.length > 117) {
    text = text.substr(0, 117);
  }

  crypt.setPublicKey(pubkey);
  let cypherText = crypt.encrypt(text);
  return cypherText;
}

export function decrypt(cypherText, prikey) {
  crypt.setPrivateKey(prikey);
  let text = crypt.decrypt(cypherText);

  if (Object.is(text, null)) {
    console.log("Decrypt failed");
    return null;
  }
  return text;
}

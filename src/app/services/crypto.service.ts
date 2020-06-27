import { Injectable } from '@angular/core';
import { JSEncrypt } from 'jsencrypt';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  constructor() {}

  crypt = null;

  generateKeyPair() { 
    let keySize = 1024;
    this.crypt = new JSEncrypt({ default_key_size: keySize });
    this.crypt.getKey();
    let prikey = this.crypt.getPrivateKey();
    let pubkey = this.crypt.getPublicKey();

    return { prikey, pubkey };
  }

  encrypt(text, pubkey) {
    if (text.length > 117) {
      text = text.substr(0, 117);
    }

    this.crypt.setPublicKey(pubkey);
    let cypherText = this.crypt.encrypt(text);
    return cypherText;
  }

  decrypt(cypherText, prikey) {
    console.log('decrypt()');
    this.crypt.setPrivateKey(prikey);
    let text = this.crypt.decrypt(cypherText);
    console.log(cypherText, '=================', text);

    if (Object.is(text, null)) {
      console.log('Decrypt failed');
      return null;
    }
    return text;
  }

  // decrypt() {
  //   this.crypt.setPrivateKey(privateKey);
  //   this.plainText = this.crypt.decrypt(this.cypherText);
  //   1;
  //   if (Object.is(this.plainText, null)) {
  //     this._message.error('解密失败');
  //   }
  // }
}

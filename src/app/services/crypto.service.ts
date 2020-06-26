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

  // encrypt() {
  //   const text = `${this.plainText}`.trim();

  //   // 1024 位的密钥支持明文长度最大为 127
  //   if (text.length > 117) {
  //     this._message.error('加密内容过长，请重新输入');
  //   } else {
  //     this.$encrypt.setPublicKey(publicKey);
  //     this.cypherText = this.$encrypt.encrypt(text);
  //   }
  // }

  // decrypt() {
  //   this.$encrypt.setPrivateKey(privateKey);
  //   this.plainText = this.$encrypt.decrypt(this.cypherText);
  //   1;
  //   if (Object.is(this.plainText, null)) {
  //     this._message.error('解密失败');
  //   }
  // }
}

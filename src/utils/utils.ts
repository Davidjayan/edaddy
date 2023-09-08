import crypto from "crypto-js";
export const Utils = {
  encryptFile: (data: string) => {
    var key: any = crypto.lib.WordArray.random(64);

    key = crypto.enc.Base64.stringify(key);

    const encryptedData = crypto.AES.encrypt(data, key).toString();
    return { encryptedData, key };
  },
  decryptFile: (data: string, key: string) => {
    const decryptedImageBuffer = crypto.AES.decrypt(data, key);

    const decryptedImageData = Buffer.from(
      decryptedImageBuffer.toString(crypto.enc.Utf8),
      "base64"
    );
    return decryptedImageData;
  },
};

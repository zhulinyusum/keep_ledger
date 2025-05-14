const fs = require('fs');
const { Keypair } = require('@solana/web3.js');

// 从已有私钥Uint8Array创建
const existingPrivateKey = new Uint8Array([...]); // 你的私钥数组
const keypair = Keypair.fromSecretKey(existingPrivateKey);

// 保存为id.json
fs.writeFileSync(
  'slo',
  JSON.stringify(Array.from(keypair.secretKey))
);
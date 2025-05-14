import fs from 'fs';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58'; // 用于解码 Base58 编码的私钥

export const convertPrivateKeyToKeypair = () => {
  try {
    // Base58 编码的私钥字符串
    const base58PrivateKey = 'Pfbyft4kBwuGQggoZfDhTFNZWRmcXQH41Qr61DzsbXVwbRE4ngmXyVcBKWbfG6AybkH2HuUGdR5avUKqwJubu87';

    // 解码 Base58 私钥为 Uint8Array
    const existingPrivateKey = bs58.decode(base58PrivateKey);

    // 创建密钥对
    const keypair = Keypair.fromSecretKey(existingPrivateKey);

    // 打印公钥和私钥
    console.log('Public Key:', keypair.publicKey.toBase58());
    console.log('Private Key (64 bytes):', Array.from(keypair.secretKey));
    console.log('Private Key (58 bytes):', keypair);
    // 保存密钥对到文件
    const outputPath = 'keypair.json';
    // fs.writeFileSync(
    //   outputPath,
    //   JSON.stringify({
    //     publicKey: keypair.publicKey.toBase58(),
    //     secretKey: Array.from(keypair.secretKey),
    //   })
    // );

    // console.log(`Keypair saved to ${outputPath}`);
  } catch (error) {
    console.error('Error converting private key to keypair:', error);
  }
};

// 执行转换
convertPrivateKeyToKeypair();
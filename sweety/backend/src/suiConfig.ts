// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { PACKAGE_ID } from "./constant.js"

import dotenv from "dotenv";
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { getAllowlistedKeyServers, SealClient } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';
dotenv.config();

const suiServer = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: "testnet",
});

const secretKey = process.env.SUI_PRIVATE_KEY ?? ""
const keypair = Secp256k1Keypair.fromSecretKey(secretKey);

const sealServer = new SealClient({
  suiClient: suiServer,
  serverObjectIds: getAllowlistedKeyServers('testnet'),
  verifyKeyServers: false,
})

const walrusServer = new WalrusClient({
  network: 'testnet',
  suiClient: suiServer,

})

export {keypair, suiServer, sealServer, walrusServer };



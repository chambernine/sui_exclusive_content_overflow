// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { getFullnodeUrl } from '@mysten/sui/client';

import { createNetworkConfig } from '@mysten/dapp-kit';
import { TESTNET_PACKAGE_ID } from '@/constant/constant';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl('testnet'),
    variables: {
      packageId: TESTNET_PACKAGE_ID,
      gqlClient: 'https://sui-testnet.mystenlabs.com/graphql',
    },
  },
});

export { useNetworkVariable, useNetworkVariables, networkConfig };

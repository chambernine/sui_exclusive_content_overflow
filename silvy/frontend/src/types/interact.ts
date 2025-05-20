import { SuiTransactionBlockResponse } from "node_modules/@mysten/sui/dist/esm/client/types";
export interface WaitForSignPublishResponse {
  albumId: string;
  capId: string;
  walrusObjectIds: WalrusObjectResponse[];
}

export interface WalrusObjectResponse {
  id: string;
  registered_epoch: number;
  blob_id: string;
  size: string;
  encoding_type: number;
  certified_epoch: number | null;
  storage: {
    id: string;
    start_epoch: number;
    end_epoch: number;
    storage_size: string;
  };
  deletable: boolean;
  cost: number;
  resourceOperation: {
    registerFromScratch: {
      encodedLength: string;
      epochsAhead: number;
    };
  };
}

export type PublishStatus =
  | { status: "approved"; result: SuiTransactionBlockResponse }
  | { status: "failed"; error?: string; result: SuiTransactionBlockResponse }
  | { status: "rejected" };

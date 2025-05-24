import {
  useCurrentAccount,
  useSuiClientQueries,
  useSuiClientQuery,
} from "@mysten/dapp-kit";

export const useSuiAccount = () => {
  const account = useCurrentAccount();

  const address = account?.address
  const balances = useSuiClientQueries({
    queries: account?.address
      ? [
          {
            method: "getBalance",
            params: {
              owner: account.address,
            },
          },
        ]
      : [],
    combine: (result) => {
      return {
        data: result.map((res) => res.data),
        isSuccess: result.every((res) => res.isSuccess),
        isPending: result.some((res) => res.isPending),
        isError: result.some((res) => res.isError),
      };
    },
  });

  const getOwnedObject = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    },
  );

  return {
    account,
    address,
    getOwnedObject,
    balances
  };
};

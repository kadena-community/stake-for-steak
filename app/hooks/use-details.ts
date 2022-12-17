import useSWR from "swr";
import { Pact } from "@kadena/client";

const fetchDetails = async (name: string) => {
  const details = await (Pact.modules as any)["coin"]
    ["details"](name)
    .local(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );

  return details.result.data;
};

interface KeySet {
  keys: string[];
}

interface Details {
  account: string;
  balance: number;
  guard: KeySet;
}

export function useDetails(name: string | null) {
  const { data, error, isLoading } = useSWR(name, fetchDetails, {
    refreshInterval: 10000,
  });
  return {
    details: data as Details,
    isLoading: !data,
    isError: error,
  };
}

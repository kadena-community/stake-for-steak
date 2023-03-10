import useSWR from "swr";
import { Pact } from "@kadena/client";

const fetchStake = async (name: string) => {
  const stake = await (Pact.modules as any)["free.stake-for-steak"]
    ["get-stake"](name)
    .local(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );

  return stake.result.data;
};

interface Stake {
  name: string;
  stake: number;
  balance: number;
  owner: string;
  stakers: string[];
  merchant: string;
}

export function useStake(name: string | undefined) {
  const { data, error, isLoading } = useSWR(name, fetchStake, {
    refreshInterval: 10000,
  });
  return {
    stake: data as Stake,
    isLoading: !data,
    isError: error,
  };
}

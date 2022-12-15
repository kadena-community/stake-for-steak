import useSWRMutation from "swr/mutation";
import { Pact, signWithChainweaver } from "@kadena/client";

interface PayInput {
  staker: string;
  keys: string[];
  amount: number;
}
const pay = async (name: string, { arg }: { arg: PayInput }) => {
  const { staker, keys, amount } = arg;
  const stake = await (Pact.modules as any)["free.stake-for-steak"]
    ["get-stake"](name)
    .local(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );
  const stakeId = await (Pact.modules as any)["free.stake-for-steak"]
    ["get-stake-id"](name, stake.result.data.owner)
    .local(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );
  const command = (Pact.modules as any)["free.stake-for-steak"]
    ["pay"](name, staker, amount)
    .addData({
      keyset: { pred: "keys-all", keys },
    })
    .addCap("coin.GAS" as any, keys[0])
    .addCap("free.stake-for-steak.STAKER", keys[0], name, staker)
    .addCap(
      "coin.TRANSFER" as any,
      keys[0],
      stakeId.result.data,
      stake.result.data.merchant,
      stake.result.data.stake
    )
    .setMeta({ sender: staker }, "testnet04");

  await signWithChainweaver(command);

  const res = await command.send(
    "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
  );
  return res;
};

export function usePay(name: string | undefined) {
  const { data, error, isMutating, trigger } = useSWRMutation(name, pay);
  return {
    transaction: data,
    isPaying: isMutating,
    isError: error,
    pay: trigger,
  };
}

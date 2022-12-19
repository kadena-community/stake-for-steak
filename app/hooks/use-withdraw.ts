import useSWRMutation from "swr/mutation";
import { Pact, signWithChainweaver } from "@kadena/client";

interface WithdrawInput {
  name: string;
  keys: string[];
}
const withdraw = async (staker: string, { arg }: { arg: WithdrawInput }) => {
  const { name, keys } = arg;
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
    ["withdraw"](name, staker)
    .addData({
      keyset: { pred: "keys-all", keys },
    })
    .addCap("coin.GAS" as any, keys[0])
    .addCap("free.stake-for-steak.STAKER", keys[0], name, staker)
    .addCap(
      "coin.TRANSFER" as any,
      keys[0],
      stakeId.result.data,
      staker,
      stake.result.data.stake
    )
    .setMeta({ sender: staker }, "testnet04");

  await signWithChainweaver(command);

  const res = await command.send(
    "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
  );
  console.log(res);
};

export function useWithdraw(staker: string | undefined | null) {
  const { data, error, isMutating, trigger } = useSWRMutation(staker, withdraw);
  return {
    transaction: data,
    isWithdrawing: isMutating,
    isError: error,
    withdraw: trigger,
  };
}

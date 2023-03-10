import useSWRMutation from "swr/mutation";
import { Pact, signWithChainweaver } from "@kadena/client";
import { getEscrowId } from "../utils/get-escrow-id";
import { useContext } from "react";
import { ConsentModalContext } from "../components/consent-context";

interface FundInput {
  staker: string;
  keys: string[];
}
const fundStake =
  (open: Function) =>
  async (name: string, { arg }: { arg: FundInput }) => {
    const modal = await open(["GAS", "TRANSFER"]);
    console.log("modal", modal);

    const { staker, keys } = arg;
    const stake = await (Pact.modules as any)["free.stake-for-steak"]
      ["get-stake"](name)
      .local(
        "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
      );

    const escrowId = await getEscrowId(name, stake.result.data.owner);

    const command = (Pact.modules as any)["free.stake-for-steak"]
      ["fund-stake"](name, staker, () => `(read-keyset 'keyset)`)
      .addData({
        keyset: { pred: "keys-all", keys },
      })
      .addCap("coin.GAS" as any, keys[0])
      .addCap(
        "coin.TRANSFER" as any,
        keys[0],
        staker,
        escrowId,
        stake.result.data.stake
      )
      .setMeta({ sender: staker }, "testnet04");

    await signWithChainweaver(command);

    const res = await command.send(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );
    console.log(res);
    return res;
  };

export function useFund(name: string | undefined) {
  const { open } = useContext(ConsentModalContext);
  const { data, error, isMutating, trigger } = useSWRMutation(
    name,
    fundStake(open)
  );
  return {
    transaction: data,
    isFunding: isMutating,
    isError: error,
    fund: trigger,
  };
}

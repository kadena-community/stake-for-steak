import useSWRMutation from "swr/mutation";
import { Pact, signWithChainweaver } from "@kadena/client";
import { getEscrowId } from "../utils/get-escrow-id";

interface CreateInput {
  name: string;
  merchant: string;
  keys: string[];
  stake: number;
}
const pay = async (owner: string, { arg }: { arg: CreateInput }) => {
  const { merchant, name, keys, stake } = arg;
  const escrowId = await getEscrowId(name, owner);

  const command = (Pact.modules as any)["free.stake-for-steak"]
    ["create-stake"](
      name,
      merchant,
      owner,
      () => `(read-keyset 'keyset)`,
      stake
    )
    .addData({
      keyset: { pred: "keys-all", keys },
    })
    .addCap("coin.GAS" as any, keys[0])
    .addCap("coin.TRANSFER" as any, keys[0], owner, escrowId, stake)
    .setMeta({ sender: owner }, "testnet04");

  await signWithChainweaver(command);

  const res = await command.send(
    "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
  );
  return res;
};

export function useCreate(owner: string | undefined | null) {
  const { data, error, isMutating, trigger } = useSWRMutation(owner, pay);
  return {
    transaction: data,
    isCreating: isMutating,
    isError: error,
    create: trigger,
  };
}

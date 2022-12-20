import { Pact } from "@kadena/client";

export const getEscrowId = async (name: string, owner: string) => {
  const res = await (Pact.modules as any)["free.stake-for-steak"]
    ["get-escrow-id"](name, owner)
    .local(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );

  return res?.result?.data;
};

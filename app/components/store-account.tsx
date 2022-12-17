import { Pact } from "@kadena/client";
import { FormEvent, useCallback } from "react";
import { useAccount } from "../hooks/use-account";
import { useDetails } from "../hooks/use-details";
import { useKeys } from "../hooks/use-keys";

const fetchDetails = async (name: string) => {
  const details = await (Pact.modules as any)["coin"]
    ["details"](name)
    .local(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );

  return details.result.data;
};

export default function StoreAccount() {
  const { account, setAccount } = useAccount();
  const { details } = useDetails(account);
  const { keys, setKeys } = useKeys();
  const storeAccount = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { name } = event.target as Element & {
        [key: string]: HTMLInputElement;
      };
      setAccount(name.value);
      const details = await fetchDetails(name.value);

      setKeys(details.guard.keys);
    },
    [setAccount, setKeys]
  );
  if (account && keys?.length)
    return (
      <p className="account">
        {account} {details && `(KDA: ${details?.balance})`}
      </p>
    );
  return (
    <form className="flex flex-col" onSubmit={storeAccount}>
      <label className="text-slate-100 p-2 label">
        Account name:
        <input name="name" />
      </label>
      <button
        className="block p-2 m-2 button rounded-md text-slate-100"
        type="submit"
      >
        Store
      </button>
    </form>
  );
}

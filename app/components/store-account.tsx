import { FormEvent, useCallback } from "react";
import { useAccount } from "../hooks/use-account";
import { useKeys } from "../hooks/use-keys";

export default function StoreAccount() {
  const { account, setAccount } = useAccount();
  const { keys, setKeys } = useKeys();
  const storeAccount = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { name, keys } = event.target as Element & {
        [key: string]: HTMLInputElement;
      };
      setAccount(name.value);
      setKeys(keys.value.split(","));
    },
    [setAccount, setKeys]
  );
  if (account && keys?.length)
    return (
      <p className="account">
        {account}
      </p>
    );
  return (
    <form className="flex flex-col" onSubmit={storeAccount}>
      <label className="text-slate-100 p-2 label">
        Account name:
        <input name="name" />
      </label>
      <label className="text-slate-100 p-2 label">
        public keys:
        <input name="keys" />
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

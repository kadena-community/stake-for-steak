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
    []
  );
  if (account && keys?.length)
    return (
      <p className="m-4 text-slate-100 text-right relative xsm:absolute xsm:right-2 top-2 truncate f-right xm:max-w-[10rem]">
        {account}
      </p>
    );
  return (
    <form className="flex flex-col" onSubmit={storeAccount}>
      <label className="text-slate-100 p-2">
        name:
        <input className="ml-2" name="name" />
      </label>
      <label className="text-slate-100 p-2">
        public keys:
        <input className="ml-2" name="keys" />
      </label>
      <button
        className="block p-2 m-2 bg-slate-700 rounded-md text-slate-100"
        type="submit"
      >
        Store
      </button>
    </form>
  );
}

import { FormEvent, useCallback } from "react";
import { useAccount } from "../hooks/use-account";

export default function StoreAccount() {
  const { account, setAccount } = useAccount();
  const storeAccount = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { name } = event.target as Element & {
        [key: string]: HTMLInputElement;
      };
      setAccount(name.value);
    },
    []
  );
  if (account)
    return (
      <p className="m-4 text-slate-100 text-right relative xsm:absolute xsm:right-2 top-2 truncate f-right xm:max-w-[10rem]">
        {account}
      </p>
    );
  return (
    <form className="flex" onSubmit={storeAccount}>
      <label>
        Please enter your account name:
        <input name="name" />
      </label>
    </form>
  );
}

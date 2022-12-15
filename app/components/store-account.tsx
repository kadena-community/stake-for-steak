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
  if (account) return <p>Account name: {account}</p>;
  return (
    <form onSubmit={storeAccount}>
      <label>
        Please enter your account name:
        <input name="name" />
      </label>
    </form>
  );
}

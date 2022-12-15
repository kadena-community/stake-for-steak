import { useEffect, useState } from "react";

export function useAccount() {
  const [account, setAccount] = useState<string | null>(null);
  useEffect(() => {
    setAccount(localStorage?.getItem("accountName"));
  }, []);
  return {
    account,
    setAccount: (account: string) => {
      setAccount(account);
      localStorage.setItem("accountName", account);
    },
  };
}

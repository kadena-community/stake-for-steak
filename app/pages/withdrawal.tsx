import Head from "next/head";
import { FormEvent, useCallback } from "react";
import { Pact, signWithChainweaver } from "@kadena/client";
import styles from "../styles/Home.module.css";
import { useDetails } from "../hooks/use-details";
import { useAccount } from "../hooks/use-account";
import { useWithdraw } from "../hooks/use-withdraw";

export default function Home() {
  const { account } = useAccount();
  const { details } = useDetails(account);
  const { withdraw, isWithdrawing } = useWithdraw(account);
  const withdrawFunds = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { name } = event.target as Element & {
        [key: string]: HTMLInputElement;
      };

      const keys = details.guard.keys;
      await withdraw({ name: name.value, keys });
    },
    [account, details, withdraw]
  );
  return (
    <>
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="sweet-title">Withdraw</h1>

        <p className="text-slate-100">Withdraw your stake here</p>

        {isWithdrawing && (
          <p className="text-xl text-slate-100 font-bold">
            Please sign in chainweaver...
          </p>
        )}

        <form onSubmit={withdrawFunds} className="m-4">
          <div className="text-slate-100 m-2">
            <label htmlFor="name">Name: </label>
            <input
              className="text-slate-700 p-1"
              type="text"
              name="name"
              id="name"
            />
          </div>
          <button
            type="submit"
            className="block button rounded-md text-slate-100"
          >
            Withdraw
          </button>
        </form>
      </main>
    </>
  );
}

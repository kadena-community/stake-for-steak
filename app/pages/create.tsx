import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Pact, signWithChainweaver } from "@kadena/client";
import { FormEvent, useCallback } from "react";
import { useAccount } from "../hooks/use-account";
import { useDetails } from "../hooks/use-details";
import { useCreate } from "../hooks/use-create";

export default function Home() {
  const { account } = useAccount();
  const { details } = useDetails(account);
  const { create, isCreating } = useCreate(account);

  const createStake = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { name, merchant, stake } = event.target as Element & {
        [key: string]: HTMLInputElement;
      };
      const keys = details.guard.keys;
      await create({
        name: name.value,
        keys,
        merchant: merchant.value,
        stake: parseFloat(stake.value),
      });
    },
    [account, details]
  );
  return (
    <>
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="text-3xl font-bold text-slate-100 text-center">
          Create
        </h1>

        <p className="text-slate-100 text-center">Create your stake here</p>

        {isCreating && (
          <p className="text-xl text-slate-100 font-bold">
            Please sign in chainweaver...
          </p>
        )}
        <form onSubmit={createStake} className="m-4">
          <div className="text-slate-100 m-2">
            <label htmlFor="name">Name: </label>
            <input
              className="text-slate-700 p-1"
              type="text"
              name="name"
              id="name"
            />
          </div>
          <div className="text-slate-100 m-2">
            <label htmlFor="merchant">Merchant: </label>
            <input
              className="text-slate-700 p-1"
              type="text"
              name="merchant"
              id="merchant"
            />
          </div>
          <div className="text-slate-100 m-2">
            <label htmlFor="stake">Stake: </label>
            <input
              className="text-slate-700 p-1"
              type="number"
              name="stake"
              id="stake"
            />
          </div>
          <button
            type="submit"
            className="block button rounded-md text-slate-100"
          >
            Create
          </button>
        </form>
      </main>
    </>
  );
}

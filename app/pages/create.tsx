import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Pact, signWithChainweaver } from "@kadena/client";
import { FormEvent, useCallback } from "react";
import { useAccount } from "../hooks/use-account";
import { useDetails } from "../hooks/use-details";

export default function Home() {
  const { account } = useAccount();
  const { details } = useDetails(account);
  const createStake = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, merchant, stake } = event.target as Element & {
      [key: string]: HTMLInputElement;
    };
    const keys = details.guard.keys;
    const command = (Pact.modules as any)["free.stake-for-steak"]
      ["create-stake"](
        name.value,
        merchant.value,
        account,
        () => `(read-keyset 'keyset)`,
        parseFloat(stake.value)
      )
      .addData({
        keyset: { pred: "keys-all", keys },
      })
      .addCap("coin.GAS" as any, keys[0])
      .addCap(
        "coin.TRANSFER" as any,
        keys[0],
        account,
        `${account}-${name.value}`,
        parseFloat(stake.value)
      )
      .setMeta({ sender: account }, "testnet04");

    await signWithChainweaver(command);

    console.log(command);

    const res = await command.send(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );
    console.log(res);
  }, []);
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

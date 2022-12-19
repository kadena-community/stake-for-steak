import Head from "next/head";
import { FormEvent, useCallback } from "react";
import { Pact, signWithChainweaver } from "@kadena/client";
import styles from "../styles/Home.module.css";
import { useDetails } from "../hooks/use-details";
import { useAccount } from "../hooks/use-account";

export default function Home() {
  const { account } = useAccount();
  const { details } = useDetails(account);
  const withdraw = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name } = event.target as Element & {
      [key: string]: HTMLInputElement;
    };
    const keys = details.guard.keys;
    const stake = await (Pact.modules as any)["free.stake-for-steak"]
      ["get-stake"](name.value)
      .local(
        "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
      );

    const stakeId = await (Pact.modules as any)["free.stake-for-steak"]
      ["get-stake-id"](name.value, stake.result.data.owner)
      .local(
        "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
      );
    const command = (Pact.modules as any)["free.stake-for-steak"]
      ["withdraw"](name.value, account)
      .addData({
        keyset: { pred: "keys-all", keys },
      })
      .addCap("coin.GAS" as any, keys[0])
      .addCap("free.stake-for-steak.STAKER", keys[0], name.value, account)
      .addCap(
        "coin.TRANSFER" as any,
        keys[0],
        stakeId.result.data,
        account,
        stake.result.data.stake
      )
      .setMeta({ sender: account }, "testnet04");

    await signWithChainweaver(command);

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
        <h1 className="sweet-title">Withdraw</h1>

        <p className="text-slate-100">Withdraw your stake here</p>

        <form onSubmit={withdraw} className="m-4">
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

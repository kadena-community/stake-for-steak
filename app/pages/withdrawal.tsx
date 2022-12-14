import Head from "next/head";
import { FormEvent, useCallback } from "react";
import { Pact, signWithChainweaver } from "@kadena/client";
import styles from "../styles/Home.module.css";

export default function Home() {
  const withdraw = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, staker, keys } = event.target as Element & {
      [key: string]: HTMLInputElement;
    };
    const pubkeys = keys.value.split(",").map((key) => key.trim());
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
      ["withdraw"](name.value, staker.value)
      .addData({
        keyset: { pred: "keys-all", keys: keys.value.split(",") },
      })
      .addCap("coin.GAS" as any, pubkeys[0])
      .addCap(
        "free.stake-for-steak.STAKER",
        pubkeys[0],
        name.value,
        staker.value
      )
      .addCap(
        "coin.TRANSFER" as any,
        pubkeys[0],
        stakeId.result.data,
        staker.value,
        stake.result.data.stake
      )
      .setMeta({ sender: staker.value }, "testnet04");

    await signWithChainweaver(command);

    const res = await command.send(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );
    console.log(res);
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Withdraw</h1>

        <p className={styles.description}>Withdraw your stake here</p>

        <form onSubmit={withdraw} className={styles.grid}>
          <div className={styles.input}>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" />
          </div>
          <div className={styles.input}>
            <label htmlFor="staker">Staker</label>
            <input type="text" name="staker" id="staker" />
          </div>
          <div className={styles.input}>
            <label htmlFor="keys">Keys</label>
            <input type="text" name="keys" id="keys" />
          </div>
          <div className={styles.input}>
            <button type="submit">Withdraw</button>
          </div>
        </form>
      </main>
    </div>
  );
}

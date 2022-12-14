import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Pact, signWithChainweaver } from "@kadena/client";
import { FormEvent, useCallback } from "react";

export default function Home() {
  const createStake = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, merchant, owner, keys, stake } = event.target as Element & {
      [key: string]: HTMLInputElement;
    };
    const pubkeys = keys.value.split(",").map((key) => key.trim());
    const command = (Pact.modules as any)["free.stake-for-steak"]
      ["create-stake"](
        name.value,
        merchant.value,
        owner.value,
        () => `(read-keyset 'keyset)`,
        parseFloat(stake.value)
      )
      .addData({
        keyset: { pred: "keys-all", keys: keys.value.split(",") },
      })
      .addCap("coin.GAS" as any, pubkeys[0])
      .addCap(
        "coin.TRANSFER" as any,
        pubkeys[0],
        owner.value,
        `${owner.value}-${name.value}`,
        parseFloat(stake.value)
      )
      .setMeta({ sender: owner.value }, "testnet04");

    await signWithChainweaver(command);

    console.log(command);

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
        <h1 className={styles.title}>Create</h1>

        <p className={styles.description}>Create your stake here</p>

        <form onSubmit={createStake} className={styles.grid}>
          <div className={styles.input}>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" />
          </div>
          <div className={styles.input}>
            <label htmlFor="merchant">Merchant</label>
            <input type="text" name="merchant" id="merchant" />
          </div>
          <div className={styles.input}>
            <label htmlFor="owner">Owner</label>
            <input type="text" name="owner" id="owner" />
          </div>
          <div className={styles.input}>
            <label htmlFor="keys">Keys</label>
            <input type="text" name="keys" id="keys" />
          </div>
          <div className={styles.input}>
            <label htmlFor="stake">Stake</label>
            <input type="number" name="stake" id="stake" />
          </div>
          <div className={styles.input}>
            <button type="submit">Create</button>
          </div>
        </form>
      </main>
    </div>
  );
}

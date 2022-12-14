import Head from "next/head";
import { Pact, signWithChainweaver } from "@kadena/client";
import { FormEvent, useCallback, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [stake, setStake] = useState<any>(null);
  const getStake = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name } = event.target as Element & {
      [key: string]: HTMLInputElement;
    };
    const command = (Pact.modules as any)["free.stake-for-steak"]["get-stake"](
      name.value
    );

    const res = await command.local(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );
    setStake(res.result.data);
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>View</h1>

        <p className={styles.description}>View your stake here</p>

        <code>
          <pre>{stake && JSON.stringify(stake, null, 2)}</pre>
        </code>

        <form onSubmit={getStake} className={styles.grid}>
          <div className={styles.input}>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" />
          </div>
          <div className={styles.input}>
            <button type="submit">view</button>
          </div>
        </form>
      </main>
    </div>
  );
}

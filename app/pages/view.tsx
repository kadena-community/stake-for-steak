import Head from "next/head";
import { FormEvent, useCallback, useState } from "react";
import styles from "../styles/Home.module.css";
import { useStake } from "../hooks/use-stake";

export default function Home() {
  const [stakeName, setStakeName] = useState<any>(null);
  const { stake } = useStake(stakeName);
  const getStake = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name } = event.target as Element & {
      [key: string]: HTMLInputElement;
    };
    setStakeName(name.value);
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
            <button type="submit" className="button">view</button>
          </div>
        </form>
      </main>
    </div>
  );
}

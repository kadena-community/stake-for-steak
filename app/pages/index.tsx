import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Stake for Steak</h1>

        <p className={styles.description}>
          Create a stake for your group to pay for your steak!
        </p>

        <div className={styles.grid}>
          <a href="/create" className={styles.card}>
            <h2>Create stake &rarr;</h2>
            <p>Plan to eat together? Create a stake for your group!</p>
          </a>

          <a href="/view" className={styles.card}>
            <h2>View stake &rarr;</h2>
            <p>Want to know who's coming? An overview of your stake</p>
          </a>

          <a href="/fund" className={styles.card}>
            <h2>Fund &rarr;</h2>
            <p>Are you joining for diner? Fund the stake here</p>
          </a>

          <a href="/pay" className={styles.card}>
            <h2>Pay &rarr;</h2>
            <p>Done with your diner? Pay for your steak here</p>
          </a>

          <a href="/withdrawal" className={styles.card}>
            <h2>Withdrawal &rarr;</h2>
            <p>Can't make it? Withdraw your stake here</p>
          </a>
        </div>
      </main>
    </div>
  );
}

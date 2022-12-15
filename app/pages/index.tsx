import Head from "next/head";
import styles from "../styles/Home.module.css";
import StoreAccount from "../components/store-account";

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
        <StoreAccount />
      </main>
    </div>
  );
}

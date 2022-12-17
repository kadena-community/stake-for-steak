import Head from "next/head";
import StakesOverview from "../components/stakes-overview";
import StoreAccount from "../components/store-account";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="sweet-title">
            <span data-text="Stake for Steak">Stake for Steak</span>
        </h1>
        <StoreAccount />
        <StakesOverview />
      </main>
    </>
  );
}

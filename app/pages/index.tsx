import Head from "next/head";
import StakesOverview from "../components/stakes-overview";
import StoreAccount from "../components/store-account";

export default function Home() {
  return (
    <>
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-2">
        <h1 className="text-3xl font-bold text-slate-100 text-center">
          Stake for Steak
        </h1>
        <StoreAccount />
        <StakesOverview />
      </main>
    </>
  );
}

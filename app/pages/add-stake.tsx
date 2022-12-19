import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useCallback } from "react";
import { useStakes } from "../hooks/use-stakes";
import styles from "../styles/Home.module.css";

export default function Home() {
  const { stakes, setStakes } = useStakes();
  const router = useRouter();
  const addStake = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { name } = event.target as Element & {
        [key: string]: HTMLInputElement;
      };
      setStakes([...stakes, name.value]);
      router.push(`/stake/${name.value}`);
    },
    [stakes, setStakes]
  );
  return (
    <>
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="text-3xl font-bold text-slate-100 text-center">
          Add stake
        </h1>

        <form onSubmit={addStake} className="m-4">
          <label className="text-slate-100 label" htmlFor="name">
            Name
            <input type="text" name="name" id="name" />
          </label>
          <button
            className="block button rounded-md text-slate-100"
            type="submit"
          >
            add
          </button>
        </form>
      </main>
    </>
  );
}

import Head from "next/head";
import { FormEvent, useCallback } from "react";
import { useStakes } from "../hooks/use-stakes";

export default function Home() {
  const { stakes, setStakes } = useStakes();
  const addStake = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name } = event.target as Element & {
      [key: string]: HTMLInputElement;
    };
    setStakes([...stakes, name.value]);
  }, []);
  return (
    <div className="">
      <Head>
        <title>Stake for steak</title>
        <meta name="description" content="Stake for stake" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <h1 className="text-3xl font-bold text-slate-100 text-center">
          Add stake
        </h1>

        <form onSubmit={addStake} className="m-4">
          <label className="m-2 text-slate-100" htmlFor="name">
            Name
          </label>
          <input type="text" name="name" id="name" />
          <button
            className="block p-2 m-2 bg-slate-700 rounded-md text-slate-100"
            type="submit"
          >
            add
          </button>
        </form>
      </main>
    </div>
  );
}

import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { ConsentModalContext } from "../components/consent-context";
import { Modal } from "../components/modal";
import { useModal } from "../hooks/use-modal";

export default function App({ Component, pageProps }: AppProps) {
  const modal = useModal();
  return (
    <div className="h-screen bg-slate-800 kadena-bg">
      <ConsentModalContext.Provider value={modal}>
        <Component {...pageProps} />
        <Modal />
        <footer className="fixed bottom-0 flex flex-row">
          <Link href="/">
            <span className="block p-2 m-2 button rounded-md text-slate-100">
              overview
            </span>
          </Link>
          <Link href="/add-stake">
            <span className="block p-2 m-2 button rounded-md text-slate-100">
              add stake
            </span>
          </Link>
          <Link href="/create">
            <span className="block p-2 m-2 button rounded-md text-slate-100">
              create stake
            </span>
          </Link>
        </footer>
      </ConsentModalContext.Provider>
    </div>
  );
}

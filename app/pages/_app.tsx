import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="h-screen bg-slate-800 kadena-bg">
      <Component {...pageProps} />
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
      </footer>
    </div>
  );
}

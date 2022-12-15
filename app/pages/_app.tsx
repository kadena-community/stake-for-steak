import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="h-screen bg-slate-800">
      <Component {...pageProps} />
      <footer className="fixed bottom-0">
        <Link href="/add-stake">
          <span className="block p-2 m-2 bg-slate-700 rounded-md text-slate-100">
            add stake
          </span>
        </Link>
      </footer>
    </div>
  );
}

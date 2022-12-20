import { useContext } from "react";
import { ConsentModalContext } from "./consent-context";

export const Modal = () => {
  const { consent, isOpen, accept, reject } = useContext(ConsentModalContext);
  if (!isOpen) return null;
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center flex-col">
      <div className="bg-black bg-opacity-90">
        <h2 className="text-3xl font-bold text-slate-100">
          You will be signing for:
        </h2>
        {consent.map((c) => (
          <div key={c} className="text-slate-100">
            {c}
          </div>
        ))}
        <button className="text-slate-100" onClick={accept}>
          accept
        </button>
        <button className="text-slate-100" onClick={reject}>
          reject
        </button>
      </div>
    </div>
  );
};

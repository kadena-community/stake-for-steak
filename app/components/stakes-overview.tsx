import Link from "next/link";
import { useStakes } from "../hooks/use-stakes";

export default function StakesOverview() {
  const { stakes } = useStakes();

  if (!stakes) return null;

  return (
    <>
      {stakes.map((stake) => (
        <Link
          key={stake}
          href={`/stake/${stake}`}
          className="flex justify-center m-2 hover:bg-slate-700 hover:rounded-md active:bg-slate-900 active:rounded-md"
        >
          <span className="text-center text-xl text-slate-100">{stake}</span>
        </Link>
      ))}
    </>
  );
}

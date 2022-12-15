import { useRouter } from "next/router";
import { useStake } from "../../hooks/use-stake";

export default function StakePage() {
  const router = useRouter();
  const { stakeId } = router.query;
  const { stake, isError, isLoading } = useStake(stakeId as string);
  if (isLoading)
    return (
      <div className="font-bold text-slate-100 text-center p-8">loading...</div>
    );
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-100 text-center p-4">
        {stake.name}
      </h2>
      <p className="text-xl font-bold text-slate-100 text-center">
        KDA: {stake.balance}
      </p>
      <p className="font-bold text-slate-100 text-center">
        Stake: {stake.stake}
      </p>
      <p className="font-bold text-slate-100 text-center">
        Stakers: {stake.stakers.join(",")}
      </p>
    </div>
  );
}

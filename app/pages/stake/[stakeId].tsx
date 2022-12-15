import { useRouter } from "next/router";
import { useCallback } from "react";
import { useAccount } from "../../hooks/use-account";
import { useFund } from "../../hooks/use-fund";
import { useKeys } from "../../hooks/use-keys";
import { useStake } from "../../hooks/use-stake";

export default function StakePage() {
  const router = useRouter();
  const { stakeId } = router.query;
  const { stake, isError, isLoading } = useStake(stakeId as string);
  const { account } = useAccount();
  const { keys } = useKeys();
  const { fund, isMutating } = useFund(stakeId as string);
  const fundStake = useCallback(async () => {
    if (!account || !keys?.length) return;
    fund({ staker: account, keys });
  }, [stakeId, account, keys]);
  if (isMutating)
    return (
      <div className="font-bold text-slate-100 text-center p-8">
        Please sign in Chainweaver...
      </div>
    );
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
      <button
        className="block p-2 m-2 bg-slate-700 rounded-md text-slate-100"
        onClick={fundStake}
      >
        fund
      </button>
    </div>
  );
}

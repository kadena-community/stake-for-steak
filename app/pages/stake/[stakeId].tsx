import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useAccount } from "../../hooks/use-account";
import { useFund } from "../../hooks/use-fund";
import { useKeys } from "../../hooks/use-keys";
import { usePay } from "../../hooks/use-pay";
import { useStake } from "../../hooks/use-stake";
import { useWithdraw } from "../../hooks/use-withdraw";
import styles from "../../styles/Home.module.css";

export default function StakePage() {
  const router = useRouter();
  const { stakeId } = router.query;
  const { stake, isError, isLoading } = useStake(stakeId as string);
  const { account } = useAccount();
  const { keys } = useKeys();
  const { fund, isFunding } = useFund(stakeId as string);
  const { pay, isPaying } = usePay(stakeId as string);
  const { withdraw, isWithdrawing } = useWithdraw(account);
  const [amount, setAmount] = useState(0);
  const fundStake = useCallback(async () => {
    if (!account || !keys?.length) return;
    fund({ staker: account, keys });
  }, [account, keys, fund]);
  const payStake = useCallback(async () => {
    if (!account || !keys?.length) return;
    pay({ staker: account, keys, amount });
  }, [account, keys, amount, pay]);
  const withdrawStake = useCallback(async () => {
    if (!account || !keys?.length) return;
    await withdraw({ name: stakeId as string, keys });
  }, [account, keys, withdraw]);
  if (isFunding || isPaying || isWithdrawing)
    return (
      <div className={styles.main}>
        <h2 className="sweet-title">{stake.name}</h2>
        <div className="font-bold text-slate-100 text-center p-8">
          Please sign in Chainweaver...
        </div>
      </div>
    );
  if (isLoading)
    return (
      <div className="font-bold text-slate-100 text-center p-8">loading...</div>
    );
  return (
    <div className={styles.main}>
      <h2 className="sweet-title">{stake.name}</h2>
      <p className="text-xl font-bold text-slate-100 text-center">
        KDA: {stake.balance}
      </p>
      <p className="font-bold text-slate-100 text-center">
        Stake: {stake.stake}
      </p>
      <p className="font-bold text-slate-100 text-center">
        Stakers: {stake.stakers.join(",")}
      </p>
      <div className="flex flex-col">
        <label className="m-2 text-slate-100 text-center">
          amount:
          <input
            className="text-slate-700"
            type="number"
            name="amount"
            min="0.000001"
            onChange={(e: any) => setAmount(parseFloat(e.target.value))}
          />
        </label>
        <div className="grid grid-cols-2">
          <button
            className="block p-2 m-2 button rounded-md text-slate-100"
            onClick={fundStake}
          >
            fund
          </button>

          <button
            className="block p-2 m-2 button rounded-md text-slate-100"
            onClick={payStake}
          >
            pay
          </button>

          <button
            className="block p-2 m-2 button rounded-md text-slate-100"
            onClick={withdrawStake}
          >
            withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export function useStakes() {
  const [stakes, setStakes] = useState<string[]>([]);
  useEffect(() => {
    setStakes(localStorage?.getItem("stakes")?.split(",") || []);
  }, []);
  return {
    stakes,
    setStakes: (stakes: string[]) => {
      setStakes(stakes);
      localStorage.setItem("stakes", stakes.join(","));
    },
  };
}

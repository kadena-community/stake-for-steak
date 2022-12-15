import { useEffect, useState } from "react";

export function useKeys() {
  const [keys, setKeys] = useState<string[]>([]);
  useEffect(() => {
    setKeys(localStorage?.getItem("keys")?.split(",") || []);
  }, []);
  return {
    keys,
    setKeys: (keys: string[]) => {
      setKeys(keys);
      localStorage.setItem("keys", keys.join(","));
    },
  };
}

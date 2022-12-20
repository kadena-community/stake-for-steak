import { useCallback, useState } from "react";

export const useModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [consent, setConsent] = useState<string[]>([]);
  const [accept, setAccept] = useState<() => void>(() => {});
  const [reject, setReject] = useState<() => void>(() => {});

  const open = useCallback(
    (consent: string[]) =>
      new Promise<boolean>((resolve) => {
        setIsOpen(true);
        setConsent(consent);
        setAccept(() => () => {
          resolve(true);
          close();
        });
        setReject(() => () => {
          resolve(false);
          close();
        });
      }),
    [isOpen, consent]
  );
  const close = useCallback(() => {
    setIsOpen(false);
    setConsent([]);
    setAccept(() => {});
    setReject(() => {});
  }, [isOpen, consent]);

  return { isOpen, open, close, consent, accept, reject };
};

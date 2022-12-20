import { createContext } from "react";

export interface ConsentModal {
  consent: string[];
  isOpen: boolean;
  open: (consent: string[]) => Promise<boolean>;
  accept: () => void;
  reject: () => void;
  close: () => void;
}
const defaultContext: ConsentModal = {
  isOpen: false,
  consent: [],
  open: async () => false,
  accept: () => {},
  reject: () => {},
  close: () => {},
};
export const ConsentModalContext = createContext(defaultContext);

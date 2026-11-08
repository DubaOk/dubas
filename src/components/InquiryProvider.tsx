'use client';

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

type Draft = { service: string; approach: string };
const Context = createContext<{ draft: Draft; setDraft: Dispatch<SetStateAction<Draft>> } | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>({ service: 'unsure', approach: 'custom' });
  return <Context.Provider value={{ draft, setDraft }}>{children}</Context.Provider>;
}

export function useInquiry() {
  const value = useContext(Context);
  if (!value) throw new Error('InquiryProvider is missing.');
  return value;
}

'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ActiveStreamsContextValue = {
  activeThreadKeys: string[];
  setActiveThreadKeys: (keys: string[]) => void;
};

const ActiveStreamsContext = createContext<ActiveStreamsContextValue>({
  activeThreadKeys: [],
  setActiveThreadKeys: () => {},
});

export function ActiveStreamsProvider({ children }: { children: ReactNode }) {
  const [activeThreadKeys, setActiveThreadKeys] = useState<string[]>([]);
  const value = useMemo(() => ({ activeThreadKeys, setActiveThreadKeys }), [activeThreadKeys]);
  return <ActiveStreamsContext value={value}>{children}</ActiveStreamsContext>;
}

export function useActiveStreams() {
  return useContext(ActiveStreamsContext);
}

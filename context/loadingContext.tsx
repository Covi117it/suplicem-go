import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const LoadingContext = createContext({
  isLoading: false,
  show: () => {},
  hide: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const show = useCallback(() => setIsLoading(true), []);
  const hide = useCallback(() => setIsLoading(false), []);

  const value = useMemo(
    () => ({ isLoading, show, hide }),
    [isLoading, show, hide]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

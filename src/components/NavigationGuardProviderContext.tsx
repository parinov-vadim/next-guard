"use client";

import React, { MutableRefObject } from "react";
import { GuardDef } from "../types";

export const NavigationGuardProviderContext = React.createContext<
  MutableRefObject<Map<string, GuardDef>> | undefined
>(undefined);
NavigationGuardProviderContext.displayName = "NavigationGuardProviderContext";
export const NavigationAcceptedUrlContext = React.createContext<{
  acceptedUrl: string | null;
  setAcceptedUrl: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);

export const NavigationAcceptedUrlProvider = ({children}:{
  children: React.ReactNode;
}) => {
  const [acceptedUrl, setAcceptedUrl] = React.useState<string | null>(null);
  return (
    <NavigationAcceptedUrlContext.Provider value={{
      acceptedUrl,
      setAcceptedUrl,
    }}>
      {children}
    </NavigationAcceptedUrlContext.Provider>
  );
}
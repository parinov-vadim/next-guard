"use client";

import React, { useRef } from "react";
import { useInterceptPageUnload } from "../hooks/useInterceptPageUnload";
import { useInterceptPopState } from "../hooks/useInterceptPopState";
import { GuardDef } from "../types";
import { InterceptAppRouterProvider } from "./InterceptAppRouterProvider";
import { InterceptPagesRouterProvider } from "./InterceptPagesRouterProvider";
import { NavigationAcceptedUrlContext, NavigationGuardProviderContext } from "./NavigationGuardProviderContext";

export function NavigationGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const guardMapRef = useRef(new Map<string, GuardDef>());
    const [acceptedUrl, setAcceptedUrl] = React.useState<string | null>(null);
  

  useInterceptPopState({ guardMapRef, acceptedUrl });
  useInterceptPageUnload({ guardMapRef });

  return (
    <NavigationGuardProviderContext.Provider value={guardMapRef}>
     <NavigationAcceptedUrlContext.Provider value={{ acceptedUrl, setAcceptedUrl }}>
       <InterceptAppRouterProvider guardMapRef={guardMapRef}>
         <InterceptPagesRouterProvider guardMapRef={guardMapRef}>
           {children}
         </InterceptPagesRouterProvider>
       </InterceptAppRouterProvider>
     </NavigationAcceptedUrlContext.Provider>
    </NavigationGuardProviderContext.Provider>
  );
}

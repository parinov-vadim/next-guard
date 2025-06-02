import { useCallback, useContext, useId, useState } from "react";
import {
  NavigationAcceptedUrlContext,
  NavigationGuardProviderContext
} from "../components/NavigationGuardProviderContext";
import { NavigationGuardCallback, NavigationGuardOptions } from "../types";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

// Should memoize callback func
export function useNavigationGuard(options: NavigationGuardOptions) {
  const callbackId = useId();
  const guardMapRef = useContext(NavigationGuardProviderContext);
  const acceptContext = useContext(NavigationAcceptedUrlContext);

  if (!guardMapRef)
    throw new Error(
      "useNavigationGuard must be used within a NavigationGuardProvider"
    );

  const [pendingState, setPendingState] = useState<{
    resolve: (accepted: boolean) => void;
  } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const callback: NavigationGuardCallback = (params) => {
      if (options.confirm) {
        return options.confirm(params);
      }

      return new Promise<boolean>((resolve) => {
        setPendingState({ resolve });
      });
    };

    const enabled = options.enabled;

    guardMapRef.current.set(callbackId, {
      enabled: typeof enabled === "function" ? enabled : () => enabled ?? true,
      callback,
    });
    if (acceptContext && options.acceptedUrl) {
      acceptContext.setAcceptedUrl(options.acceptedUrl as string);
    }


    return () => {
      guardMapRef.current.delete(callbackId);
      if (acceptContext) {
        acceptContext.setAcceptedUrl(null);
      }
    };
  }, [options.confirm, options.enabled, options.acceptedUrl]);

  const active = pendingState !== null;

  const accept = useCallback(() => {
    if (!pendingState) return;
    pendingState.resolve(true);
    setPendingState(null);
  }, [pendingState]);

  const reject = useCallback(() => {
    if (!pendingState) return;
    pendingState.resolve(false);
    setPendingState(null);
  }, [pendingState]);

  return { active, accept, reject };
}

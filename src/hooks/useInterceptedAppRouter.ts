import {
  AppRouterContext,
  AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { MutableRefObject, useContext, useMemo } from "react";
import { GuardDef } from "../types";
import { NavigationAcceptedUrlContext } from "../components/NavigationGuardProviderContext";

export function useInterceptedAppRouter({
                                          guardMapRef,
                                        }: {
  guardMapRef: MutableRefObject<Map<string, GuardDef>>;
}) {
  const origRouter = useContext(AppRouterContext);
  const acceptedUrl = useContext(NavigationAcceptedUrlContext);

  return useMemo((): AppRouterInstance | null => {
    if (!origRouter) return null;

    const guarded = async (
      type: "push" | "replace" | "refresh",
      to: string,
      accepted: (acceptUrl?: string) => void
    ) => {
      const defs = [...guardMapRef.current.values()];
      let finalUrl = to;

      let shouldUseAcceptedUrl = false;
      for (const { enabled, callback } of defs) {
        if (!enabled({ to, type })) continue;
        const confirm = await callback({ to, type });
        if (!confirm) return;
        if (acceptedUrl?.acceptedUrl !== undefined) {
          finalUrl = acceptedUrl?.acceptedUrl as string;
          shouldUseAcceptedUrl = true;
        }
      }
      accepted(shouldUseAcceptedUrl ? finalUrl : to);
    };

    return {
      ...origRouter,
      push: (href, ...args) => {
        return guarded("push", href, (acceptUrl) =>
          origRouter.push(acceptUrl as string, ...args)
        );
      },
      replace: (href, ...args) => {
        return guarded("replace", href, (acceptUrl) =>
          origRouter.replace(acceptUrl as string, ...args)
        );
      },
      refresh: (...args) => {
        return guarded("refresh", location.href, () =>
          origRouter.refresh(...args)
        );
      },
    };
  }, [origRouter,acceptedUrl?.acceptedUrl]);
}
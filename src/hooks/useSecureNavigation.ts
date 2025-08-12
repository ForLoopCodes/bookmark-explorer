"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { markNavigation } from "@/utils/pageSession";

export const useSecureNavigation = () => {
  const router = useRouter();

  const push = useCallback(
    (href: string) => {
      markNavigation();
      router.push(href);
    },
    [router]
  );

  const replace = useCallback(
    (href: string) => {
      markNavigation();
      router.replace(href);
    },
    [router]
  );

  const back = useCallback(() => {
    markNavigation();
    router.back();
  }, [router]);

  const forward = useCallback(() => {
    markNavigation();
    router.forward();
  }, [router]);

  return {
    push,
    replace,
    back,
    forward,
  };
};

export default useSecureNavigation;

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaEvent } from "@/lib/metaPixelClient";

export default function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedInitialPageView = useRef(false);

  useEffect(() => {
    // The root layout fires the first PageView in Meta's base snippet before
    // hydration. This component covers only subsequent SPA navigation, so the
    // landing page event is reliable and never double-counted.
    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      return;
    }

    trackMetaEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}

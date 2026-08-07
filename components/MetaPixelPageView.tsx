"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackMetaEvent } from "@/lib/metaPixelClient";

export default function MetaPixelPageView() {
  const pathname = usePathname();

  useEffect(() => {
    // This also runs after Next.js client-side route transitions. PageView does
    // not need an event ID because no CAPI copy is sent for deduplication.
    trackMetaEvent("PageView");
  }, [pathname]);

  return null;
}

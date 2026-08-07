"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaEvent } from "@/lib/metaPixelClient";

export default function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reading the query string makes this fire for client-side search/filter
    // navigations too. PageView does not need an event ID because no CAPI copy
    // of this event is sent for deduplication.
    searchParams.toString();
    trackMetaEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}

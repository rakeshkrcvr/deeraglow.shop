"use client";

export type MetaPixelParameters = Record<string, string | number | string[] | Array<Record<string, string | number>>>;

declare global {
  interface Window {
    fbq?: (command: string, eventName: string, parameters?: MetaPixelParameters, options?: { eventID?: string }) => void;
  }
}

/** Safely queues an event until Meta's browser library has finished loading. */
export function trackMetaEvent(
  eventName: string,
  parameters?: MetaPixelParameters,
  eventId?: string,
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  window.fbq("track", eventName, parameters, eventId ? { eventID: eventId } : undefined);
}

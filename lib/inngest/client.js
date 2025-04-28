import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "richloom",
  name: "Richloom App",
  retry: {
    retries: process.env.NODE_ENV === "production" ? 5 : 2,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 30000
  },
  logger: {
    debug: (...args) => console.debug("[Inngest]", ...args),
    info: (...args) => console.log("[Inngest]", ...args),
    warn: (...args) => console.warn("[Inngest]", ...args),
    error: (...args) => console.error("[Inngest]", ...args)
  }
});
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "EXPO_PUBLIC_",
  client: {
    EXPO_PUBLIC_SERVER_URL: z.url(),
    EXPO_PUBLIC_MAX_UPLOAD_SIZE: z.coerce.number().default(5242880), // 5MB
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

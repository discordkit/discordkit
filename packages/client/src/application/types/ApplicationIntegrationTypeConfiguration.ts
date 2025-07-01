import * as v from "valibot";
import { installParamsSchema } from "./InstallParams.js";

export const applicationIntegrationTypeConfigurationSchema = v.object({
  /** Install params for each installation context's default in-app authorization link */
  oauth2InstallParams: v.exactOptional(installParamsSchema)
});

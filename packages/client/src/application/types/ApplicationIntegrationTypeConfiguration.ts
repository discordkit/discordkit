import { exactOptional, object } from "valibot";
import { installParamsSchema } from "./InstallParams.js";

export const applicationIntegrationTypeConfigurationSchema = object({
  /** Install params for each installation context's default in-app authorization link */
  oauth2InstallParams: exactOptional(installParamsSchema)
});

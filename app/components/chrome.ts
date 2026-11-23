/**
 * Public pages that bring their own header and footer. The portal header and
 * footer hide themselves on these paths.
 */
const MARKETING_PATHS = new Set(["/", "/login"]);

export function isMarketingPath(pathname: string) {
  return MARKETING_PATHS.has(pathname);
}

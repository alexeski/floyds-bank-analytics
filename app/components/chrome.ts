/**
 * Public pages that bring their own header and footer. The portal header and
 * footer hide themselves on these paths.
 */
const MARKETING_PATHS = new Set(["/", "/login"]);

export function isMarketingPath(pathname: string) {
  return MARKETING_PATHS.has(pathname);
}

/**
 * Pages whose content fills the viewport below the header, such as the AI
 * assistant. The footer is hidden there so the page never scrolls; add any
 * other full-screen route (an embedded Liveboard, for example) here.
 */
export function isFullScreenPath(pathname: string) {
  return /^\/ai\/?$/.test(pathname);
}

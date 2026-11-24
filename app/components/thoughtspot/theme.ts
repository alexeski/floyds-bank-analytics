import type { CustomisationsInterface, CustomCssVariables } from "@thoughtspot/visual-embed-sdk";

/**
 * The Floyds Bank design system (app/globals.css and the portal components),
 * translated into ThoughtSpot's supported CSS variables so the embedded
 * Liveboards, the Spotter chat, and the Liveboard's AI panel look like the
 * rest of the portal. Passed once to init(), so it applies to every embed.
 */

// Design tokens, as defined in app/globals.css.
const brand = {
  950: "#00241A",
  900: "#024731",
  800: "#035C40",
  700: "#006A4D",
  600: "#00825F",
  500: "#11B67A",
  300: "#8EDDB9",
  200: "#C2EBD7",
  100: "#E3F5EC",
  50: "#F2FAF6",
} as const;
const surface = "#F3F4F2";
const line = "#DDE1DE";
const ink = "#161A18";
const muted = "#59635E";
const gain = "#00825F";
const loss = "#C0392B";
const white = "#FFFFFF";

/** Portal shapes: 12px cards, 6px buttons and inputs, pill-shaped chips. */
const radius = { card: "12px", control: "6px", pill: "999px" } as const;

/** The portal's typeface, loaded into the embeds from Google Fonts. */
const FONT_FAMILY = "Figtree, 'Helvetica Neue', Arial, sans-serif";
const FIGTREE_WOFF2 =
  "https://fonts.gstatic.com/s/figtree/v9/_Xms-HUzqDCFdgfMm4S9DaRvzig.woff2";

/**
 * The portal's AI mark (white sparkle on a green tile) as the symbol
 * rd-icon-spotter. ThoughtSpot fetches it from the public internet, so it is
 * served from the public repo, pinned to a commit so caches never go stale.
 */
const ICON_SPRITE_URL =
  "https://raw.githubusercontent.com/alexeski/floyds-bank-analytics/a0c83f59c75981c4a42e97fccfae729beb55f4c0/public/icons/spotter-icon-sprite.svg";

const variables: CustomCssVariables = {
  /* ── Shared by every embed ───────────────────────────────────────────── */

  // Page and type: the portal's light-grey canvas, ink text, Figtree.
  "--ts-var-root-background": surface,
  "--ts-var-root-color": ink,
  "--ts-var-root-font-family": FONT_FAMILY,
  // Every other font-family variable too, so nothing relies on inheriting the root font.
  "--ts-var-axis-data-label-font-family": FONT_FAMILY,
  "--ts-var-axis-title-font-family": FONT_FAMILY,
  "--ts-var-button--primary--font-family": FONT_FAMILY,
  "--ts-var-button--secondary--font-family": FONT_FAMILY,
  "--ts-var-button--tertiary--font-family": FONT_FAMILY,
  "--ts-var-chip-title-font-family": FONT_FAMILY,
  "--ts-var-liveboard-group-description-font-family": FONT_FAMILY,
  "--ts-var-liveboard-group-tile-description-font-family": FONT_FAMILY,
  "--ts-var-liveboard-group-tile-title-font-family": FONT_FAMILY,
  "--ts-var-liveboard-group-title-font-family": FONT_FAMILY,
  "--ts-var-liveboard-tab-font-family": FONT_FAMILY,
  "--ts-var-menu-font-family": FONT_FAMILY,
  "--ts-var-search-bar-text-font-family": FONT_FAMILY,
  "--ts-var-search-data-button-font-family": FONT_FAMILY,
  "--ts-var-tab-font-family": FONT_FAMILY,
  "--ts-var-viz-description-font-family": FONT_FAMILY,
  "--ts-var-viz-title-font-family": FONT_FAMILY,
  "--ts-var-root-secondary-color": brand[100],

  // Buttons: solid green primary, white outlined secondary, quiet tertiary.
  "--ts-var-button-border-radius": radius.control,
  "--ts-var-button--icon-border-radius": radius.control,
  "--ts-var-button-border-width": "1px",
  "--ts-var-button-font-weight": "600",
  "--ts-var-button--primary-color": white,
  "--ts-var-button--primary-background": brand[700],
  "--ts-var-button--primary--hover-background": brand[800],
  "--ts-var-button--primary--active-background": brand[900],
  "--ts-var-button--primary-border-color": brand[700],
  "--ts-var-button--primary-font-weight": "700",
  "--ts-var-button--secondary-color": brand[800],
  "--ts-var-button--secondary-background": white,
  "--ts-var-button--secondary--hover-background": brand[50],
  "--ts-var-button--secondary--active-background": brand[100],
  "--ts-var-button--secondary-border-color": line,
  "--ts-var-button--tertiary-color": brand[800],
  "--ts-var-button--tertiary-background": "transparent",
  "--ts-var-button--tertiary--hover-background": brand[50],
  "--ts-var-button--tertiary--active-background": brand[100],
  "--ts-var-button--tertiary-border-color": "transparent",

  // Menus: white panels with the portal's green hover tint.
  "--ts-var-menu-color": ink,
  "--ts-var-menu-background": white,
  "--ts-var-menu--hover-background": brand[50],
  "--ts-var-menu-selected-text-color": brand[700],
  "--ts-var-menu-seperator-background": line,

  // Filter chips: white pills with a hairline border, like the portal's chips.
  "--ts-var-chip-border-radius": radius.pill,
  "--ts-var-chip-box-shadow": `inset 0 0 0 1px ${line}`,
  "--ts-var-chip-background": white,
  "--ts-var-chip-color": ink,
  "--ts-var-chip--hover-background": brand[50],
  "--ts-var-chip--hover-color": brand[900],
  "--ts-var-chip--active-background": brand[700],
  "--ts-var-chip--active-color": white,

  // Search tokens in answers (column chips): green for attributes, neutral
  // for measures, tints for dates and filters.
  "--ts-var-chip--attribute-background": brand[100],
  "--ts-var-chip--attribute--hover-background": brand[200],
  "--ts-var-chip--measure-background": surface,
  "--ts-var-chip--measure--hover-background": line,
  "--ts-var-chip--measure-border-color": line,
  "--ts-var-chip--date-background": brand[50],
  "--ts-var-chip--date--hover-background": brand[100],
  "--ts-var-chip--date-border-color": brand[200],
  "--ts-var-chip--filter-background": white,
  "--ts-var-chip--filter--hover-background": brand[50],
  "--ts-var-chip--filter-border-color": line,

  // Visualizations: white cards with bold ink titles and muted descriptions.
  "--ts-var-viz-background": white,
  "--ts-var-viz-title-color": ink,
  "--ts-var-viz-description-color": muted,
  "--ts-var-viz-border-radius": radius.card,
  "--ts-var-viz-box-shadow": "0 1px 2px rgba(2, 71, 49, 0.04)",
  "--ts-var-answer-chart-select-background": brand[100],
  "--ts-var-answer-chart-hover-background": brand[50],

  /* ── Liveboards ──────────────────────────────────────────────────────── */

  "--ts-var-liveboard-layout-background": surface,
  "--ts-var-liveboard-header-background": white,
  "--ts-var-liveboard-header-font-color": ink,
  "--ts-var-liveboard-header-action-button-font-color": brand[800],
  "--ts-var-liveboard-header-action-button-hover-color": brand[700],
  "--ts-var-liveboard-header-action-button-active-color": brand[900],
  "--ts-var-liveboard-tile-background": white,
  "--ts-var-liveboard-tile-border-color": line,
  "--ts-var-liveboard-tile-border-radius": radius.card,
  "--ts-var-liveboard-tile-title-fontweight": "700",
  "--ts-var-liveboard-tile-table-header-background": surface,
  // Tabs: like the portal nav, muted labels and a 4px accent underline.
  "--ts-var-liveboard-tab-color": muted,
  "--ts-var-liveboard-tab-hover-color": brand[800],
  "--ts-var-liveboard-tab-selected-color": ink,
  "--ts-var-liveboard-tab-selected-font-weight": "700",
  "--ts-var-liveboard-tab-active-border-color": brand[500],
  "--ts-var-liveboard-tab-selected-indicator-height": "4px",
  "--ts-var-liveboard-tab-list-border-color": line,
  // KPIs: ink hero numbers, and the portal's gain/loss colors.
  "--ts-var-kpi-hero-color": ink,
  "--ts-var-kpi-comparison-color": muted,
  "--ts-var-kpi-analyze-text-color": brand[700],
  "--ts-var-kpi-positive-change-color": gain,
  "--ts-var-kpi-negative-change-color": loss,
  // AI insight tiles: the portal's pale-green "featured" treatment.
  "--ts-var-liveboard-insight-tile-background": brand[50],
  "--ts-var-liveboard-insight-tile-font-color": ink,
  "--ts-var-liveboard-insight-tile-icon-color": brand[700],
  "--ts-var-liveboard-insight-tile-success-color": gain,
  "--ts-var-liveboard-insight-tile-failure-color": loss,
  "--ts-var-liveboard-notetitle-heading-font-color": ink,
  "--ts-var-liveboard-notetitle-body-font-color": muted,
  "--ts-var-liveboard-group-title-font-color": ink,
  "--ts-var-liveboard-group-description-font-color": muted,
  "--ts-var-liveboard-group-tile-title-font-color": ink,
  "--ts-var-liveboard-group-tile-description-font-color": muted,

  /* ── Spotter chat (the Bankalytics AI page) ──────────────────────────── */

  "--ts-var-spotter-input-background": white,
  "--ts-var-spotter-prompt-background": brand[100],
  // Chat history sidebar: a white panel like the portal's side cards.
  "--ts-var-saved-chats-bg": white,
  "--ts-var-saved-chats-border-color": line,
  "--ts-var-saved-chats-text-color": ink,
  "--ts-var-saved-chats-header-border": line,
  "--ts-var-saved-chats-title-color": ink,
  "--ts-var-saved-chats-section-title-color": muted,
  "--ts-var-saved-chats-btn-bg": brand[100],
  "--ts-var-saved-chats-btn-hover-bg": brand[200],
  "--ts-var-saved-chats-conv-text-color": ink,
  "--ts-var-saved-chats-conv-hover-bg": brand[50],
  "--ts-var-saved-chats-conv-active-bg": brand[100],
  "--ts-var-saved-chats-footer-border": line,

  /* ── The Liveboard's AI panel (SpotterViz) ───────────────────────────── */

  "--ts-var-spotterviz-panel-background": surface,
  "--ts-var-spotterviz-border-color": line,
  "--ts-var-spotterviz-text-primary": ink,
  "--ts-var-spotterviz-text-secondary": muted,
  "--ts-var-spotterviz-input-background": white,
  "--ts-var-spotterviz-input-placeholder-color": muted,
  "--ts-var-spotterviz-input-cta-color": brand[700],
  "--ts-var-spotterviz-input-cta-hover-color": brand[800],
  "--ts-var-spotterviz-emptystate-spotterviz-color": brand[800],
  "--ts-var-spotterviz-prompt-card-background": white,
  "--ts-var-spotterviz-prompt-card-hover-background": brand[50],
  "--ts-var-spotterviz-message-background": brand[100],
  "--ts-var-spotterviz-expanded-border-color": brand[300],
  "--ts-var-spotterviz-usermessage-icon-background": white,
  "--ts-var-spotterviz-usermessage-icon-hover": brand[50],
  "--ts-var-spotterviz-thinking-inprogress-header-color": brand[700],
  "--ts-var-spotterviz-thinking-completed-header-color": muted,
  "--ts-var-spotterviz-thinking-work-done-icon-color": brand[500],
  "--ts-var-spotterviz-thinking-cta-hover-background": brand[50],
  "--ts-var-spotterviz-tool-call-background": white,
  "--ts-var-spotterviz-tool-border-color": line,
  "--ts-var-spotterviz-tool-title-color": brand[800],
  "--ts-var-spotterviz-tool-json-input-background": surface,
  "--ts-var-spotterviz-tool-json-input-color": ink,
  "--ts-var-spotterviz-tool-feedback-button-background": white,
  "--ts-var-spotterviz-tool-feedback-button-hover": brand[50],
  "--ts-var-spotterviz-last-checkpoint-background": brand[50],
  "--ts-var-spotterviz-last-checkpoint-border": brand[200],
  "--ts-var-spotterviz-reference-icon-hover-background": brand[50],
  "--ts-var-spotterviz-reference-icon-selected-color": brand[700],
  "--ts-var-spotterviz-reference-icon-selected-background": brand[100],
  "--ts-var-spotterviz-footer-text-color": muted,
};

export const EMBED_CUSTOMIZATIONS: CustomisationsInterface = {
  style: {
    customCSS: {
      variables,
      // Only to load the portal's font into the embeds: the SDK documents
      // rules_UNSTABLE for @font-face. No selector rules are used.
      rules_UNSTABLE: {
        "@font-face": {
          "font-family": "Figtree",
          src: `url(${FIGTREE_WOFF2}) format('woff2')`,
          "font-weight": "400 800",
          "font-style": "normal",
          "font-display": "swap",
        },
      },
    },
  },
  content: {
    // White label: the AI is "Scout" everywhere, and no vendor names show.
    strings: { Spotter: "Scout", ThoughtSpot: "Bankalytics" },
  },
  iconSpriteUrl: ICON_SPRITE_URL,
};

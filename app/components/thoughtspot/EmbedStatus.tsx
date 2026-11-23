import { AlertIcon } from "../icons";

/** Fills an embed area while it loads, or explains why it can't. */
export default function EmbedStatus(
  props:
    | { state: "loading"; label?: string }
    | { state: "error"; message: string; title?: string },
) {
  if (props.state === "loading") {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-center justify-center gap-3 bg-surface text-sm text-muted"
      >
        <span className="size-8 animate-spin rounded-full border-3 border-brand-200 border-t-brand-700" />
        {props.label ?? "Loading Liveboard…"}
      </div>
    );
  }

  return (
    <div role="alert" className="flex h-full items-center justify-center bg-surface p-6">
      <div className="flex max-w-md items-start gap-3 rounded-xl border border-red-200 bg-white p-5 text-sm shadow-sm">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-loss" />
        <div>
          <p className="font-bold text-ink">
            {props.title ?? "This Liveboard couldn’t be loaded."}
          </p>
          <p className="mt-1 text-muted">{props.message}</p>
        </div>
      </div>
    </div>
  );
}

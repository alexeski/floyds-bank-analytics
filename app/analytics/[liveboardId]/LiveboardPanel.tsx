"use client";

import dynamic from "next/dynamic";
import EmbedStatus from "../../components/thoughtspot/EmbedStatus";

/** The embed uses browser-only APIs, so it never renders on the server. */
const LiveboardEmbedView = dynamic(() => import("./LiveboardEmbedView"), {
  ssr: false,
  loading: () => <EmbedStatus state="loading" />,
});

export default function LiveboardPanel({
  liveboardId,
  username,
}: {
  liveboardId: string;
  username: string;
}) {
  return <LiveboardEmbedView liveboardId={liveboardId} username={username} />;
}

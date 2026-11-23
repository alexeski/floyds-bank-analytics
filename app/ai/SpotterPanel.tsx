"use client";

import dynamic from "next/dynamic";
import EmbedStatus from "../components/thoughtspot/EmbedStatus";

/** The embed uses browser-only APIs, so it never renders on the server. */
const SpotterEmbedView = dynamic(() => import("./SpotterEmbedView"), {
  ssr: false,
  loading: () => <EmbedStatus state="loading" label="Loading the assistant…" />,
});

export default function SpotterPanel({
  worksheetId,
  username,
}: {
  worksheetId: string;
  username: string;
}) {
  return <SpotterEmbedView worksheetId={worksheetId} username={username} />;
}

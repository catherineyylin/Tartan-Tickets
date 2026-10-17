import { Suspense } from "react";
import RidgeChat from "./ridge-chat";

export default function Home() {
  return (
    <Suspense fallback={<main className="ridge-page" aria-busy="true">Loading Ridge…</main>}>
      <RidgeChat />
    </Suspense>
  );
}

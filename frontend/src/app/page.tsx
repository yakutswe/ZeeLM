import { BackgroundVideo } from "@/components/BackgroundVideo";
import { ChatWorkspace } from "@/components/ChatWorkspace";

export default function Home() {
  return <div className="zeelm-cinematic-shell">
    <BackgroundVideo />
    <div className="zeelm-cinematic-content"><ChatWorkspace /></div>
  </div>;
}

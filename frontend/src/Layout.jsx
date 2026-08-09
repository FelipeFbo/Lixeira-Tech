import { Outlet } from "react-router-dom";
import { Nav } from "./components/ui/Nav";
import { AssistantWidget } from "./components/assistant/AssistantWidget";
import { useLenis } from "./lib/useLenis";

export default function Layout() {
  useLenis();

  return (
    <>
      <div className="noise-overlay" />
      <Nav />
      <main>
        <Outlet />
      </main>
      <AssistantWidget />
    </>
  );
}

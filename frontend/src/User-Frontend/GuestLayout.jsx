import { Outlet } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";

export default function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F1]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

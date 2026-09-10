import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF7]">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

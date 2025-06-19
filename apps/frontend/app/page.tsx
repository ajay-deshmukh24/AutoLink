// import Image from "next/image";

// import { Appbar } from "@/components/Appbar";
// import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HeroVideo } from "@/components/HeroVideo";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Appbar /> */}
      <main className="flex-grow">
        <Hero />
        <div className="pb-20">
          <HeroVideo />
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

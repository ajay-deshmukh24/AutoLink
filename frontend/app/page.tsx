// import Image from "next/image";

import { Appbar } from "@/components/Appbar";
import { Hero } from "@/components/Hero";
import { HeroVideo } from "@/components/HeroVideo";

export default function Home() {
  return (
    <main className="pb-40">
      <Appbar></Appbar>
      <Hero></Hero>
      <div className="pt-8">
        <HeroVideo></HeroVideo>
      </div>
    </main>
  );
}

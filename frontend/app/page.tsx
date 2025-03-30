// import Image from "next/image";

import { Appbar } from "@/components/Appbar";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <main className="">
      <Appbar></Appbar>
      <Hero></Hero>
      {/* <HeroVideo></HeroVideo> */}
    </main>
  );
}

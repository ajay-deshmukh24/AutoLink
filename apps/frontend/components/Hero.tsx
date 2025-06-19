"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Feature } from "./Feature";

export const Hero = () => {
  const router = useRouter();

  return (
    <section className="w-full py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Automate as fast as you can type
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
          Turn chaos into smooth operations by automating workflows yourself—no
          developers, no IT tickets, no delays. The only limit is your
          imagination.
        </p>

        <div className="flex justify-center flex-wrap gap-4 pt-4">
          <Button
            size="lg"
            className="rounded-full text-lg px-8 py-6 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full text-lg px-8 py-6 border cursor-pointer"
            onClick={() => {
              // future contact logic
              router.push("/");
            }}
          >
            Contact Sales
          </Button>
        </div>
      </div>

      <Separator className="my-12 max-w-5xl mx-auto" />

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-center items-center gap-6">
        <Feature title="Free Forever" subtitle="for core features" />
        <Feature title="More Apps" subtitle="than any other platform" />
        <Feature title="Cutting Edge" subtitle="AI capabilities included" />
      </div>
    </section>
  );
};

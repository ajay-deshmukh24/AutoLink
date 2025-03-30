"use client";

import { useRouter } from "next/navigation";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { SecondaryButton } from "./buttons/SecondaryButton";
import { Feature } from "./Feature";

export const Hero = () => {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-center">
        <div className="text-6xl font-bold text-center pt-8 max-w-xl">
          Automate as fast as you can type
        </div>
      </div>
      <div className="flex justify-center pt-4">
        <div className="text-xl font-normal text-center pt-8 max-w-2xl">
          Turn chaos into smooth operations by automating workflows yourself—no
          developers, no IT tickets, no delays. The only limit is your
          imagination.
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <div className="pr-4">
          <PrimaryButton
            onClick={() => {
              router.push("/signup");
            }}
            size="big"
          >
            Get Started free
          </PrimaryButton>
        </div>
        <SecondaryButton onClick={() => {}} size="big">
          Contact Sales
        </SecondaryButton>
      </div>

      <div className="flex justify-center pt-4">
        <Feature title="Free Forever" subtitle="for core freatures"></Feature>
        <Feature title="More apps" subtitle="than any other apps"></Feature>
        <Feature title="Cutting Edge" subtitle="AI Features"></Feature>
      </div>
    </div>
  );
};

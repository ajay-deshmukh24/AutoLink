"use client";

import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { FeatureSignup } from "@/components/FeatureSignup";
import { Input } from "@/components/Input";

export default function Signup() {
  return (
    <div>
      <Appbar></Appbar>
      <div className="flex justify-center">
        <div className="flex pt-10 max-w-4xl">
          <div className="flex-1 pt-20 px-4">
            <div className="font-bold text-3xl pb-6">
              Join millions worldwide who automate their work using AutoLink
            </div>
            <div className="pb-4 pt-4">
              <FeatureSignup
                label={"Easy setup, no coding required"}
              ></FeatureSignup>
            </div>
            <div className="pb-4">
              <FeatureSignup
                label={"Free forever for core features"}
              ></FeatureSignup>
            </div>
            <div className="pb-4">
              <FeatureSignup
                label={"14-day trial of premium features & apps"}
              ></FeatureSignup>
            </div>
          </div>
          <div
            className="flex-1 px-4 pt-6 mt-12 pb-6 rounded"
            style={{ border: "1px solid #ece9df" }}
          >
            <Input
              label={"Name"}
              placeholder={"Your name"}
              onChange={() => {}}
            ></Input>
            <Input
              label={"Email"}
              placeholder={"Your Email"}
              onChange={() => {}}
            ></Input>
            <Input
              label={"Password"}
              placeholder={"Password"}
              onChange={() => {}}
              type={"password"}
            ></Input>
            <div className="pt-4">
              <PrimaryButton onClick={() => {}} size="big">
                Get started free
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

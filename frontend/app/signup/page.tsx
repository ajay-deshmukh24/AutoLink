"use client";

import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { FeatureSignup } from "@/components/FeatureSignup";
import { Input } from "@/components/Input";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

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
              onChange={(e) => {
                setName(e.target.value);
              }}
            ></Input>
            <Input
              label={"Email"}
              placeholder={"Your Email"}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            ></Input>
            <Input
              label={"Password"}
              placeholder={"Password"}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type={"password"}
            ></Input>
            <div className="pt-4">
              <PrimaryButton
                onClick={async () => {
                  const res = await axios.post(
                    `${BACKEND_URL}/api/v1/user/signup`,
                    {
                      username: email,
                      password,
                      name,
                    }
                  );

                  console.log(res);
                  router.push("/login");
                }}
                size="big"
              >
                Get started for free
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

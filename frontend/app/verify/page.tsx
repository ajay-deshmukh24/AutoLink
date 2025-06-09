"use client";

import { Appbar } from "@/components/Appbar";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../config";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/Context";

export default function VerifySignup() {
  const { token: contextToken } = useAuth();
  const [activationCode, setActivationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");

  const token = urlToken || contextToken;

  useEffect(() => {
    if (urlToken) {
      setVerifying(true);
      axios
        .post(`${BACKEND_URL}/api/v1/user/verify-user`, { token: urlToken })
        .then(() => {
          router.push("/login");
        })
        .catch((e) => {
          console.error(e);
          if (e.response?.data?.message === "Verification link expired") {
            alert("Link has expired. Please sign up again.");
          } else {
            alert("Verification failed.");
          }
          setVerifying(false);
        });
    }
  }, [urlToken, router]);

  return (
    <div>
      <Appbar />
      <div className="flex justify-center">
        {!verifying && (
          <div className="flex pt-8 max-w-4xl">
            <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded w-96 h-80">
              <h1 className="font-semibold text-2xl text-center ">
                Verify your Account
              </h1>
              <div className="pt-8" />
              <Input
                onChange={(e) => setActivationCode(e.target.value)}
                label={""}
                type="password"
                placeholder="Code"
              />
              <div className="pt-10">
                <PrimaryButton
                  onClick={async () => {
                    try {
                      await axios.post(
                        `${BACKEND_URL}/api/v1/user/verify-user`,
                        {
                          token,
                          activationCode,
                        }
                      );
                      router.push("/login");
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  size="big"
                >
                  Verify
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
        {verifying && (
          <p className="text-center mt-10">Verifying your account...</p>
        )}
      </div>
    </div>
  );
}

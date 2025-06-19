"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/Context";
// import { Appbar } from "@/components/Appbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Footer } from "@/components/Footer";

export default function VerifySignup() {
  const { token: contextToken, setToken, setCurrentUser } = useAuth();
  const [activationCode, setActivationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");

  const token = urlToken || contextToken;

  useEffect(() => {
    // console.log(urlToken);
    if (urlToken) {
      setVerifying(true);
      axios
        .post(`${BACKEND_URL}/api/v1/user/verify-user`, {
          token,
        })

        .then(async (res) => {
          const jwt = res.data.token;
          localStorage.setItem("token", jwt);
          setToken(jwt);

          const userRes = await axios.get(`${BACKEND_URL}/api/v1/user`, {
            headers: { Authorization: jwt },
          });
          setCurrentUser(userRes.data.user);

          router.push("/dashboard");
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
  }, [token, urlToken, router, setToken, setCurrentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Appbar /> */}
      <div className="flex justify-center items-center h-[80vh] px-4">
        {!verifying && (
          <Card className="w-full max-w-md shadow-xl border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Verify your Account
              </CardTitle>
              <CardDescription className="text-center">
                Enter the code sent to your email or use the link to complete
                signup.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Enter Activation Code"
                onChange={(e) => setActivationCode(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={async () => {
                  if (!token) {
                    alert("Token is missing.");
                    return;
                  }

                  try {
                    const res = await axios.post(
                      `${BACKEND_URL}/api/v1/user/verify-user`,
                      {
                        token,
                        activationCode,
                      }
                    );

                    const jwt = res.data.token;
                    localStorage.setItem("token", jwt);
                    setToken(jwt);

                    const userRes = await axios.get(
                      `${BACKEND_URL}/api/v1/user`,
                      {
                        headers: { Authorization: jwt },
                      }
                    );
                    setCurrentUser(userRes.data.user);

                    router.push("/dashboard");
                  } catch (err) {
                    console.error(err);
                    alert("Verification failed.");
                  }
                }}
              >
                Verify
              </Button>
            </CardContent>
          </Card>
        )}
        {verifying && (
          <p className="text-center text-gray-600 text-lg animate-pulse">
            Verifying your account...
          </p>
        )}
      </div>
      {/* <Footer></Footer> */}
    </div>
  );
}

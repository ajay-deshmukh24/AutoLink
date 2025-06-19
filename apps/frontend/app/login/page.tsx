"use client";

// import { Appbar } from "@/components/Appbar";
import { FeatureSignup } from "@/components/FeatureSignup";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useRouter } from "next/navigation";
// import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../context/Context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
        username: email,
        password,
      });

      setToken(res.data.token);

      // const token = res.data.token;
      // localStorage.setItem("token", token);
      // setToken(token);

      // const userRes = await axios.get(`${BACKEND_URL}/api/v1/user`, {
      //   headers: {
      //     Authorization: token,
      //   },
      // });

      // setCurrentUser(userRes.data.user);
      // router.push("/dashboard");

      if (!res.data.verified) {
        router.push(`/verify?email=${email}`);
        return;
      }
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* <Appbar /> */}

      <div className="flex-grow flex justify-center px-4 pt-16 pb-24">
        <div className="flex flex-col md:flex-row gap-12 max-w-5xl w-full">
          {/* Left Section */}
          <div className="flex-1 space-y-6 py-5">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back to AutoLink
            </h1>
            <FeatureSignup label="Easy setup, no coding required" />
            <FeatureSignup label="Free forever for core features" />
            <FeatureSignup label="14-day trial of premium features & apps" />
          </div>

          {/* Right Section - Login Form */}
          <Card className="flex-1 h-fit shadow-lg border border-border bg-white dark:bg-[#1f1f1f]">
            <CardHeader>
              <CardTitle className="text-xl">Sign in to your account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between gap-6">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Your email"
                  type="email"
                  className="bg-white dark:bg-background border border-border"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  className="bg-white dark:bg-background border border-border"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button className="w-full" size="lg" onClick={handleLogin}>
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* <div className="mt-auto">
        <Footer />
      </div> */}
    </div>
  );
}

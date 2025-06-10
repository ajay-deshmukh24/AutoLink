"use client";

// import { Appbar } from "@/components/Appbar";
import { FeatureSignup } from "@/components/FeatureSignup";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/Context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Footer } from "@/components/Footer";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* <Appbar /> */}

      <div className="flex-grow flex justify-center px-4 pt-16 pb-24">
        <div className="flex flex-col md:flex-row gap-12 max-w-5xl w-full">
          {/* Left Section */}
          <div className="flex-1 space-y-6 py-5">
            <h1 className="text-3xl md:text-4xl font-bold">
              Join millions worldwide who automate their work using AutoLink
            </h1>
            <FeatureSignup label="Easy setup, no coding required" />
            <FeatureSignup label="Free forever for core features" />
            <FeatureSignup label="14-day trial of premium features & apps" />
          </div>

          {/* Right Section */}
          <Card className="flex-1 h-fit shadow-lg border border-border bg-white dark:bg-[#1f1f1f]">
            <CardHeader>
              <CardTitle className="text-xl">Create your account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between gap-6">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="bg-white dark:bg-background border border-border"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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

              <Button
                className="w-full"
                size="lg"
                onClick={async () => {
                  const res = await axios.post(
                    `${BACKEND_URL}/api/v1/user/signup`,
                    {
                      username: email,
                      password,
                      name,
                    }
                  );
                  setToken(res.data.token);
                  router.push("/verify");
                }}
              >
                Get started for free
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

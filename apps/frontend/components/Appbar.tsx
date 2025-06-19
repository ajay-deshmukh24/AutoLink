"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/Context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";
import { HiMenu } from "react-icons/hi";

export const Appbar = () => {
  const router = useRouter();
  const { currentUser, setCurrentUser, setToken } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && !currentUser) {
      axios
        .get(`${BACKEND_URL}/api/v1/user`, {
          headers: {
            Authorization: savedToken,
          },
        })
        .then((res) => {
          setToken(savedToken);
          setCurrentUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken("");
          setCurrentUser(null);
        });
    }

    // Set mobile view
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [currentUser, setToken, setCurrentUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setToken("");
    router.push("/");
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts
      .map((p) => p[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white dark:bg-[#1f1f1f] shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-2xl font-bold tracking-tight cursor-pointer"
          onClick={() => router.push("/")}
        >
          <span className="text-primary">_</span>AutoLink
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* If Mobile, show Hamburger */}
          {isMobile ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HiMenu className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="space-y-1">
                  <DropdownMenuItem onClick={() => router.push("/")}>
                    Contact Sales
                  </DropdownMenuItem>

                  {currentUser ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push("/dashboard")}
                      >
                        My Zaps
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/zap/create")}
                      >
                        Create Zap
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-500 font-medium"
                      >
                        Logout
                      </DropdownMenuItem> */}
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/login")}>
                        Login
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem onClick={() => router.push("/signup")}>
                        Signup
                      </DropdownMenuItem> */}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Avatar */}
              {currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer w-10 h-10 text-foreground shrink-0">
                      <AvatarFallback
                        className="text-md font-semibold"
                        style={{ backgroundColor: "#80afef" }}
                      >
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-sm text-muted-foreground">
                      {currentUser.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-500 font-medium"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push("/")}>
                Contact Sales
              </Button>

              {currentUser ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                  >
                    My Zaps
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/zap/create")}
                  >
                    Create Zap
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer w-10 h-10 bg-muted text-foreground shrink-0">
                        <AvatarFallback
                          className="text-md font-semibold"
                          style={{ backgroundColor: "#80afef" }}
                        >
                          {getInitials(currentUser.name)}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="text-sm text-muted-foreground">
                        {currentUser.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-500 font-medium"
                      >
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* <Button variant="ghost" onClick={() => router.push("/login")}>
                    Login
                  </Button> */}
                  <Button onClick={() => router.push("/login")}>Login</Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

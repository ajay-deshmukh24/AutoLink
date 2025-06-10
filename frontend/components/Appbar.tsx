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
import { useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";

export const Appbar = () => {
  const router = useRouter();
  const { currentUser, setCurrentUser, setToken } = useAuth();

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

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/contact")}>
            Contact Sales
          </Button>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-12 h-12 bg-muted text-foreground">
                  <AvatarFallback className="text-md font-semibold">
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
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button onClick={() => router.push("/signup")}>Signup</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

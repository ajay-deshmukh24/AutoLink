"use client";

import { Separator } from "@/components/ui/separator";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="w-full px-4 md:px-8 lg:px-16 py-20 bg-muted">
      <Separator className="mb-8" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-sm text-muted-foreground">
        {/* Branding */}
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-lg font-bold text-primary">_AutoLink</h2>
          <p className="max-w-xs mx-auto md:mx-0">
            Automate as fast as you can type. Build workflows without writing
            code.
          </p>
        </div>

        {/* Links */}
        <div className="text-center md:text-left space-y-3">
          <h3 className="text-md font-semibold text-foreground">Company</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:underline">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div className="text-center md:text-left space-y-3">
          <h3 className="text-md font-semibold text-foreground">Follow Us</h3>
          <div className="flex justify-center md:justify-start gap-6">
            <Link
              href="https://twitter.com"
              target="_blank"
              aria-label="Twitter"
            >
              <FaTwitter className="h-5 w-5 hover:text-foreground" />
            </Link>
            <Link href="https://github.com" target="_blank" aria-label="GitHub">
              <FaGithub className="h-5 w-5 hover:text-foreground" />
            </Link>
            <Link href="mailto:support@autolink.com" aria-label="Email">
              <HiOutlineMail className="h-5 w-5 hover:text-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} _AutoLink. All rights reserved.
      </div>
    </footer>
  );
};

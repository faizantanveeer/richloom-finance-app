import React from "react";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox, PenBoxIcon } from "lucide-react";
import { checkUser } from "@/lib/server/checkUser";

const Header = async () => {
  await checkUser();
  return (
    <div className="fixed top-0 w-full z-50 backdrop-blur-md bg-white-30 shadow-md ">
      <nav className="container flex items-center justify-between mx-auto p-2 bg-white-30">
        <Link href="/" className="h-17 flex items-center">
          <Image
            src={"/images/logo.png"}
            width={500}
            height={200}
            alt="logo"
            className="object-cover h-20 w-50"
          />
        </Link>

        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800"
            >
              <Button variant="outline" className="cursor-pointer">
                <LayoutDashboard className="" size={20} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <Link href="/transaction/create" className="">
              <Button variant="default" className="cursor-pointer">
                <PenBoxIcon className=" " size={20} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline" className="cursor-pointer">
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton>
              <Button variant="outline" className="cursor-pointer">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "w-20 h-20" } }} />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;

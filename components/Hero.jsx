"use client"
import Link from "next/link";
import React, { useRef, useEffect } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {

    const imageRef = useRef()

    useEffect(() => {
        const imageElement = imageRef.current;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 150

            if(scrollPosition > scrollThreshold){
                imageElement.classList.add("scrolled")
            }else{
                imageElement.classList.remove("scrolled")
            }
        }
        window.addEventListener("scroll", handleScroll)

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    })

  return (
    <div className="mx-20 mb-20">
      <div className="container mx-auto text-center ">
        <h1 className="text-5xl md:text-8xl lg-[106px] pb-6">
            <span className="font-bold tracking-tighter pb-4 ">
          Smarter Finance?
            </span>
          <br />
          <span className="gradient-title">Possible with Richloom</span>
        </h1>
        <p className="text-center text-gray-600 text-xl max-w-2xl pb-6 mx-auto">
          An Al-powered financial management platform that helps you track,
          analyze and optimize your spendings with real-time insights.
        </p>
      </div>

      <div className="flex justify-center mt-10 gap-2">
        <Link href="/dashboard">
          <Button className=" text-white px-4 py-2 cursor-pointer bg-gradient-to-br bg-green-600  hover:bg-green-700 transition duration-300">
            Get Started
          </Button>
        </Link>
        <Link href="/">
          <Button variant={"outline"}>
            Watch Demo
          </Button>
        </Link>
      </div>
      <div className="hero-image-wrapper mt-10 flex justify-center">

        <div ref={imageRef} className="hero-image">
          <Image
            src={"/images/banner1.jpg"}
            height={720}
            width={1280}
            priority
            className="rounded-lg shadow-xl"
            alt="hero image"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

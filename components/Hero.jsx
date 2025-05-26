"use client";
import Link from "next/link";
import React, { useRef, useEffect } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {
  const imageRef = useRef();

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 150;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-20 mb-20">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[106px] pb-6 leading-tight sm:leading-tight md:leading-tight">
          <span className="font-bold tracking-tight pb-4 block">
            Smarter Finance?
          </span>
          <span className="gradient-title block">Possible with Richloom</span>
        </h1>

        <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-md sm:max-w-xl md:max-w-2xl pb-6 mx-auto">
          An AI-powered financial management platform that helps you track,
          analyze and optimize your spendings with real-time insights.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 sm:mt-10">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto text-white px-4 py-2 cursor-pointer bg-gradient-to-br bg-green-600 hover:bg-green-700 transition duration-300">
            Get Started
          </Button>
        </Link>
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            Watch Demo
          </Button>
        </Link>
      </div>

      <div className="hero-image-wrapper mt-8 sm:mt-10 flex justify-center">
        <div
          ref={imageRef}
          className="hero-image w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%]"
        >
          <Image
            src="/images/banner1.jpg"
            height={720}
            width={1280}
            priority
            className="rounded-lg shadow-xl w-full h-auto"
            alt="hero image"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

"use client";
import { useSearchParams } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import MUIProviders from "@/app/providers/MUIProvider";

export default function Navigations({ children }) {
  const searchParams = useSearchParams();
  const lng = searchParams.get("lng") || "ar";
  return (
    <>
      <Navbar lng={lng} />
      {children}
      <Footer lng={lng} />
    </>
  );
}

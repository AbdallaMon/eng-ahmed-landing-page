"use client";

import { useEffect } from "react";
import DotsLoader from "../component/feedback/loaders/DotsLoader.jsx";
import { useSearchParams } from "next/navigation.js";

export default function RedirectToRegisterSuccess() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.size > 0) {
      window.location.href = `/register/success?${searchParams.toString()}`;
    }
  }, [searchParams]);
  return <DotsLoader instantLoading={true} />;
}

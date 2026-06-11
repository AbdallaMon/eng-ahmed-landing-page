import { Suspense } from "react";
import SuccessView from "@/app/register/component/success/SuccessView";

export const metadata = {
  title: "Payment Successful",
  description:
    "Your payment has been successfully processed. Thank you for choosing us for your design needs.",
  // Transactional page — keep it out of search indexes.
  robots: { index: false, follow: false },
};

export default async function SuccessPage() {
  return (
    <Suspense>
      <SuccessView />
    </Suspense>
  );
}

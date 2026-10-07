import { Suspense } from "react";
import CancelView from "@/app/register/component/cancel/CancelView";

export const metadata = {
  title: "Payment Unsuccessful",
  description:
    "We encountered an issue processing your payment. Please try again or contact our support team for assistance.",
  // Transactional page — keep it out of search indexes.
  robots: { index: false, follow: false },
};

export default async function CancelPage() {
  return (
    <Suspense>
      <CancelView />
    </Suspense>
  );
}

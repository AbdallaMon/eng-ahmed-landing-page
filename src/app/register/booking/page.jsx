import { Suspense } from "react";
import { BookingWizard } from "@/app/register/component/booking/BookingWizard";

export default async function BookingPage({ searchParams }) {
  // Next 16: searchParams is async. Awaited so the server entry stays valid;
  // the client wizard reads the live params via useSearchParams for deep-linking.
  await searchParams;

  return (
    <Suspense>
      <BookingWizard />
    </Suspense>
  );
}

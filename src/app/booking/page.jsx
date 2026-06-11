import { BookingPage } from "../component/pages/booking/BookingPage";
import { getTranslation } from "../i18n";

export default async function page({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng || "ar";
  const { t } = await getTranslation(lng);
  const bookingData = t("booking", { returnObjects: true });
  return <BookingPage bookingData={bookingData} lng={lng} />;
}

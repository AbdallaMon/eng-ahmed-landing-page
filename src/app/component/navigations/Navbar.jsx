import { getTranslation } from "@/app/i18n";
import { NavbarClient } from "./ClientNavbar";

export async function Navbar({ lng }) {
  const { t } = await getTranslation(lng);
  const navItems = t("navBar", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });
  return (
    <NavbarClient
      lng={lng}
      navItems={navItems}
      bookingButton={buttons.booking}
    />
  );
}

import { colors } from "@/app/data/constants";
import { ButtonClick } from "./ButtonClick";
import { ButtonLink } from "./ButtonLink";

export function LinkButton({
  name,
  icon,
  href,
  bgColor = colors.primary,
  textColor = colors.white,
  borderColor,
  sx = {},
  onClick,
  lng = "ar",
  type,
}) {
  if (type === "WHATSAPP") {
    return (
      <ButtonClick
        name={name}
        icon={icon}
        bgColor={bgColor}
        textColor={textColor}
        borderColor={borderColor}
        sx={sx}
        onClick={onClick}
        lng={lng}
        type={type}
      />
    );
  }
  return (
    <ButtonLink
      name={name}
      icon={icon}
      href={href}
      bgColor={bgColor}
      textColor={textColor}
      borderColor={borderColor}
      sx={sx}
      lng={lng}
      onClick={onClick}
    />
  );
}

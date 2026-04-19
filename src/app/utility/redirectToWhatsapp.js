import { whatsAppNumber } from "../data/constants";

export const handleOpenWhatsApp = () => {
  const url = `whatsapp://send?phone=${whatsAppNumber}`;

  window.location.href = url;
  window.setTimeout(() => {
    window.location.href = `https://wa.me/${whatsAppNumber}`;
  }, 500);
};

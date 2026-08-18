// Readable text for the MIGRATED server's language-neutral message CODES.
//
// The migrated server answers with codes (e.g. "VALIDATION_ERROR",
// "CLIENT_LEAD_ALREADY_TODAY") in the envelope `message`, while the OLD server
// returned ready Arabic/English prose. `resolveServerMessage` maps a known code
// to readable text; anything it doesn't recognise (old prose) passes through
// unchanged — i.e. it handles old || new without dropping either.
//
// Strings mirror the new admin app's `data/messages/*` so wording stays in sync.
const SERVER_MESSAGES = {
  // core / general
  VALIDATION_ERROR: {
    ar: "بيانات غير صحيحة، يرجى مراجعة الحقول",
    en: "Invalid data, please review the fields",
  },
  NOT_FOUND: {
    ar: "العنصر المطلوب غير موجود",
    en: "The requested item was not found",
  },
  UNAUTHORIZED: {
    ar: "انتهت الجلسة، يرجى تسجيل الدخول من جديد",
    en: "Your session has ended, please sign in again",
  },
  OK: { ar: "تمت العملية بنجاح", en: "Completed successfully" },
  CREATED: { ar: "تم الإنشاء بنجاح", en: "Created successfully" },
  FILE_UPLOAD_ERROR: { ar: "تعذر رفع الملف", en: "File upload failed" },
  INVALID_TOKEN: {
    ar: "انتهت صلاحية جلسة التسجيل، يرجى البدء من جديد",
    en: "Your registration session has expired. Please start again",
  },

  // public lead funnel
  LEAD_NOT_FOUND: { ar: "العميل غير موجود", en: "Lead not found" },
  CLIENT_LEAD_CREATED: {
    ar: "تم إرسال طلبك بنجاح",
    en: "Your request was sent successfully",
  },
  CLIENT_LEAD_REGISTERED: {
    ar: "تم التسجيل بنجاح",
    en: "Registered successfully",
  },
  CLIENT_LEAD_REGISTRATION_STATUS_FETCHED: {
    ar: "تم التحقق من حالة التسجيل",
    en: "Registration status checked",
  },
  CLIENT_LEAD_REGISTER_COMPLETED: {
    ar: "تم إكمال التسجيل بنجاح",
    en: "Registration completed successfully",
  },
  CLIENT_LEAD_ALREADY_TODAY: {
    ar: "لقد أرسلت طلباً بالفعل اليوم، حاول غداً",
    en: "You've already sent a request today, try again tomorrow",
  },
  CLIENT_LEAD_ALREADY_COMPLETED: {
    ar: "تم إكمال هذا التسجيل بالفعل",
    en: "This registration is already completed",
  },
  COOPERATION_REQUEST_SENT: {
    ar: "تم إرسال طلب التعاون بنجاح",
    en: "Cooperation request sent successfully",
  },

  // payments
  PAYMENT_CHECKOUT_CREATED: {
    ar: "تم إنشاء جلسة الدفع",
    en: "Checkout session created",
  },
  PAYMENT_VERIFIED: {
    ar: "تم تأكيد الدفع بنجاح",
    en: "Payment confirmed successfully",
  },
  PAYMENT_NOT_COMPLETED: {
    ar: "لم يكتمل الدفع بعد",
    en: "The payment is not complete yet",
  },
};

/** Best-effort current language (URL ?lng → i18next cookie → localStorage → ar). */
function currentLng() {
  if (typeof window === "undefined") return "ar";
  const url = new URLSearchParams(window.location.search).get("lng");
  if (url === "ar" || url === "en") return url;
  const cookie = document.cookie.match(/(?:^|;\s*)i18next=(ar|en)/);
  if (cookie) return cookie[1];
  const ls = window.localStorage?.getItem("lng");
  if (ls === "ar" || ls === "en") return ls;
  return "ar";
}

/**
 * Resolve a server `message` to readable text. The migrated server sends CODES;
 * the old server sent prose — unknown values pass through unchanged.
 *
 * @param {string} message - The envelope `message` (a code or old prose)
 * @param {"ar"|"en"} [lng] - Language (defaults to the detected current one)
 * @returns {string}
 */
export function resolveServerMessage(message, lng = currentLng()) {
  if (!message || typeof message !== "string") return message;
  const entry = SERVER_MESSAGES[message];
  return (entry && (entry[lng] || entry.ar)) || message;
}

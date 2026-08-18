"use client";
import { useEffect, useRef } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { FaHome } from "react-icons/fa";
import { MdAppRegistration } from "react-icons/md";
import gsap from "gsap";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import colors from "@/app/register/theme/colors";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import { DesignLeadPrice, LeadType } from "@/app/register/data/constants";

/**
 * شاشة "تم استلام طلبك" اللي بتظهر بدل الدفع (الدفع متوقّف حاليًا — شوف
 * useLeadForm). بتتركّب فوق الفلو بمجرد ما `form.isDone` تبقى true بعد ما
 * complete-register ينجح.
 *
 * بتعرض:
 *  • رسالة شكر: "شكرًا لك على تقديم طلبك. سنتواصل معك قريبًا." (status.thankYou)
 *  • رسوم تصميم المشروع حسب النوع اللي اختاره العميل (DesignLeadPrice[item]) —
 *    عنوان + شارة النوع (فيلا/شقة/جزء من المنزل) + قيمة الرسوم + ملاحظة إن ده
 *    تقدير مبدئي يتأكّد في الاستشارة.
 *  • أزرار للرجوع للرئيسية أو تسجيل جديد.
 *
 * كل الـ full-screen root بـ inline style علشان الإيموشن كلاس ممكن يتأخّر فريم
 * فيحصل فلاش (نفس منطق PayingOverlay). المحتوى جوّه بيظهر من opacity 0 بالـ GSAP
 * فأي تأخير كلاس بيتغطّى.
 */
export default function LeadSuccessOverlay({ item }) {
  const { translate, lng } = useLanguage();
  const direction = lng === "en" ? "ltr" : "rtl";
  const rootRef = useRef(null);

  // رسوم التصميم + اسم النوع حسب اللي اختاره العميل. لو النوع مش في جدول الرسوم
  // (مثلاً نوع من غير سعر محدّد) بنخفي بلوك الرسوم كله.
  const feeNotice = item && DesignLeadPrice[item] ? translate(DesignLeadPrice[item]) : null;
  const feeTypeLabel = item && LeadType[item] ? translate(LeadType[item]) : null;

  // زرار "العودة للرئيسية" لازم يوصّل للموقع الأساسي — الحجز بيشتغل على دومين
  // منفصل حيث "/" هي رئيسية الحجز مش الموقع. fallback لـ "/" في dev بدومين واحد.
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN;
  const homeHref = mainDomain
    ? mainDomain.includes("://")
      ? mainDomain
      : `https://${mainDomain}`
    : "/";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const badge = root.querySelector("[data-badge]");
    const checkPath = root.querySelector("[data-check]");
    const reveal = root.querySelectorAll("[data-reveal]");

    if (prefersReducedMotion()) {
      gsap.set(root, { opacity: 1 });
      gsap.set([badge, ...reveal], { opacity: 1, scale: 1, y: 0 });
      if (checkPath) gsap.set(checkPath, { strokeDashoffset: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" });
      tl.fromTo(
        badge,
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.1",
      );
      if (checkPath) {
        tl.fromTo(
          checkPath,
          { strokeDashoffset: 48 },
          { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" },
          "-=0.15",
        );
      }
      tl.fromTo(
        reveal,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.12 },
        "-=0.2",
      );
      gsap.to(badge, {
        scale: 1.05,
        duration: 1.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} dir={direction} role="status" aria-live="polite" style={ROOT_STYLE}>
      {/* شارة صح ذهبية */}
      <Box
        data-badge
        sx={{
          width: { xs: 96, md: 112 },
          height: { xs: 96, md: 112 },
          borderRadius: "50%",
          mb: { xs: 3, md: 4 },
          background: colors.primaryGradient,
          boxShadow: `0 20px 56px ${colors.primary}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
        }}
      >
        <Box component="svg" viewBox="0 0 52 52" sx={{ width: "52%", height: "52%" }}>
          <path
            data-check
            d="M14 27 L23 36 L40 18"
            fill="none"
            stroke="#ffffff"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 48, strokeDashoffset: 48 }}
          />
        </Box>
      </Box>

      <Typography
        data-reveal
        variant="h4"
        component="h1"
        fontWeight={700}
        sx={{ color: colors.heading, opacity: 0, maxWidth: 520 }}
      >
        {translate("status.thankYou")}
      </Typography>

      {/* بلوك رسوم التصميم — حسب النوع اللي العميل اختاره */}
      {feeNotice && (
        <Box
          data-reveal
          sx={{
            mt: { xs: 3.5, md: 4 },
            width: "100%",
            maxWidth: 420,
            mx: "auto",
            opacity: 0,
            px: { xs: 2.5, md: 3 },
            py: { xs: 2.5, md: 3 },
            borderRadius: 3,
            textAlign: "center",
            border: `1px solid ${colors.primary}55`,
            background: `linear-gradient(160deg, ${colors.primary}1f 0%, ${colors.primary}08 100%)`,
            boxShadow: `0 12px 34px ${colors.primary}22`,
          }}
        >
          <Typography
            component="p"
            sx={{
              color: colors.primaryDark,
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: 1,
              textTransform: "uppercase",
              mb: 1.25,
            }}
          >
            {translate("success.designFeeHeading")}
          </Typography>

          {feeTypeLabel && (
            <Box
              component="span"
              sx={{
                display: "inline-block",
                px: 1.75,
                py: 0.6,
                mb: 1.5,
                borderRadius: 999,
                background: colors.primaryGradient,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.92rem",
              }}
            >
              {feeTypeLabel}
            </Box>
          )}

          <Typography
            component="p"
            sx={{
              color: colors.heading,
              fontWeight: 700,
              fontSize: { xs: "1.05rem", md: "1.18rem" },
              lineHeight: 1.4,
            }}
          >
            {feeNotice}
          </Typography>

          <Typography
            component="p"
            sx={{ color: colors.secondaryText, mt: 1.25, fontSize: "0.85rem", lineHeight: 1.6 }}
          >
            {translate("success.designFeeNote")}
          </Typography>
        </Box>
      )}

      <Stack
        data-reveal
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mt: 4, opacity: 0 }}
      >
        <Button
          variant="contained"
          component="a"
          href={homeHref}
          size="large"
          startIcon={<FaHome />}
          sx={{
            bgcolor: colors.primary,
            color: "#fff",
            borderRadius: 2,
            px: 3,
            "&:hover": { bgcolor: colors.primaryDark },
          }}
        >
          {translate("success.backHome")}
        </Button>
        <Button
          variant="outlined"
          component="a"
          href={`/register?lng=${lng}`}
          size="large"
          startIcon={<MdAppRegistration />}
          sx={{
            color: colors.primaryDark,
            borderColor: colors.primary,
            borderRadius: 2,
            px: 3,
            "&:hover": {
              borderColor: colors.primaryDark,
              backgroundColor: `${colors.primary}14`,
            },
          }}
        >
          {translate("success.goRegister")}
        </Button>
      </Stack>
    </div>
  );
}

const ROOT_STYLE = {
  position: "fixed",
  inset: 0,
  zIndex: 5000,
  opacity: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "48px 24px",
  overflowY: "auto",
  background: `radial-gradient(120% 120% at 50% 22%, ${colors.primaryAlt} 0%, ${colors.bgSecondary} 45%, ${colors.bgPrimary} 100%)`,
};

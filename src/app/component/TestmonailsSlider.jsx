// react-slick
"use client";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Box } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { TestMonailCard } from "./cards/TestmonialCard";
import { colors } from "../data/constants";
// import slider css
export function TestmonailsSlider({ data, rtl }) {
  const items = Array.isArray(data?.reviews) ? data.reviews : [];
  const total = items.length;

  // If you want looping only when it makes sense
  const canLoop = false;

  if (total === 0) return null;
  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      <Box
        component={Swiper}
        sx={{
          pt: 4,
          pb: {
            xs: 6,
            md: 14,
            lg: 18,
          },
          "& .swiper-slide": { height: "auto" },
          "& .swiper-pagination": {
            bottom: 0,
          },
          "& .swiper-pagination-bullet": {
            backgroundColor: colors.primary,
            mt: 8,
          },
          "& .swiper-button-next, & .swiper-button-prev": {
            color: colors.primary,
            backgroundColor: "#403730",
            color: colors.white,
            borderRadius: "50%",
            width: { xs: 0, md: 40 },
            height: 40,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            "& .swiper-navigation-icon": {
              width: 8,
              color: "#DFA40B",
            },
          },
          "& .swiper-button-disable": {
            opacity: 0.3,
            cursor: "not-allowed",
          },

          "& .swiper-button-prev": {
            left: "92%",
          },
        }}
        dir={rtl ? "ltr" : "ltr"}
        modules={[Pagination, Navigation]}
        loop={canLoop}
        speed={500}
        spaceBetween={16}
        slidesPerView={4}
        slidesPerGroup={4}
        pagination={{ clickable: true }}
        navigation
        breakpoints={{
          0: {
            slidesPerView: 1,
            slidesPerGroup: 1,
          },
          480: {
            slidesPerView: 2,
            slidesPerGroup: 2,
          },
          600: {
            slidesPerView: 2,
            slidesPerGroup: 2,
          },
          1024: {
            slidesPerView: 3,
            slidesPerGroup: 3,
          },
          1280: {
            slidesPerView: Math.min(4, total),
            slidesPerGroup: Math.min(4, total),
          },
        }}
        // Prevent weird layout if fewer items than default perView
        onBeforeInit={(swiper) => {
          const cap = Math.min(4, total || 1);
          swiper.params.slidesPerView = cap;
          swiper.params.slidesPerGroup = cap;
        }}
      >
        {items.map((review, i) => (
          <SwiperSlide key={i}>
            <TestMonailCard data={review} />
          </SwiperSlide>
        ))}
      </Box>
    </Box>
  );
}

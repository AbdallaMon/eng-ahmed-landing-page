import { Box } from "@mui/material";
import AboutImagesShapes from "./AboutImageShapes";
import Image from "next/image";

export default function AboutImageContainer({ images, lng, aboutData }) {
  const profileAlt =
    lng === "ar"
      ? "المهندس أحمد المبيض – مهندس معماري ومتخصص في التصميم الداخلي"
      : "Eng. Ahmad Almobayed – Architect and Interior Design Specialist";

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          width: { xs: "70%", md: "60%" },
          mx: "auto",
          maxWidth: "550px",
          display: "flex",
          position: "relative",
          zIndex: 5,
        }}
      >
        <Image
          style={{
            width: "100%",
            maxWidth: "550px",
            height: "auto",
          }}
          width={1200}
          height={1200}
          src={images.profile}
          alt={profileAlt}
        />

        <AboutImagesShapes images={images} />
      </Box>

      {/* صورة الـ blur (خلفية ديكورية) */}
      <Box
        component="img"
        sx={{
          width: { xs: "112%", md: "100%" },
          position: "absolute",
          bottom: 0,
          height: "90%",
          zIndex: -1,
        }}
        src={images.blur}
        alt=""
        aria-hidden="true"
      />
    </Box>
  );
}

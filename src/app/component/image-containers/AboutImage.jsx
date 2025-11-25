import { Box } from "@mui/material";
import AboutImagesShapes from "./AboutImageShapes";

export default function AboutImageContainer({ images, lng, aboutData }) {
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
        <Box
          component="img"
          sx={{
            width: "100%",
          }}
          src={images.profile}
          alt={
            (lng === "ar"
              ? "عن المهندس احمد المبيض :"
              : "About eng ahmed almobayed") + aboutData.description
          }
        />
        <AboutImagesShapes images={images} />
      </Box>
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
        alt={
          (lng === "ar"
            ? "عن المهندس احمد المبيض :"
            : "About eng ahmed almobayed") + aboutData.description
        }
      />
    </Box>
  );
}

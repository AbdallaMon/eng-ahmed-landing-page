import { Box } from "@mui/material";
import AboutImagesShapes from "./AboutImageShapes";

export default function AboutImageContainer({ images }) {
  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          width: { xs: "70%", md: "60%" },
          mx: "auto",
          // maxHeight: "600px",
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
      />
    </Box>
  );
}

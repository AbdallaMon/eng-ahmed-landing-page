import { Box, Typography } from "@mui/material";
import Image from "next/image";

export function MainPageCard({ data, lng }) {
  return (
    <Box
      component="a"
      href={data.href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "block",
        px: { xs: 8, md: 0 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          p: { xs: 1.5, md: 3 },
          borderRadius: 50,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textDecoration: "none",
          overflow: "hidden",
          aspectRatio: "1 / 1",
          maxWidth: 400,
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            zIndex: 3,
          }}
        />
        <Image
          width={400}
          height={300}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
          }}
          src={"/card-bg.png"}
          alt="المهندس احمد المبيض"
        />

        <Image
          src={data.image}
          alt="المهندس احمد المبيض"
          width={1200}
          height={800}
          style={{
            width: "100%",
            borderRadius: 500,
            height: "100%",
            objectFit: data.type === "COVER" ? "cover" : "contain",
            position: "relative",
            zIndex: 2,
            backgroundColor: "#ffffff",
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: { xs: 0.5, md: 2 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 1,
            textAlign: "center",
            fontSize: {
              xs: "1rem",
              md: "1.25rem",
            },
          }}
        >
          {data.title}
        </Typography>
        {data.subTitle && (
          <Typography
            sx={{
              fontSize: {
                xs: "0.7rem",
                md: "1rem",
              },
            }}
          >
            {data.subTitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

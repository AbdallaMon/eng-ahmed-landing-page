import { Box, Typography } from "@mui/material";

export function MainPageCard({ data, lng }) {
  return (
    <Box
      component="a"
      href={data.href}
      sx={{
        display: "block",
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
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
          }}
          component={"img"}
          src={"/card-bg.png"}
          alt="المهندس احمد المبيض"
        />

        <Box
          component={"img"}
          src={data.image}
          alt="المهندس احمد المبيض"
          sx={{
            width: "100%",
            borderRadius: 50,
            height: "100%",
            objectFit: "cover",
            position: "relative",
            zIndex: 2,
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: { xs: 1.5, md: 2 },
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

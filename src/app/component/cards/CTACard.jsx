import { colors } from "@/app/data/constants";
import { Box, Typography } from "@mui/material";

export default function CTACard({ data }) {
  return (
    <Box
      sx={{
        boxShadow:
          "inset 0 0 0 0.72px #DFDFDF, 0px 2.88px 0.72px rgba(0,0,0,0.13)",
        borderRadius: 1.5,
        p: { xs: 2, md: 3 },
        width: "100%",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: { xs: "220px", md: "300px" },
          mx: "auto",
          gap: { xs: 2.2, md: 3 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "primary.main",
            fontSize: { xs: "1.1rem", md: "1.5rem" },
          }}
        >
          {data.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            lineHeight: { xs: "17px", md: "23px" },
            fontSize: {
              xs: "0.7rem",
              md: "1rem",
            },
          }}
        >
          {data.description}
        </Typography>
      </Box>
    </Box>
  );
}

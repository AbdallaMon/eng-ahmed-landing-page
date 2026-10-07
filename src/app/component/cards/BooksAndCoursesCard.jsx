import { colors } from "@/app/data/constants";
import { Box, Typography } from "@mui/material";
import { LinkButton } from "../buttons/LinkButton";

export function BooksAndCoursesCard({ cardData, lng }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: { xs: "24px 16px", md: "32px 20px" },
        backgroundColor: "primary.main",
        borderRadius: "8px",
        textAlign: "center",
        height: "100%",
        position: "relative",
        py: 6,
        minHeight: { xs: "250px", md: "300px" },
        borderRadius: 2,
      }}
    >
      <Box
        component="img"
        src={cardData.image}
        alt={cardData.title}
        loading="lazy"
        decoding="async"
        sx={{
          mb: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: "calc(100% - 0px)",
          width: "calc(100% - 0px)",
          objectFit: "cover",
          borderRadius: "8px",
          zIndex: 1,
        }}
      />
      <Box
        className="overlay"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: "calc(100% - 0px)",
          width: "calc(100% - 0px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: "8px",
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            height: { xs: "100px", md: "200px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              color: colors.white,
              fontSize: { xs: "1.3rem", md: "2rem" },
            }}
          >
            {cardData.title}
          </Typography>
        </Box>
        <Box
          sx={{
            height: "100%",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              fontWeight: 400,
              color: colors.white,
              fontSize: { xs: "0.8rem", md: "1rem" },
            }}
          >
            {cardData.subTitle}
          </Typography>
          <LinkButton
            href={cardData.href}
            bgColor={colors.highlight}
            textColor={colors.primary}
            borderColor={colors.primary}
            name={cardData.buttonText}
            sx={{
              textAlign: "center",
              paddingX: 3,
              fontSize: { xs: "0.7rem", md: "0.9rem" },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

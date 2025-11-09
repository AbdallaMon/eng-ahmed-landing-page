import { colors } from "@/app/data/constants";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Button,
} from "@mui/material";

export default function HomeProjectCard({
  id,
  imageSrc,
  imgAlt = "Project image",
  description,
  buttonText = "View Project",
  category = "",
}) {
  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      {/* Image on top */}
      <CardActionArea
        component={"a"}
        href={`/projects/${id}`}
        sx={{ display: "block" }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            src={imageSrc}
            alt={imgAlt}
            sx={{
              width: "100%",
              height: 300,
              objectFit: "cover",
              display: "block",
              borderRadius: 0.7,
            }}
          />

          {/* Category badge (top-right) */}
          {category ? (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                px: 2.5,
                py: 1.5,
                borderRadius: 0.5,
                backgroundColor: colors.highlightDark,
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.3,
                boxShadow: 1,
                userSelect: "none",
              }}
            >
              {category}
            </Box>
          ) : null}
        </Box>
      </CardActionArea>

      {/* Description + Button */}
      <CardContent sx={{ pt: 2 }}>
        {description ? (
          <Typography
            variant="body1"
            sx={{
              mb: 1.2,
              fontSize: { xs: "1.1rem", md: "1.2rem" },
              color: "text.primary",
            }}
          >
            {description}
          </Typography>
        ) : null}

        <Button
          component={"a"}
          href={`/projects/${id}`}
          variant="text"
          sx={{
            px: 0,
            minWidth: 0,
            textTransform: "none",
            fontWeight: 400,
            alignItems: "center",
            gap: 1,
            display: "flex",
            width: "fit-content",
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          {buttonText}
          <Box
            component="img"
            src="./arrow-left-colored.png"
            sx={{
              width: 16,
              height: 16,
            }}
          />
        </Button>
      </CardContent>
    </Card>
  );
}

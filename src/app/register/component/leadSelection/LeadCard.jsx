"use client";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

/**
 * A single image card representing a service or location option.
 * Renders as an `<a>` for LINK type and a `<div>` for clickable types.
 *
 * The `className` is also a GSAP hook — keep "lead-card" and "location"
 * verbatim, and the per-value class (e.g. ".DESIGN", ".INSIDE_UAE").
 *
 * @param {{
 *   lead: object,
 *   handleClick: Function,
 *   className?: string,
 *   isCatAnimated?: boolean,
 * }} props
 */
export function LeadCard({
  lead,
  handleClick,
  className = "lead-card",
  isCatAnimated,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { translate } = useLanguage();

  const cardSx = {
    position: "relative",
    minHeight: isMobile ? "180px" : "200px",
    width: isMobile ? "100%" : "calc(50% - 24px)",
    display: "inline-block",
    cursor: "pointer",
    my: "8px",
    mx: isMobile ? 0 : "12px",
    overflow: "hidden",
    ...(className === "location" && { zIndex: 15 }),
  };

  const content = (
    <Box
      className={`shadow-${className}`}
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        display: "inline-block",
        cursor: "pointer",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Hidden img for SEO / accessibility */}
      <img src={lead.image} alt={lead.alt} style={{ display: "none" }} />

      {/* Background image layer */}
      <Box
        className="lead-card-image"
        sx={{
          position: "absolute",
          height: "100%",
          width: "100%",
          backgroundImage: `url(${lead.image || "/design.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            height: "100%",
            width: "100%",
            zIndex: 2,
          }}
          style={{
            background:
              "linear-gradient(169deg, rgba(45,35,30,0.3) 0%, rgba(45,35,30,0.85) 100%)",
          }}
        >
          {lead.type === "COMING_SOON" && (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                textAlign: "center",
                position: "absolute",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "50px",
                zIndex: 3000,
                bottom: 0,
                left: "50%",
                transform: "translate(-50%, 0%)",
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
              }}
            >
              {translate("category.comingSoon")}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Card title */}
      <Typography
        variant="h4"
        sx={{
          fontSize: isMobile ? "1.8rem" : undefined,
          color: theme.palette.primary.main,
          fontWeight: 700,
          textAlign: "center",
          letterSpacing: "0.5px",
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          whiteSpace: "nowrap",
          zIndex: 3000,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {translate(lead.title)}
      </Typography>
    </Box>
  );

  if (lead.type === "LINK") {
    return (
      <Box
        component="a"
        href={lead.href}
        target="_blank"
        rel="noreferrer"
        className={`${className} ${lead.value}`}
        onClick={(event) => {
          event.preventDefault();
          if (isCatAnimated) event.preventDefault();
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          if (isCatAnimated) event.preventDefault();
        }}
        sx={{ ...cardSx, cursor: "default" }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      className={`${className} ${lead.value}`}
      onClick={() => handleClick(lead.value)}
      sx={{
        ...cardSx,
        opacity: className === "location" ? 0 : 1,
      }}
    >
      {content}
    </Box>
  );
}

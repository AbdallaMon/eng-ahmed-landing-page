import { LinkButton } from "../component/buttons/LinkButton";
import { colors } from "../data/constants";
import { getTranslation } from "../i18n";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

export async function OurNumbersSection({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("ourNumbers", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });
  const order = ["right", "middle", "left"];
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 28 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            mb: 2,
            fontSize: {
              xs: "1.8rem",
              md: "3rem",
            },
          }}
        >
          {data.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "text.secondary",
            mb: { xs: 4, md: 6 },
            maxWidth: "500px",
            mx: "auto",
            color: colors.secondary,
          }}
        >
          {data.description}
        </Typography>

        <Grid
          sx={{ borderRadius: 3 }}
          container
          spacing={0}
          alignItems="stretch"
        >
          {order.map((key, idx) => {
            const isMiddle = key === "middle";
            const card = data.cards[key];

            return (
              <Grid key={key} size={4}>
                <OurNumberCard card={card} isMiddle={isMiddle} />
              </Grid>
            );
          })}
        </Grid>
        <Box mt={2} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <LinkButton
            {...buttons.booking}
            bgColor={colors.primary}
            borderColor={colors.primary}
            textColor={colors.white}
          />
        </Box>
      </Container>
    </Box>
  );
}

function OurNumberCard({ card, isMiddle }) {
  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 5 },
        borderRadius: 0,
        backgroundColor: "transparent",
        borderLeft: isMiddle ? `1px solid ${colors.borderColor2}` : 0,
        borderRight: isMiddle ? `1px solid ${colors.borderColor2}` : 0,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Typography
          // middle title only is bigger
          variant={"h4"}
          sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            mb: 1,
            fontSize: isMiddle
              ? { xs: "1.5rem", md: "2.8rem" }
              : { xs: "1.25rem", md: "2.2rem" },
          }}
        >
          {card.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            maxWidth: 360,
            mx: "auto",
            color: colors.secondary,
          }}
        >
          {card.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

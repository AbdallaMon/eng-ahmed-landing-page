import { Box, Container, Typography } from "@mui/material";
import { getTranslation } from "../i18n";
import StageItem from "../component/StageItem";
import { colors } from "../data/constants";

export default async function StagesSection({ lng }) {
  const { t } = await getTranslation(lng);

  const stagesData = t("stages", { returnObjects: true });
  return (
    <Box>
      <Container
        maxWidth="xl"
        sx={{ backgroundColor: colors.primary, pb: { xs: 16, md: 20 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box>
            <Box
              sx={{
                textAlign: "center",
                mb: { xs: 3, md: 5 },
                mt: { xs: 14, md: 20 },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: {
                    xs: "1.8rem",
                    md: "2.8rem",
                  },
                  color: colors.white,
                  mb: {
                    xs: 2,
                    md: 3,
                  },
                }}
              >
                {stagesData.title}
              </Typography>
              <Typography variant="body1">{stagesData.description}</Typography>
            </Box>
            <Box>
              {stagesData.stages.map((stage, i) => (
                <StageItem {...stage} key={i} />
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

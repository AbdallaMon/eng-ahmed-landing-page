import { Box, Container, Grid } from "@mui/material";
import { MainPageCard } from "../cards/MainPageCard";
import FloatingWhatsAppButton from "../buttons/FloatingWhatsAppButton";

export function MainPage({ mainData, lng }) {
  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          pt: { xs: 0, md: 12 },
        }}
      >
        <Grid
          container
          sx={{
            // maxWidth: "800px",
            mx: "auto",
          }}
          spacing={{ xs: 1, md: 3 }}
        >
          {mainData.map((item, index) => (
            <Grid size={{ xs: 12, md: 3 }} key={index}>
              <MainPageCard data={item} lng={lng} preload={index === 0} />
            </Grid>
          ))}
        </Grid>
      </Box>
      <FloatingWhatsAppButton />
    </Container>
  );
}

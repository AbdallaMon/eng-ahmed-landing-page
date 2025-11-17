import { Box, Container, Grid } from "@mui/material";
import { MainPageCard } from "../cards/MainPageCard";

export function MainPage({ mainData, lng }) {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 8, md: 12 },
        }}
      >
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {mainData.map((item, index) => (
            <Grid size={{ xs: 6, md: 4 }} key={index}>
              <MainPageCard data={item} lng={lng} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

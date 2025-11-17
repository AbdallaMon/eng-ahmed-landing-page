import { Alert, Paper, Typography } from "@mui/material";

export function SuccessPage({ lng }) {
  return (
    <Paper
      elevation={4}
      sx={{
        padding: 2,
        borderRadius: 3,
        backgroundColor: "#fff",
        textAlign: "center",
        direction: lng === "ar" ? "ltr" : "ltr",
      }}
    >
      <Alert severity="success">
        <Typography variant="body1" p={4} fontSize="1.2rem">
          {lng === "ar"
            ? "تم الحجز بنجاح! سنقوم بالتواصل معك قريباً."
            : "Booking successful! We will contact you soon."}
        </Typography>
      </Alert>
    </Paper>
  );
}

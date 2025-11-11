import { colors } from "@/app/data/constants";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Rating,
  Typography,
} from "@mui/material";

export function TestMonailCard({ data }) {
  return (
    <Card
      sx={{
        backgroundColor: colors.solidWhite,
        height: "100%",
      }}
    >
      <CardContent>
        <Box>
          <Rating
            name="read-only"
            value={data.rating}
            // colors={{ iconFilled: colors.solidWhite }}
            sx={{
              "& .MuiSvgIcon-root": {
                // review yellow always like in any website
                color: "#FFB400",
              },
            }}
            readOnly
          />
        </Box>
        <Box>
          <Typography
            variant="body1"
            fontSize={{ xs: "0.9rem", md: "1.1rem" }}
            sx={{
              maxWidth: "80%",
              color: colors.brown,
              mt: 2,
              mb: 3,
              ml: "auto",
            }}
          >
            {data.text}
          </Typography>
        </Box>
        <Box
          mt={2}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",

              gap: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {data.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {data.country}
            </Typography>
          </Box>
          <Box>
            <Avatar
              alt={data.name}
              src={data.avatar}
              sx={{ width: 56, height: 56, ml: 2 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

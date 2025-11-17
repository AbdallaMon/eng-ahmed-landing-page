import { TextField } from "@mui/material";

export function TextInput({ input, value, lng, handleChange }) {
  return (
    <TextField
      fullWidth
      label={input.label}
      name={input.id}
      variant="outlined"
      value={value}
      onChange={(event) => handleChange(event.target.value, input.id)}
      slotProps={{
        input: {
          sx: {
            borderRadius: 2,
            "&:hover": {
              "& fieldset": {
                borderColor: "primary.main",
              },
            },
          },
        },
      }}
    />
  );
}

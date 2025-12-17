"use client";

import { useState } from "react";
import { Button, Box, Typography, Menu, MenuItem } from "@mui/material";

export function LanguageSwitcher({ options, currentLanguage }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!options || !options.length) return null;

  const current =
    options.find((opt) => opt.value === currentLanguage) || options[0];

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value) => {
    if (onChange && value !== currentLanguage) {
      onChange(value);
    }
    handleClose();
  };
  const onChange = (value) => {
    const url = new URL(window.location.href);
    url.searchParams.set("lng", value);
    window.localStorage.setItem("i18nextLng", value);
    window.localStorage.setItem("lng", value);
    // add cookies i18next with lng
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `i18next=${value}; path=/;`;
    window.location.assign(url.toString());
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        sx={{
          textTransform: "none",

          px: 1.5,
          py: 0.5,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
        }}
        // variant="outlined"
        size="small"
      >
        <Box
          component="img"
          src={"/chevron-down-colored.png"}
          alt="Language"
          sx={{
            width: 18,
            height: 18,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease-in-out",
          }}
        />
        <Typography variant="body2">
          {current && current.label ? current.label : "Language"}
        </Typography>
        <Box
          component="img"
          src={"/language-selector.png"}
          alt="Language"
          sx={{ width: 18, height: 18 }}
        />
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={opt.value === currentLanguage}
            onClick={() => handleSelect(opt.value)}
            sx={{ px: 3, py: 1.5 }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

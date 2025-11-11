"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Box,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";

/* ---------- Small components ---------- */

function FaqSearchInput({ value, onChange, lng = "en" }) {
  const placeholder = lng === "ar" ? "ابحث في الأسئلة..." : "Search FAQs...";
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      variant="outlined"
      size="medium"
      sx={{
        width: { xs: "100%", md: "300px" },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton tabIndex={-1} disableRipple edge="end">
              {/* simple magnifier emoji to avoid extra libs */}
              <Box
                component="img"
                src="./search.png"
                alt="search icon"
                sx={{
                  width: 20,
                }}
              />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

function ChevronIcon({ expanded }) {
  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 200ms ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src={"/chevron-down-colored.png"} // put your image at public/chevron-down-colored.png
        alt="toggle"
        width={22}
        height={22}
        priority={false}
      />
    </Box>
  );
}

function FaqItem({ q, a, index, lng = "en", defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <Accordion
      elevation={0}
      disableGutters
      square
      expanded={expanded}
      onChange={() => setExpanded((p) => !p)}
      sx={{
        "&:before": { display: "none" },
        // border: (theme) => `1px solid ${theme.palette.divider}`,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronIcon expanded={expanded} />}
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          "& .MuiAccordionSummary-content": {
            my: 0.5,
          },
          direction: lng === "ar" ? "rtl" : "ltr",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ textAlign: lng === "ar" ? "right" : "left" }}
        >
          {q}
        </Typography>
      </AccordionSummary>
      <Divider />
      <AccordionDetails sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            whiteSpace: "pre-line",
            textAlign: lng === "ar" ? "right" : "left",
          }}
        >
          {a}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

/* ---------- Main component ---------- */

export function FaqComponent({ faqData = [], lng = "en" }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return faqData;
    return faqData.filter(({ question, answer }) => {
      const q = (question || "").toLowerCase();
      const a = (answer || "").toLowerCase();
      return q.includes(term) || a.includes(term);
    });
  }, [faqData, searchTerm]);
  return (
    <Box
      component="section"
      sx={{
        direction: lng === "ar" ? "rtl" : "ltr",
      }}
    >
      {/* Search */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <FaqSearchInput value={searchTerm} onChange={setSearchTerm} lng={lng} />
      </Box>

      {/* List */}
      <Box sx={{ display: "grid", gap: 2 }}>
        {filtered.map((item, idx) => (
          <FaqItem
            key={`${item.question}-${idx}`}
            q={item.question}
            a={item.answer}
            index={idx}
            lng={lng}
            defaultExpanded={idx === 0 && !searchTerm}
          />
        ))}

        {filtered.length === 0 && (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              textAlign: "center",
            }}
          >
            <Typography variant="body1">
              {lng === "ar" ? "لا توجد نتائج مطابقة." : "No matching results."}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

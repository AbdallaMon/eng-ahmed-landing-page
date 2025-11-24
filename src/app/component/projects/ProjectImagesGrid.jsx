// components/Project/ProjectImagesGrid.jsx
import { Box, IconButton } from "@mui/material";
import { MdRemoveRedEye } from "react-icons/md";
import ProjectImagesLightboxClient from "./ProjectImagesLightboxClient";

function buildImageAlt({ project, index, lng }) {
  const engAhmedBrand =
    lng === "ar" ? "المهندس أحمد المبيض" : "Eng Ahmed Almobayed";

  return `${project.name} – ${project.description} – ${
    project.location
  } – ${engAhmedBrand} – image ${index + 1}`;
}

function getProjectImages(project) {
  const totalImages =
    project.imagesNumbers ||
    (Array.isArray(project.images) ? project.images.length : 0);

  if (!totalImages || !project.id) return [];

  return Array.from({ length: totalImages }, (_, index) => ({
    src: `/projects/project-${project.id}/${index + 1}.${
      project.imagesExtension || "jpg"
    }`,
    index,
  }));
}

export default function ProjectImagesGrid({ project, lng = "ar" }) {
  const baseImages = getProjectImages(project);

  if (!baseImages.length) return null;

  const imagesWithAlt = baseImages.map((img) => ({
    ...img,
    alt: buildImageAlt({ project, index: img.index, lng }),
  }));

  const sectionLabel =
    lng === "ar"
      ? `معرض صور مشروع ${project.name}`
      : `Project image gallery for ${project.name}`;

  // ---------- 3 columns: keep row order + make middle lighter ----------

  const columnsCount = 3;
  const columns = Array.from({ length: columnsCount }, () => []);

  // 1) Round-robin: ensures (1,2,3), (4,5,6) horizontally
  imagesWithAlt.forEach((img, i) => {
    const colIdx = i % columnsCount;
    columns[colIdx].push(img);
  });

  // 2) Rebalance so middle column has <= images than both sides
  const leftCol = columns[0];
  const middleCol = columns[1];
  const rightCol = columns[2];

  while (middleCol.length > Math.min(leftCol.length, rightCol.length)) {
    const moved = middleCol.pop();
    if (!moved) break;
    // Push to the right side (so we get patterns like 4 / 3 / 4 for 11 images)
    rightCol.push(moved);
  }

  return (
    <>
      <Box
        component="section"
        aria-label={sectionLabel}
        itemScope
        itemType="https://schema.org/ImageGallery"
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {columns.map((columnImages, colIdx) => (
          <Box
            key={colIdx}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {columnImages.map((img) => (
              <Box
                key={img.src}
                component="figure"
                itemProp="associatedMedia"
                itemScope
                itemType="https://schema.org/ImageObject"
                sx={{
                  m: 0,
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  itemProp="contentUrl"
                  sx={{
                    width: "100%",
                    height: "auto", // keep aspect ratio
                    display: "block",
                    borderRadius: 1,
                  }}
                />

                <IconButton
                  component="button"
                  type="button"
                  aria-label={
                    lng === "ar"
                      ? `عرض الصورة رقم ${img.index + 1} في وضع الشاشة الكاملة`
                      : `View image ${img.index + 1} in fullscreen`
                  }
                  data-project-lightbox-trigger={project.id}
                  data-lightbox-index={img.index}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.55)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.8)",
                    },
                    zIndex: 2,
                  }}
                >
                  <MdRemoveRedEye />
                </IconButton>

                <Box
                  component="meta"
                  itemProp="name"
                  content={`${project.name} – image ${img.index + 1}`}
                />
                <Box component="meta" itemProp="caption" content={img.alt} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      <ProjectImagesLightboxClient
        projectId={project.id}
        images={imagesWithAlt}
        project={project}
        lng={lng}
      />
    </>
  );
}

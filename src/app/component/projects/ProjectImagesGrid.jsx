// components/Project/ProjectImagesGrid.jsx
import { Box, IconButton } from "@mui/material";
import { MdRemoveRedEye } from "react-icons/md";
import Image from "next/image";
import ProjectImagesLightboxClient from "./ProjectImagesLightboxClient";
import { getProjectKind } from "@/app/seo/jsonLdHelpers";

function buildImageAlt({ project, index, lng, kindLabel }) {
  const brand = lng === "ar" ? "المهندس أحمد المبيض" : "Eng. Ahmed Almobayd";

  if (lng === "ar") {
    return `صورة رقم ${index + 1} من ${kindLabel} «${project.name}» في ${
      project.location
    } – ${brand}`;
  }

  return `Image ${index + 1} of ${kindLabel} "${project.name}" in ${
    project.location
  } – ${brand}`;
}

export default function ProjectImagesGrid({ project, lng = "ar" }) {
  const baseImages = project.images || [];

  if (!baseImages.length) return null;

  const DEFAULT_WIDTH = 1200;
  const DEFAULT_HEIGHT = 800;

  const kindLabel = getProjectKind(project, lng).label;

  const imagesWithAlt = baseImages.map((img, index) => ({
    ...img,
    index, // store it explicitly
    width: img.width ?? DEFAULT_WIDTH,
    height: img.height ?? DEFAULT_HEIGHT,
    alt: buildImageAlt({ project, index, lng, kindLabel }),
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
              width: "100%",
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
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes="(max-width: 900px) 100vw, 33vw"
                  loading="lazy"
                  placeholder={img.blurDataURL ? "blur" : "empty"}
                  blurDataURL={img.blurDataURL}
                  itemProp="image"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
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

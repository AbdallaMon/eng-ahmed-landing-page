import { arInitialProjects } from "./data/projects";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";

export default function sitemap() {
  const lastModified = new Date();

  const staticRoutes = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/booking`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8 },
  ].map((route) => ({ ...route, lastModified }));

  const projectRoutes = arInitialProjects.map((project) => ({
    url: `${base}/projects/${project.id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.64,
  }));

  return [...staticRoutes, ...projectRoutes];
}

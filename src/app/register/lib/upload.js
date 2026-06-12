import { toast } from "react-toastify";
import { Success, Failed } from "@/app/register/lib/toast";

const BASE_URL = process.env.NEXT_PUBLIC_URL;
const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB

/**
 * Upload a file to the client endpoint in 1 MB chunks, reporting progress.
 *
 * @param {File}     file        - File to upload
 * @param {Function} setProgress - Called with a 0–100 percentage
 * @param {Function} setOverlay  - Called with true/false to toggle the upload overlay
 * @returns {Promise<{ url: string, status: number } | undefined>}
 */
export async function uploadInChunks(file, setProgress, setOverlay) {
  const toastId = toast.loading("Uploading");

  try {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let finalFileUrl;

    setOverlay(true);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("filename", file.name);
      formData.append("chunkIndex", i);
      formData.append("totalChunks", totalChunks);

      const res = await fetch(`${BASE_URL}/client/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const json = await res.json();
      // Old server returned `{ url }`; the migrated server nests it as
      // `{ data: { url } }`. Handle old || new.
      const chunkUrl = json.url || json.data?.url;
      if (chunkUrl) finalFileUrl = chunkUrl;

      setProgress(Math.round(((i + 1) / totalChunks) * 100));
    }

    setOverlay(false);
    toast.update(toastId, Success("Uploaded successfully"));

    return { url: finalFileUrl, status: finalFileUrl ? 200 : 500 };
  } catch (err) {
    setOverlay(false);
    toast.update(toastId, Failed("Upload failed"));
  }
}

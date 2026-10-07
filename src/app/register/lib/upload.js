import { toast } from "react-toastify";
import { Success, Failed } from "@/app/register/lib/toast";
import { apiUrl } from "@/app/utility/apiBase.mjs";
const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB

/**
 * Upload a file to the client endpoint in 1 MB chunks, reporting progress.
 *
 * @param {File}     file        - File to upload
 * @param {Function} setProgress - Called with a 0–100 percentage
 * @param {Function} setOverlay  - Called with true/false to toggle the upload overlay
 * @returns {Promise<{ url: string, status: number } | undefined>}
 */
export async function uploadInChunks(
  file,
  setProgress,
  setOverlay,
  publicAccess,
  messages = {},
) {
  const toastId = toast.loading(messages.uploading || "Uploading");

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

      const purpose = publicAccess?.purpose;
      const token = publicAccess?.token;
      if (purpose !== "PUBLIC_LEAD" || !token) {
        throw new Error("PUBLIC_UPLOAD_CAPABILITY_REQUIRED");
      }

      const res = await fetch(
        apiUrl(`files/client/chunks?purpose=${encodeURIComponent(purpose)}`),
        {
          method: "POST",
          body: formData,
          headers: { "x-upload-token": token },
          credentials: "include",
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "FILE_UPLOAD_ERROR");
      const chunkUrl = json.data?.url;
      if (chunkUrl) finalFileUrl = chunkUrl;

      setProgress(Math.round(((i + 1) / totalChunks) * 100));
    }

    setOverlay(false);
    toast.update(
      toastId,
      Success(messages.uploaded || "Uploaded successfully"),
    );

    return { url: finalFileUrl, status: finalFileUrl ? 200 : 500 };
  } catch (err) {
    setOverlay(false);
    toast.update(toastId, Failed(messages.failed || "Upload failed"));
    return { url: null, status: 500, message: err?.message };
  }
}

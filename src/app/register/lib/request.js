import { toast } from "react-toastify";
import { Success, Failed } from "@/app/register/lib/toast";
import { resolveServerMessage } from "@/app/register/lib/serverMessages";

const BASE_URL = process.env.NEXT_PUBLIC_URL;

/**
 * Submit a form request (POST / PUT / DELETE) with a loading toast.
 *
 * @param {object}   data          - Request body
 * @param {Function} setLoading    - Setter from the loading toast context / local state
 * @param {string}   path          - API path relative to NEXT_PUBLIC_URL (e.g. "client/new-lead/register")
 * @param {boolean}  isFileUpload  - Send FormData instead of JSON
 * @param {string}   toastMessage  - Text shown while loading
 * @param {Function} [setRedirect] - Called with `prev => !prev` on success (optional)
 * @param {string}   [method]      - HTTP verb (default: "POST")
 * @param {string|object} [header] - Override Content-Type or merge request headers
 * @returns {Promise<object>}      - Response JSON with an added .status property
 */
export async function handleRequestSubmit(
  data,
  setLoading,
  path,
  isFileUpload = false,
  toastMessage = "Sending...",
  setRedirect,
  method = "POST",
  header,
) {
  const toastId = toast.loading(toastMessage);
  const body = isFileUpload ? data : JSON.stringify(data);
  const headers = {
    ...(isFileUpload ? {} : { "Content-Type": "application/json" }),
    ...(typeof header === "string" ? { "Content-Type": header } : header || {}),
  };

  setLoading(true);

  try {
    const response = await fetch(`${BASE_URL}/${path}`, {
      method,
      body,
      headers,
      credentials: "include",
    });

    const status = response.status;
    const result = await response.json();
    result.status = status;

    // Old server replied 200; the migrated server replies 201 on create and
    // carries a `success` flag — treat both as success (handle old || new).
    const isSuccess =
      status === 200 || status === 201 || result?.success === true;
    // The migrated server sends language-neutral CODES in `message`; resolve
    // them to readable text (old prose passes through unchanged).
    const shownMessage = resolveServerMessage(result.message);
    if (isSuccess) {
      toast.update(toastId, Success(shownMessage));
      if (setRedirect) setRedirect((prev) => !prev);
    } else {
      toast.update(toastId, Failed(shownMessage));
    }

    return result;
  } catch (err) {
    toast.update(toastId, Failed("Error, " + err.message));
    return { status: 500, message: "Error, " + err.message };
  } finally {
    setLoading(false);
  }
}

/**
 * Fetch data via GET (used by the success page for payment-status).
 *
 * @param {object}   args
 * @param {string}   args.url        - API path relative to NEXT_PUBLIC_URL
 * @param {Function} [args.setLoading] - Loading setter (optional)
 * @returns {Promise<object|undefined>} - Response JSON with an added .status property
 */
export async function getData({ url = "", setLoading, headers = {} }) {
  try {
    if (setLoading) setLoading(true);

    const response = await fetch(`${BASE_URL}/${url}`, {
      headers: { "Content-Type": "application/json", ...headers },
      credentials: "include",
    });

    const status = response.status;
    const result = await response.json();
    result.status = status;
    return result;
  } catch (err) {
    console.error("getData error:", err);
  } finally {
    if (setLoading) setLoading(false);
  }
}

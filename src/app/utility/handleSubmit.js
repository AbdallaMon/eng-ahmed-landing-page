import { toast } from "react-toastify";

export async function handleRequestSubmit(
  data,
  setLoading,
  path,
  toastMessage = "Sending...",
  method = "POST",
  isFileUpload = false
) {
  const toastId = toast.loading(toastMessage);
  const body = isFileUpload ? data : JSON.stringify(data);
  const headers = isFileUpload ? {} : { "Content-Type": "application/json" };
  setLoading(true);
  try {
    const request = await fetch(process.env.NEXT_PUBLIC_URL + "/" + path, {
      method: method,
      body,
      headers: headers,
      credentials: "include",
    });
    const reqStatus = request.status;
    const response = await request.json();
    response.status = reqStatus;
    if (reqStatus === 200) {
      toast.update(toastId, Success(response.message));
    } else {
      toast.update(toastId, Failed(response.message));
    }
    return response;
  } catch (err) {
    toast.update(toastId, Failed("Error, " + err.message));
    return { status: 500, message: "Error, " + err.message };
  } finally {
    setLoading(false);
  }
}

function Success(message) {
  return {
    render: message,
    type: "success",
    isLoading: false,
    autoClose: 3000,
  };
}

function Failed(error) {
  return {
    render: error,
    type: "error",
    isLoading: false,
    autoClose: 3000,
  };
}

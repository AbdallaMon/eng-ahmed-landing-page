// Toast notification update configs for react-toastify.

export function Success(message) {
  return {
    render: message,
    type: "success",
    isLoading: false,
    autoClose: 3000,
  };
}

export function Failed(error) {
  return { render: error, type: "error", isLoading: false, autoClose: 3000 };
}

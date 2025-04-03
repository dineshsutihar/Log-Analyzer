export default async function chatApi(logObject, userText) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      logId: logObject.logId, 
      userText: userText || "",
    }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok: " + response.statusText);
  }

  const dataJson = await response.json();

  if (!dataJson) {
    throw new Error("No data found");
  }

  return dataJson;
}

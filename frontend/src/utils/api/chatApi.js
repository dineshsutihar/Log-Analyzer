export default async function chatApi(logId, userText) {

  const formData = new URLSearchParams();
  formData.append('logId', "67f0db6103d61105d821496b");
  formData.append('userText', userText);

  const data = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", 
    },
    body: formData, 
  });

  if (!data.ok) {
    throw new Error("Network response was not ok" + data.statusText);
  }

  const dataJson = await data.json();
  console.log(dataJson);

  if (!dataJson) {
    throw new Error("No data found");
  }

  return dataJson;
}

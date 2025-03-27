export default async function fetchStats() {
  const data = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stats`)
    
  if(!data.ok) {
    throw new Error("Network response was not ok" + data.statusText);
  }

  const dataJson = await data.json();
  if (!dataJson) {
    throw new Error("No data found");
  }
  return dataJson;
}

import config from "../../../config";

export default async function getCourses() {
  const token = localStorage.getItem("token");

  const resp = await fetch(`${config.hostUrl}/api/batch/get`, {
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (resp.status === 200) {
    const data = await resp.json();
    return data.data;
  }

  return [];
}
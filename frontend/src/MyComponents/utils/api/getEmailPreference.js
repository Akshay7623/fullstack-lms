import config from "../../../config";

export default async function getEmailPreference() {
  const token = localStorage.getItem("token");
  if(!token) {
    return;
  }
  const resp = await fetch(
    `${config.hostUrl}/api/setting/get/email_preference`,
    {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (resp.status === 200) {
    const data = await resp.json();
    return data.data;
  }

  return {
    emailOnTimeChange: true,
    emailOnTrainerAssign: true,
    emailOnLectureCancel: true,
    emailOnLectureReschedule: true,
  };
}
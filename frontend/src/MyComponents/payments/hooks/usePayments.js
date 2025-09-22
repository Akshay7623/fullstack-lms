import { useState, useEffect, useRef } from "react";
import config from "../../../config";

function usePayments({ page, pageSize, type }) {
  const [payments, setPayments] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [error, setError] = useState(false);

  const getPayments = async (page, pageSize, status) => {
    const token = localStorage.getItem("token");

    try {
      const url = `${config.hostUrl}/api/trainer-payment/get-payments?page=${page}&pageSize=${pageSize}&status=${status}`;
      const resp = await fetch(url, {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.status === 200) {
        const data = await resp.json();
        const totalPages = Math.ceil(data.total / pageSize);
        setPayments(data.data);
        setTotalPage(totalPages);
      } else {
        setError(true);
      }
    } catch (Err) {
      setError(true);
      console.log("Error while fetching data", Err);
    }
  };

  useEffect(() => {
    getPayments(page, pageSize, type);
  }, [page, pageSize, type]);

  return { payments, totalPage, error, getPayments };
}

export default usePayments;

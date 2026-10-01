import http from "k6/http";
import { check, sleep } from "k6";

const API_URL = __ENV.API_URL || "http://localhost:5000";

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "20s", target: 30 },
    { duration: "20s", target: 50 },
    { duration: "10s", target: 0 },
  ],
};


export default function () {
  const res = http.get(
    `${API_URL}/api/products/lists?page=1&limit=10`,
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
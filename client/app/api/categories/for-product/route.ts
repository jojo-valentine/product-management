import axios from "axios";
import { NextResponse } from "next/server";
import { API_URL } from "@/app/utils/api";
import { AxiosError } from "axios";
export async function GET() {
  try {
    const res = await axios.get(`${API_URL}/api/category/for-product`);
    const result = res.data;
    return NextResponse.json(result.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

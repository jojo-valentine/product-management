import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/app/utils/api";
export async function GET(request: NextRequest) {
  try {
    const res = await axios.get(`${API_URL}/api/dashboard/stats`, {});
    return NextResponse.json(res.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to fetch products" },
      { status: 500 },
    );
  }
}

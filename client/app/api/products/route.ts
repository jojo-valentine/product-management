import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/app/utils/api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") ?? "";
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "10";
    const categoryId = searchParams.get("categoryId");
    const res = await axios.get(`${API_URL}/api/products/lists`, {
      params: {
        search,
        page,
        limit,
        ...(categoryId && { categoryId }),
      },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to fetch products" },
      { status: 500 },
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const res = await axios.post(`${API_URL}/api/products/store`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to store products" },
      { status: 500 },
    );
  }
}

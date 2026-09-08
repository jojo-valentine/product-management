import { API_URL } from "@/app/utils/api";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
// GET /api/Category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") ?? "";
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "10";
    const res = await axios.get(`${API_URL}/api/category/lists`, {
      params: {
        search,
        page,
        limit,
      },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST /api/Category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await axios.post(`${API_URL}/api/category/store`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return NextResponse.json(res.data, {
      status: res.status,
    });
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to post categories" },
      { status: 500 },
    );
  }
}

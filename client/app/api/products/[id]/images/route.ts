import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/app/utils/api";
import { request } from "http";

export async function POST(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;
    const formDataImages = await _request.formData();
    const res = await axios.post(
      `${API_URL}/api/products/upload/productImage/${id}/store`,
      formDataImages,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return NextResponse.json(res.data);
  } catch (error: any) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to store Product Image" },
      { status: 500 },
    );
  }
}

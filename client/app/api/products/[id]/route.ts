import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/app/utils/api";
import { headers } from "next/headers";

// GET /api/product
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ✅ params เป็น object ธรรมดา
) {
  try {
    const { id } = await params; // ✅ ไม่ต้อง await
    const res = await axios.get(`${API_URL}/api/products/${id}`);
    return NextResponse.json(res.data.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to find product" },
      { status: 500 },
    );
  }
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const response = await axios.put(`${API_URL}/api/products/${id}`, body, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to update product" },
      { status: 500 },
    );
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const response = await axios.patch(
      `${API_URL}/api/products/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to update status product" },
      { status: 500 },
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const response = await axios.delete(`${API_URL}/api/products/${id}`, {
      withCredentials: true,
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to delete product" },
      { status: 500 },
    );
  }
}

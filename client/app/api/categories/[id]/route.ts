import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/app/utils/api";
// PATCH /api/Category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const res = await axios.patch(`${API_URL}/api/category/${id}/action`, body);
    return NextResponse.json(res.data.data, {
      status: res.status,
    });
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to update category status" },
      { status: 500 },
    );
  }
}
// GET /api/category
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await axios.get(`${API_URL}/api/category/${id}`);
    return NextResponse.json(res.data.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to find category" },
      { status: 500 },
    );
  }
}
// PUT /api/category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const res = await axios.put(`${API_URL}/api/category/${id}/update`, body);
    return NextResponse.json(res.data.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to update category" },
      { status: 500 },
    );
  }
}
// DELETE /api/category
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await axios.delete(`${API_URL}/api/category/${id}/delete`);
    return NextResponse.json(res.data);
  } catch (error) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to delete category" },
      { status: 500 },
    );
  }
}

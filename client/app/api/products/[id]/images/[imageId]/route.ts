// delete image import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/app/utils/api";
import axios, { AxiosError } from "axios";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      imageId: string;
    }>;
  },
) {
  try {
    const { id, imageId } = await params;
    const { status } = await request.json();
    const res = await axios.patch(
      `${API_URL}/api/products/${id}/images/${imageId}/visibility`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return NextResponse.json(res.data);
  } catch (error: any) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to change status Product Image" },
      { status: 500 },
    );
  }
}

// DELETE /api/products/image
export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      imageId: string;
    }>;
  },
) {
  try {
    const { id, imageId } = await params;
    const res = await axios.delete(
      `${API_URL}/api/products/${id}/images/${imageId}`,
    );
    return NextResponse.json(res.data);
  } catch (error: any) {
    const err = error as AxiosError;
    return NextResponse.json(
      { message: err.message || "Failed to delete Product Image" },
      { status: 500 },
    );
  }
}

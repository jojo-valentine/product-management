export interface Category {
  uuid: string;
  tagId: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
}
export type AlertStateCategory = {
  type: "success" | "error";
  message: string;
} | null;

export interface CategoryListResponse {
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface errorCategory {
  name: string;
  description: string;
  status: string;
}

export interface categoryEdit {
  name: string;
  description: string;
}

export interface categoryEditFormError {
  name: string;
  description: string;
}

export interface formCategory {
  name: string;
  description: string;
  status: boolean;
}
export interface formCategoryChangeStatus {
  id: string;
  status: boolean;
}

export const initialCategoryError: errorCategory = {
  name: "",
  description: "",
  status: "",
};

export const initialFormCategory: formCategory = {
  name: "",
  description: "",
  status: true,
};

export const initialFormCategoryChangeStatus: formCategoryChangeStatus = {
  id: "",
  status: true,
};

export const initialCategoryEditFormError: categoryEditFormError = {
  name: "",
  description: "",
};

export const initialCategoryEdit: categoryEdit = {
  name: "",
  description: "",
};

export type ExistingImage = {
  uuid: string;
  path: string;
  image: string;
  status: "active" | "inactive" | "archived";
};

export interface productCategoryList {
  uuid: string;
  name: string;
}

export interface productImages {
  uuid: string;
  image: string;
  path: string;
  url: string;
}

export interface pagination {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}
export interface product {
  tagId: string;
  uuid: string;
  name: string;
  detail: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "archived";
  createdAt: Date;
  categories: productCategoryList[];
  images: productImages[];
}
export interface productResponse {
  data: product[];
  pagination: pagination;
}
export const initialProductCategoryList: productCategoryList = {
  uuid: "",
  name: "", 
};
export const initialProduct: product = {
  tagId: "",
  uuid: "",
  name: "",
  detail: "",
  price: 0, 
  stock: 0,
  status: "active", 
  createdAt: new Date(),
  categories: [], 
  images: [],
};

export interface productForm {
  name: string;
  detail: string;
  price: string;
  stock: string;
  status: "active" | "inactive";
  categoryIds: string[];
  images: File[];
}

export const initialProductForm: productForm = {
  name: "",
  detail: "",
  price: "",
  stock: "",
  status: "active",
  categoryIds: [],
  images: [],
};

export interface productFormError {
  name: string;
  detail: string;
  price: string;
  stock: string;
  status: string;
  categoryIds: string;
  images: string;
}

export const initialProductFormError: productFormError = {
  name: "",
  detail: "",
  price: "",
  stock: "",
  status: "",
  categoryIds: "",
  images: "",
};

export interface productEditForm {
  name: string;
  detail: string;
  price: string;
  stock: string;
  categoryIds: string[];
  images: File[];
}

export const initialProductEditForm: productEditForm = {
  name: "",
  detail: "",
  price: "",
  stock: "",
  categoryIds: [],
  images: [],
};
export interface productEditFormError {
  name: string;
  detail: string;
  price: string;
  stock: string;
  categoryIds: string;
}

export const initialProductEditFormError: productEditFormError = {
  name: "",
  detail: "",
  price: "",
  stock: "",
  categoryIds: "",
};

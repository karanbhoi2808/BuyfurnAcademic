export interface ProductImage {
  id: number;
  name: string;
  type: string;
  path: string;
  url: string;
  sequence?: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  productImages: ProductImage[];
  carts?: any;
  price: number;
  warranty: string;
  category: string;
  color: string;
  material: string;
  seatingCapacity: number;
  weight: number;
  careAndMaintenance: string;
  stockStatus: string;
  createdDate?: string | Date;
}

export interface ProductFilterParams {
  pageNumber?: number;
  pageSize?: number;
  searchKey?: string;
  searchCategory?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc' | string;
}

export interface ProductPageResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

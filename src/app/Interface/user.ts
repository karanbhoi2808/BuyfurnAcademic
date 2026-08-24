export interface User {
    id?: number;
    name: string;
    email: string;
    pasword?: string;
    roles?: string[];
}

export interface UserAddress {
    address?: string;
    pincode?: string;
    city?: string;
    state?: string;
    [key: string]: any;
}

export interface UserAccount {
    id?: number | string;
    name: string;
    email: string;
    roles: string[];
    contactNumber?: string;
    contact?: string;
    address?: UserAddress;
    [key: string]: any;
}

export interface UserFilterParams {
    pageNumber?: number;
    pageSize?: number;
    searchKey?: string;
    sortBy?: string;
    sortDir?: string;
    role?: string;
}

export interface UserPageResponse {
    totalUsers: number;
    administratorsCount: number;
    customersCount: number;
    totalPages: number;
    currentPage: number;
    users: UserAccount[];
}


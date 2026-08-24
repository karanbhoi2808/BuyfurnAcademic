export interface OrderDetails {
    fullName: string;
    address: any;
    contactNumber: string;
    orderquantities: any;
    transactionId: string;
}

export interface PeakMonthStats {
    month: string;
    revenue: number;
}

export interface AnalyticsSummary {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    deliveredCount: number;
    placedCount: number;
    peakMonth?: PeakMonthStats;
}

export interface MonthlyStats {
    month: string;
    orderCount: number;
    totalPrice: number;
    avgOrderValue: number;
    percentage: number;
}

export interface CategoryStats {
    category: string;
    count: number;
    revenue: number;
}

export interface StatusBreakdown {
    delivered: number;
    placed: number;
    [key: string]: number;
}

export interface OrderAnalyticsResponse {
    summary: AnalyticsSummary;
    monthlyBreakdown: MonthlyStats[];
    categoryBreakdown: CategoryStats[];
    statusBreakdown: StatusBreakdown;
}

export interface ProductImage {
    name?: string;
    url?: string;
}

export interface OrderProduct {
    id?: number;
    title?: string;
    price?: number;
    category?: string;
    productImages?: ProductImage[];
    [key: string]: any;
}

export interface OrderUser {
    name?: string;
    userName?: string;
    email?: string;
    [key: string]: any;
}

export interface OrderAddress {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    [key: string]: any;
}

export interface OrderItem {
    orderId: number;
    orderStatus: 'Placed' | 'Delivered' | string;
    createdDate?: string | Date;
    contact?: string;
    user?: OrderUser;
    address?: OrderAddress;
    product?: OrderProduct;
    [key: string]: any;
}

export interface OrderFilterParams {
    pageNumber?: number;
    pageSize?: number;
    searchKey?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
}

export interface OrderPageResponse {
    totalOrders: number;
    placedCount: number;
    deliveredCount: number;
    totalRevenue: number;
    totalPages: number;
    currentPage: number;
    orders: OrderItem[];
}



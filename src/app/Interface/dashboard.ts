export interface GrossRevenueCount {
  amount: number;
  ordersProcessed: number;
}

export interface TotalOrdersCount {
  total: number;
  pendingDispatch: number;
  delivered: number;
}

export interface ActiveCatalogueCount {
  liveItems: number;
}

export interface RegisteredAccountsCount {
  total: number;
}

export interface DashboardCountsResponse {
  grossRevenue: GrossRevenueCount;
  totalOrders: TotalOrdersCount;
  activeCatalogue: ActiveCatalogueCount;
  registeredAccounts: RegisteredAccountsCount;
}

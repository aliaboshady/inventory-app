export interface IPaginated {
  data: any[];
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedResult {
  data: any[]
  meta: {
    total: number
    page: number
  }
}

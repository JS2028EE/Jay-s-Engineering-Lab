// Query factory creates a fresh Supabase builder for each page.
export async function fetchAllRows(queryFactory, pageSize = 100) {
  const rows = []
  for (let offset = 0; ; offset += pageSize) {
    const result = await queryFactory().range(offset, offset + pageSize - 1)
    if (result.error) throw result.error
    const page = result.data || []
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}

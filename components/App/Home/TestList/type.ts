export type TestItemStatus =
  | 'Completed'
  | 'Collecting response'
  | 'Draft: Create'
  | 'Draft: Recruit'

export interface TestListItem {
  title: string
  date: string
  responses: Number
  notes: Number
  status: TestItemStatus
  id: string
  favourite?: boolean
}

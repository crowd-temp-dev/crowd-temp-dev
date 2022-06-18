import { TestListItem } from '~/components/App/Home/TestList/type'
import { uid } from '~/utils'

export interface TestListState {
  items: TestListItem[]
  showFavourite: boolean
}

export default function state(): TestListState {
  return {
    items: [
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 100,
        notes: 3,
        status: 'Completed',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 2,
        notes: 0,
        status: 'Collecting response',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Create',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Recruit',
      },

      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 100,
        notes: 3,
        status: 'Completed',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 2,
        notes: 0,
        status: 'Collecting response',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Create',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Recruit',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 100,
        notes: 3,
        status: 'Completed',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 2,
        notes: 0,
        status: 'Collecting response',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Create',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Recruit',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 100,
        notes: 3,
        status: 'Completed',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 2,
        notes: 0,
        status: 'Collecting response',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Create',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Recruit',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 100,
        notes: 3,
        status: 'Completed',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 2,
        notes: 0,
        status: 'Collecting response',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Create',
      },
      {
        id: uid(),
        title: 'New Test',
        date: 'Created 12/03/2022 09:00AM',
        responses: 0,
        notes: 0,
        status: 'Draft: Recruit',
      },
    ],

    showFavourite: false,
  }
}

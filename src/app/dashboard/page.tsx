import { ListItem } from "@/components/common/OpenedListBox";
import { Dashboard } from "@/components/Dashboard";

export default async function DashboardPage() {
  
  return (
    <Dashboard
      readyToServeList={cachedReadyToServeList}
      inProgressList={cachedInProgressList}
      pendingList={cachedPendingList}
    /> 
  )
}

const cachedReadyToServeList: ListItem[] = [
    {
      id: '1',
      label: '532',
      description: 'Large Fries • 2x Cheeseburger • Coke Zero',
      meta: 'Ready',
      actions: [
        { key: 'complete', label: 'Complete' },
        { key: 'inProgress', label: 'In Progress' },
        { key: 'pending', label: 'Pending' },
        { key: 'cancel', label: 'Cancel' },
      ],
    },
    {
      id: '2',
      label: '533',
      description: 'McNuggets 6 • Sundae (Choc)',
      meta: 'Prep',
      actions: [
        { key: 'complete', label: 'Complete' },
        { key: 'inProgress', label: 'In Progress' },
        { key: 'pending', label: 'Pending' },
        { key: 'cancel', label: 'Cancel' },
      ],
    },
    {
      id: '3',
      label: '534',
      description: 'Big Mac • Apple Pie',
      meta: <span className="text-[10px]">2 min</span>,
      actions: [
        { key: 'complete', label: 'Complete' },
        { key: 'inProgress', label: 'In Progress' },
        { key: 'pending', label: 'Pending' },
        { key: 'cancel', label: 'Cancel' },
      ],
    },
  ]

  const cachedInProgressList: ListItem[] = [
      {
        id: '1',
        label: '532',
        description: 'Large Fries • 2x Cheeseburger • Coke Zero',
        meta: 'Ready',
        actions: [
          { key: 'readyToServe', label: 'Ready to serve' },
          { key: 'pending', label: 'Pending' },
          { key: 'cancel', label: 'Cancel' },
        ],
      },
      {
        id: '2',
        label: '533',
        description: 'McNuggets 6 • Sundae (Choc)',
        meta: 'Prep',
        actions: [
          { key: 'readyToServe', label: 'Ready to serve' },
          { key: 'pending', label: 'Pending' },
          { key: 'cancel', label: 'Cancel' },
        ],
      },
      {
        id: '3',
        label: '534',
        description: 'Big Mac • Apple Pie',
        meta: <span className="text-[10px]">2 min</span>,
        actions: [
          { key: 'readyToServe', label: 'Ready to serve' },
          { key: 'pending', label: 'Pending' },
          { key: 'cancel', label: 'Cancel' },
        ],
      },
    ]

    const cachedPendingList: ListItem[] = [
        {
          id: '1',
          label: '532',
          description: 'Large Fries • 2x Cheeseburger • Coke Zero',
          meta: 'Ready',
          actions: [
            { key: 'inprogress', label: 'In Progress' },
            { key: 'cancel', label: 'Cancel' },
          ],
        },
        {
          id: '2',
          label: '533',
          description: 'McNuggets 6 • Sundae (Choc)',
          meta: 'Prep',
          actions: [
            { key: 'inprogress', label: 'In Progress' },
            { key: 'cancel', label: 'Cancel' },
          ],
        },
        {
          id: '3',
          label: '534',
          description: 'Big Mac • Apple Pie',
          meta: <span className="text-[10px]">2 min</span>,
          actions: [
            { key: 'inprogress', label: 'In Progress' },
            { key: 'cancel', label: 'Cancel' },
          ],
        },
      ]
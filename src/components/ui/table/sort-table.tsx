import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  Center,
  Group,
  keys,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import classes from './sort-table.module.css'

interface RowData {
  date: string
  role: string
  poster: string
  title: string
  id: number
}

interface ThProps {
  children: React.ReactNode
  reversed: boolean
  sorted: boolean
  onSort: () => void
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted ? (reversed ? Search : Search) : Search
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  )
}

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim()
  return data.filter((item) =>
    keys(data[0]).some((key) =>
      item[key].toString().toLowerCase().includes(query),
    ),
  )
}

function sortData(
  data: RowData[],
  payload: {
    sortBy: keyof Omit<RowData, 'id'> | null
    reversed: boolean
    search: string
  },
) {
  const { sortBy } = payload

  if (!sortBy) {
    return filterData(data, payload.search)
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy])
      }

      return a[sortBy].localeCompare(b[sortBy])
    }),
    payload.search,
  )
}

const TableSort = ({
  data,
  onTitleClick,
}: {
  data: RowData[]
  onTitleClick: (id: number, type: 'movie', label: string) => void
}) => {
  const [search, setSearch] = useState('')
  const [sortedData, setSortedData] = useState(data)
  const [sortBy, setSortBy] = useState<keyof Omit<RowData, 'id'> | null>(null)
  const [reverseSortDirection, setReverseSortDirection] = useState(false)

  const setSorting = (field: keyof Omit<RowData, 'id'>) => {
    const reversed = field === sortBy ? !reverseSortDirection : false
    setReverseSortDirection(reversed)
    setSortBy(field)
    setSortedData(sortData(data, { sortBy: field, reversed, search }))
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget
    setSearch(value)
    setSortedData(
      sortData(data, { sortBy, reversed: reverseSortDirection, search: value }),
    )
  }

  const rows = sortedData.map((row) => (
    <Table.Tr key={row.title}>
      <Table.Td>{new Date(row.date).getFullYear()}</Table.Td>
      <Table.Td>
        <span
          className="hover:cursor-pointer hover:underline"
          onClick={() => {
            onTitleClick(row.id, 'movie', row.title)
          }}
        >
          {row.title}
        </span>
      </Table.Td>
      <Table.Td>{row.role}</Table.Td>
    </Table.Tr>
  ))

  return (
    <ScrollArea>
      <TextInput
        placeholder="Search by any field"
        mb="sm"
        leftSection={<Search size={16} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        miw={700}
        layout="fixed"
      >
        <Table.Tbody>
          <Table.Tr>
            <Th
              sorted={sortBy === 'date'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('date')}
            >
              Year
            </Th>
            <Th
              sorted={sortBy === 'title'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('title')}
            >
              Title
            </Th>
            <Th
              sorted={sortBy === 'role'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('role')}
            >
              Role
            </Th>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={Object.keys(data[0]).length}>
                <Text fw={500} ta="center">
                  Nothing found
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}

export default TableSort

import { useState } from 'react'
import {
  Table,
  ScrollArea,
  TextInput,
  UnstyledButton,
  Group,
  Text,
  Center,
} from '@mantine/core'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronUp,
  SearchIcon,
  ChevronsUpDown,
} from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  striped?: boolean
  highlightOnHover?: boolean
  searchPlaceholder?: string
  onClickName?: (rowData: TData) => void
}

function DataTable<TData, TValue>({
  columns,
  data,
  striped,
  highlightOnHover = true,
  searchPlaceholder = 'Search all columns...',
  onClickName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      onClickName,
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <TextInput
        placeholder={searchPlaceholder}
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.currentTarget.value)}
        leftSection={<SearchIcon size={16} />}
        className="w-full"
      />
      <ScrollArea>
        <Table striped={striped} highlightOnHover={highlightOnHover}>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup, indx) => (
              <Table.Tr key={`${headerGroup.id}-${indx}`}>
                {headerGroup.headers.map((header, idx) => {
                  const isSortable = header.column.getCanSort()
                  const sortedState = header.column.getIsSorted()

                  return (
                    <Table.Th key={`${header.id}-${indx}-${idx}`}>
                      {header.isPlaceholder ? null : isSortable ? (
                        <UnstyledButton
                          onClick={header.column.getToggleSortingHandler()}
                          className="w-full"
                        >
                          <Group justify="space-between" wrap="nowrap">
                            <Text fw={500} fz="sm">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </Text>
                            <Center>
                              {sortedState === 'desc' ? (
                                <ChevronDown size={16} />
                              ) : sortedState === 'asc' ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronsUpDown size={16} />
                              )}
                            </Center>
                          </Group>
                        </UnstyledButton>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </Table.Th>
                  )
                })}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, indx) => (
                <Table.Tr key={`${row.id}-${indx}`} className="m-0 p-0">
                  {row.getVisibleCells().map((cell, idx) => (
                    <Table.Td
                      key={`${cell.id}-${indx}-${idx}`}
                      className="p-0.5! m-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length} className="text-center">
                  No results found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </div>
  )
}

export default DataTable

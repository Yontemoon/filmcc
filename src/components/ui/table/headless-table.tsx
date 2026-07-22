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
import classes from './table.module.css'
import Paper from '#/components/ui/paper/paper'

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
  striped = false,
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
    <div className={classes.tableContainer}>
      <TextInput
        placeholder={searchPlaceholder}
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.currentTarget.value)}
        leftSection={<SearchIcon size={16} />}
      />
      <ScrollArea>
        <Paper
          withBorder
          classNames={{
            root: classes.tableContainer,
          }}
        >
          <Table
            striped={striped}
            highlightOnHover={highlightOnHover}
            verticalSpacing={'xs'}
            className={classes.table}
            classNames={{
              tr: classes.tableRow,
              td: classes.tableCell,
              th: classes.tableHead,
            }}
          >
            <Table.Thead className={classes.tHead}>
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
                  <Table.Tr key={`${row.id}-${indx}`}>
                    {row.getVisibleCells().map((cell, idx) => (
                      <Table.Td key={`${cell.id}-${indx}-${idx}`} className="">
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
                  <Table.Td colSpan={columns.length}>
                    No results found.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      </ScrollArea>
    </div>
  )
}

export default DataTable

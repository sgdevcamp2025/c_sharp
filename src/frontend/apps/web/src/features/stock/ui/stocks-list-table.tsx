'use client';

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Stock, columns } from '../model';
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components';
import { useRouter } from 'next/navigation';

const Stockdata: Stock[] = [
  {
    id: '1',
    name: '삼성전자',
    currPrice: '53700',
    fluctuation: '+0.00',
    volume: '1000',
    slug: 'samsung-electronics',
  },
  {
    id: '2',
    name: 'SK하이닉스',
    currPrice: '221000',
    fluctuation: '+0.68',
    volume: '1000',
    slug: 'sk-hynix',
  },
  {
    id: '3',
    name: '카카오',
    currPrice: '35750',
    fluctuation: '+0.00',
    volume: '1000',
    slug: 'kakao',
  },
  {
    id: '4',
    name: '네이버',
    currPrice: '204000',
    fluctuation: '-0.24',
    volume: '1000',
    slug: 'naver',
  },
  {
    id: '5',
    name: '한화에어로스페이스',
    currPrice: '411500',
    fluctuation: '+7.30',
    volume: '1000',
    slug: 'hanwha-aerospace',
  },
];

const StocksListTable = () => {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: Stockdata,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  return (
    <div className="w-3/4 h-1/2 shadow-s flex flex-col gap-3">
      <div className="flex flex-row">
        <Input
          placeholder="주식 종목명을 검색하세요."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => {
                  router.push(`/${row.original.slug ?? ''}`);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="w-full text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default StocksListTable;

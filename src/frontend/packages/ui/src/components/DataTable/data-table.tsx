'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../Table';
import { Button } from '../Button';
import { ArrowUpDown } from 'lucide-react';

export type Stock = {
  id: string;
  name: string;
  currPrice: string;
  fluctuation: string;
  volume: string;
};

export const columns: ColumnDef<Stock>[] = [
  {
    accessorKey: 'name',
    header: () => <div className="text-left">종목명</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'currPrice',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        현재가
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('currPrice'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        currency: 'KRW',
      }).format(price);
      return <div className="text-right font-medium">{`${formatted}원`}</div>;
    },
  },
  {
    accessorKey: 'fluctuation',
    accessorFn: (row) => parseFloat(row.fluctuation),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        등락률
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('fluctuation')}%</div>,
  },
  {
    accessorKey: 'volume',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        거래량
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('volume')}</div>,
  },
];

export function DataTable({ data }: { data: Stock[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="flex w-[600px] flex-wrap">
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
                          header.getContext()
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
                data-state={row.getIsSelected() && 'selected'}
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

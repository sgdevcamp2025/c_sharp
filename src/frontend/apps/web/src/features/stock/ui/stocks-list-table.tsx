'use client';

import { SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useState } from 'react';
import { columns } from '../model';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components';

const Stockdata = [
  {
    id: '1',
    name: '삼성전자',
    currPrice: '53700',
    fluctuation: '+0.00',
    volume: '1000',
    stockSlug: 'samsung-electronics',
  },
  {
    id: '2',
    name: 'SK하이닉스',
    currPrice: '221000',
    fluctuation: '+0.68',
    volume: '1000',
    stockSlug: 'sk-hynix',
  },
  {
    id: '3',
    name: '카카오',
    currPrice: '35750',
    fluctuation: '+0.00',
    volume: '1000',
    stockSlug: 'kakao',
  },
  {
    id: '4',
    name: '네이버',
    currPrice: '204000',
    fluctuation: '-0.24',
    volume: '1000',
    stockSlug: 'naver',
  },
  {
    id: '5',
    name: '한화에어로스페이스',
    currPrice: '411500',
    fluctuation: '+7.30',
    volume: '1000',
    stockSlug: 'hanwha-aerospace',
  },
];

const StocksListTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: Stockdata,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });
  return (
    <div className="w-3/4 shadow-s">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
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
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
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

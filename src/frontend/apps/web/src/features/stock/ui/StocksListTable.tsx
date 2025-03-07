'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
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

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components';
import { RealTimeStock } from '@/src/entities/stock';

import { columns } from '../model';

export const RealTimeDummy: RealTimeStock[] = [
  {
    slug: 'samsung-electronics',
    name: '삼성전자',
    businessDate: '2025-02-27',
    code: '005930',
    tradingTime: '15:30:00',
    currentPrice: '78,500',
    priceChange: '+1,200',
    openPrice: '77,800',
    highPrice: '79,200',
    lowPrice: '77,500',
    tradingVolume: '18,950,000',
    totalTradeAmount: '1,487,850,000,000',
  },
  {
    slug: 'sk-hynix',
    name: 'SK하이닉스',
    businessDate: '2025-02-27',
    code: '000660',
    tradingTime: '15:30:00',
    currentPrice: '125,000',
    priceChange: '+2,000',
    openPrice: '123,500',
    highPrice: '126,300',
    lowPrice: '122,800',
    tradingVolume: '9,560,300',
    totalTradeAmount: '1,195,780,000,000',
  },
  {
    slug: 'hanwha-aerospace',
    name: '한화에어로스페이스',
    businessDate: '2025-02-27',
    code: '012450',
    tradingTime: '15:30:00',
    currentPrice: '98,700',
    priceChange: '-500',
    openPrice: '99,200',
    highPrice: '100,000',
    lowPrice: '97,800',
    tradingVolume: '1,230,500',
    totalTradeAmount: '121,563,750,000',
  },
  {
    slug: 'kakao',
    name: '카카오',
    businessDate: '2025-02-27',
    code: '035720',
    tradingTime: '15:30:00',
    currentPrice: '53,200',
    priceChange: '-1,100',
    openPrice: '54,000',
    highPrice: '54,500',
    lowPrice: '52,900',
    tradingVolume: '5,780,400',
    totalTradeAmount: '307,226,000,000',
  },
  {
    slug: 'naver',
    name: '네이버',
    businessDate: '2025-02-27',
    code: '035420',
    tradingTime: '15:30:00',
    currentPrice: '210,500',
    priceChange: '+3,000',
    openPrice: '208,000',
    highPrice: '211,800',
    lowPrice: '207,500',
    tradingVolume: '3,120,800',
    totalTradeAmount: '656,145,400,000',
  },
];

const StocksListTable = () => {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // const { stockData } = useWebSocket();

  // const formatted = stockData.map((data) =>
  //   StockForTable(data.data, data.code),
  // );
  console.log(RealTimeDummy);
  const table = useReactTable({
    data: RealTimeDummy,
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
    <div className="w-3/4 h-2/3 shadow-s flex flex-col gap-3">
      <div className="flex flex-row justify-between">
        <Input
          placeholder="주식 종목명을 검색하세요."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                if (column.id === 'name') return;

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table className="table-fixed">
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
                  router.push(`/stock/${row.original.slug ?? ''}`);
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

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@workspace/ui/components';

import type { RealTimeStock } from '@/src/entities/stock';

export const columns: ColumnDef<RealTimeStock>[] = [
  {
    accessorKey: 'name',
    header: () => <div className="text-left">종목명</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue('name')}</div>,
  },
  {
    id: 'currentPrice',
    accessorFn: (row) => parseFloat(row.currentPrice),
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
      const price = parseFloat(row.getValue('currentPrice'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        currency: 'KRW',
      }).format(price);
      return <div className="text-right font-medium">{`${formatted}원`}</div>;
    },
  },
  {
    id: 'priceChange',
    accessorFn: (row) => parseFloat(row.priceChange),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        등락률
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('priceChange')}%</div>,
  },
  {
    id: 'tradingVolume',
    accessorFn: (row) => parseFloat(row.tradingVolume),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        거래량
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('tradingVolume')}</div>,
  },
];

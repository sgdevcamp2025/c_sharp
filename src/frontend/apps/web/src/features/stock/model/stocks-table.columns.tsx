import { ColumnDef } from '@tanstack/react-table';
import { Stock } from './stock.types';
import { Button } from '@workspace/ui/components';
import { ArrowUpDown } from 'lucide-react';

export const columns: ColumnDef<Stock>[] = [
  {
    accessorKey: 'name',
    header: () => <div className="text-left">종목명</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue('name')}</div>,
  },
  {
    id: 'currPrice',
    accessorFn: (row) => parseFloat(row.currPrice),
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
    id: 'fluctuation',
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
    id: 'volume',
    accessorFn: (row) => parseFloat(row.volume),
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

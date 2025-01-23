import { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './table';

const meta: Meta<typeof Table> = {
  title: 'Widget/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <div className="flex w-[600px] flex-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">종목</TableHead>
            <TableHead>현재가</TableHead>
            <TableHead>등락률</TableHead>
            <TableHead>거래량</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="text-left">삼성전자</TableCell>
              <TableCell>10,000</TableCell>
              <TableCell>+00.0%</TableCell>
              <TableCell>1,000</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

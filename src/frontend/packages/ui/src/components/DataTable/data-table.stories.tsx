import { Meta, StoryObj } from '@storybook/react';
import { DataTable, Stock } from './data-table';

const meta: Meta<typeof DataTable> = {
  title: 'Widget/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DataTable>;

const sampleData: Stock[] = [
  {
    id: '1',
    name: 'Samsung',
    currPrice: '10000',
    fluctuation: '+0.1',
    volume: '1000',
  },
  {
    id: '2',
    name: 'Apple',
    currPrice: '20000',
    fluctuation: '+0.2',
    volume: '2000',
  },
  {
    id: '3',
    name: 'Google',
    currPrice: '30000',
    fluctuation: '-0.3',
    volume: '3000',
  },
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
};

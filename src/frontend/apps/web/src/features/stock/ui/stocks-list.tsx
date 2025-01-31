import { DataTable } from '@workspace/ui/components';

const StocksList = () => {
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
  return (
    <div className="w-3/4 shadow-s">
      <DataTable data={Stockdata} />
    </div>
  );
};
export default StocksList;

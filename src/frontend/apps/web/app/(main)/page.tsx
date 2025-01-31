import { StocksList } from '@/src/features/stock';
import { Button } from '@workspace/ui/components';
import Link from 'next/link';

export const metadata = {
  title: '주식 리스트 - 실시간 주식 정보',
  description: '삼성전자, SK하이닉스, 카카오, 네이버, 한화에어로스페이스의 실시간 주식 정보를 확인하세요.',
  keywords: '주식, 삼성전자, SK하이닉스, 카카오, 네이버, 한화에어로스페이스, 주식 정보',
};

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <Button size="sm">
        <Link href="/tesla">상세페이지로 이동</Link>
      </Button>
      <StocksList />
    </div>
  );
}

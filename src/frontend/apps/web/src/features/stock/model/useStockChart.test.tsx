import React, { useRef } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CHART_TYPES } from '@/src/entities/stock';
import { useStockChart } from './useStockChart';

// lightweight-charts 모듈 모킹
const mockApplyOptions = vi.fn();
const mockTimeScale = { applyOptions: mockApplyOptions };
const mockSetData = vi.fn();
const dummySeries = { setData: mockSetData };
const mockAddSeries = vi.fn(() => dummySeries);
const mockResize = vi.fn();
const mockRemove = vi.fn();

const dummyChart = {
  timeScale: () => mockTimeScale,
  addSeries: mockAddSeries,
  resize: mockResize,
  remove: mockRemove,
};

vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => dummyChart),
  CandlestickSeries: 'CandlestickSeries',
  LineSeries: 'LineSeries',
  HistogramSeries: 'HistogramSeries',
}));

// ResizeObserver 모킹: 생성 시 콜백을 전역 변수에 저장
let capturedResizeCallback: (() => void) | null = null;
const disconnectSpy = vi.fn();
class FakeResizeObserver {
  constructor(callback: () => void) {
    capturedResizeCallback = callback;
  }
  observe() {}
  disconnect() {
    disconnectSpy();
  }
}
global.ResizeObserver = FakeResizeObserver as any;

// TestComponent: 정상 동작하는 컴포넌트
const TestComponent = ({
  chartType,
  data,
}: {
  chartType: string;
  data: any[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useStockChart(chartType, containerRef, data);
  return (
    <div
      ref={containerRef}
      style={{ width: '500px', height: '300px' }}
      data-testid="chart-container"
    >
      Chart Container
    </div>
  );
};

// DummyComponent: containerRef.current를 강제로 null로 설정하기 위한 컴포넌트
const DummyComponent = () => {
  // 여기서는 useRef를 사용하지 않고, 직접 { current: null } 객체를 전달합니다.
  const fakeRef = { current: null } as React.RefObject<HTMLDivElement>;
  const result = useStockChart(CHART_TYPES.Line, fakeRef, []);
  return <div>Dummy</div>;
};

describe('useStockChart', () => {
  const originalClientWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'clientWidth',
  );
  const originalClientHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'clientHeight',
  );

  beforeEach(() => {
    vi.clearAllMocks();
    capturedResizeCallback = null;
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 500,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get: () => 300,
    });
  });

  afterEach(() => {
    if (originalClientWidth) {
      Object.defineProperty(
        HTMLElement.prototype,
        'clientWidth',
        originalClientWidth,
      );
    }
    if (originalClientHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        'clientHeight',
        originalClientHeight,
      );
    }
    vi.resetAllMocks();
  });

  it('should do nothing if chartContainerRef.current is null', () => {
    // DummyComponent를 렌더링하여, containerRef.current가 null인 경우를 테스트
    const { container } = render(<DummyComponent />);
    // DummyComponent 내에서는 useStockChart가 실행되었으나, containerRef.current가 null이므로 chartRef는 그대로 null이어야 합니다.
    // 여기서 우리는 useStockChart의 반환값을 직접 테스트할 수 없으므로, 대신 에러 없이 렌더링되었음을 검증합니다.
    expect(container.textContent).toContain('Dummy');
  });

  it('should create a chart, add Candlestick series and set data', async () => {
    const data = [
      { time: 1672563300, open: 100, high: 110, low: 90, close: 105 },
    ];
    const { container } = render(
      <TestComponent
        chartType={CHART_TYPES.Candlestick}
        data={data}
      />,
    );
    // container.firstChild는 chartContainer div
    expect(
      (await import('lightweight-charts')).createChart,
    ).toHaveBeenCalledWith(
      container.firstChild,
      expect.objectContaining({ width: 500, height: 300 }),
    );
    expect(mockAddSeries).toHaveBeenCalledWith(
      'CandlestickSeries',
      expect.any(Object),
    );
    expect(mockSetData).toHaveBeenCalledWith(data);
  });

  it('should create a chart, add Line series and set data', () => {
    const data = [{ time: 1672563300, value: 105 }];
    render(
      <TestComponent
        chartType={CHART_TYPES.Line}
        data={data}
      />,
    );
    expect(mockAddSeries).toHaveBeenCalledWith(
      'LineSeries',
      expect.any(Object),
    );
    expect(mockSetData).toHaveBeenCalledWith(data);
  });

  it('should create a chart, add Histogram series and set data', () => {
    const data = [{ time: 1672563300, value: 1000 }];
    render(
      <TestComponent
        chartType={CHART_TYPES.Histogram}
        data={data}
      />,
    );
    expect(mockAddSeries).toHaveBeenCalledWith(
      'HistogramSeries',
      expect.any(Object),
    );
    expect(mockSetData).toHaveBeenCalledWith(data);
  });

  it('should handle cleanup: disconnect observer and remove chart', () => {
    const data = [{ time: 1672563300, value: 105 }];
    const { unmount } = render(
      <TestComponent
        chartType={CHART_TYPES.Line}
        data={data}
      />,
    );
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('should resize the chart when container size changes', async () => {
    const data = [{ time: 1672563300, value: 105 }];
    const { container, getByTestId } = render(
      <TestComponent
        chartType={CHART_TYPES.Line}
        data={data}
      />,
    );
    const chartContainer = getByTestId('chart-container');

    // 재정의를 위해 chartContainer의 clientWidth/clientHeight를 새 값으로 설정
    Object.defineProperty(chartContainer, 'clientWidth', {
      value: 600,
      configurable: true,
    });
    Object.defineProperty(chartContainer, 'clientHeight', {
      value: 400,
      configurable: true,
    });

    // capturedResizeCallback이 존재하는지 확인하고, 직접 호출
    expect(capturedResizeCallback).toBeTypeOf('function');
    act(() => {
      capturedResizeCallback && capturedResizeCallback();
    });

    await waitFor(() => {
      expect(mockResize).toHaveBeenCalledWith(600, 400);
    });
  });
});

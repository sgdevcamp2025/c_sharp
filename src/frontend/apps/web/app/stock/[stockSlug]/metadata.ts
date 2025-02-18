export async function generateMetadata({ params }) {
  const { stockSlug } = params;

  return {
    title: `${stockSlug} - 주식 정보`,
    description: `${stockSlug}의 최신 주식 정보를 확인하세요.`,
    keywords: `주식, ${stockSlug}, 주식 정보`,
  };
}

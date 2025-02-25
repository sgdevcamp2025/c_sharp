import type { GetServerSideProps } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/shared';
import { getWorkspaceList } from '../api';

export type WorkspacePageProps = {
  workspaceId: number;
};

export const getWorkspacePageProps: GetServerSideProps<
  WorkspacePageProps
> = async (context) => {
  const { workspaceId } = context.params as { workspaceId: string };
  const queryClient = new QueryClient();

  const queryKey = QUERY_KEYS.workspaceList(Number(workspaceId));
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getWorkspaceList(Number(workspaceId)),
  });

  return {
    props: {
      workspaceId: Number(workspaceId),
      dehydratedState: dehydrate(queryClient),
    },
  };
};

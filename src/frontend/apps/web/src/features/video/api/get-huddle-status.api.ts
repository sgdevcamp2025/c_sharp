'use server';

import { serverFetchInstance } from '@/src/shared/services';

export const getHuddleStatus = async (channeld: any) => {
  try {
    const staus = serverFetchInstance(`/api/v1/huddle/${channeld}`, 'GET');
  } catch (err) {
    console.error(err);
  }
};

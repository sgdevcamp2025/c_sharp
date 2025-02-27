import { z } from 'zod';

export const WorkspaceFormSchema = z.object({
  workspace: z
    .string()
    .min(2, { message: '워크스페이스 이름은 2글자 이상이어야 합니다.' })
    .max(30, { message: '워크스페이스 이름은 30글자 이하여야 합니다.' }),
});

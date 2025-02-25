import { useEffect } from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@workspace/ui/components/Input/input';
import { Button } from '@workspace/ui/components/Button/button';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: '사용자 이름은 2글자 이상이어야 합니다.' })
    .max(30, { message: '사용자 이름은 30글자 이하여야 합니다.' }),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
});

const meta: Meta<typeof Form> = {
  title: 'Widget/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

// 기본 Form 예시
export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        email: '',
      },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
      console.log(values);
      alert(JSON.stringify(values, null, 2));
    };

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-[400px]"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>사용자 이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="홍길동"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  공개 프로필에 표시될 이름입니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  알림을 받을 이메일 주소입니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">제출</Button>
        </form>
      </Form>
    );
  },
};

// 에러 상태 Form 예시
export const WithErrors: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        email: '',
      },
      mode: 'onChange',
    });

    // 강제로 에러 표시
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      form.setError('username', {
        type: 'manual',
        message: '사용자 이름은 2글자 이상이어야 합니다.',
      });
      form.setError('email', {
        type: 'manual',
        message: '유효한 이메일 주소를 입력해주세요.',
      });
    }, [form]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
      console.log(values);
      alert(JSON.stringify(values, null, 2));
    };

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-[400px]"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>사용자 이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="홍길동"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  공개 프로필에 표시될 이름입니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  알림을 받을 이메일 주소입니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">제출</Button>
        </form>
      </Form>
    );
  },
};

// 다양한 폼 요소 예시
export const ComplexForm: Story = {
  render: () => {
    // 복잡한 폼 스키마 정의
    const complexSchema = z.object({
      name: z.string().min(2, { message: '이름은 2글자 이상이어야 합니다.' }),
      email: z
        .string()
        .email({ message: '유효한 이메일 주소를 입력해주세요.' }),
      bio: z
        .string()
        .max(160, { message: '자기소개는 160자 이내로 작성해주세요.' })
        .optional(),
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm<z.infer<typeof complexSchema>>({
      resolver: zodResolver(complexSchema),
      defaultValues: {
        name: '',
        email: '',
        bio: '',
      },
    });

    const onSubmit = (values: z.infer<typeof complexSchema>) => {
      console.log(values);
      alert(JSON.stringify(values, null, 2));
    };

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-[400px]"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="홍길동"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>자기소개</FormLabel>
                <FormControl>
                  <textarea
                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="간단한 자기소개를 작성해주세요."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  프로필에 표시될 자기소개입니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit">저장하기</Button>
          </div>
        </form>
      </Form>
    );
  },
};

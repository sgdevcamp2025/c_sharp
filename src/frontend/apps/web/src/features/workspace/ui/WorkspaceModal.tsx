'use client';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@workspace/ui/components';

import { WorkspaceFormSchema } from '@/src/entities/workspace';

type FormValues = z.infer<typeof WorkspaceFormSchema>;

type WorkspaceModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  size?: 'default' | 'lg';
  className?: string;
  onSubmit?: (data: FormValues) => void;
};

const WorkspaceModal = ({
  isOpen,
  setIsOpen,
  className = '',
  onSubmit: externalSubmit,
}: WorkspaceModalProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(WorkspaceFormSchema),
    defaultValues: { workspace: '' },
  });

  const handleSubmit = (values: FormValues) => {
    if (externalSubmit) {
      externalSubmit(values);
    } else {
      // console.log(values);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    form.setError('workspace', {
      type: 'manual',
      message: '워크스페이스명은 2글자 이상이어야 합니다.',
    });
  }, [form]);

  const [showModal, setShowModal] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);

      setTimeout(() => setAnimate(true), 20);
    } else {
      setAnimate(false);

      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className={`bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ${
            animate
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95'
          } ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="workspace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>워크스페이스 이름</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="생성할 워크스페이스 이름을 입력해주세요."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      워크스페이스 채널 리스트에 표시될 이름입니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">생성</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default WorkspaceModal;

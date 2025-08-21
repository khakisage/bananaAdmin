"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const schema = z.object({
  title: z.string().min(1, "제목을 입력하세요."),
  description: z.string().min(1, "설명을 입력하세요."),
  price: z.coerce.number().min(0, "0 이상이어야 합니다."),
});

export default function ProductForm({
  defaultValues,
  onSubmit,
  submitText = "저장",
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      price: "",
    },
  });

  // 기존(수정 모달용) 이미지 URL들
  const [existingUrls, setExistingUrls] = useState(() =>
    Array.isArray(defaultValues?.imageUrls) ? defaultValues.imageUrls : []
  );
  // 새로 추가된 파일들
  const [files, setFiles] = useState([]); // File[]
  const [filePreviews, setFilePreviews] = useState([]); // string[] (ObjectURL)

  // 미리보기 생성/정리
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // 총합 최대 5장
  const totalCount = existingUrls.length + files.length;
  const remaining = Math.max(0, 5 - totalCount);

  const addFiles = (list) => {
    const incoming = Array.from(list || []);
    const onlyImages = incoming.filter((f) => f.type.startsWith("image/"));
    const next = [...files, ...onlyImages].slice(
      0,
      Math.max(0, 5 - existingUrls.length)
    ); // 기존 포함 총 5
    setFiles(next);
  };

  const removeExistingAt = (idx) => {
    const next = existingUrls.slice();
    next.splice(idx, 1);
    setExistingUrls(next);
  };

  const removeNewAt = (idx) => {
    const next = files.slice();
    next.splice(idx, 1);
    setFiles(next);
  };

  const handleSubmit = async (values) => {
    if (mode === "create" && existingUrls.length + files.length === 0) {
      form.setError("root", {
        message: "이미지 파일을 1장 이상 첨부해 주세요.",
      });
      return;
    }
    if (existingUrls.length + files.length > 5) {
      form.setError("root", {
        message: "이미지는 최대 5장까지 업로드할 수 있습니다.",
      });
      return;
    }

    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("description", values.description);
    fd.append("price", String(values.price));

    // 새 파일들
    files.forEach((f) => fd.append("images", f)); // ← 백엔드 필드명: images (배열)

    // 수정 모드일 때, 유지할 기존 이미지들을 백엔드에 알려줌
    // (백엔드에서 기존 보관/삭제 판단)
    existingUrls.forEach((url) => fd.append("existingUrls[]", url));

    await onSubmit?.(fd);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상품 제목</FormLabel>
              <FormControl>
                <Input placeholder="예) 바나나 보관함" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상품 설명</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="간단한 설명을 입력하세요."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>가격(원)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="예) 12900"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 파일 입력 + 남은 장수 안내 */}
        <div className="space-y-2">
          <FormLabel>
            이미지 파일 (최대 5장)
            {remaining < 5 ? (
              <span className="ml-2 text-xs text-muted-foreground">
                (추가 가능: {remaining}장)
              </span>
            ) : null}
          </FormLabel>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFiles(e.target.files)}
          />
          {form.formState.errors.root?.message ? (
            <p className="text-sm text-red-600">
              {form.formState.errors.root.message}
            </p>
          ) : null}
        </div>

        {/* 미리보기 영역: 기존 + 새 파일 */}
        <div className="grid grid-cols-5 gap-3">
          {/* 기존 이미지 */}
          {existingUrls.map((src, i) => (
            <div
              key={`exist-${i}`}
              className="relative rounded border overflow-hidden"
            >
              <img
                src={src}
                alt={`exist-${i}`}
                className="h-20 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeExistingAt(i)}
                className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white"
                aria-label="remove"
              >
                삭제
              </button>
            </div>
          ))}
          {/* 새로 추가한 파일 */}
          {filePreviews.map((src, i) => (
            <div
              key={`new-${i}`}
              className="relative rounded border overflow-hidden"
            >
              <img
                src={src}
                alt={`new-${i}`}
                className="h-20 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewAt(i)}
                className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white"
                aria-label="remove"
              >
                삭제
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "처리 중..." : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}

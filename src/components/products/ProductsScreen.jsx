"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProductForm from "./ProductForm";
import ProductRowMenu from "./ProductRowMenu";

// API 베이스 (없으면 mock 모드)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const mockProductsInit = [
  {
    id: 1,
    title: "바나나 보관함",
    description: "노랗고 튼튼한 보관함",
    price: 12900,
    imageUrl: "https://placehold.co/80x80?text=🍌",
    updatedAt: new Date().toISOString(),
  },
];

export default function ProductsScreen() {
  const [products, setProducts] = useState(mockProductsInit);
  const [loading, setLoading] = useState(false);

  // 등록/수정 모달
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  // 삭제 확인
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 최초 로딩: API 있으면 로드 시도, 없으면 mock 유지
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!API_BASE) return; // mock 유지
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) return; // API 미동작 시 mock 유지
        const data = await res.json();
        if (!ignore) setProducts(data ?? []);
      } catch (_) {
        // API 에러면 mock 유지
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreate = async (values) => {
    // 지금은 즉시 클라이언트에 반영 (mock)
    // API 붙이면 POST `${API_BASE}/products`
    const newItem = {
      id: Math.max(0, ...products.map((p) => p.id)) + 1,
      ...values,
      price: Number(values.price),
      updatedAt: new Date().toISOString(),
    };
    setProducts([newItem, ...products]);
    setOpenCreate(false);
  };

  const openEditModal = (row) => {
    setEditing(row);
    setOpenEdit(true);
  };

  const handleEdit = async (values) => {
    // API 붙이면 PATCH `${API_BASE}/products/${editing.id}`
    const updated = products.map((p) =>
      p.id === editing.id
        ? {
            ...p,
            ...values,
            price: Number(values.price),
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    setProducts(updated);
    setOpenEdit(false);
    setEditing(null);
  };

  const openDeleteConfirm = (id) => {
    setDeletingId(id);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    // API 붙이면 DELETE `${API_BASE}/products/${deletingId}`
    setProducts(products.filter((p) => p.id !== deletingId));
    setOpenDelete(false);
    setDeletingId(null);
  };

  const hasData = useMemo(() => (products?.length ?? 0) > 0, [products]);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">상품 관리</h1>

        {/* 상품 등록 버튼 + 모달 */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>상품 등록</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>상품 등록</DialogTitle>
            </DialogHeader>
            <ProductForm submitText="등록" onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* 목록 테이블 */}
      <section className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[96px]">이미지</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="text-right">가격(원)</TableHead>
              <TableHead className="w-[140px] text-right">수정일</TableHead>
              <TableHead className="w-[60px] text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasData && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  {loading ? "불러오는 중..." : "등록된 상품이 없습니다."}
                </TableCell>
              </TableRow>
            )}

            {products.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {/* next/image 사용 (외부 도메인은 next.config에서 remotePatterns 설정 필요) */}
                  <div className="relative h-12 w-12 overflow-hidden rounded">
                    {/* 간단히 img 태그로도 가능 */}
                    <img
                      src={row.imageUrl}
                      alt={row.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="font-medium">{row.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {row.description}
                  </div>
                </TableCell>
                <TableCell className="text-right align-middle">
                  {Number(row.price).toLocaleString()}
                </TableCell>
                <TableCell className="text-right align-middle">
                  {new Date(row.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right align-middle">
                  <ProductRowMenu
                    onEdit={() => openEditModal(row)}
                    onDelete={() => openDeleteConfirm(row.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* 수정 모달 */}
      <Dialog
        open={openEdit}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
          setOpenEdit(o);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>상품 수정</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProductForm
              defaultValues={editing}
              submitText="수정"
              onSubmit={handleEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 해당 상품이 목록에서 제거됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MultiProductSelect from "./MultiProductSelect";

// API 베이스(있으면 fetch, 없으면 mock)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// --- 날짜 유틸 ---
const fmtDay = (d) => format(d, "yyyy년 M월 d일 (EEE)", { locale: ko });
const fmtMonth = (d) => format(d, "yyyy년 M월", { locale: ko });
const fmtYear = (d) => format(d, "yyyy년", { locale: ko });

function moveAnchor(date, grain, delta) {
  const d = new Date(date);
  if (grain === "day") d.setDate(d.getDate() + delta);
  if (grain === "month") d.setMonth(d.getMonth() + delta);
  if (grain === "year") d.setFullYear(d.getFullYear() + delta);
  return d;
}

function rangeFromAnchor(date, grain) {
  const start = new Date(date);
  const end = new Date(date);
  if (grain === "day") end.setDate(end.getDate() + 1);
  if (grain === "month") {
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 1);
  }
  if (grain === "year") {
    start.setMonth(0, 1);
    end.setFullYear(end.getFullYear() + 1, 1, 1);
  }
  // ISO(yyyy-mm-dd) 형태
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(start), to: iso(new Date(end.getTime() - 1)) }; // end-1ms
}

// --- mock 데이터 ---
const mockProducts = [
  { id: 1, title: "바나나 보관함" },
  { id: 2, title: "초코 바나나 세트" },
  { id: 3, title: "바나나 스티커팩" },
];

// 랜덤 mock 집계
function mockAggregate({ from, to, grain, productIds }) {
  // 결과: [{ bucket: "YYYY-MM-DD|YYYY-MM|YYYY", totalAmount, totalQty }]
  const buckets = [];
  const start = new Date(from);
  const until = new Date(to);
  const step = (d) => {
    if (grain === "day") d.setDate(d.getDate() + 1);
    if (grain === "month") d.setMonth(d.getMonth() + 1);
    if (grain === "year") d.setFullYear(d.getFullYear() + 1);
  };
  const key = (d) => {
    if (grain === "day") return d.toISOString().slice(0, 10);
    if (grain === "month") return d.toISOString().slice(0, 7);
    if (grain === "year") return d.toISOString().slice(0, 4);
  };
  const ptr = new Date(start);
  while (ptr <= until) {
    const qty = Math.floor(Math.random() * 10); // 0~9
    const amt = qty * (1000 + Math.floor(Math.random() * 9000));
    buckets.push({ bucket: key(ptr), totalQty: qty, totalAmount: amt });
    step(ptr);
  }
  return buckets;
}

export default function SalesScreen() {
  // 상태
  const [grain, setGrain] = useState("day"); // "day" | "month" | "year"
  const [anchor, setAnchor] = useState(new Date()); // 기준일(일/월/년)
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // number[]
  const [data, setData] = useState([]); // [{bucket, totalAmount, totalQty}]
  const [mode, setMode] = useState("amount"); // "amount" | "qty"
  const [loading, setLoading] = useState(false);

  // 초기 로드: 상품 목록
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!API_BASE) {
        if (!ignore) {
          setProducts(mockProducts);
          setSelectedIds([mockProducts[0].id]); // 기본 첫 번째 상품
        }
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/products`, {
          cache: "no-store",
          credentials: "include",
        });
        const list = res.ok ? await res.json() : [];
        if (!ignore) {
          setProducts(list);
          setSelectedIds(list[0] ? [list[0].id] : []);
        }
      } catch {
        if (!ignore) {
          setProducts(mockProducts);
          setSelectedIds([mockProducts[0].id]);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // 집계 로드
  const loadSales = async (g = grain, a = anchor, ids = selectedIds) => {
    const { from, to } = rangeFromAnchor(a, g);
    setLoading(true);
    try {
      if (!API_BASE) {
        const mock = mockAggregate({ from, to, grain: g, productIds: ids });
        setData(mock);
      } else {
        const q = new URLSearchParams({
          from,
          to,
          grain: g,
          productIds: ids.join(","),
        });
        const res = await fetch(`${API_BASE}/sales?${q.toString()}`, {
          cache: "no-store",
          credentials: "include",
        });
        const json = res.ok ? await res.json() : [];
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  // 초기/변경 로드
  useEffect(() => {
    if (selectedIds.length > 0) loadSales();
  }, [grain, anchor, selectedIds]);

  // 라벨
  const label = useMemo(() => {
    if (grain === "day") return fmtDay(anchor);
    if (grain === "month") return fmtMonth(anchor);
    return fmtYear(anchor);
  }, [grain, anchor]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">판매 내역</h1>

      {/* 상단 필터바 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 단위 선택 */}
        <RadioGroup
          className="flex items-center gap-3"
          value={grain}
          onValueChange={(v) => setGrain(v)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="g-day" value="day" />
            <Label htmlFor="g-day">일</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="g-month" value="month" />
            <Label htmlFor="g-month">월</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="g-year" value="year" />
            <Label htmlFor="g-year">년</Label>
          </div>
        </RadioGroup>

        {/* 기간 이동 */}
        <div className="ml-2 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAnchor(moveAnchor(anchor, grain, -1))}
          >
            ◀
          </Button>
          <div className="min-w-[180px] text-center">{label}</div>
          <Button
            variant="outline"
            onClick={() => setAnchor(moveAnchor(anchor, grain, +1))}
          >
            ▶
          </Button>
        </div>

        {/* 상품 멀티 선택 */}
        <div className="ml-auto">
          <MultiProductSelect
            products={products}
            value={selectedIds}
            onChange={setSelectedIds}
            placeholder="상품 선택"
          />
        </div>
      </div>

      {/* 금액/수량 토글 */}
      <div className="flex items-center gap-2">
        <Button
          variant={mode === "amount" ? "default" : "outline"}
          onClick={() => setMode("amount")}
        >
          금액
        </Button>
        <Button
          variant={mode === "qty" ? "default" : "outline"}
          onClick={() => setMode("qty")}
        >
          수량
        </Button>
      </div>

      {/* 결과 테이블 (차트는 원하면 recharts로 추가 가능) */}
      <section className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>버킷</TableHead>
              <TableHead className="text-right">총 금액</TableHead>
              <TableHead className="text-right">총 수량</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-muted-foreground"
                >
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-muted-foreground"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={r.bucket}>
                  <TableCell>{r.bucket}</TableCell>
                  <TableCell className="text-right">
                    {(r.totalAmount ?? 0).toLocaleString()}원
                  </TableCell>
                  <TableCell className="text-right">
                    {r.totalQty ?? 0}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}

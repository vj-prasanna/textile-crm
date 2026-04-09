"use client";

import { useState, useMemo } from "react";
import {
  Typography, Button, Chip, IconButton, Tooltip, Skeleton, MenuItem, Select,
} from "@mui/material";
import {
  AddRounded, EditRounded, DeleteRounded, SearchRounded,
  GridViewRounded, ViewListRounded, InventoryRounded,
  CheckCircleOutlineRounded, WarningAmberRounded,
  TextureRounded, LayersRounded, CheckroomRounded,
} from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { useProducts } from "@/hooks/useProducts";
import { deleteProduct } from "@/lib/firebase/products";
import { ProductDrawer } from "@/components/products/ProductDrawer";
import { DeleteDialog } from "@/components/products/DeleteDialog";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";

/* ─── Category config ──────────────────────────────────────────────── */
const CATEGORY_CONFIG = {
  yarn: { Icon: TextureRounded, color: "#F59E0B", bg: "rgba(245,158,11,0.15)", gradient: "linear-gradient(135deg,#F59E0B,#D97706)" },
  fabric: { Icon: LayersRounded, color: "#4F8EF7", bg: "rgba(79,142,247,0.15)", gradient: "linear-gradient(135deg,#4F8EF7,#6366F1)" },
  garment: { Icon: CheckroomRounded, color: "#8B5CF6", bg: "rgba(139,92,246,0.15)", gradient: "linear-gradient(135deg,#8B5CF6,#6366F1)" },
} satisfies Record<Product["category"], { Icon: React.ElementType; color: string; bg: string; gradient: string }>;

type ViewMode = "grid" | "list";
type StockFilter = "all" | "in-stock" | "low-stock";

function isLowStock(p: Product) {
  return p.stock <= p.minStock;
}

/* ─── Product card (grid view) ─────────────────────────────────────── */
function ProductCard({
  product,
  dark,
  t,
  onEdit,
  onDelete,
}: {
  product: Product;
  dark: boolean;
  t: Record<string, string>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cfg = CATEGORY_CONFIG[product.category];
  const lowStock = isLowStock(product);

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        backdropFilter: "blur(20px)",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = dark
          ? "0 8px 32px rgba(0,0,0,0.4)"
          : "0 8px 32px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Card top — icon + badges */}
      <div className="relative flex items-center justify-center py-7" style={{ background: cfg.gradient }}>
        <cfg.Icon sx={{ fontSize: 44, color: "rgba(255,255,255,0.9)" }} />
        {/* Low stock badge */}
        {lowStock && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: "rgba(239,68,68,0.9)", backdropFilter: "blur(8px)" }}
          >
            <WarningAmberRounded sx={{ fontSize: 11, color: "#fff" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>LOW</span>
          </div>
        )}
        {/* Inactive badge */}
        {!product.isActive && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
            style={{ background: "rgba(100,116,139,0.8)", backdropFilter: "blur(8px)" }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>INACTIVE</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-1">
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 14, color: t.text }}>{product.name}</Typography>
        <Typography sx={{ fontSize: 11, color: t.muted, fontFamily: "monospace", mb: 1 }}>{product.sku}</Typography>

        <div className="flex items-center justify-between mb-2">
          <Chip
            label={product.subCategory}
            size="small"
            sx={{ fontSize: 10, fontWeight: 600, height: 20, background: cfg.bg, color: cfg.color, border: "none" }}
          />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: t.text }}>
            {formatCurrency(product.pricePerUnit)}
            <span style={{ fontSize: 10, color: t.muted, fontWeight: 400 }}>/{product.unit}</span>
          </Typography>
        </div>

        {/* Stock bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Typography sx={{ fontSize: 11, color: t.muted }}>Stock</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: lowStock ? "#EF4444" : t.text }}>
              {product.stock} {product.unit}s
            </Typography>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 4, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, product.minStock > 0 ? (product.stock / (product.minStock * 3)) * 100 : 100)}%`,
                background: lowStock ? "#EF4444" : cfg.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Card footer — actions */}
      <div
        className="flex items-center justify-end gap-1 px-3 py-2"
        style={{ borderTop: `1px solid ${t.border}` }}
      >
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{ color: t.muted, "&:hover": { color: "#4F8EF7", bgcolor: "rgba(79,142,247,0.1)" }, borderRadius: "8px" }}
          >
            <EditRounded sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{ color: t.muted, "&:hover": { color: "#EF4444", bgcolor: "rgba(239,68,68,0.1)" }, borderRadius: "8px" }}
          >
            <DeleteRounded sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  const { products, loading } = useProducts();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | Product["category"]>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const filtered = useMemo(() => products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (!search || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.subCategory.toLowerCase().includes(q)) &&
      (categoryFilter === "all" || p.category === categoryFilter) &&
      (stockFilter === "all" || (stockFilter === "low-stock" ? isLowStock(p) : !isLowStock(p)))
    );
  }), [products, search, categoryFilter, stockFilter]);

  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter((p) => !isLowStock(p)).length,
    lowStock: products.filter(isLowStock).length,
    totalValue: products.reduce((s, p) => s + p.pricePerUnit * p.stock, 0),
  }), [products]);

  const t = {
    card: dark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.8)",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
    hover: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    input: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
  };

  const menuPaper = {
    paper: {
      sx: {
        background: dark ? "rgba(15,23,42,0.95)" : "#fff",
        backdropFilter: "blur(20px)",
        border: `1px solid ${t.border}`,
        borderRadius: 2,
        "& .MuiMenuItem-root": {
          fontSize: 13, color: t.text,
          "&:hover": { background: "rgba(79,142,247,0.1)" },
        },
      },
    },
  };

  const statCards = [
    { label: "Total Products", value: stats.total, icon: InventoryRounded, color: "#4F8EF7" },
    { label: "In Stock", value: stats.inStock, icon: CheckCircleOutlineRounded, color: "#10B981" },
    { label: "Low Stock", value: stats.lowStock, icon: WarningAmberRounded, color: "#EF4444" },
    { label: "Inventory Value", value: formatCurrency(stats.totalValue), icon: null, color: "#8B5CF6" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography sx={{ fontWeight: 700, fontSize: 22, color: t.text }}>Products</Typography>
          <Typography sx={{ fontSize: 13, color: t.muted, mt: 0.3 }}>Manage your product catalog</Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => { setEditing(null); setDrawerOpen(true); }}
          sx={{
            borderRadius: "10px", fontWeight: 700, px: 2.5,
            background: "linear-gradient(135deg,#4F8EF7,#6366F1)",
            boxShadow: "0 4px 15px rgba(79,142,247,0.3)",
            "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" },
          }}
        >
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <Typography sx={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{s.label}</Typography>
              {s.icon && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <s.icon sx={{ fontSize: 16, color: s.color }} />
                </div>
              )}
            </div>
            <Typography sx={{ fontSize: s.label === "Inventory Value" ? 18 : 28, fontWeight: 700, color: t.text }}>
              {loading ? <Skeleton width={60} sx={{ bgcolor: t.border }} /> : s.value}
            </Typography>
          </div>
        ))}
      </div>

      {/* Filters + view toggle */}
      <div
        className="flex flex-wrap items-center gap-3 p-3 rounded-2xl mb-4"
        style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 flex-1"
          style={{ background: t.input, border: `1px solid ${t.border}`, height: 40, minWidth: 180 }}
        >
          <SearchRounded sx={{ fontSize: 17, color: t.muted }} />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: t.text, width: "100%" }}
          />
        </div>

        {/* Category filter */}
        <Select
          size="small"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
          sx={{ minWidth: 140, height: 40, borderRadius: "10px", fontSize: 13, color: t.text, background: t.input, "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border }, "& .MuiSvgIcon-root": { color: t.muted } }}
          MenuProps={{ slotProps: menuPaper }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {(["yarn", "fabric", "garment"] as const).map((c) => (
            <MenuItem key={c} value={c} sx={{ textTransform: "capitalize" }}>{c}</MenuItem>
          ))}
        </Select>

        {/* Stock filter */}
        {(["all", "in-stock", "low-stock"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setStockFilter(v)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
              background: stockFilter === v ? (v === "low-stock" ? "rgba(239,68,68,0.15)" : "rgba(79,142,247,0.15)") : t.input,
              color: stockFilter === v ? (v === "low-stock" ? "#EF4444" : "#4F8EF7") : t.muted,
              outline: stockFilter === v ? `1px solid ${v === "low-stock" ? "rgba(239,68,68,0.3)" : "rgba(79,142,247,0.3)"}` : `1px solid ${t.border}`,
            }}
          >
            {v === "all" ? "All" : v === "in-stock" ? "In Stock" : "Low Stock"}
          </button>
        ))}

        <Typography sx={{ fontSize: 13, color: t.muted }}>{filtered.length} of {products.length}</Typography>

        {/* View toggle */}
        <div
          className="flex rounded-xl overflow-hidden ml-auto flex-shrink-0"
          style={{ border: `1px solid ${t.border}` }}
        >
          {([{ mode: "grid", Icon: GridViewRounded }, { mode: "list", Icon: ViewListRounded }] as const).map(({ mode: m, Icon }) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                padding: "7px 10px",
                background: viewMode === m ? "rgba(79,142,247,0.15)" : "transparent",
                color: viewMode === m ? "#4F8EF7" : t.muted,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={260} sx={{ borderRadius: "16px", bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <InventoryRounded sx={{ fontSize: 48, color: t.muted, opacity: 0.3 }} />
            <Typography sx={{ color: t.muted, fontSize: 14 }}>
              {products.length === 0 ? "No products yet — add your first one!" : "No products match your filters."}
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                dark={dark}
                t={t}
                onEdit={() => { setEditing(product); setDrawerOpen(true); }}
                onDelete={() => setDeleting(product)}
              />
            ))}
          </div>
        )
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
          {/* Header row */}
          <div
            className="hidden md:grid px-4 py-3"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 80px", gap: 8, borderBottom: `1px solid ${t.border}` }}
          >
            {["Product", "SKU", "Category", "Sub-Cat", "Unit", "Price", "Stock", ""].map((h) => (
              <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</Typography>
            ))}
          </div>

          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5" style={{ borderBottom: `1px solid ${t.border}` }}>
                <Skeleton height={20} sx={{ bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <InventoryRounded sx={{ fontSize: 48, color: t.muted, opacity: 0.3 }} />
              <Typography sx={{ color: t.muted, fontSize: 14 }}>
                {products.length === 0 ? "No products yet — add your first one!" : "No products match your filters."}
              </Typography>
            </div>
          ) : (
            filtered.map((product, idx) => {
              const cfg = CATEGORY_CONFIG[product.category];
              const lowStock = isLowStock(product);
              return (
                <div
                  key={product.id}
                  className="md:grid px-4 items-center"
                  style={{
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 80px",
                    gap: 8, padding: "12px 16px",
                    borderBottom: idx < filtered.length - 1 ? `1px solid ${t.border}` : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = t.hover)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                >
                  {/* Product name + icon */}
                  <div className="flex items-center gap-2.5 min-w-0 mb-2 md:mb-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.gradient }}>
                      <cfg.Icon sx={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }} />
                    </div>
                    <div className="min-w-0">
                      <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600, color: t.text }}>{product.name}</Typography>
                      {!product.isActive && (
                        <Typography sx={{ fontSize: 10, color: t.muted }}>Inactive</Typography>
                      )}
                    </div>
                  </div>

                  <Typography sx={{ fontSize: 12, color: t.muted, fontFamily: "monospace" }}>{product.sku}</Typography>

                  <Chip
                    label={product.category}
                    size="small"
                    sx={{ fontSize: 11, fontWeight: 600, height: 22, background: cfg.bg, color: cfg.color, textTransform: "capitalize", border: "none" }}
                  />

                  <Typography noWrap sx={{ fontSize: 13, color: t.muted }}>{product.subCategory}</Typography>

                  <Typography sx={{ fontSize: 13, color: t.muted, textTransform: "capitalize" }}>{product.unit}</Typography>

                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                    {formatCurrency(product.pricePerUnit)}
                  </Typography>

                  <div className="flex items-center gap-1.5">
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: lowStock ? "#EF4444" : t.text }}>
                      {product.stock}
                    </Typography>
                    {lowStock && (
                      <WarningAmberRounded sx={{ fontSize: 13, color: "#EF4444" }} />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => { setEditing(product); setDrawerOpen(true); }}
                        sx={{ color: t.muted, "&:hover": { color: "#4F8EF7", bgcolor: "rgba(79,142,247,0.1)" }, borderRadius: "8px" }}
                      >
                        <EditRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => setDeleting(product)}
                        sx={{ color: t.muted, "&:hover": { color: "#EF4444", bgcolor: "rgba(239,68,68,0.1)" }, borderRadius: "8px" }}
                      >
                        <DeleteRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <ProductDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editing={editing} />
      {deleting && (
        <DeleteDialog
          open={!!deleting}
          productName={deleting.name}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleteProduct(deleting.id)}
        />
      )}
    </>
  );
}

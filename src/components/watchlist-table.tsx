'use client';

import type { SortingState } from '@tanstack/react-table';
import type { Stock } from '@/lib/stock-types';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,

  useReactTable,
} from '@tanstack/react-table';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeBadge } from './change-badge';
import { DirectionIcon } from './direction-icon';
import { SplitFlapText } from './split-flap-text';

type WatchlistTableProps = {
  stocks: Stock[];
  onAddStock: (symbol: string, name: string) => void;
  onRemoveStock: (id: string) => void;
};

const columnHelper = createColumnHelper<Stock>();

export function WatchlistTable({ stocks, onAddStock, onRemoveStock }: WatchlistTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Symbol
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <DirectionIcon direction={row.original.direction} />
            <SplitFlapText
              value={row.original.symbol}
              charset="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
              direction={row.original.direction}
            />
          </div>
        ),
      }),
      columnHelper.accessor('name', {
        header: () => <span className="text-xs font-semibold text-muted-foreground">Name</span>,
        cell: ({ getValue }) => (
          <span className="block max-w-[120px] truncate text-sm text-muted-foreground">{getValue()}</span>
        ),
      }),
      columnHelper.accessor('price', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Last Price
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <SplitFlapText
            value={`$${row.original.price.toFixed(2)}`}
            charset="0123456789.$"
            direction={row.original.direction}
          />
        ),
      }),
      columnHelper.accessor('change', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Change
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <SplitFlapText
            value={`${row.original.change >= 0 ? '+' : ''}${row.original.change.toFixed(2)}`}
            charset="0123456789.+-"
            direction={row.original.direction}
          />
        ),
      }),
      columnHelper.accessor('changePercent', {
        header: () => <span className="text-xs font-semibold text-muted-foreground">Change %</span>,
        cell: ({ row }) => <ChangeBadge stock={row.original} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-xs font-semibold text-muted-foreground">Actions</span>,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveStock(row.original.id)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${row.original.symbol}`}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1} />
          </Button>
        ),
      }),
    ],
    [onRemoveStock],
  );

  const table = useReactTable({
    data: stocks,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleAddStock = () => {
    if (newSymbol.trim()) {
      onAddStock(newSymbol.trim(), '');
      setNewSymbol('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Watchlist</h2>
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter symbols..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="h-8 w-40 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Symbol (e.g., AAPL)"
          value={newSymbol}
          onChange={e => setNewSymbol(e.target.value.toUpperCase())}
          className="h-9 max-w-[180px] flex-1 text-sm uppercase"
          maxLength={5}
        />
        <Button onClick={handleAddStock} size="sm" className="h-9 gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Stock</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hide-scrollbar overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-3 py-2 text-left">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.original.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-b border-border/50 transition-colors hover:bg-muted/20"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {table.getRowModel().rows.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">No stocks in watchlist. Add some above!</div>
        )}
      </div>
    </div>
  );
}

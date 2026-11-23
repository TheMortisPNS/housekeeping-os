'use client';
import React from 'react';
import { DORM_ROOMS } from '@/lib/constants';
import { BedDouble } from 'lucide-react';

interface DormBed {
  id: string;
  roomNumber: string;
  bedLabel: string;
  status: string;
  cleanerName?: string | null;
}

interface Props {
  beds: DormBed[];
  onUpdateBed: (id: string, status: string, cleanerName?: string) => void;
}

const STATUS_LOCAL = ['empty', 'IN', 'IN_CIRCLE', 'OUT'] as const;

export default function DormsSection({ beds, onUpdateBed }: Props) {
  const roomOrder = Object.keys(DORM_ROOMS ?? {});

  const bedsByRoom: Record<string, DormBed[]> = {};
  for (const bed of beds ?? []) {
    const room = bed?.roomNumber ?? '';
    if (!bedsByRoom[room]) bedsByRoom[room] = [];
    bedsByRoom[room].push(bed);
  }

  const cycleStatus = (current: string) => {
    const idx = STATUS_LOCAL.indexOf(current as any);
    return STATUS_LOCAL[(idx + 1) % STATUS_LOCAL.length];
  };

  const getBedStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1.5px solid',
      borderRadius: '10px',
      fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
      fontSize: '11px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      userSelect: 'none',
      flexShrink: 0,
    };

    if (status === 'IN') return {
      ...base,
      background:   'hsl(var(--status-in-bg))',
      borderColor:  'hsl(var(--status-in-border))',
      color:        'hsl(var(--status-in-text))',
      boxShadow:    '0 0 10px rgba(52,211,153,0.25)',
    };

    if (status === 'IN_CIRCLE') return {
      ...base,
      background:   'transparent',
      borderColor:  'hsl(var(--status-in-border))',
      borderWidth:  '2.5px',
      borderRadius: '50%',
      color:        'hsl(var(--status-in-text))',
    };

    if (status === 'OUT') return {
      ...base,
      background:   'hsl(var(--status-out-bg))',
      borderColor:  'hsl(var(--status-out-border))',
      color:        'hsl(var(--status-out-text))',
      borderRadius: '50%',
    };

    // empty
    return {
      ...base,
      background:  'hsl(var(--status-empty-bg))',
      borderColor: 'hsl(var(--border))',
      color:       'hsl(var(--muted-foreground))',
    };
  };

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <BedDouble className="w-4 h-4 text-[#B38B59]" />
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Κουκέτες
        </h2>
        <span className="text-xs text-muted-foreground/50">· {beds?.length ?? 0} κρεβάτια</span>
      </div>

      {/* Room cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {roomOrder.map((roomNum) => {
          const expectedBeds = DORM_ROOMS?.[roomNum] ?? [];
          const roomBeds     = bedsByRoom?.[roomNum]  ?? [];

          const inCount  = roomBeds.filter((b) => b?.status === 'IN').length;
          const outCount = roomBeds.filter((b) => b?.status === 'OUT').length;

          // Columns: max 4 per row in the tile grid
          const cols = Math.min(expectedBeds.length, 4);

          return (
            <div
              key={roomNum}
              className="rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-lg"
              style={{
                borderColor: 'hsl(var(--border))',
                boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)',
              }}
            >
              {/* Room header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-bold text-xl tracking-tight text-foreground">
                    {roomNum}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {expectedBeds.length} κρεβάτια
                  </span>
                </div>
                {/* Mini status pills */}
                <div className="flex gap-1.5">
                  {inCount > 0 && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'hsl(var(--status-in-bg))',
                        color:      'hsl(var(--status-in-text))',
                      }}
                    >
                      {inCount} IN
                    </span>
                  )}
                  {outCount > 0 && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'hsl(var(--status-out-bg))',
                        color:      'hsl(var(--status-out-text))',
                      }}
                    >
                      {outCount} OUT
                    </span>
                  )}
                </div>
              </div>

              {/* Bed tile grid */}
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {expectedBeds.map((label: string) => {
                  const bed    = roomBeds.find((b: DormBed) => b?.bedLabel === label);
                  const status = bed?.status ?? 'empty';

                  return (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      {/* Monospace bed label e.g. "33A" */}
                      <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-wider">
                        {roomNum}{label}
                      </span>

                      {/* Tile */}
                      <div
                        style={getBedStyle(status)}
                        onClick={() =>
                          bed?.id &&
                          onUpdateBed(bed.id, cycleStatus(status), bed.cleanerName ?? undefined)
                        }
                        className="hover:scale-110 active:scale-95"
                        title={`${roomNum}-${label}: ${status}`}
                      >
                        {status === 'IN'  ? 'IN'  : ''}
                        {status === 'OUT' ? 'OUT' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground px-4 py-3 rounded-2xl border border-dashed border-border">
        {[
          {
            el: (
              <div className="w-4 h-4 rounded-lg border-2 border-border flex-shrink-0"
                style={{ background: 'hsl(var(--status-empty-bg))' }} />
            ),
            label: 'Κενό',
          },
          {
            el: (
              <div className="w-4 h-4 rounded-lg border-2 flex-shrink-0"
                style={{ background: 'hsl(var(--status-in-bg))', borderColor: 'hsl(var(--status-in-border))' }} />
            ),
            label: 'IN (Παραμένει)',
          },
          {
            el: (
              <div className="w-4 h-4 rounded-full border-[2.5px] flex-shrink-0"
                style={{ background: 'transparent', borderColor: 'hsl(var(--status-in-border))' }} />
            ),
            label: 'Κύκλος (Φεύγει 11:00)',
          },
          {
            el: (
              <div className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                style={{ background: 'hsl(var(--status-out-bg))', borderColor: 'hsl(var(--status-out-border))' }} />
            ),
            label: 'OUT (Checkout)',
          },
        ].map(({ el, label }) => (
          <div key={label} className="flex items-center gap-2">
            {el}
            <span>{label}</span>
          </div>
        ))}
        <span className="w-full text-muted-foreground/40 text-[10px] mt-1">
          💡 Κλικ σε κουκέτα: Κενό → IN → Κύκλος → OUT → Κενό
        </span>
      </div>
    </section>
  );
}

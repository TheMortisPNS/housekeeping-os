'use client';
import { Building2 } from 'lucide-react';
import { STATUS_CYCLE } from '@/lib/constants';

interface RoomStatus {
  id: string;
  roomNumber: string;
  status: string;
  checkOutTime: string | null;
  checkInTime: string | null;
  notes: string | null;
  cleanerName?: string | null;
}

interface Props {
  rooms: RoomStatus[];
  onUpdateRoom: (id: string, fields: any) => void;
}

export default function RoomsSection({ rooms, onUpdateRoom }: Props) {
  const sorted = [...(rooms ?? [])].sort(
    (a, b) => parseInt(a?.roomNumber ?? '0', 10) - parseInt(b?.roomNumber ?? '0', 10)
  );

  const cycleStatus = (current: string) => {
    const idx = STATUS_CYCLE.indexOf(current as any) ?? 0;
    return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] ?? 'empty';
  };

  const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    IN: {
      bg:     'hsl(var(--status-in-bg))',
      text:   'hsl(var(--status-in-text))',
      border: 'hsl(var(--status-in-border))',
      label:  'IN',
    },
    OUT: {
      bg:     'hsl(var(--status-out-bg))',
      text:   'hsl(var(--status-out-text))',
      border: 'hsl(var(--status-out-border))',
      label:  'OUT',
    },
    empty: {
      bg:     'hsl(var(--status-empty-bg))',
      text:   'hsl(var(--status-empty-text))',
      border: 'transparent',
      label:  '—',
    },
  };

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <Building2 className="w-4 h-4 text-[#B38B59]" />
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Δωμάτια
        </h2>
        <span className="text-xs text-muted-foreground/50">· {sorted.length}</span>
      </div>

      {/* Micro-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {sorted.map((room) => {
          const cfg = statusConfig[room?.status ?? 'empty'] ?? statusConfig.empty;

          return (
            <div
              key={room?.id}
              className="group relative rounded-2xl border bg-card p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-lg"
              style={{
                borderColor: 'hsl(var(--border))',
                boxShadow:
                  '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)',
              }}
            >
              {/* Status badge — top right, clickable to cycle */}
              <button
                onClick={() =>
                  room?.id && onUpdateRoom(room.id, { status: cycleStatus(room?.status ?? 'empty') })
                }
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background:   cfg.bg,
                  color:        cfg.text,
                  borderColor:  cfg.border,
                }}
                title="Κλικ για αλλαγή status"
              >
                {cfg.label}
              </button>

              {/* Room number */}
              <div className="pr-12">
                <span className="font-mono font-bold text-2xl tracking-tight text-foreground leading-none">
                  {room?.roomNumber ?? ''}
                </span>
              </div>

              {/* Time fields */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground w-7 flex-shrink-0">
                    OUT
                  </span>
                  <input
                    type="time"
                    value={room?.checkOutTime ?? ''}
                    onChange={(e) =>
                      room?.id && onUpdateRoom(room.id, { checkOutTime: e.target.value })
                    }
                    className="flex-1 text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:border-[#B38B59] outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground w-7 flex-shrink-0">
                    IN
                  </span>
                  <input
                    type="time"
                    value={room?.checkInTime ?? ''}
                    onChange={(e) =>
                      room?.id && onUpdateRoom(room.id, { checkInTime: e.target.value })
                    }
                    className="flex-1 text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:border-[#B38B59] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Cleaner */}
              <input
                type="text"
                value={room?.cleanerName ?? ''}
                placeholder="Καμαριέρα..."
                onChange={(e) =>
                  room?.id && onUpdateRoom(room.id, { cleanerName: e.target.value })
                }
                className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground/50 focus:border-[#B38B59] outline-none transition-colors"
              />

              {/* Notes — dashed border to signal "optional" */}
              <input
                type="text"
                value={room?.notes ?? ''}
                placeholder="Σημείωση..."
                onChange={(e) =>
                  room?.id && onUpdateRoom(room.id, { notes: e.target.value })
                }
                className="w-full text-[11px] border border-dashed border-border rounded-lg px-2 py-1 bg-transparent text-foreground placeholder:text-muted-foreground/35 focus:border-[#B38B59] outline-none transition-colors"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
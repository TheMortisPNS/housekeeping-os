'use client';
import { Home, Check } from 'lucide-react';
import { HOUSES } from '@/lib/constants';
interface HouseStatus {
  id: string;
  houseName: string;
  inHouse: boolean;
  checkOut: boolean;
  checkOutTime: string | null;
  checkOutTaxi: boolean;
  checkOutBalance: string | null;
  checkIn: boolean;
  checkInTime: string | null;
  checkInTaxi: boolean;
  checkInBalance: string | null;
  pax: string | null;
  cleanerName?: string | null;
}

interface Props {
  houses: HouseStatus[];
  onUpdateHouse: (id: string, fields: any) => void;
}

export default function HousesSection({ houses, onUpdateHouse }: Props) {

const sortedHouses = [...(houses ?? [])].sort((a, b) => {
  const ai = HOUSES.indexOf(a?.houseName ?? '');
  const bi = HOUSES.indexOf(b?.houseName ?? '');
  const aIdx = ai === -1 ? 999 : ai;
  const bIdx = bi === -1 ? 999 : bi;
  return aIdx - bIdx;
});

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
        <h2 className="text-lg font-display font-bold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>
          ΔΙΑΜΕΡΙΣΜΑΤΑ  
        </h2>
      </div>

      <div className="rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: 'hsl(var(--card))' }}>
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="text-xs" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
              <th className="py-2.5 px-3 text-left font-medium">Διαμέρισμα</th>
              <th className="py-2.5 px-2 text-center font-medium">Καμαριέρα</th>
              <th className="py-2.5 px-2 text-center font-medium border-l border-white/20">IN HOUSE</th>
              <th className="py-2.5 px-2 text-center font-medium border-l border-white/20">CHECK OUT</th>
              <th className="py-2.5 px-2 text-center font-medium">Ώρα</th>
              <th className="py-2.5 px-2 text-center font-medium">TAXI</th>
              <th className="py-2.5 px-2 text-center font-medium">BALANCE/ID</th>
              <th className="py-2.5 px-2 text-center font-medium border-l border-white/20">CHECK IN</th>
              <th className="py-2.5 px-2 text-center font-medium">Ώρα</th>
              <th className="py-2.5 px-2 text-center font-medium">TAXI</th>
              <th className="py-2.5 px-2 text-center font-medium">BALANCE/ID</th>
              <th className="py-2.5 px-2 text-center font-medium">PAX</th>
            </tr>
          </thead>
          <tbody>
            {sortedHouses?.map((house: HouseStatus) => (
              <tr
                key={house?.id}
                className="border-b transition"
                style={{ borderColor: 'hsl(var(--border))' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'hsl(var(--muted))')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
              >
                <td className="py-2 px-3">
                  <span className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                    {house?.houseName ?? ''}
                  </span>
                </td>

                {/* Καμαριέρα */}
                <td className="py-2 px-2 text-center">
                  <input
                    type="text"
                    value={house?.cleanerName ?? ''}
                    placeholder="Όνομα..."
                    onChange={(e) => house?.id && onUpdateHouse?.(house.id, { cleanerName: e.target.value })}
                    className="text-xs text-center rounded px-1.5 py-1 outline-none w-24 border"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                </td>

                {/* IN HOUSE */}
                <td className="py-2 px-2 text-center" style={{ borderLeft: '1px solid hsl(var(--border))' }}>
                  <button
                    onClick={() => house?.id && onUpdateHouse?.(house.id, { inHouse: !(house?.inHouse ?? false) })}
                    className="w-7 h-7 rounded border-2 flex items-center justify-center transition hover:scale-110 mx-auto"
                    style={house?.inHouse ? {
                      backgroundColor: 'hsl(var(--status-in-bg))',
                      borderColor: 'hsl(var(--status-in-border))',
                      color: 'hsl(var(--status-in-text))',
                    } : {
                      borderColor: 'hsl(var(--border))',
                      color: 'transparent',
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </td>

                {/* CHECK OUT */}
                <td className="py-2 px-2 text-center" style={{ borderLeft: '1px solid hsl(var(--border))' }}>
                  <button
                    onClick={() => house?.id && onUpdateHouse?.(house.id, { checkOut: !(house?.checkOut ?? false) })}
                    className="w-7 h-7 rounded border-2 flex items-center justify-center transition hover:scale-110 mx-auto"
                    style={house?.checkOut ? {
                      backgroundColor: 'hsl(var(--status-out-bg))',
                      borderColor: 'hsl(var(--status-out-border))',
                      color: 'hsl(var(--status-out-text))',
                    } : {
                      borderColor: 'hsl(var(--border))',
                      color: 'transparent',
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </td>

                {/* Check Out Time */}
                <td className="py-2 px-2 text-center">
                  <input
                    type="time"
                    value={house?.checkOutTime ?? ''}
                    onChange={(e) => house?.id && onUpdateHouse?.(house.id, { checkOutTime: e.target.value })}
                    className="text-xs rounded px-1.5 py-1 outline-none w-20 border"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                </td>

                {/* Check Out TAXI */}
                <td className="py-2 px-2 text-center">
                  <button
                    onClick={() => house?.id && onUpdateHouse?.(house.id, { checkOutTaxi: !(house?.checkOutTaxi ?? false) })}
                    className="w-7 h-7 rounded border-2 flex items-center justify-center transition hover:scale-110 mx-auto"
                    style={house?.checkOutTaxi ? {
                      backgroundColor: 'hsl(33 80% 20%)',
                      borderColor: 'hsl(33 80% 50%)',
                      color: 'hsl(33 80% 70%)',
                    } : {
                      borderColor: 'hsl(var(--border))',
                      color: 'transparent',
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </td>

                {/* Check Out Balance */}
                <td className="py-2 px-2 text-center">
                  <input
                    type="text"
                    value={house?.checkOutBalance ?? ''}
                    placeholder="—"
                    onChange={(e) => house?.id && onUpdateHouse?.(house.id, { checkOutBalance: e.target.value })}
                    className="text-xs text-center rounded px-1.5 py-1 outline-none w-20 border"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                </td>

                {/* CHECK IN */}
                <td className="py-2 px-2 text-center" style={{ borderLeft: '1px solid hsl(var(--border))' }}>
                  <button
                    onClick={() => house?.id && onUpdateHouse?.(house.id, { checkIn: !(house?.checkIn ?? false) })}
                    className="w-7 h-7 rounded border-2 flex items-center justify-center transition hover:scale-110 mx-auto"
                    style={house?.checkIn ? {
                      backgroundColor: 'hsl(var(--status-in-bg))',
                      borderColor: 'hsl(var(--status-in-border))',
                      color: 'hsl(var(--status-in-text))',
                    } : {
                      borderColor: 'hsl(var(--border))',
                      color: 'transparent',
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </td>

                {/* Check In Time */}
                <td className="py-2 px-2 text-center">
                  <input
                    type="time"
                    value={house?.checkInTime ?? ''}
                    onChange={(e) => house?.id && onUpdateHouse?.(house.id, { checkInTime: e.target.value })}
                    className="text-xs rounded px-1.5 py-1 outline-none w-20 border"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                </td>

                {/* Check In TAXI */}
                <td className="py-2 px-2 text-center">
                  <button
                    onClick={() => house?.id && onUpdateHouse?.(house.id, { checkInTaxi: !(house?.checkInTaxi ?? false) })}
                    className="w-7 h-7 rounded border-2 flex items-center justify-center transition hover:scale-110 mx-auto"
                    style={house?.checkInTaxi ? {
                      backgroundColor: 'hsl(33 80% 20%)',
                      borderColor: 'hsl(33 80% 50%)',
                      color: 'hsl(33 80% 70%)',
                    } : {
                      borderColor: 'hsl(var(--border))',
                      color: 'transparent',
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </td>

                {/* Check In Balance */}
                <td className="py-2 px-2 text-center">
                  <input
                    type="text"
                    value={house?.checkInBalance ?? ''}
                    placeholder="—"
                    onChange={(e) => house?.id && onUpdateHouse?.(house.id, { checkInBalance: e.target.value })}
                    className="text-xs text-center rounded px-1.5 py-1 outline-none w-20 border"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                </td>

                {/* PAX */}
                <td className="py-2 px-2 text-center">
                  <input
                    type="text"
                    value={house?.pax ?? ''}
                    placeholder="—"
                    onChange={(e) => house?.id && onUpdateHouse?.(house.id, { pax: e.target.value })}
                    className="text-xs text-center rounded px-1.5 py-1 outline-none w-14 border"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                </td>
              </tr>
            )) ?? []}
          </tbody>
        </table>
      </div>
    </div>
  );
}
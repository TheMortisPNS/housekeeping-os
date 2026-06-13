'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Pencil, UserCog } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchUsers();
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user?.id) setCurrentUserId(data.user.id);
      });
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) {
        toast.error('Δεν έχεις δικαίωμα πρόσβασης');
        router.push('/dashboard');
        return;
      }
      if (!res.ok) { toast.error('Σφάλμα φόρτωσης χρηστών'); return; }
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      toast.error('Αποτυχία φόρτωσης χρηστών');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({ name: user.name, email: user.email, password: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', email: '', password: '' });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (res.ok) {
        toast.success('Τα στοιχεία αποθηκεύτηκαν!');
        cancelEdit();
        fetchUsers();
      } else {
        toast.error('Αποτυχία αποθήκευσης');
      }
    } catch {
      toast.error('Αποτυχία αποθήκευσης');
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Διαγραφή χρήστη "${name}"; Η ενέργεια δεν αναιρείται.`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('Ο χρήστης διαγράφηκε!');
        fetchUsers();
      } else {
        toast.error('Αποτυχία διαγραφής');
      }
    } catch {
      toast.error('Αποτυχία διαγραφής');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── SILK HEADER ── */}
      <header
        className="sticky top-0 z-50 border-b border-white/10"
        style={{
          background: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#B38B59] flex items-center justify-center">
              <UserCog className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Διαχείριση Χρηστών</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B59]" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {editingId === user.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Όνομα</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-muted-foreground mb-1 block">Νέος Κωδικός (προαιρετικό)</label>
                        <input
                          type="password"
                          value={editForm.password}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(user.id)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
                      >
                        Αποθήκευση
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm"
                      >
                        Ακύρωση
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#B38B59]/10 flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-[#B38B59]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{user.name}</span>
                          {user.id === currentUserId && (
                            <span className="text-xs bg-[#B38B59]/15 text-[#B38B59] px-2 py-0.5 rounded-full font-medium">
                              Εσύ
                            </span>
                          )}
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            {user.role}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(user)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-500/10 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id, user.name)}
                        disabled={user.id === currentUserId}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
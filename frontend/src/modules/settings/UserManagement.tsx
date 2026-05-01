/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================
 *
 * UserManagement.tsx
 * Full CRUD user management with role-based access control.
 * Shoper 9 parity: vaUser + vaGroup concepts.
 * ============================================================ */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Shield, ShieldCheck, ShieldAlert, ShieldOff,
  Search, MoreVertical, Edit2, Trash2, Lock, Unlock,
  ChevronRight, Key, Eye, EyeOff, X, Check, RefreshCw,
  Crown, Briefcase, ShoppingCart, AlertTriangle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import { Button, Input, Text, Modal, Badge, Card } from '@/components/ui/SovereignUI';

/* ── Types ─────────────────────────────────────────────────────────────── */
interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'cashier';
  active: boolean;
  created_at: string;
}

interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  role: 'cashier' | 'manager' | 'admin';
}

/* ── Role Config ────────────────────────────────────────────────────────── */
const ROLES = {
  admin: {
    label: 'Administrator',
    shortLabel: 'ADMIN',
    icon: Crown,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badgeVariant: 'warning' as const,
    permissions: ['Billing', 'Inventory', 'Reports', 'Settings', 'Users', 'Day End', 'Price Change', 'Void Bills'],
  },
  manager: {
    label: 'Store Manager',
    shortLabel: 'MANAGER',
    icon: Briefcase,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    badgeVariant: 'info' as const,
    permissions: ['Billing', 'Inventory', 'Reports', 'Day End', 'Price Change'],
  },
  cashier: {
    label: 'Cashier',
    shortLabel: 'CASHIER',
    icon: ShoppingCart,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    badgeVariant: 'success' as const,
    permissions: ['Billing'],
  },
} as const;

/* ── User Card Component ───────────────────────────────────────────────── */
function UserCard({
  user,
  onEdit,
  onToggle,
  onDelete,
  isCurrentUser,
}: {
  user: StaffUser;
  onEdit: (u: StaffUser) => void;
  onToggle: (u: StaffUser) => void;
  onDelete: (u: StaffUser) => void;
  isCurrentUser: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const role = ROLES[user.role];
  const RoleIcon = role.icon;

  const createdDaysAgo = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative group rounded-xl border p-5 transition-all duration-200
        ${user.active
          ? 'bg-bg-elevated border-border-subtle hover:border-accent/30'
          : 'bg-bg-base/40 border-border-subtle/50 opacity-60'
        }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${role.bg}`}>
          <RoleIcon size={22} className={role.color} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Text variant="sm" className="font-black uppercase tracking-tight truncate">
              {user.full_name}
            </Text>
            {isCurrentUser && (
              <span className="text-[9px] font-black px-2 py-0.5 bg-accent/10 text-accent rounded uppercase tracking-widest">
                YOU
              </span>
            )}
          </div>
          <Text variant="xs" className="opacity-40 font-mono truncate mt-0.5">
            {user.email}
          </Text>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${role.bg} ${role.color}`}>
              {role.shortLabel}
            </span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
              user.active ? 'bg-status-green/10 text-status-green' : 'bg-status-red/10 text-status-red'
            }`}>
              {user.active ? 'ACTIVE' : 'LOCKED'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-float transition-all"
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-10 z-50 bg-bg-float border border-border-subtle rounded-xl shadow-2xl shadow-black/20 overflow-hidden w-48"
                  onBlur={() => setShowMenu(false)}
                >
                  <button
                    onClick={() => { onEdit(user); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
                  >
                    <Edit2 size={14} /> Edit Details
                  </button>
                  {!isCurrentUser && (
                    <>
                      <button
                        onClick={() => { onToggle(user); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
                      >
                        {user.active ? <Lock size={14} /> : <Unlock size={14} />}
                        {user.active ? 'Lock Account' : 'Unlock Account'}
                      </button>
                      <div className="h-px bg-border-subtle mx-2" />
                      <button
                        onClick={() => { onDelete(user); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-status-red hover:bg-status-red/5 transition-colors"
                      >
                        <Trash2 size={14} /> Remove User
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="mt-4 pt-3 border-t border-border-subtle/50">
        <Text variant="xs" className="opacity-30 uppercase tracking-widest font-bold mb-2">
          Permissions
        </Text>
        <div className="flex flex-wrap gap-1">
          {role.permissions.map(p => (
            <span key={p} className="text-[9px] font-bold px-2 py-0.5 bg-bg-base rounded text-text-tertiary uppercase tracking-wider">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-1 text-text-tertiary">
        <Clock size={10} />
        <span className="text-[9px] font-bold">
          {createdDaysAgo === 0 ? 'Created today' : `Created ${createdDaysAgo}d ago`}
        </span>
      </div>
    </motion.div>
  );
}

/* ── User Form Modal ───────────────────────────────────────────────────── */
function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  editUser,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  editUser?: StaffUser;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<UserFormData>({
    email: '',
    full_name: '',
    password: '',
    role: 'cashier',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editUser) {
      setForm({
        email: editUser.email,
        full_name: editUser.full_name,
        password: '',
        role: editUser.role,
      });
    } else {
      setForm({ email: '', full_name: '', password: '', role: 'cashier' });
    }
    setError('');
  }, [editUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Something went wrong. Try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editUser ? 'Edit Staff User' : 'Create Staff User'}
      subtitle={editUser ? 'Update role or profile details' : 'Add a new staff member to SMRITI-OS'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
            Full Name *
          </label>
          <Input
            placeholder="e.g. Rahul Sharma"
            value={form.full_name}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            required
            className="h-12"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
            Email Address *
          </label>
          <Input
            type="email"
            placeholder="e.g. rahul@yourstore.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            required
            disabled={!!editUser}
            className="h-12"
          />
        </div>

        {/* Password (only for new users) */}
        {!editUser && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
              Password *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                minLength={6}
                className="h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
            System Role *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map(roleKey => {
              const r = ROLES[roleKey];
              const RIcon = r.icon;
              const isSelected = form.role === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role: roleKey }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${isSelected
                      ? `${r.border} ${r.bg}`
                      : 'border-border-subtle hover:border-accent/30'
                    }`}
                >
                  <RIcon size={20} className={isSelected ? r.color : 'text-text-tertiary'} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? r.color : 'text-text-tertiary'}`}>
                    {r.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Permission preview */}
          <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
            <Text variant="xs" className="opacity-40 uppercase tracking-widest font-bold mb-2">
              This role can access:
            </Text>
            <div className="flex flex-wrap gap-1">
              {ROLES[form.role].permissions.map(p => (
                <span key={p} className="text-[9px] font-bold px-2 py-0.5 bg-bg-elevated rounded text-text-secondary uppercase">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-status-red/5 border border-status-red/20 rounded-lg">
            <AlertTriangle size={14} className="text-status-red shrink-0" />
            <Text variant="xs" className="text-status-red font-bold">{error}</Text>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-12">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1 h-12 gap-2">
            {isLoading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {editUser ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function UserManagement() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'manager' | 'cashier'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<StaffUser | undefined>();
  const [currentUserId, setCurrentUserId] = useState<string>('');

  /* ── Load Users ──────────────────────────────────────────────────────── */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [data, me] = await Promise.all([
        api.users.list(),
        api.users.getMe().catch(() => null)
      ]);
      setUsers(data);
      if (me?.id) setCurrentUserId(me.id);
    } catch (err) {
      console.error('[SMRITI-OS] Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  /* ── Actions ─────────────────────────────────────────────────────────── */
  const handleCreate = async (data: UserFormData) => {
    setSaving(true);
    try {
      await api.users.create(data);
      await loadUsers();
      setShowCreateModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: UserFormData) => {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.users.update(editUser.id, {
        full_name: data.full_name,
        role: data.role,
      });
      await loadUsers();
      setEditUser(undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (user: StaffUser) => {
    try {
      await api.users.update(user.id, { active: !user.active });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !u.active } : u));
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  /* ── Filtered Users ──────────────────────────────────────────────────── */
  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  /* ── Stats ───────────────────────────────────────────────────────────── */
  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    cashiers: users.filter(u => u.role === 'cashier').length,
  };

  return (
    <div className="flex flex-col h-full bg-bg-base text-text-primary">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-border-subtle bg-bg-float flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users size={18} className="text-accent" />
          </div>
          <div>
            <Text variant="h3" className="leading-none">USER MANAGEMENT</Text>
            <Text variant="xs" className="opacity-40">Staff Access & Permissions</Text>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2 h-9 px-4"
        >
          <UserPlus size={16} />
          ADD STAFF USER
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">

        {/* ── Stats Bar ────────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: 'text-text-primary' },
            { label: 'Active', value: stats.active, icon: ShieldCheck, color: 'text-status-green' },
            { label: 'Admins', value: stats.admins, icon: Crown, color: 'text-amber-500' },
            { label: 'Managers', value: stats.managers, icon: Briefcase, color: 'text-blue-500' },
            { label: 'Cashiers', value: stats.cashiers, icon: ShoppingCart, color: 'text-green-500' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} variant="flat" className="p-4 flex items-center gap-3">
                <Icon size={20} className={stat.color} />
                <div>
                  <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                  <Text variant="xs" className="opacity-40 uppercase tracking-widest font-bold">{stat.label}</Text>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── Search + Filter ───────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'admin', 'manager', 'cashier'] as const).map(r => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-4 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                  ${filterRole === r
                    ? 'bg-accent text-white'
                    : 'bg-bg-elevated text-text-tertiary hover:text-text-primary border border-border-subtle'
                  }`}
              >
                {r === 'all' ? 'All Roles' : ROLES[r].shortLabel}
              </button>
            ))}
          </div>
          <button
            onClick={loadUsers}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-subtle text-text-tertiary hover:text-accent hover:border-accent/30 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* ── User Grid ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-bg-elevated animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
              <Users size={28} className="text-text-tertiary" />
            </div>
            <Text variant="h3" className="opacity-50 mb-2">
              {search ? 'No users found' : 'No staff users yet'}
            </Text>
            <Text variant="sm" className="opacity-30 max-w-sm">
              {search
                ? 'Try a different search term or clear the filter.'
                : 'Create your first staff user to get started.'}
            </Text>
            {!search && (
              <Button onClick={() => setShowCreateModal(true)} className="mt-6 gap-2">
                <UserPlus size={16} /> Create First User
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={u => setEditUser(u)}
                  onToggle={handleToggle}
                  onDelete={u => setConfirmDelete(u)}
                  isCurrentUser={user.id === currentUserId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Create Modal ──────────────────────────────────────────── */}
      <UserFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={saving}
      />

      {/* ── Edit Modal ────────────────────────────────────────────── */}
      <UserFormModal
        isOpen={!!editUser}
        onClose={() => setEditUser(undefined)}
        onSubmit={handleUpdate}
        editUser={editUser}
        isLoading={saving}
      />

      {/* ── Delete Confirm Modal ──────────────────────────────────── */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(undefined)}
        title="Remove User"
        subtitle="This action cannot be undone"
        maxWidth="max-w-sm"
      >
        {confirmDelete && (
          <div className="space-y-4">
            <div className="p-4 bg-status-red/5 border border-status-red/20 rounded-xl flex items-center gap-3">
              <ShieldAlert size={20} className="text-status-red shrink-0" />
              <div>
                <Text variant="sm" className="font-black text-status-red">
                  {confirmDelete.full_name}
                </Text>
                <Text variant="xs" className="opacity-60">{confirmDelete.email}</Text>
              </div>
            </div>
            <Text variant="sm" className="opacity-60">
              This will permanently remove the user's access to SMRITI-OS. Their historical records will be preserved.
            </Text>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setConfirmDelete(undefined)} className="flex-1">
                Cancel
              </Button>
              <button
                onClick={async () => {
                  // Future: implement delete endpoint
                  await api.users.update(confirmDelete.id, { active: false });
                  await loadUsers();
                  setConfirmDelete(undefined);
                }}
                className="flex-1 h-12 bg-status-red text-white rounded-xl font-bold text-sm hover:bg-status-red/90 transition-colors"
              >
                Deactivate User
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

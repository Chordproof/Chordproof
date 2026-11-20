"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User, Settings, CreditCard, Music, History, Bookmark, LogOut,
  Loader2, Check, Pencil, ExternalLink, Trash2,
} from "lucide-react";
import PlayerStats from "@/components/PlayerStats";
import OfflineLibrary from "@/components/OfflineLibrary";
import ManageBillingButton from "@/components/ManageBillingButton";

type Profile = {
  email: string;
  name: string | null;
  displayName: string | null;
  bio: string | null;
  image: string | null;
  createdAt: string | null;
};
type Bookmark = {
  tab_id: string; song: string; artist: string; slug_artist: string; slug_song: string;
  key_sig: string | null; capo: string | null; difficulty: string | null; created_at: string;
};
type Activity = {
  kind: "viewed" | "saved" | "completed" | "downloaded";
  song: string | null; artist: string | null;
  slug_artist: string | null; slug_song: string | null; created_at: string;
};
type Payload = {
  profile: Profile;
  bookmarks: Bookmark[];
  activity: Activity[];
  plus: { hasAccess: boolean; inTrial: boolean; trialEnd: string | null };
};

const TAB_IDS = ["overview", "tabs", "settings"] as const;
type TabId = (typeof TAB_IDS)[number];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

const ACTIVITY_LABEL: Record<Activity["kind"], string> = {
  viewed: "Viewed", saved: "Saved", completed: "Played", downloaded: "Downloaded",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-24 flex justify-center"><Loader2 className="animate-spin text-brand-gold" /></div>}>
      <Profile />
    </Suspense>
  );
}

function Profile() {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useSession();

  const initialTab = (TAB_IDS as readonly string[]).includes(params.get("tab") || "")
    ? (params.get("tab") as TabId)
    : "overview";
  const [tab, setTab] = useState<TabId>(initialTab);

  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/profile");
    if (r.status === 401) {
      router.replace("/auth/signin?callbackUrl=/profile");
      return;
    }
    const j = await r.json();
    if (j?.error) { setError(j.error); return; }
    setData(j);
    setNameDraft(j.profile.displayName || j.profile.name || "");
    setBioDraft(j.profile.bio || "");
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=/profile");
      return;
    }
    if (status === "authenticated") load();
  }, [status, load, router]);

  function switchTab(t: TabId) {
    setTab(t);
    router.replace(`/profile?tab=${t}`, { scroll: false });
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const r = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: nameDraft, bio: bioDraft }),
      });
      if (!r.ok) throw new Error("save failed");
      await load();
      setEditing(false);
      setSavedMsg("Profile updated");
      setTimeout(() => setSavedMsg(null), 2500);
    } catch {
      setSavedMsg("Could not save");
      setTimeout(() => setSavedMsg(null), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function removeBookmark(b: Bookmark) {
    setData((d) => d ? { ...d, bookmarks: d.bookmarks.filter((x) => x.tab_id !== b.tab_id) } : d);
    await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ artist: b.slug_artist, song: b.slug_song }),
    });
  }

  if (status === "loading" || (!data && !error)) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex justify-center">
        <Loader2 className="animate-spin text-brand-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-3">
        <p className="text-lg font-bold">Could not load your profile</p>
        <p className="text-brand-muted text-sm">{error}</p>
        <button onClick={() => load()} className="bg-brand-accent text-black px-6 py-3 rounded-full font-bold">Try again</button>
      </div>
    );
  }

  const p = data!.profile;
  const joined = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null;
  const shownName = p.displayName || p.name || p.email.split("@")[0];
  const planLabel = data!.plus.hasAccess
    ? data!.plus.inTrial ? `TRIAL — ends ${data!.plus.trialEnd ? new Date(data!.plus.trialEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "soon"}` : "PLUS"
    : "FREE Plan";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-[var(--c-card)] rounded-3xl p-8 border border-[var(--c-hairline)]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-accent to-emerald-600 flex items-center justify-center text-4xl font-black shrink-0 overflow-hidden">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              shownName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-center md:text-left flex-1 space-y-2">
            <h1 className="text-3xl font-bold">{shownName}</h1>
            <p className="text-brand-muted break-all">{p.email}</p>
            {p.bio && <p className="text-sm text-brand-muted max-w-lg">{p.bio}</p>}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${data!.plus.hasAccess ? "bg-brand-gold/15 text-brand-gold" : "bg-brand-accent/10 text-brand-accent"}`}>
                {planLabel}
              </span>
              {joined && <span className="bg-[var(--c-overlay-soft)] px-4 py-1.5 rounded-full text-sm">Joined {joined}</span>}
              <span className="bg-[var(--c-overlay-soft)] px-4 py-1.5 rounded-full text-sm">
                {data!.bookmarks.length} saved
              </span>
            </div>
          </div>
          {data!.plus.hasAccess ? (
            <ManageBillingButton
              label="Manage plan"
              className="bg-brand-accent text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 transition shrink-0 flex items-center gap-2"
            />
          ) : (
            <Link href="/pricing" className="bg-brand-accent text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 transition shrink-0">
              Upgrade to Plus
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--c-overlay-soft)] rounded-xl p-1">
        {[
          { id: "overview" as const, label: "Overview", icon: User },
          { id: "tabs" as const, label: "My Tabs", icon: Bookmark },
          { id: "settings" as const, label: "Settings", icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            aria-selected={tab === t.id}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
              tab === t.id ? "bg-brand-accent text-black" : "hover:bg-[var(--c-overlay)]"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-8">
          <PlayerStats />
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><History size={18} /> Recent Activity</h2>
            {data!.activity.length === 0 ? (
              <div className="bg-[var(--c-card)] rounded-xl p-8 border border-[var(--c-hairline)] text-center space-y-2">
                <p className="text-brand-muted">Nothing here yet.</p>
                <p className="text-sm text-brand-muted">Open a tab and save it — your activity shows up here.</p>
                <Link href="/browse" className="inline-block mt-3 bg-brand-accent text-black px-5 py-2.5 rounded-full font-bold text-sm">Browse tabs</Link>
              </div>
            ) : (
              data!.activity.map((a, i) => {
                const href = a.slug_artist && a.slug_song ? `/tab/${a.slug_artist}/${a.slug_song}` : "/browse";
                return (
                  <Link key={i} href={href} className="bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-hairline)] flex justify-between items-center hover:border-brand-gold/40 transition">
                    <div className="flex items-center gap-3">
                      <Music size={16} className="text-brand-accent shrink-0" />
                      <div>
                        <p className="font-bold text-sm">{ACTIVITY_LABEL[a.kind]}</p>
                        <p className="text-brand-muted text-sm">{a.song ?? "—"}{a.artist ? ` — ${a.artist}` : ""}</p>
                      </div>
                    </div>
                    <span className="text-xs text-brand-muted shrink-0">{timeAgo(a.created_at)}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MY TABS */}
      {tab === "tabs" && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bookmark size={18} /> Saved Tabs
              <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold">
                {data!.bookmarks.length}
              </span>
            </h2>
            {data!.bookmarks.length === 0 ? (
              <div className="bg-[var(--c-card)] rounded-xl p-8 border border-[var(--c-hairline)] text-center space-y-2">
                <Bookmark size={36} className="mx-auto opacity-40" />
                <p className="text-brand-muted">No saved tabs yet.</p>
                <p className="text-sm text-brand-muted">Open any tab and tap the bookmark icon to save it here.</p>
                <Link href="/browse" className="inline-block mt-3 bg-brand-accent text-black px-5 py-2.5 rounded-full font-bold text-sm">Browse tabs</Link>
              </div>
            ) : (
              data!.bookmarks.map((b) => (
                <div key={b.tab_id} className="bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-hairline)] flex justify-between items-center gap-3">
                  <Link href={`/tab/${b.slug_artist}/${b.slug_song}`} className="flex-1 min-w-0">
                    <p className="font-bold truncate">{b.song}</p>
                    <p className="text-brand-muted text-sm truncate">
                      {b.artist}
                      {b.key_sig ? ` · ${b.key_sig}` : ""}
                      {b.capo && b.capo !== "0" ? ` · capo ${b.capo}` : ""}
                    </p>
                  </Link>
                  <span className="text-xs text-brand-muted shrink-0 hidden sm:block">{timeAgo(b.created_at)}</span>
                  <button onClick={() => removeBookmark(b)} title="Remove from My Tabs"
                    className="p-2 rounded-full hover:bg-[var(--c-overlay)] text-brand-muted hover:text-red-400 transition shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-[var(--c-hairline)]">
            <OfflineLibrary />
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {tab === "settings" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Account Settings</h2>

          {/* Perfil */}
          <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-hairline)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={18} className="text-brand-muted" />
                <span className="font-bold">Edit Profile</span>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-bold text-brand-gold hover:brightness-110">
                  <Pencil size={14} /> Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="text-sm space-y-1 pl-7">
                <p><span className="text-brand-muted">Display name: </span>{p.displayName || <em className="text-brand-muted">not set</em>}</p>
                <p><span className="text-brand-muted">Bio: </span>{p.bio || <em className="text-brand-muted">not set</em>}</p>
                <p><span className="text-brand-muted">Email: </span>{p.email} <span className="text-xs text-brand-muted">(from Google)</span></p>
              </div>
            ) : (
              <div className="space-y-3 pl-7">
                <div>
                  <label htmlFor="dn" className="text-sm text-brand-muted block mb-1">Display name</label>
                  <input id="dn" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={40}
                    className="w-full bg-[var(--c-overlay-soft)] border border-[var(--c-hairline)] rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="bio" className="text-sm text-brand-muted block mb-1">Bio <span className="text-xs">({bioDraft.length}/200)</span></label>
                  <textarea id="bio" value={bioDraft} onChange={(e) => setBioDraft(e.target.value)} maxLength={200} rows={3}
                    className="w-full bg-[var(--c-overlay-soft)] border border-[var(--c-hairline)] rounded-lg px-3 py-2 text-sm resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveProfile} disabled={saving}
                    className="flex items-center gap-2 bg-brand-accent text-black px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-60">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                  </button>
                  <button onClick={() => { setEditing(false); setNameDraft(p.displayName || p.name || ""); setBioDraft(p.bio || ""); }}
                    className="px-5 py-2 rounded-lg text-sm font-bold bg-[var(--c-overlay-soft)]">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Plano */}
          <div className="bg-[var(--c-card)] rounded-xl border border-[var(--c-hairline)] p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-brand-muted" />
                <div>
                  <p className="font-bold">Billing</p>
                  <p className="text-sm text-brand-muted">{planLabel}</p>
                </div>
              </div>
              {data!.plus.hasAccess ? (
                <ManageBillingButton
                  label="Manage"
                  className="flex items-center gap-1.5 text-sm font-bold text-brand-gold hover:brightness-110"
                />
              ) : (
                <Link href="/pricing" className="flex items-center gap-1.5 text-sm font-bold text-brand-gold">
                  See plans <ExternalLink size={13} />
                </Link>
              )}
            </div>
            {data!.plus.hasAccess && (
              <p className="text-xs text-brand-muted mt-3 pl-7">
                Cancel, change your card or download invoices below — no need to email support.
              </p>
            )}
          </div>

          {/* Sign out */}
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition mt-2">
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      )}

      {savedMsg && (
        <div role="status" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a1a2e", border: "1px solid #333", color: "var(--c-text)", padding: "10px 18px", borderRadius: 999, fontSize: 13, zIndex: 80 }}>
          {savedMsg}
        </div>
      )}
    </div>
  );
}

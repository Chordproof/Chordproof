export default function CancelSubscription() {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-8">
      <h1 className="text-3xl font-bold">Cancel Subscription</h1>
      <p className="text-[var(--c-text-secondary)]">
        We're sorry to see you go. If you cancel, you will still have Premium access until <strong>August 28, 2026</strong>.
      </p>

      <div className="space-y-4">
        <button className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-[var(--c-text)] transition">
          Yes, cancel my subscription
        </button>
        <button className="w-full py-4 bg-[var(--c-overlay-soft)] rounded-xl font-bold hover:bg-[var(--c-overlay)] transition">
          No, keep my subscription
        </button>
      </div>

      <p className="text-xs text-[var(--c-text-tertiary)]">
        No retention calls. No hidden fees. Just one click.
      </p>
    </div>
  );
}

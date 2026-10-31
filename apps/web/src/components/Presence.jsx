import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
  Visit counter.

  The number is NOT invented. It comes from /api/portfolio-status, the
  Cloudflare Pages Function already running on the live site, which keeps the
  count in Upstash Redis and increments once per visitor session rather than
  once per page load. Its response looks like:

      { visits, online, lastSeen, presenceConfigured }

  In local dev that route does not exist, so the fetch fails and this renders
  nothing. That is deliberate: a site whose Results section opens with
  "verified outcomes, not adjectives" cannot show a placeholder number three
  screens above it.

  No status dot lives here. The heartbeat belongs to the name in the nav and
  nowhere else.
*/

const ENDPOINT = import.meta.env.VITE_PRESENCE_URL || '/api/portfolio-status';
const REFRESH_MS = 60_000;

export default function Presence({ className }) {
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(ENDPOINT, {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin', // the session cookie is what dedupes visits
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const n = Number(data.visits);
        if (Number.isFinite(n) && n > 0) setVisits(n);
      } catch {
        // A dead endpoint leaves the counter hidden rather than showing a zero
        // that would read as "nobody has ever been here".
      }
    };

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (visits === null) return null;

  return (
    <span
      className={cn(
        'glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium text-white/75',
        className,
      )}
    >
      <Eye className="h-3 w-3 text-white/45" />
      <span className="tnum">{visits.toLocaleString('en-US')}</span>
      <span className="text-white/45">visits</span>
    </span>
  );
}

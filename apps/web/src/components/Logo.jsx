import { useState } from 'react';
import { icon } from '@/lib/icons';
import { cn } from '@/lib/utils';

/*
  Real brand marks, not generic icons.

  - Tools      → Simple Icons CDN (cdn.simpleicons.org/<slug>). Monochrome SVG,
                 colour controlled via the /<colour> path segment.
  - Flags      → /public/flags/<iso2>.svg, drawn circular at source. Cropping
                 a rectangular flag into a circle silently destroys any flag
                 with a hoist band: the UAE loses its red stripe entirely and
                 reads as a different country.
  - Companies  → /public/companies/<file>. Self-hosted, because the favicon
                 services return whatever a domain happens to publish, which
                 for Concentrix was a 25px copy of a logo retired years ago.

  Tool logos are still remote and fall back to a lucide glyph; company marks
  fall back to the favicon service and then to a lettermark.
*/

const SIMPLE_ICONS = 'https://cdn.simpleicons.org';

/** A technology / tool logo. */
export function ToolLogo({ slug, name, fallback = 'Box', size = 18, className }) {
  const [failed, setFailed] = useState(false);
  const Fallback = icon(fallback);

  if (failed || !slug) {
    return (
      <Fallback
        className={cn('text-white/70', className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={`${SIMPLE_ICONS}/${slug}/white`}
      alt={name ? `${name} logo` : ''}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-contain opacity-80', className)}
      style={{ width: size, height: size }}
    />
  );
}

/** A country flag, already circular in the source SVG. */
export function Flag({ code, name, size = 22, className }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-white/10 font-mono text-[9px] uppercase text-white/70',
          className,
        )}
        style={{ width: size, height: size }}
      >
        {code}
      </span>
    );
  }

  return (
    <img
      src={`/flags/${code}.svg`}
      alt={name ? `${name} flag` : ''}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full ring-1 ring-white/15', className)}
      style={{ width: size, height: size }}
    />
  );
}

/** A company mark: self-hosted file, then favicon service, then a lettermark. */
export function CompanyLogo({ logo, domain, name, size = 40, className }) {
  const favicon = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null;
  const [src, setSrc] = useState(logo || favicon);

  const initials = (name || '?')
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (!src) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-xl bg-white/[0.07] font-semibold tracking-tight text-white/75 ring-1 ring-white/10',
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.34 }}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setSrc(src === logo && favicon ? favicon : null)}
      className={cn(
        'shrink-0 rounded-xl bg-white/[0.06] object-contain p-1.5 ring-1 ring-white/10',
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

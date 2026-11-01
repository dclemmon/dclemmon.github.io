<script lang="ts">
  /**
   * Gentle "week done" banner. Lives inside a persistent role="status" region (in the
   * parent), so screen readers announce it when it appears. Never mentions what's missing.
   */
  interface Props {
    total: number;
    /** Extra line from content, e.g. "The Hope candle is shining." */
    message?: string;
  }
  let { total, message }: Props = $props();
</script>

<div class="banner">
  <svg class="art" viewBox="0 0 52 52" width="52" height="52" aria-hidden="true">
    <circle class="glow" cx="26" cy="22" r="20" />
    <path class="flame" d="M26 6 C34 17 33 28 26 31 C19 28 18 17 26 6Z" />
    <path class="flame-core" d="M26 16 C30 22 29 28 26 29 C23 28 22 22 26 16Z" />
    <rect class="candle" x="20" y="31" width="12" height="18" rx="6" />
    <path class="star" d="M6,8 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2z" />
    <path class="star" d="M45,30 l1.5,4 4,1.5 -4,1.5 -1.5,4 -1.5,-4 -4,-1.5 4,-1.5z" />
  </svg>
  <div class="text">
    <p class="headline">You did it!</p>
    <p class="detail">
      {message ? `All ${total} done. ${message}` : `All ${total} done.`}
    </p>
  </div>
</div>

<style>
  .banner {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: var(--space-4);
    border-radius: var(--radius-card);
    background: var(--color-celebrate-bg);
    animation: pop var(--motion-base) cubic-bezier(0.2, 1.4, 0.4, 1);
  }

  .star {
    transform-box: fill-box;
    transform-origin: center;
    animation: twinkle 1.2s ease-in-out 2;
  }

  .star + .star {
    animation-delay: 0.3s;
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.92);
    }
  }

  @keyframes twinkle {
    50% {
      transform: scale(1.4) rotate(20deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .banner,
    .star {
      animation: none;
    }
  }

  .art {
    flex: none;
  }

  .glow {
    fill: var(--wreath-glow);
  }
  .flame {
    fill: var(--wreath-flame);
  }
  .flame-core {
    fill: var(--wreath-flame-core);
  }
  .candle {
    fill: var(--wreath-candle-purple);
  }
  .star {
    fill: var(--wreath-star);
  }

  .text {
    display: flex;
    flex-direction: column;
  }

  .headline {
    font-size: var(--text-xl);
    font-weight: var(--font-weight-heavy);
    line-height: var(--line-tight);
  }

  .detail {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
  }
</style>

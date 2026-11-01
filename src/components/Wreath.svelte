<script lang="ts">
  /**
   * The Advent wreath, from docs/design/wreath.svg.
   * Layer order is load-bearing: #sky -> #wreath-back -> #candles -> #wreath-front,
   * so candles sit inside the greenery. State is only the `lit` class on each .candle.
   * Decorative image: the tappable targets are the week chips, not the candles.
   */
  import type { CandleSlot } from '../../content/schema.ts';

  interface Props {
    lit: ReadonlySet<CandleSlot>;
  }
  let { lit }: Props = $props();

  const label = $derived(
    lit.size === 0
      ? 'Advent wreath, no candles lit yet'
      : `Advent wreath, ${lit.size} ${lit.size === 1 ? 'candle' : 'candles'} lit`,
  );
</script>

<svg class="wreath" viewBox="0 0 320 260" role="img" aria-label={label}>
  <g id="sky" aria-hidden="true">
    <path class="star" d="M30,40 l3,8 8,3 -8,3 -3,8 -3,-8 -8,-3 8,-3z" />
    <path class="star" d="M286,28 l2,6 6,2 -6,2 -2,6 -2,-6 -6,-2 6,-2z" />
    <path class="star-soft" d="M300,96 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2z" />
    <path class="star-soft" d="M18,120 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2z" />
  </g>

  <g id="wreath-back">
    <circle class="leaf-a" cx="28" cy="200" r="20" />
    <circle class="leaf-b" cx="38" cy="185" r="20" />
    <circle class="leaf-a" cx="67" cy="172" r="20" />
    <circle class="leaf-b" cx="109" cy="163" r="20" />
    <circle class="leaf-a" cx="160" cy="160" r="20" />
    <circle class="leaf-b" cx="211" cy="163" r="20" />
    <circle class="leaf-a" cx="253" cy="172" r="20" />
    <circle class="leaf-b" cx="282" cy="185" r="20" />
    <circle class="leaf-a" cx="292" cy="200" r="20" />
  </g>

  <g id="candles">
    <!-- Back candles first so front candles overlap them. -->
    <g id="candle-2" class="candle" class:lit={lit.has('2')} data-week="2">
      <circle class="glow" cx="115" cy="104" r="40" />
      <rect class="body-purple" x="103" y="120" width="24" height="60" rx="12" />
      <rect class="hi-purple" x="108" y="128" width="5" height="34" rx="2.5" />
      <g id="flame-2" class="flame">
        <path class="flame-outer" d="M115,90 C125,104 124,116 115,118 C106,116 105,104 115,90Z" />
        <path class="flame-core" d="M115,100 C120,108 119,115 115,116 C111,115 110,108 115,100Z" />
      </g>
    </g>
    <g id="candle-3" class="candle" class:lit={lit.has('3')} data-week="3">
      <circle class="glow" cx="205" cy="104" r="40" />
      <rect class="body-rose" x="193" y="120" width="24" height="60" rx="12" />
      <rect class="hi-rose" x="198" y="128" width="5" height="34" rx="2.5" />
      <g id="flame-3" class="flame">
        <path class="flame-outer" d="M205,90 C215,104 214,116 205,118 C196,116 195,104 205,90Z" />
        <path class="flame-core" d="M205,100 C210,108 209,115 205,116 C201,115 200,108 205,100Z" />
      </g>
    </g>
    <g id="candle-christ" class="candle" class:lit={lit.has('christ')} data-week="christmas">
      <circle class="glow" cx="160" cy="85" r="44" />
      <rect class="body-christ" x="144" y="101" width="32" height="104" rx="14" />
      <g id="flame-christ" class="flame">
        <path class="flame-outer" d="M160,71 C170,85 169,97 160,99 C151,97 150,85 160,71Z" />
        <path class="flame-core" d="M160,81 C165,89 164,96 160,97 C156,96 155,89 160,81Z" />
      </g>
    </g>
    <g id="candle-1" class="candle" class:lit={lit.has('1')} data-week="1">
      <circle class="glow" cx="72" cy="128" r="40" />
      <rect class="body-purple" x="58" y="144" width="28" height="84" rx="14" />
      <rect class="hi-purple" x="64" y="152" width="6" height="46" rx="3" />
      <g id="flame-1" class="flame">
        <path class="flame-outer" d="M72,114 C82,128 81,140 72,142 C63,140 62,128 72,114Z" />
        <path class="flame-core" d="M72,124 C77,132 76,139 72,140 C68,139 67,132 72,124Z" />
      </g>
    </g>
    <g id="candle-4" class="candle" class:lit={lit.has('4')} data-week="4">
      <circle class="glow" cx="248" cy="128" r="40" />
      <rect class="body-purple" x="234" y="144" width="28" height="84" rx="14" />
      <rect class="hi-purple" x="240" y="152" width="6" height="46" rx="3" />
      <g id="flame-4" class="flame">
        <path class="flame-outer" d="M248,114 C258,128 257,140 248,142 C239,140 238,128 248,114Z" />
        <path class="flame-core" d="M248,124 C253,132 252,139 248,140 C244,139 243,132 248,124Z" />
      </g>
    </g>
  </g>

  <g id="wreath-front">
    <circle class="leaf-b" cx="282" cy="215" r="22" />
    <circle class="leaf-a" cx="253" cy="228" r="22" />
    <circle class="leaf-b" cx="211" cy="237" r="22" />
    <circle class="leaf-a" cx="160" cy="240" r="22" />
    <circle class="leaf-b" cx="109" cy="237" r="22" />
    <circle class="leaf-a" cx="67" cy="228" r="22" />
    <circle class="leaf-b" cx="38" cy="215" r="22" />
    <circle class="berry" cx="48" cy="210" r="6" />
    <circle class="berry" cx="130" cy="248" r="6" />
    <circle class="berry" cx="190" cy="248" r="6" />
    <circle class="berry" cx="272" cy="210" r="6" />
  </g>
</svg>

<style>
  .wreath {
    display: block;
    width: 100%;
    max-width: 28rem;
    height: auto;
    margin: 0 auto;
  }

  /* From the <style> block in docs/design/wreath.svg, scoped to this component. */
  .glow {
    fill: var(--wreath-glow);
    opacity: 0;
  }
  .flame {
    opacity: 0;
  }
  .flame-outer {
    fill: var(--wreath-flame);
  }
  .flame-core {
    fill: var(--wreath-flame-core);
  }
  .candle.lit .glow {
    opacity: 0.9;
  }
  .candle.lit .flame {
    opacity: 1;
  }
  .body-purple {
    fill: var(--wreath-candle-purple);
  }
  .hi-purple {
    fill: var(--wreath-candle-purple-hi);
  }
  .body-rose {
    fill: var(--wreath-candle-rose);
  }
  .hi-rose {
    fill: var(--wreath-candle-rose-hi);
  }
  .body-christ {
    fill: var(--wreath-candle-christ);
    stroke: var(--color-border);
    stroke-width: 2;
  }
  .leaf-a {
    fill: var(--wreath-green-1);
  }
  .leaf-b {
    fill: var(--wreath-green-2);
  }
  .berry {
    fill: var(--wreath-berry);
  }
  .star {
    fill: var(--wreath-star);
  }
  .star-soft {
    fill: var(--wreath-star-soft);
  }

  /*
    Motion: lit candles fade in one after another, then their flames flicker gently.
    The end state is the static rules above, so with no animation everything still shows.
  */
  .candle.lit .glow {
    animation: glow-in var(--motion-slow) ease-out backwards;
    animation-delay: var(--light-delay, 0ms);
  }

  .candle.lit .flame {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: flame-in var(--motion-slow) ease-out backwards;
    animation-delay: var(--light-delay, 0ms);
  }

  .candle.lit .flame-outer,
  .candle.lit .flame-core {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: flicker var(--flicker, 2.8s) ease-in-out infinite;
    animation-delay: calc(var(--light-delay, 0ms) + var(--motion-slow));
  }

  #candle-1 {
    --light-delay: 0ms;
    --flicker: 2.6s;
  }
  #candle-2 {
    --light-delay: 150ms;
    --flicker: 3.1s;
  }
  #candle-3 {
    --light-delay: 300ms;
    --flicker: 2.8s;
  }
  #candle-4 {
    --light-delay: 450ms;
    --flicker: 3.3s;
  }
  #candle-christ {
    --light-delay: 600ms;
    --flicker: 2.9s;
  }

  @keyframes glow-in {
    from {
      opacity: 0;
    }
  }

  @keyframes flame-in {
    from {
      opacity: 0;
      transform: scale(0.3);
    }
  }

  @keyframes flicker {
    0%,
    100% {
      transform: scale(1, 1) rotate(0deg);
    }
    30% {
      transform: scale(0.96, 1.05) rotate(-2deg);
    }
    60% {
      transform: scale(1.03, 0.97) rotate(1.5deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .candle.lit .glow,
    .candle.lit .flame,
    .candle.lit .flame-outer,
    .candle.lit .flame-core {
      animation: none;
    }
  }
</style>

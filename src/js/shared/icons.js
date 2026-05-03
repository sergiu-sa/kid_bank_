// Inline icon helper. Replaces the Font Awesome CDN with a small set of
// lucide SVGs imported as raw strings. Each entry is keyed by the FA-style
// name we already use throughout the codebase (so HTML stays familiar:
// <span class="icon" data-icon="home"></span>).

import barcode from 'lucide-static/icons/barcode.svg?raw'
import bicycle from 'lucide-static/icons/bike.svg?raw'
import bolt from 'lucide-static/icons/zap.svg?raw'
import book from 'lucide-static/icons/book-open.svg?raw'
import box from 'lucide-static/icons/box.svg?raw'
import boxOpen from 'lucide-static/icons/package-open.svg?raw'
import broom from 'lucide-static/icons/sparkles.svg?raw'
import burger from 'lucide-static/icons/hamburger.svg?raw'
import camera from 'lucide-static/icons/camera.svg?raw'
import cameraRotate from 'lucide-static/icons/switch-camera.svg?raw'
import chartPie from 'lucide-static/icons/pie-chart.svg?raw'
import chevronLeft from 'lucide-static/icons/chevron-left.svg?raw'
import circleExclamation from 'lucide-static/icons/circle-alert.svg?raw'
import eye from 'lucide-static/icons/eye.svg?raw'
import eyeSlash from 'lucide-static/icons/eye-off.svg?raw'
import gamepad from 'lucide-static/icons/gamepad-2.svg?raw'
import gear from 'lucide-static/icons/settings.svg?raw'
import gift from 'lucide-static/icons/gift.svg?raw'
import globe from 'lucide-static/icons/globe.svg?raw'
import handHoldingUsd from 'lucide-static/icons/hand-coins.svg?raw'
import headphones from 'lucide-static/icons/headphones.svg?raw'
import home from 'lucide-static/icons/house.svg?raw'
import laptop from 'lucide-static/icons/laptop.svg?raw'
import moneyCheckDollar from 'lucide-static/icons/wallet.svg?raw'
import paperPlane from 'lucide-static/icons/send.svg?raw'
import piggyBank from 'lucide-static/icons/piggy-bank.svg?raw'
import plane from 'lucide-static/icons/plane.svg?raw'
import receipt from 'lucide-static/icons/receipt.svg?raw'
import shirt from 'lucide-static/icons/shirt.svg?raw'
import shoppingBag from 'lucide-static/icons/shopping-bag.svg?raw'
import store from 'lucide-static/icons/store.svg?raw'
import trash from 'lucide-static/icons/trash-2.svg?raw'
import user from 'lucide-static/icons/user.svg?raw'
import users from 'lucide-static/icons/users.svg?raw'
import utensils from 'lucide-static/icons/utensils.svg?raw'
import volumeHigh from 'lucide-static/icons/volume-2.svg?raw'
import volumeXmark from 'lucide-static/icons/volume-x.svg?raw'
import wallet from 'lucide-static/icons/wallet.svg?raw'
import xmark from 'lucide-static/icons/x.svg?raw'

// Lucide doesn't ship a GitHub mark since 1.x; use the canonical 24px stroke variant.
const github = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`

export const ICONS = {
  barcode,
  bicycle,
  bolt,
  book,
  box,
  'box-open': boxOpen,
  broom,
  burger,
  camera,
  'camera-rotate': cameraRotate,
  'chart-pie': chartPie,
  'chevron-left': chevronLeft,
  'circle-exclamation': circleExclamation,
  eye,
  'eye-slash': eyeSlash,
  gamepad,
  gear,
  github,
  gift,
  globe,
  'hand-holding-usd': handHoldingUsd,
  headphones,
  home,
  laptop,
  'money-check-dollar': moneyCheckDollar,
  'paper-plane': paperPlane,
  'piggy-bank': piggyBank,
  plane,
  receipt,
  shirt,
  'shopping-bag': shoppingBag,
  store,
  trash,
  tshirt: shirt,
  user,
  users,
  utensils,
  'volume-high': volumeHigh,
  'volume-xmark': volumeXmark,
  wallet,
  xmark
}

// Walk a root for [data-icon] elements and inject the matching SVG inline.
// Safe to call multiple times — already-rendered icons are skipped.
export function renderIcons(root = document) {
  const els = root.querySelectorAll('[data-icon]:not([data-icon-rendered])')
  for (const el of els) {
    const name = el.getAttribute('data-icon')
    const svg = ICONS[name]
    if (!svg) continue
    el.innerHTML = svg
    el.setAttribute('data-icon-rendered', '')
  }
}

// Build an inline icon node for use in DOM-construction code.
// Returns a span with the SVG already mounted (skips renderIcons).
export function iconNode(name, extraClasses = '') {
  const span = document.createElement('span')
  span.className = `icon ${extraClasses}`.trim()
  span.dataset.icon = name
  span.dataset.iconRendered = ''
  span.setAttribute('aria-hidden', 'true')
  span.innerHTML = ICONS[name] ?? ''
  return span
}

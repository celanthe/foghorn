# Changelog

## 1.1.0 — 2026-03-30

### Accessibility
- Bump --font-size-xs from 12px to 13px (affects 33+ locations)
- Remove all 28 font-style: italic instances across 10 CSS files
- Fix broken skip-link tokens (--color-deep-ocean/--color-soft-white to valid tokens)
- Add ErrorBoundary with grief-appropriate messaging
- Add global input font-size (16px min) to prevent iOS zoom
- Add overscroll-behavior-y: contain

### Legal and Privacy
- Add MIT LICENSE file
- Create privacy policy (GDPR Art. 9 compliant for sensitive grief data)
- Add geolocation consent flow before sending location to OpenWeatherMap
- Add privacy policy link in Settings

### PWA
- Add vite-plugin-pwa with workbox caching (weather: NetworkFirst, historical: CacheFirst)
- Add service worker registration
- Add 192px/512px PNG icon entries to manifest

### UX
- Decouple weather from ritual recording — app works without weather data
- Migrate all hardcoded strings to content/en.json
- Change error message to reassurance pattern ("Your data is safe")

### Code Quality
- Self-host Google Fonts (Merriweather, Crimson Text via @fontsource)
- Delete 138 lines of dead Lumentide code from core/utils.js
- Remove duplicate IndexedDB index

## 1.0.0 — 2026-03-30

### Accessibility
- Add focus trapping to all dialog panels (QuarterlyCheckIn, RetroRitualCapture, Onboarding)
- Add skip-to-content link for keyboard navigation
- Add aria-live announcements on play button state changes
- Add aria-modal and aria-labelledby to all dialog panels
- All interactive elements meet 44px minimum touch target (WCAG SC 2.5.5)
- Add focus-visible styles with consistent focus ring across all components
- Add prefers-reduced-motion fallbacks on every animation and transition
- Remove text-transform: uppercase from all small labels (dyslexia-friendly)
- Replace serif fonts on data values with sans-serif for readability
- Reduce letter-spacing to 0.03em on all label elements
- Remove emoji from foghorn weather trigger notification

### Visual Polish
- Replace all emoji icons with inline SVGs (play, stop, record, settings, refresh)
- Add panel open/close animations (fadeSlideIn) to all 5 panels
- Add content-loaded fade-in on main area
- Add button press feedback (scale 0.97 on active) for play and record buttons
- Add audio playback pulse animation on play button while sound plays
- Add hover states on save buttons (ritual capture, settings)
- Add hover lift on weather detail cards (wind, humidity)
- Add branded loading state with app title and gentle pulse animation
- Add custom ::selection color matching coastal theme
- Add smooth scroll behavior (with reduced-motion fallback)

### PWA & Meta
- Add PWA manifest with standalone display mode
- Add lighthouse silhouette favicon (replaces Vite default)
- Add Open Graph meta tags for link preview cards
- Add apple-touch-icon and apple-mobile-web-app meta tags
- Add viewport-fit=cover and safe-area-inset padding for notched devices
- Set proper title casing ("Foghorn" not "foghorn")

### UX
- Surface app tagline in the header
- Add privacy statement to Settings panel and Onboarding
- Replace developer error message ("add API key to .env") with user-friendly copy
- Add first-ritual prompt for new users ("Your first ritual begins whenever you're ready")
- Extend ritual-saved confirmation from 2.5s to 5s, make it tappable to dismiss
- Change grief phase "Not tracking" option to "Just here"
- Add visual spacing between context sections and action buttons

### Security
- Add useDialogFocus hook for consistent focus trap implementation across dialogs

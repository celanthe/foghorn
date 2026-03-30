# Changelog

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

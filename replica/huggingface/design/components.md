# Components

Icons: Lucide (MIT). Fonts: Source Sans 3 and IBM Plex Mono (OFL). Logo, emoji mascot, copy and brand colour are not taken; accent is a placeholder role. Dark theme: `color-dark` in tokens.json.

Button
  variants  primary (ink), secondary (outlined), ghost, danger, accent
  sizes     sm 28px, md 36px, lg 44px; pill radius for header CTA
  states    default, hover (surface-2), active, focus-visible (2px accent ring), disabled, loading (label kept)
  tokens    ink/on-ink, border, radius md, type sm/500
  a11y      real <button>, visible focus, loading sets aria-busy
  used on   MainHeader, ModelHeader (Deploy, Use this model, Copy to bucket), Like, Follow, Comment, Apply filters

SplitButton (Like + count, Follow + count)
  states    default, pressed (liked), hover, focus-visible, disabled when signed out (opens login)
  a11y      aria-pressed; count in the accessible name

DropdownMenu (Deploy, Use this model, Sort, Libraries, Languages, Licenses, theme)
  states    closed, open, item hover, item disabled, keyboard: arrows, Esc, typeahead
  a11y      menu/menuitem roles, focus returns to trigger

Tag / Chip (task, library, language, license, safetensors)
  variants  filter (link to listing), static; sizes sm 28px
  states    default, hover, selected (accent border), focus-visible
  used on   ModelHeader, DatasetHeader, filter sidebar

Tabs (Model card, Files and versions, Community)
  states    default, hover, selected (2px ink underline), focus-visible; counter badge
  a11y      tablist, arrow keys, links when routes

SearchField (header, Ctrl K)
  states    default, focus (accent ring), typing with suggestions list, empty, loading
  a11y      combobox, listbox results, shortcut hint aria-hidden

MainHeader: 64px, logo slot, SearchField, nav links (Models, Datasets, Spaces, Buckets, Docs, Pricing), overflow menu, Log In, Sign Up; collapses to drawer under 1024px.
ThemeSwitcher: system, light, dark; persisted, SystemThemeMonitor follows prefers-color-scheme.
Banner (SSOBanner, UnsafeBanner): surface-2 or warning tint, dismissible, role=status.

RepoHeader (ModelHeader, DatasetHeader, SpaceHeader, OrgHeaderActions)
  owner/name in mono, copy control, Like, Follow, tags row, tabs row; skeleton while loading, error state for 404 and gated repos.

FileTree + LastCommit (Files and versions): rows with icon, name, message, size, date; branch selector button (main); xet and LFS badge; empty repo state.
RepoCodeCopy: mono block with copy button, copied state announced politely.
SideNavigation / SideMenu / SubSideMenu (docs, repo): 360px aside, collapsible, current item aria-current.
InferenceWidget: card with input, run button, loading, error, result.
ModelTree, LinkedSpacesList: key-value rows and chip lists.
Card (listing item): surface, border, radius lg, hover shadow-card; title mono, meta row (task, updated, downloads, likes).
Table (discussions, files, datasets viewer): sticky header, zebra none, row hover, empty state.
Modal (CopyToBucketModal): focus trap, Esc closes, scrim, radius lg, shadow-pop.
DiscussionEvents / UpvoteControl: timeline with avatar, markdown body, comment composer.
Form (join, login, settings tokens): label above, input 40px border-input, error text danger with aria-describedby, success toast.
Markdown body: prose type scale, mono code, tables, callouts.
Footer + DocFooterNav: previous/next links.
Toast, Skeleton, Avatar (initials fallback), Pagination, Sparkline (downloads, accent stroke).

# Interface

Eclipse's UI is stored as editable Studio instances under Interface.Assets. Components bind behavior to those instances.

## Edit the stored assets

- Customization: editor panels, pages and inspector.
- EclipseTransition: the entry/exit transition.
- CharacterSheet and NameCard: identity displays.
- Templates: accessory rows, outfit rows and name tags.
- CustomizationIdle: the stored Animation instance.

Preserve names used by binders. Use Interface.Core.theme for palette and timing changes. Interface.Core.styling applies the theme to cloned instances.

## Scaling and accessories

Editor body-scale edits refit accessories to retain their placement relative to the holding body part and their relative size. Saved outfits, imports and server calls apply submitted transforms directly.

## Test interaction paths

Check open, select, transform, focus, return, close and reopen. Check viewport zoom without sidebar scrolling, compact layouts, and identity display after a head replacement.

See [Interface](/learn/interface), [Handles](/learn/handles) and [Scene](/learn/scene).

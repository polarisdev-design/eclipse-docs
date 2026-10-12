# Identity

Identity is part of the outfit:

```lua
Identity = {
    Name = "Captain Vale",
    Bio = "A pilot from the outer rim.",
}
```

The Identity tab submits name and bio changes on blur. Empty text clears a field. Default limits are 30 bytes for names and 250 bytes for bios; truncation preserves UTF-8 character boundaries.

## Filtering

Validation cleans text. The server filters changed names and bios before displaying them. Editor changes are rate limited; saved outfits and imports are also filtered on application. If filtering fails, the previous accepted field is retained.

## Display

The server writes EclipseName and EclipseBio character attributes. Clients use those attributes for name tags, hover cards and sheets.

A roleplay name produces a name tag; an unset name produces none. The Sheet topbar button opens your own sheet. Clicking or tapping another visible player within the configured distance opens theirs.

## Persistence

Named saves contain identity. Loading or importing restores it through server filtering. Identity is not restored from a last-worn outfit on join.

See [Identity](/learn/identity) for the implementation and testing steps.

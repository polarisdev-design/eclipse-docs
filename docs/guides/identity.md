# Identity

Roleplay names and bios are stored in `outfit.Identity`:

```lua
Identity = {
    Name = "Captain Vale",
    Bio = "A pilot from the outer rim.",
}
```

In the Identity tab, click away from a text box to submit it. Blank text clears the field.

The default limits are 30 bytes for a name and 250 for a bio. These are byte limits, not character counts. Truncation keeps UTF-8 characters intact.

## What other players see

Validation cleans the text, then the server filters new names and bios. A failed filter keeps the previous accepted value. Editor changes are rate limited.

Accepted fields are written to the character's `EclipseName` and `EclipseBio` attributes. Clients read those attributes to draw the name tag and sheet.

No roleplay name means no name tag. The sheet uses the player's display name as its fallback.

## Character sheets

The Sheet button in the top bar opens your own sheet. Click or tap another visible player within the configured distance to open theirs.

The sheet shows their roleplay name, username, height and bio. Name tag and sheet distances are set in `Configuration.Identity`.

## Saved and imported identities

Names and bios save with the outfit. Loading a save or applying an import filters them again before display.

[Identity](/learn/identity) explains filtering, character attributes and the client displays.

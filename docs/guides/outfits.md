# Outfits and imports

## Named outfits

The Outfits tab supports saving the current draft, previewing a save, loading, renaming, overwriting and deleting. There are 20 slots by default.

Saves use versioned native buffers. Revision checks protect operations on existing entries. Joining does not restore the last worn outfit.

## Paragon imports

Paste a normal Paragon outfit transfer code, review its preview and notices, then apply the reviewed result. Save current outfit separately to persist it.

Normal transfer versions 6, 8, 9, 10, 11 and 12, plus the version-13 compressed wrapper, are supported. PRG1 portable codes and accessory-only codes are rejected.

Mesh fallback preserves source names and independent copies when a usable catalog origin is unavailable. Roleplay names and bios are imported and filtered on application. Unsupported data is described in the review.

## Server integration

Use ListOutfits, SaveOutfit, LoadOutfit and ManageOutfit through the server root. Existing-entry actions require both an ID and revision. Custom storage must be configured before the first saved-outfit request.

Read [Outfits](/learn/outfits), [Importing](/learn/importing) and the [server API](/api/server).

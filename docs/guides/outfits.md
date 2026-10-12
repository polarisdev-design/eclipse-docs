# Outfits and imports

## Saving an outfit

Open Outfits and enter a name. Save current outfit stores the editor's current draft. There are 20 save slots by default.

Select a saved entry to preview it. Load applies it; Rename changes its name; Overwrite replaces its data; Delete removes it.

Existing-entry requests include a revision. If another request changed the save first, the old revision is rejected.

## Importing from Paragon

Use Paragon's normal outfit Export code:

1. Paste the code into the import box.
2. Press Review code.
3. Check the preview and the omitted or adjusted items.
4. Press Apply import.
5. Save current outfit if you want to keep it.

Applying an import does not create a save.

The reader supports normal transfer versions 6, 8, 9, 10, 11 and 12, and the version-13 compressed wrapper. It does not accept PRG1 or accessory-only codes.

When an item has no usable catalog origin, Eclipse tries its mesh ID. Names and repeated mesh copies are kept. Imported names and bios are filtered when applied.

Unsupported data and changes caused by configured limits appear in the review.

## From a server script

Use `SaveOutfit`, `LoadOutfit` and `ListOutfits`, or `ManageOutfit` for the other actions. Requests on an existing save need its ID and revision.

See the [server API](/api/server) for payloads. [Outfits](/learn/outfits) explains storage and retries, and [Importing](/learn/importing) explains conversion.

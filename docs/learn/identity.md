# Identity


What you'll learn: how players give their character a roleplay name and bio, how those
reach everyone else safely, and how name tags and character sheets show them.

## The Idea


A roleplay name and bio are part of the outfit, in outfit.Identity:

```text
Identity = {
	Name = "Captain Vale",                        -- nil means no name tag
	Bio = "A pilot from the outer rim.",          -- nil means no bio
}
```

Because they live in the outfit, they go through the same pipeline as everything else:
the editor changes its copy, the server checks it, and saving an outfit saves the name and
bio with it. Loading a saved outfit brings them back, and so does importing a Paragon
transfer code that has them.

Other players read them, so the server writes the accepted name and bio to the character
as attributes (EclipseName and EclipseBio, listed in Schema.IdentityAttributes). Character
attributes replicate to every client, so name tags and sheets are drawn from them without
any extra remotes.

## Where It Lives


```text
Config.configuration.Identity            lengths, rate limit, distances
Data.schema                              Identity in the outfit, IdentityAttributes
ServerScriptService.Eclipse
	Modules.validation                   CleanIdentity: type, length, control characters
	Modules.identity                     Resolve (filtering) and Apply (attributes)
ReplicatedStorage.Eclipse
	Controllers.identity                 starts the sheet and the name tags
	Interface.Tabs.identity              the Identity tab in the editor
	Interface.Screens.sheet              the character sheet
	Interface.Helpers.nametags           name tags, the hover card and clicking
```

## Cleaning And Filtering


Validation.Clean only cleans the text: it must be a valid string, control characters are
removed (a bio keeps its line breaks), runs of blank lines are shortened, and the text is
cut to MaxNameLength or MaxBioLength bytes without splitting a character. Empty text
becomes nil.

Filtering happens in Services.service, right after cleaning, through Identity.Resolve.
Text one player writes that other players can see must go through Roblox's filter first.
Resolve only filters a name or bio that differs from what the player already has, so
changing a color or moving a hat never calls the filter.

- If the filter fails or blocks the whole text, the player keeps their previous value.
- Editor changes are rate limited (ChangesPerMinute). Saved outfits and imports are
  filtered too, but don't count toward the limit.
- The last text filtered for each field is remembered per player. The editor keeps
  sending its own unfiltered copy until the server's answer settles (guide 09), so this
  saves filtering the same text twice.

Filtering every value that differs, including saved and imported ones, matters: a saved
outfit holds whatever the client sent when it was saved, so it is never trusted to be
filtered already.

After the apply, Identity.Apply writes the name and bio to the character's attributes. It
runs on every apply, respawns included, so a new character always has them.

## Name Tags


Interface.Helpers.nametags clones Assets.Templates.NameTag, a BillboardGui, onto every
character's head on every client. The tag shows only when the character has a name; with
no name there is no tag at all. It is sized to the name, and fades out over the last
NameTagFade studs before NameTagDistance, since a BillboardGui's MaxDistance would
otherwise cut it off in one frame.

A description apply can replace the head, which destroys the tag with it, so the tag is
rebuilt whenever a new head arrives or the tag is destroyed.

## Opening Another Player's Sheet


Each frame, a ray goes from the camera through the mouse, up to SheetDistance studs. If it
hits another player's character (or an accessory they're wearing), the hover card
(Assets.NameCard) appears beside the cursor and the character gets an outline. Clicking
opens their sheet. On a touch screen, tapping a player does the same.

The ray skips your own character, parts hidden on your screen (like the world while the
editor is open), and anything behind a visible piece of interface such as an editor panel.

## The Character Sheet


Interface.Screens.sheet shows a player's roleplay name (or their display name when they
have none), @username, height and bio. Your own opens from the Sheet button in the top bar.

Height comes from the character's BodyHeightScale value times Configuration.Height
BaseInches, shown in feet and inches. While the sheet is open it redraws whenever that
player's name, bio or height changes, and when they respawn; it closes if they leave.

## Server Scripts


A server script can give a player a name or bio the same way it changes anything else:

```lua
local outfit = Eclipse.GetOutfit(player)
outfit.Identity.Name = "Guard"
Eclipse.ApplyOutfit(player, outfit)
```

It is filtered like any other name before anyone sees it.

## Try It


Playtest, open the editor, go to Identity, type a name and click away. The tag appears
over your head. Open the Sheet button in the top bar to see your sheet. Then start a test
with two players (Test &gt; Clients and Servers), point at the other player and click them.

## Common Mistakes


- Showing player-written text to others without filtering it. It must go through
  TextService first, and must fail closed: if the filter errors, don't show the text.
- Trusting text from a saved outfit or a client as already filtered.
- Calling the filter on every apply instead of only when the text changed.
- Setting the name tag's MaxDistance and nothing else, so it pops out of existence.

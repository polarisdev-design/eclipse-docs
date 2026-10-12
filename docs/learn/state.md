# State


What you'll learn: how the editor shows changes instantly while the server stays in
charge, and how it avoids flooding the server or jumping back mid-change.

## The Idea


If the editor waited for the server before showing every change, every change would lag
by a round trip, and anything continuous (dragging a color or transparency slider) would feel
terrible. So the client keeps its own copy of the outfit and changes it straight away.
This is often called optimistic updating.

But the server has the final say (guide 04). So the client also:

1. sends its copy to the server shortly after each change
2. listens for the server's answer
3. replaces its copy with that answer once the player has stopped editing

Anything the server refused quietly disappears at step 3, and the player gets a notice.

## Where It Lives


```text
Interface.State.outfit     OutfitState: the client's copy and all the syncing
```

## The Api


```text
state.Outfit               the client's copy
state.Changed              fires whenever the copy changes, so the editor redraws
state.Notice               fires with a message to show the player
state:Load()               asks the server for the outfit. Yields
state:Update(change)       edits the copy, redraws, and queues a send
state:BeginEdit()          holds sends back
state:EndEdit()            lets them go again
```

Every change in the editor goes through Update:

```lua
state:Update(function(outfit)
	outfit.SkinColor = color
end)
```

## Limiting Sends


A continuous change can update the outfit every frame. Sending 60 outfits a second would
hit the server's limit of 8 a second (guide 04) and waste bandwidth. So Update sends at
most once every SendInterval (0.25 seconds). If a send went out less than 0.25 seconds
ago, it schedules one for later. More changes before that just ride along with the
scheduled send.

## Edit Sessions


Some edits are made of many small steps where only the end result matters, like dragging
the body transparency slider from 0% to 50%. BeginEdit holds sends back until EndEdit,
then sends once:

```text
state:BeginEdit()       -- when the change starts
state:Update(...)       -- as many times as needed; the copy updates, nothing is sent
state:EndEdit()         -- when it finishes; the final outfit is sent once
```

Every BeginEdit must be matched by exactly one EndEdit. If an edit never ended, sends
would stay held forever, so whatever starts an edit session has to end it in every case,
not just the normal one (for example if it is cancelled or cleaned up halfway).

## Settling On The Server's Answer


When OutfitApplied arrives, the client doesn't take it straight away. If the player is
still editing, the answer describes an older outfit, and taking it would make their
change jump back while they are making it. Settle waits until:

- no edit session is open
- no send is waiting
- nothing was sent in the last SettleTime (0.5 seconds)

Then it compares the answer with what was last sent. If they differ, the server must have
refused something, so it fires a notice. Each accessory's Type, Position and Scale are
ignored in that comparison: the server always fills in Type, and it refits Position and
Scale when body scale changes (guide 06).

## Saved Outfit Requests


Saved outfits and imports (guides 13 and 14) go through the same state, because loading
one replaces the client's copy:

```text
state:SavedRequest(action, payload)   sends a saved outfit request. Yields
state.Busy                            true while a request is in progress
state.BusyChanged                     fires with true or false when Busy changes
```

SavedRequest refuses to start while an edit session is open or another request is
running. For Save, Overwrite and ImportReview it attaches a copy of the current outfit, so
the server saves exactly what the player sees at that moment. While Busy is true, Update
ignores changes and Settle waits.

For Load and ImportApply it also cancels any queued send and forgets older answers first.
When the server replies with the accepted outfit, that outfit replaces the client's copy
straight away, without waiting to settle, since the server has already applied it.

## Try It


Add a hat id to Config.configuration's BlockedAssets, playtest, open the editor and add
that hat by id. It appears straight away, then disappears about half a second later with
the notice "Some of your changes weren't allowed, so they were undone."

## Common Mistakes


- Sending to the server on every input event.
- Taking the server's answer while the player is still editing.
- A BeginEdit without a guaranteed EndEdit.
- Treating the client's copy as the truth. It is a preview until the server answers.

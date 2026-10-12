# Scene


What you'll learn: how the editor takes over the camera, hides the world, holds the
character still and poses it, all on one player's screen, and puts everything back exactly when it
closes.

## The Idea


While the editor is open, the player sees their character in a plain grey studio room with
even lighting, a camera they can orbit, and nothing from the map in the way. Other players
see nothing different at all.

The rule that makes this safe: every change is local to this client, and every value that
gets changed is saved first so it can be put back. Opening and closing the editor must
leave the game exactly as it was.

## Where It Lives


```text
Interface.Helpers.camera         orbit, pan and zoom (settings in Config.camera)
Interface.Helpers.environment    the studio room, lighting, hiding the map
Interface.Helpers.movement       holds the character still
Interface.Helpers.pose           plays an idle pose while the editor is open
```

Each one has a SetOpen(value) function that the editor calls when it opens and closes, and
each is cleaned up by a Trove, so destroying it restores everything.

## The Camera


The camera's CameraType is set to Scriptable, which stops Roblox's default camera scripts
from moving it. The first frame the editor has the camera, it saves the type, subject, field
of view, CFrame and focus, and puts them back on close.

Each frame it eases toward its target with smoothing that doesn't depend on frame rate:

```lua
local alpha = 1 - math.exp(-Settings.FocusSmoothing * deltaTime)
```

Closing the same fraction of the remaining gap per second, rather than per frame, means
the camera feels the same at 30 or 240 FPS. A jump bigger than Config.camera's
SnapDistance (a respawn, a teleport) snaps instead of gliding across the map.

## Hiding The World Locally


A part's LocalTransparencyModifier only affects this player's screen, so the environment
sets it to 1 on every part in Workspace except the player's own character and things in the
camera. Effects like particles, lights and billboards are disabled the same way. New parts
that appear while the editor is open are hidden as they arrive.

The room itself is built inside workspace.CurrentCamera. Anything parented to the camera
only exists for this player.

The floor stays at the height it started at. The character's root is anchored while the
editor is open, so when body scale changes the legs get longer or shorter around a root
that doesn't move. Each frame the environment works out where the feet would be from the
humanoid's HipHeight and moves the anchored root up or down to keep them on the floor.

Lighting properties are swapped for neutral ones, and post effects and atmosphere haze are
disabled, so the colors the player picks look true. Every original value is saved in a
table and restored on close.

## Holding The Character Still


The movement helper disables Roblox's default controls through the PlayerModule, anchors
the HumanoidRootPart, and disables AutoRotate. It does this again every physics step,
because other scripts or a respawn can undo it. It remembers the original settings and
restores them on close.

## The Idle Pose


While the editor is open, the pose helper plays the CustomizationIdle animation stored in
Interface.Assets, looped at Action4 priority so it wins over the character's own idle and
walk animations. The animation is preloaded when the helper starts, so the pose doesn't
pop in late. Because a description apply or a respawn can stop or replace the Animator,
the helper checks every frame and starts the track again if it stopped, retrying at most
every two seconds if it can't load. Closing the editor stops and destroys the track.

To use your own pose, change CustomizationIdle's AnimationId. The animation must be owned
by the game's creator, or Roblox won't play it.

## Try It


Playtest with two players (Test &gt; Clients and Servers). Open the editor on one. The other
player still sees the normal map and sees the first player standing there.

## Common Mistakes


- Changing Transparency instead of LocalTransparencyModifier. That changes it for everyone
  once it replicates (or does nothing useful on the client).
- Forgetting to save a value before changing it, so it can't be restored.
- Moving the camera without setting CameraType to Scriptable. Roblox's camera script moves
  it straight back.
- Smoothing by a fixed fraction per frame, which feels different at different frame rates.

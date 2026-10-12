# Handles


What you'll learn: how the 3D arrows and rings on a selected accessory work, why they sit
on an invisible stand-in part, and how a drag becomes a saved transform.

## The Idea


Roblox has two built-in 3D controls:

```text
Handles      arrows on each face of a part. Eclipse uses them to move and resize
ArcHandles   rings around each axis. Eclipse uses them to rotate
```

Both report a drag as a distance (or angle) from where it started. They don't move
anything themselves; the script decides what a drag means.

Eclipse previews each drag on the player's own screen with the same welding code the
server uses (guide 05), so the preview lands exactly where the server will put it. Nothing
is sent while dragging. When the player lets go, the final transform goes into the outfit
and is sent once.

## Where It Lives


```text
Interface.Helpers.handles
	Handles.new          builds the stand-in part and both handle objects
	Follow               keeps the handles on the accessory every frame
	BeginDrag            records where the drag started
	Move, Rotate, Resize   convert a drag into a transform
	Preview              applies a transform on this screen only
	EndDrag              fires Committed with the final transform
	CancelDrag           puts the accessory back where the drag started
Interface.Tabs.accessories     listens to Committed and updates the outfit
```

## The Stand-In Part


The handles aren't put on the accessory itself. They sit on an invisible, anchored Part
inside the camera:

```lua
local proxy = trove:Add(Instance.new("Part"))
proxy.Name = "CustomizationHandles"
proxy.Anchored = true
...
proxy.Parent = workspace.CurrentCamera
```

Why not use the accessory's handle directly?

- Each kind of drag needs the handles to behave differently. While moving, they should
  follow the accessory. While resizing, they should stay still, or they would run away
  from the mouse. A separate part can do either.
- Tiny accessories would have handles too close together to grab. The proxy is never
  smaller than 1 stud on any side.
- The camera only exists on this player's screen, so nobody else sees the proxy.

When no drag is happening, Follow moves the proxy onto the accessory's handle every frame,
matching its position, rotation and size.

## Local Axes


The arrows point along the accessory's own axes, like Studio's local mode. But a transform's
Position is measured along the body attachment's axes (guide 05). So Move converts the
arrow's direction first:

```lua
local direction = self.StartRotation:VectorToWorldSpace(Vector3.FromNormalId(face))
```

StartRotation is how the accessory was rotated relative to the body when the drag began.

## Measuring The Drag


MouseDrag's distance doesn't always start at 0, so the first value seen is used as the
zero point:

```lua
function Handles:Travel(distance: number): number
	if not self.StartDistance then
		self.StartDistance = distance
	end
	return distance - self.StartDistance
end
```

Every drag is measured from the transform at BeginDrag (self.Start), never from the last
frame, so small rounding errors can't build up during a long drag.

## Staying Inside The Limits


Moves are limited by Config.configuration's AccessoryOffset. Clamping each axis on its own
would let a slanted move slide along the edge of the limit, so LimitTravel works out how
far the move can go before any axis hits the limit and stops the whole move there.

Resizing grows from the centre, so both faces move and the accessory stays where it is.
Holding Shift resizes every axis by the same ratio.

R cycles between Move, Rotate and Size, like Studio's shortcut.

## Preview Versus Save


Preview calls Welding.Apply on this player's copy of the accessory. That only changes it on
their screen. Other players see nothing until the drag ends and the server applies the new
outfit. EndDrag only fires Committed if something actually changed, so a click without a
drag sends nothing.

If the menu is hidden or the character respawns mid-drag, the drag is cancelled and the
accessory goes back to where it started.

## Try It


Playtest, open the editor, select a hat and drag a move arrow. Switch the Explorer to the
server view while dragging: the server's copy hasn't moved. Let go, and it jumps to match.

## Common Mistakes


- Adorning handles directly to a part you also move during the drag.
- Measuring each frame's drag from the previous frame instead of from the start.
- Sending to the server during the drag.
- Clamping each axis separately for diagonal moves.

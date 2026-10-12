# Lessons


What you'll learn: real bugs hit while building Eclipse, why each happened, and how to
avoid them in your own code. Most of them are things you only learn by hitting them.

1. ROTATED ACCESSORIES DRIFTED ON EVERY APPLY

What happened: a hat rotated 45 degrees ended up a little further round after every outfit
change.

Why: on a description apply, the engine resets an accessory attachment's position and the
handle's size, but leaves the attachment's rotation alone. The code treated the whole
current hold as the engine's fresh default, so it took Eclipse's own rotation as the new
base and rotated it again on top.

Fix: Welding.GetBase always keeps the saved base rotation and only takes a fresh position
or size when the engine has actually changed it (guide 05).

Lesson: when you store "the original" of something the engine also writes, find out
exactly which parts the engine rewrites, and when.

2. A COMMAND BAR REQUIRE GETS ITS OWN COPY

What happened: calling Eclipse.GetOutfit(player) from the command bar during a playtest
hung forever, even though the game was working.

Why: the command bar runs separately from the game's scripts, so require there gives you
a fresh copy of the module with its own empty tables. That copy never ran Start, so it had
no player sessions, and GetOutfit waited for one that would never arrive.

Lesson: to test a module's state, use a Script in the game, or inspect instances directly
(attributes, values) rather than requiring from the command bar.

3. REMOTEEVENTS WAIT FOR A LISTENER

What happened: a test listener received an OutfitApplied event that was minutes old.

Why: when the server fires a RemoteEvent at a client that has nothing connected to it yet,
Roblox holds the event and delivers it to the first listener that connects. A late
listener gets old events first.

Lesson: don't assume the first event a new listener gets is current.

4. AN IF EXPRESSION KEEPS ONLY ONE RETURN VALUE

What happened: a function that returns two values returned one of them, then nil.

Why: in Luau, an if expression like this

```lua
local a, b = if ready then GetPose(handle) else nil, nil
```

keeps only the first value from GetPose. A function call only expands to all its results
when it is the last thing in a list, and inside an if expression it isn't.

Fix: put the call on its own line.

```lua
local a, b = nil, nil
if ready then
	a, b = GetPose(handle)
end
```

5. A LINE STARTING WITH ( IS AMBIGUOUS

What happened: Luau reported "ambiguous syntax".

Why: Luau doesn't need semicolons, so in

```lua
local value = something
(item :: any).Enabled = false
```

it can't tell whether the second line is a new statement or a call to something(...).

Fix: start the line with a local instead.

```lua
local object = item :: any
object.Enabled = false
```

6. RESIZING MOVED THE ACCESSORY

What happened: dragging a resize arrow made the accessory slide along.

Why: the first version grew the accessory from one face while the other stayed put, so its
centre moved with every change in size.

Fix: grow from the centre and double the drag distance, so the dragged face still keeps
up with the mouse (guide 08).

7. MOVED ACCESSORIES JUMPED WHEN THE BODY WAS SCALED

What happened: a hat moved 1 stud up sat about 4 studs above the head after the head was
scaled to 2, instead of about 2.

Why: the engine rescales an accessory the moment a scale value changes, multiplying its
current attachment position. That position already included Eclipse's 1 stud offset, so
the offset was doubled too. Eclipse then read the result as the new base and added the
offset again on top.

Fix: before changing scale, Welding.ResetAll puts every placed accessory back at its saved
base, so the engine scales a clean base. The server then refits each accessory to keep
its offset from its body part's centre (guide 06). It all happens in one
frame, so nothing flickers.

8. THE FLOOR MOVED WHEN THE BODY WAS SCALED

What happened: changing height in the editor made the studio floor jump up or down.

Why: the room follows the character's feet, worked out from the root's position and the
humanoid's HipHeight. The root is anchored while the editor is open, so a rescale changed
HipHeight without moving the root, and the feet (and the floor with them) moved instead.

Fix: the floor height is fixed when the editor opens, and the anchored root is moved to
keep the feet on it (guide 07).

9. HEAD ACCESSORIES DROPPED WHEN THE BODY WAS SCALED

What happened: after importing an outfit, every accessory hung from the head moved down
0.66 studs the first time the height changed, and stayed there.

Why: Eclipse used to hold a reattached accessory with its own Weld inside the handle. When
a scale value changes, the engine deletes every enabled Weld inside an accessory's handle.
With the weld gone, Eclipse fell back to the accessory's disabled built-in joint and
measured from the head's HatAttachment, which sits 0.66 studs above the head's centre,
instead of from the centre itself. The refit then wrote that error into the outfit.

Fix: reattached accessories are held by a RigidConstraint to an anchor at the body part's
centre. The engine leaves constraints alone (guide 05).

Lesson: if the engine manages a kind of object, don't assume your own copy of it is safe.
A two-line test (add one, change a scale value, check it's still there) found this.

10. NAN GETS THROUGH RANGE CHECKS

Why: NaN (0/0) is not less than, greater than or equal to anything, so

```text
if value < min or value > max then reject() end
```

lets it straight through. Then it spreads: any maths with NaN gives NaN.

Fix: Libraries.check rejects any number that isn't equal to itself (only NaN isn't), and
infinity too (guide 04).

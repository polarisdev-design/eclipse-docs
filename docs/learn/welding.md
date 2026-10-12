# Welding


What you'll learn: how Eclipse moves, rotates, resizes and restyles an accessory, why it
measures everything from a "base", and how it knows which worn accessory is which.

## The Idea


Roblox's own accessory adjustments only allow small moves. Eclipse allows much more by
editing the joint that holds the accessory on.

The key rule: a transform is always an offset from where the engine originally put the
accessory (the base), never from where it is now. Applying the same transform twice lands
in the same place. If transforms were added to the current position instead, every
apply would push the accessory further, and it would drift away over time.

## Where It Lives


```text
Helpers.welding                the main module: GetBase, PoseFor, Apply, ApplyOutfit
Helpers.welding.joints         finds and edits the joint holding an accessory on
Helpers.welding.attachment     hangs an accessory from a different body part
Helpers.welding.appearance     color, material and texture overrides
Helpers.welding.state          the names of every attribute these modules store
ServerScriptService.Eclipse.Modules.tags    matches accessories to asset ids
```

The same welding code runs on the server (after every apply) and on the client (to preview
a handle drag), so the preview always matches what the server does.

## The Joint And The Hold


As guide 01 explained, an accessory is held on by a RigidConstraint named
AccessoryRigidConstraint between an attachment in its handle and an attachment on the body,
or by a Weld named AccessoryWeld on older characters. Joints.Find looks for either. Either
way the joint has two sides: the body's side and the handle's side.

This joint is separate from the body joints, so the Avatar Joint Upgrade (guide 01) doesn't
change it. Eclipse never touches the body's Motor6Ds or AnimationConstraints.

Eclipse never touches the body's side. It only changes the handle's side, which it calls
the hold. For a RigidConstraint the hold is the handle attachment's CFrame. For a Weld it is
C0 or C1, whichever belongs to the handle. Joints.GetHold and Joints.SetHold hide that
difference so the rest of the code doesn't care which kind of joint it is.

The hold says where the joint is relative to the handle. Its inverse says where the handle
is relative to the joint, which Eclipse calls the pose.

## The Transform Maths


A transform has three parts:

```text
Position   studs, along the body attachment's axes
Rotation   degrees, rotating the accessory around its own centre
Scale      a multiplier on the base size
```

Welding.PoseFor converts a base and a transform into the new pose:

```lua
function Welding.PoseFor(base: Base, transform: Transform): CFrame
	return CFrame.new(base.Pose.Position + transform.Position) * ToRotation(transform.Rotation) * base.Pose.Rotation
end
```

Read it left to right: start at the base position plus the offset, rotate by the transform's
rotation, then apply the base's own rotation. Welding.Apply then sets the hold to the
inverse of that pose, and the size to base.Size * transform.Scale.

## The Engine Resets Position But Not Rotation


This is the subtle part. Eclipse saves the base in attributes on the handle the first time
it moves an accessory (BaseHold, BaseSize), along with what it last set (AppliedHold,
AppliedSize). The next time, it needs to know whether the engine has put the accessory
back in its default spot since then.

On a full description apply, the engine rewrites the attachment's position and the
handle's size (both change with body scale). It does not rewrite the attachment's rotation.
So Welding.GetBase:

- always keeps the saved base rotation, because the current rotation is still Eclipse's
- compares the current position with AppliedHold. If they still match, nothing reset it,
  so the saved base position is used. If they differ, the engine reset it, so the current
  position is the new base.
- does the same for size, using AppliedSize.

```lua
local hold = currentHold
if typeof(savedHold) == "CFrame" then
	local untouched = typeof(appliedHold) == "CFrame" and SameVector(appliedHold.Position, currentHold.Position)
	local position = if untouched then savedHold.Position else currentHold.Position
	hold = CFrame.new(position) * savedHold.Rotation
end
```

Getting this wrong was a real bug: rotated accessories drifted a little further on every
apply (guide 16).

## A Different Body Part


An accessory entry can have AttachmentPart = "LeftHand" to hang it from a different part.
Attachment.Set disables the engine's joints (it never destroys them) and adds its own
RigidConstraint, named EclipseAttachmentJoint. It joins an attachment in the handle
(EclipseHandleAttachment) to a shared anchor at the centre of the new part
(EclipseAttachmentAnchor). The disabled joints remember
whether they were on and where they held the accessory, so setting AttachmentPart back to
nil enables them again exactly as they were.

It is a RigidConstraint rather than a Weld on purpose: whenever body scale changes, the
engine deletes every enabled Weld inside an accessory's handle (guide 16).

## Color, Material And Texture


Appearance.Apply sets the overrides on every part of the accessory. The first time it
touches a property it saves the original value in an attribute (EclipseBaseColor,
EclipseBaseMaterial, EclipseBaseTexture). Clearing an override puts that original back, so
the accessory always returns to how the asset made it. A TextureId of 0 removes the
texture, and nil keeps the original.

## Which Accessory Is Which


Roblox doesn't record which asset a worn accessory came from anywhere a script can read.
The accessory's name isn't reliable either: two different hats can share a name.

So Modules.tags loads each asset once with InsertService and builds a fingerprint from its
handle's mesh id and texture id. It then finds the worn accessory with the same fingerprint
and sets two attributes on it:

```text
AssetId     the asset id, which everything else uses to find the accessory
AssetName   the catalog name, for anything that wants to show it
```

Fingerprints are cached, so each asset only loads once per server. The appearance module's
saved original texture is used when there is one, so a recolored accessory still matches.

Imported meshes (guide 03) skip tagging, because Eclipse creates them itself. Helpers.mesh
builds each one from its MeshId with AssetService, adds it with Humanoid:AddAccessory, and
marks it with the attributes EclipseMesh, MeshId, AssetId and AssetKey (the entry's Key).
It also removes mesh accessories the outfit no longer has. Their base size is the
MeshSize from the outfit, saved on the handle as EclipseMeshSize, so Scale multiplies the
size the player imported rather than whatever the engine gave the new handle.

Welding.FindAccessory(character, id) looks for an AssetKey first and an AssetId second, so
Welding.ApplyOutfit passes entry.Key for meshes and entry.AssetId for everything else.
When an entry has a Name, ApplyOutfit also renames the accessory and sets AssetName to it.

## Try It


Playtest, wear a hat, open the editor and move it with the handles. Then select the hat's
Handle in the Explorer (server view) and look at its attributes: CustomizationBaseHold,
CustomizationAppliedHold and the rest. Move it again and watch AppliedHold change while
BaseHold stays the same.

## Common Mistakes


- Adding a transform to the current position instead of the base. It drifts.
- Destroying the engine's joint to attach somewhere else. You can't get it back.
- Holding an accessory on with your own Weld inside its handle. The engine deletes it the
  next time body scale changes. Use a RigidConstraint.
- Finding accessories by name.
- Overriding a color without saving the original first.

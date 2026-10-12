# Avatars


What you'll learn: the engine pieces every avatar is made of, and which of them Eclipse
changes. Nothing here is Eclipse code yet. This is the Roblox side.

## The R15 Body


An R15 character is a Model with a Humanoid and 15 body parts, plus an invisible
HumanoidRootPart that the rest hang from:

```text
Head
UpperTorso, LowerTorso
LeftUpperArm, LeftLowerArm, LeftHand      (and the same on the right)
LeftUpperLeg, LeftLowerLeg, LeftFoot      (and the same on the right)
```

Roblox groups the parts into six body groups for coloring: Head, Torso, LeftArm, RightArm,
LeftLeg and RightLeg. Eclipse keeps both lists in Data.schema, as Schema.BodyGroups and
Schema.BodyPartGroups.

The older R6 rig has six parts with different names ("Left Arm", "Torso"). Eclipse only
supports R15.

## Body Joints And The Avatar Joint Upgrade


Joints connect the body parts so animations can bend them. There are two kinds of R15 rig
in games today, and code that touches joints has to work with both.

The classic rig uses a Motor6D per joint, named after the joint (Neck, Waist,
LeftShoulder, Root and so on) and parented to the lower part of the pair. A Motor6D joins
two parts directly with Part0 and Part1, and its C0 and C1 properties say where the joint
is on each part.

The Avatar Joint Upgrade (AJU) replaces those with constraints. The setting is
StarterPlayer.AvatarJointUpgrade. Roblox is enabling it for games left on Default, and
plans to make it compulsory for every game. An upgraded R15 character has, for each joint:

```text
AnimationConstraint     named like the old Motor6D (Neck, Waist, LeftShoulder). It
                        plays animations, like Motor6D did. Its IsKinematic is true by
                        default, so the body animates exactly as before
BallSocketConstraint    named with "BallSocket" on the end (NeckBallSocket,
                        WaistBallSocket). It limits how far the joint can bend when
                        the body is simulated physically, for example as a ragdoll
```

Both join two Attachments instead of two parts: the RigAttachments already in each body
part (WaistRigAttachment in LowerTorso to WaistRigAttachment in UpperTorso). So the joint's
position is the attachments' CFrame, not C0 and C1.

What that means for scripts:

- character:FindFirstChildOfClass("Motor6D") and joint:IsA("Motor6D") find nothing on an
  upgraded rig. Find joints by name, or check for AnimationConstraint first and fall back
  to Motor6D.
- AnimationConstraint has C0, C1, Part0 and Part1 only as read-only aliases for its
  attachments' CFrames and parents. Reading them works; setting them errors. Move the
  attachments instead.
- For procedural animation (looking around, recoil), Roblox recommends multiplying the
  AnimationConstraint's Transform in RunService.PreSimulation instead of moving
  RigAttachments every frame.

Eclipse handles both rigs because it never moves body joints itself. Body scale is changed
through the humanoid's scale values (below), and the engine moves the joints for either
kind of rig.

## Humanoiddescription


A HumanoidDescription is Roblox's own object for describing a whole look. It has properties
for:

```text
body part asset ids     Head, Torso, LeftArm, RightArm, LeftLeg, RightLeg, Face
clothing asset ids      Shirt, Pants, GraphicTShirt
animation asset ids     IdleAnimation, WalkAnimation, RunAnimation and so on
body colors             HeadColor, TorsoColor, LeftArmColor and so on
body scales             HeightScale, WidthScale, DepthScale, HeadScale,
                        BodyTypeScale, ProportionScale
accessories             AccessoryDescription children, one per accessory
```

On the server you hand one to a humanoid:

```text
humanoid:ApplyDescriptionAsync(description)
```

The engine then loads every asset in it and rebuilds the character to match. This is the
only supported way to change body parts, clothing assets and accessories. It is slow,
because the engine may have to download assets, and it puts every accessory back in its
default spot.

There is also ApplyDescriptionResetAsync, which throws away the current look first and
builds from scratch. It is slower, but it works when something else has changed the
character in a way the normal apply can't follow.

## Scale Values


Every R15 humanoid has six NumberValues inside it: BodyHeightScale, BodyWidthScale,
BodyDepthScale, HeadScale, BodyTypeScale and BodyProportionScale. While the humanoid's
AutomaticScalingEnabled is on, changing one of these makes the engine resize the body
straight away, without a full description apply. Eclipse uses this to change body scale
quickly (Helpers.body, guide 06).

Eclipse controls four of them: height, width, depth and head. BodyTypeScale and
BodyProportionScale are left as the player's own avatar has them.

Two things about how the engine rescales are worth knowing. It happens in the same frame
the value changes, not later. And it rescales each accessory from wherever it is right
now: the accessory's size and its attachment position are both multiplied by the change.
Guide 06 explains why that matters for accessories a player has moved.

## Bodycolors


A character has a BodyColors instance holding one color per body group. Eclipse sets the
part colors directly and keeps BodyColors in step, so anything that reads BodyColors sees
the same colors the parts show.

## Accessories


An Accessory is an instance with a part named Handle inside it. The handle has an
Attachment with a special name, like HatAttachment or HairAttachment. The body has an
attachment with the same name: the Head has a HatAttachment, the UpperTorso has a
BodyFrontAttachment, and so on.

When an accessory is worn, the engine lines the two attachments up and joins them. How it
joins them depends on the rig:

```text
RigidConstraint "AccessoryRigidConstraint"   current characters. Parented to the
                                             Handle, Attachment0 is the handle's
                                             attachment, Attachment1 the body's
Weld "AccessoryWeld"                         older characters and older code. Joins the
                                             Handle and the body part directly, with
                                             C0 and C1 saying where
```

Either way the accessory follows the body part it is joined to. A RigidConstraint holds two
attachments together, so the accessory's spot is the handle attachment's CFrame. A Weld
holds two parts, so its spot is the Weld's C0 or C1. Code that moves accessories must
handle both: in Eclipse, Helpers.welding.joints reads either kind into the same shape, so
the rest of the code never has to ask which it is. Guide 05 explains how Eclipse moves an
accessory by editing that joint.

The accessory joint is separate from the body joints above. The Avatar Joint Upgrade
changes the body's Motor6Ds into AnimationConstraints and BallSocketConstraints, but the
accessory is still held on by its own RigidConstraint (or Weld), which only cares about the
body part's attachment. Because the accessory hangs off the body part's attachment and not
off a body joint, it follows animations and ragdolls on either rig.

Rigid accessories (hats, hair, glasses) keep their shape. Layered clothing (3D jackets,
shirts, pants, shoes) is different: it has a cage that the engine stretches to wrap around
the body and around other layers. Layered clothing fits itself to the body, so it can't be
moved or resized, and the order it is worn in matters (a jacket goes over a shirt). Eclipse
lists the layered types in Schema.LayeredTypes.

## Asset Types And Accessory Types


Two different enums describe an accessory, which confuses almost everyone at first.

```text
Enum.AssetType       what the marketplace calls it: HairAccessory, FaceAccessory, Hat
Enum.AccessoryType   what the character calls it: Hair, Face, Hat
```

The marketplace tells you the asset type (MarketplaceService:GetProductInfoAsync returns an
AssetTypeId). An AccessoryDescription needs the accessory type. Schema.AccessoryTypes maps
one to the other.

Body parts have asset types too, and a head can be a classic Head or a DynamicHead (an
animated face). Schema.AssetSlots lists which asset types each slot accepts.

## Try It


1. Start a playtest and look inside your character in the Explorer. Find the Humanoid's
   scale NumberValues, the BodyColors, and an Accessory. Open the accessory's Handle and
   find its attachment and its AccessoryRigidConstraint (or AccessoryWeld). Then open the
   UpperTorso and find the Waist joint. If it is an AnimationConstraint with a
   WaistBallSocket next to it, your game uses the Avatar Joint Upgrade; if it is a
   Motor6D, it uses the classic rig.
2. In the server command bar, run:
```lua
   local h = game.Players:GetPlayers()[1].Character.Humanoid
   h.BodyHeightScale.Value = 1.3
```

   The character grows straight away. Set it back to 1.

## Common Mistakes


- Calling ApplyDescriptionAsync on the client. It only works on the server.
- Treating an asset type as an accessory type. Use Schema.AccessoryTypes to convert.
- Expecting the engine to keep an accessory where a script moved it. Every description
  apply puts accessories back in their default spot.
- Looking for Motor6D on the body. Upgraded rigs have AnimationConstraints instead, and
  setting C0 or C1 on one errors. Support both, or find joints by name.
- Assuming every accessory uses a Weld (or every one uses a RigidConstraint). Read
  whichever joint is there.
- Destroying or re-enabling the BallSocketConstraints on an upgraded rig without a reason.
  They are part of how that rig works.

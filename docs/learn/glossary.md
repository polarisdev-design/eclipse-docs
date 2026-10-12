# Glossary


Short definitions of the terms used in these guides, in alphabetical order. The number in
brackets is the guide that explains it.

Accessory
```text
An instance with a Handle part that is joined to the body, like a hat or hair. (01)
```

Accessory type
```text
What the character calls an accessory (Enum.AccessoryType.Hair). Compare asset type. (01)
```

AccessoryRigidConstraint / AccessoryWeld
```text
The joint holding an accessory to the body: a RigidConstraint on current characters, a
Weld on older ones. (01)
```

AnimationConstraint
```text
The body joint on rigs with the Avatar Joint Upgrade. Replaces Motor6D and joins two
RigAttachments. (01)
```

Apply (full)
```text
Handing a HumanoidDescription to the humanoid so the engine rebuilds the look. Slow, and
resets accessory positions. (06)
```

Asset id
```text
The number that identifies an item on Roblox, as seen in its catalog link.
```

Asset type
```text
What the marketplace calls an item (Enum.AssetType.HairAccessory). (01)
```

AssetSlots
```text
The list in Data.schema of every single-asset slot: face, body parts, clothing and
animations. (03)
```

Attachment (body / handle)
```text
Matching named Attachments on the body and in an accessory's handle. The engine joins
them to hold the accessory on. (01)
```

Avatar Joint Upgrade (AJU)
```text
Roblox's change from Motor6D body joints to AnimationConstraints and
BallSocketConstraints. Set by StarterPlayer.AvatarJointUpgrade. (01)
```

BallSocketConstraint
```text
On upgraded rigs, the constraint next to each AnimationConstraint that limits how far
the joint bends under physics. (01)
```

Base
```text
Where the engine originally put an accessory. Every transform is measured from it. (05)
```

Body group
```text
One of Head, Torso, LeftArm, RightArm, LeftLeg and RightLeg. (01)
```

BodyColors
```text
The character instance that holds one color per body group. (01)
```

Buffer (outfit)
```text
The compact binary form a saved outfit is stored in. Made by Data.buffer. (12)
```

Character sheet
```text
The window showing a player's roleplay name, username, height and bio. (15)
```

Controller
```text
A client module that Framework starts, in ReplicatedStorage.Eclipse.Controllers. (02)
```

Edit session
```text
A BeginEdit / EndEdit pair that holds sends back while something is being dragged. (09)
```

Fast path
```text
Updating a character without a full apply when only looks changed. (06)
```

Fingerprint
```text
An accessory's mesh id and texture id, used to work out which asset it came from. (05)
```

Framework
```text
Eclipse's module loader. Runs every Init, then every Start. (02)
```

Hold
```text
The handle's side of the joint holding an accessory on. Eclipse moves an accessory by
changing its hold. (05)
```

HumanoidDescription
```text
Roblox's object describing a whole avatar look. (01)
```

Identity
```text
The roleplay Name and Bio in an outfit. (15)
```

Imported mesh
```text
An accessory made from a raw mesh rather than a catalog item. It has MeshId, MeshSize
and Key. (03)
```

Key
```text
The unique id of one imported mesh copy, so two copies of the same mesh stay separate. (03)
```

Layered clothing
```text
3D clothing that wraps around the body, like jackets and shoes. Can't be moved or
resized. (01)
```

LocalTransparencyModifier
```text
A part property that makes it see-through on one player's screen only. (07)
```

Motor6D
```text
The body joint on classic R15 rigs. Joins two parts with C0 and C1. (01)
```

Name tag
```text
The roleplay name drawn above a character's head. (15)
```

Optimistic update
```text
Showing a change straight away, before the server has confirmed it. (09)
```

Outfit
```text
The plain table that describes a whole look. (03)
```

Pose
```text
Where the handle is relative to the joint. The inverse of the hold. (05)
```

Proxy
```text
The invisible part in the camera that the 3D handles sit on. (08)
```

R15
```text
The 15-part character rig Eclipse supports. (01)
```

Rate limit
```text
A cap on how often a player can make a request. (04)
```

Reconcile
```text
Filling in fields an old outfit is missing, from the default. (03)
```

RemoteEvent / RemoteFunction
```text
Objects for sending messages between the client and the server. A RemoteFunction also
returns an answer. (04)
```

Review token
```text
A one-use id the server returns after reviewing an import. Applying the import needs it,
so the client can't swap in a different outfit. (14)
```

Revision
```text
A saved outfit's change counter. Requests carry the revision they expect, so a change to
an outfit that has changed since is refused. (13)
```

RigidConstraint
```text
A constraint that holds two attachments in a fixed position relative to each other.
Current characters use one to hold each accessory on. (01)
```

RunContext
```text
A Script property. Set to Client, a Script runs on every player's device wherever it
is. (02)
```

Saved outfit
```text
A named outfit a player chose to save, stored in a DataStore. (13)
```

Scale values
```text
The NumberValues inside a humanoid that set its body scale. (01)
```

Schema
```text
The module that defines the outfit's shape and its lookup tables. (03)
```

Service
```text
A server module that Framework starts, in ServerScriptService.Eclipse.Services. (02)
```

Session
```text
The server's record of one player's outfit and apply state. (06)
```

Settle
```text
The client taking the server's answer once the player has stopped editing. (09)
```

Signal
```text
An object other code can connect functions to, like an event. From the Signal package.
```

Token bucket
```text
The rate limiting method in Libraries.limiter. (04)
```

Transfer code
```text
The text an outfit is exported as, which the importer reads. (14)
```

Transform
```text
An accessory's Position, Rotation and Scale, measured from its base. (05)
```

Trove
```text
An object that collects connections and instances and cleans them all up at once. From
the Trove package.
```

Validation
```text
The server cleaning an outfit before using it. (04)
```

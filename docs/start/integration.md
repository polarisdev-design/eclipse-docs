# First integration

Use the server root to get a copy of the current outfit, edit the copy, and submit it.

```lua
local Eclipse = require(game:GetService("ServerScriptService").Eclipse)

local function SetRoleplayName(player)
    local outfit = Eclipse.GetOutfit(player)
    if not outfit then return end
    outfit.Identity.Name = "Guard"
    Eclipse.ApplyOutfit(player, outfit)
end
```

Both operations yield. Server-submitted outfits still pass validation, and player-visible identity text passes filtering.

## Observe accepted changes

```lua
Eclipse.OutfitApplied:Connect(function(player, outfit)
    print(player.Name, #outfit.Accessories)
end)
```

The signal also fires after a respawn reapply. It is not an automatic-save trigger.

## Keep explicit loading

Eclipse starts from the Roblox avatar. Named saves are loaded only when requested. Do not add a last-worn restore to the startup path.

See the [server API](/api/server) for methods and the [application guide](/learn/applying) for request ordering.

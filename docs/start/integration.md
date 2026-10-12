# First integration

Use `ServerScriptService.Eclipse` from your server scripts. Get the current outfit, change the fields you need, then pass it back.

This example sets a roleplay name:

```lua
local Eclipse = require(game:GetService("ServerScriptService").Eclipse)

local function SetName(player)
    local Outfit = Eclipse.GetOutfit(player)
    if not Outfit then
        return
    end

    Outfit.Identity.Name = "Guard"
    Eclipse.ApplyOutfit(player, Outfit)
end
```

Both calls yield. GetOutfit returns nil if the player leaves while it is waiting. ApplyOutfit replaces the whole outfit, so starting with the current copy keeps the rest of their appearance.

Names and bios still go through the text filter when submitted by a server script.

## After an outfit is applied

Listen to `OutfitApplied` when another system needs the accepted outfit:

```lua
Eclipse.OutfitApplied:Connect(function(player, Outfit)
    print(player.Name, #Outfit.Accessories)
end)
```

It also fires when an outfit is reapplied after a respawn. Keep saves as explicit requests rather than saving on every signal.

See the [server API](/api/server) for the available methods. [Applying](/learn/applying) explains what happens when several requests arrive at once.

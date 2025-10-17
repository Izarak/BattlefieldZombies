// Script starter
class Player {

    modPlayer: mod.Player;
    points: number;

    private constructor(modPlayer: mod.Player) {
        this.modPlayer = modPlayer;
        this.points = 500;
        playerArray.push(this);

        mod.AddUIText(mod.GetObjId(modPlayer) + "_Points", mod.CreateVector(50, 100, 0), mod.CreateVector(200, 25, 0), mod.UIAnchor.TopLeft, mod.Message(this.points), modPlayer);
        mod.AddUIText(mod.GetObjId(modPlayer) + "_Round", mod.CreateVector(50, 130, 0), mod.CreateVector(200, 25, 0), mod.UIAnchor.TopLeft, mod.Message(round), modPlayer);
        mod.AddUIText(mod.GetObjId(modPlayer) + "_Zombies", mod.CreateVector(50, 160, 0), mod.CreateVector(200, 55, 0), mod.UIAnchor.TopLeft, mod.Message(zombies.length), modPlayer);
    }

    static get(modPlayer: mod.Player): Player {
        for (let i = 0; i < playerArray.length; i++) {
            let listPlayer: Player = playerArray[i];
            if (mod.GetObjId(listPlayer.modPlayer) == mod.GetObjId(modPlayer))
                return listPlayer;
        }
        return new Player(modPlayer);
    }

    updatePoints() {
        mod.SetUITextLabel(mod.FindUIWidgetWithName(mod.GetObjId(this.modPlayer) + "_Points"), mod.Message('$ {}', this.points));
    }

    updateRound() {
        mod.SetUITextLabel(mod.FindUIWidgetWithName(mod.GetObjId(this.modPlayer) + "_Round"), mod.Message('Round: {}', round));
    }

    updateZombieCount() {
        mod.SetUITextLabel(mod.FindUIWidgetWithName(mod.GetObjId(this.modPlayer) + "_Zombies"), mod.Message('Zombies in map: {}', zombies.length));
    }

}

class Door {

    interactable: number;
    door: number;
    price: number;
    opened: boolean = false;

    constructor(interactable: number, door: number, price: number) {
        this.interactable = interactable;
        this.door = door;
        this.price = price;
    }

}

class WallWeapon {

    interactable: number;
    icon: number;
    weapon: mod.Weapons;
    price: number;

    constructor(interactable: number, icon: number, weapon: mod.Weapons, price: number) {
        this.interactable = interactable;
        this.icon = icon;
        this.weapon = weapon;
        this.price = price;
    }

}

class PlayerSwappingWeapon {

    primarySlotPosition = mod.CreateVector(-75, -50, 0);
    secondarySlotPosition = mod.CreateVector(75, -50, 0);
    cancelSlotPosition = mod.CreateVector(0, 50, 0);

    player: mod.Player;
    weapon: mod.Weapons;
    price: number;

    constructor(player: mod.Player, weapon: mod.Weapons, price: number) {
        this.player = player;
        this.weapon = weapon;
        this.price = price;

        mod.AddUIText(mod.GetObjId(player) + "_Primary_Slot", this.primarySlotPosition, mod.CreateVector(125, 75, 0), mod.UIAnchor.Center, mod.Message("Replace Primary"), player);
        mod.AddUIButton(mod.GetObjId(player) + "_Primary_Slot_Button", this.primarySlotPosition, mod.CreateVector(125, 75, 0), mod.UIAnchor.Center, player);

        mod.AddUIText(mod.GetObjId(player) + "_Secondary_Slot", this.secondarySlotPosition, mod.CreateVector(125, 75, 0), mod.UIAnchor.Center, mod.Message("Replace Secondary"), player);
        mod.AddUIButton(mod.GetObjId(player) + "_Secondary_Slot_Button", this.secondarySlotPosition, mod.CreateVector(125, 75, 0), mod.UIAnchor.Center, player);

        mod.AddUIText(mod.GetObjId(player) + "_Cancel", this.cancelSlotPosition, mod.CreateVector(150, 75, 0), mod.UIAnchor.Center, mod.Message("Cancel"), player);
        mod.AddUIButton(mod.GetObjId(player) + "_Cancel_Button", this.cancelSlotPosition, mod.CreateVector(150, 75, 0), mod.UIAnchor.Center, player);

        mod.AddUIText(mod.GetObjId(player) + "_Weapon_Name", mod.CreateVector(0, -225, 0), mod.CreateVector(150, 25, 0), mod.UIAnchor.Center, mod.Message(getWeaponName(weapon)));
        mod.AddUIText(mod.GetObjId(player) + "_Weapon_Price", mod.CreateVector(0, -150, 0), mod.CreateVector(100, 75, 0), mod.UIAnchor.Center, mod.Message('Price: ${}', price));

        mod.EnableUIInputMode(true, player);
    }

    deleteWidgets() {
        mod.DeleteUIWidget(mod.FindUIWidgetWithName(mod.GetObjId(this.player) + "_Primary_Slot"));
        mod.DeleteUIWidget(mod.FindUIWidgetWithName(mod.GetObjId(this.player) + "_Primary_Slot_Button"));
        mod.DeleteUIWidget(mod.FindUIWidgetWithName(mod.GetObjId(this.player) + "_Secondary_Slot"));
        mod.DeleteUIWidget(mod.FindUIWidgetWithName(mod.GetObjId(this.player) + "_Secondary_Slot_Button"));
        mod.DeleteUIWidget(mod.FindUIWidgetWithName(mod.GetObjId(this.player) + "_Cancel"));
        mod.DeleteUIWidget(mod.FindUIWidgetWithName(mod.GetObjId(this.player) + "_Cancel_Button"));
        mod.DeleteUIWidget(mod.FindUIWidgetWithName(mod.GetObjId(this.player) + "_Weapon_Name"));
        mod.DeleteUIWidget(mod.FindUIWidgetWithName(mod.GetObjId(this.player) + "_Weapon_Price"));
    }

}

const zombies: mod.Player[] = [];
const playerArray: Player[] = [];

const interactableDoors: Door[] = [
    new Door(1, 2, 5000)
];

const wallWeapons: WallWeapon[] = [
    new WallWeapon(5, 4, mod.Weapons.SMG_KV9, 3000),
    new WallWeapon(8, 7, mod.Weapons.LMG_M250, 10)
];

const zombieSpawners: number[] = [
    3,
    6
]

let round: number = 1;
let zombieKillsThisRound: number = 0;
let zombieSpawnsThisRound: number = 0;

export async function OnGameModeStarted() {
    mod.SetSpawnMode(mod.SpawnModes.AutoSpawn);
    for (let i = 0; i < zombieSpawners.length; i++) {
        mod.AISetUnspawnOnDead(mod.GetSpawner(zombieSpawners[i]), true); // Sets all zombie spawners to kick AI players when they die.
    }
    for (let i = 0; i < wallWeapons.length; i++) {
        const wallWeapon = wallWeapons[i];
        mod.SetWorldIconText(mod.GetWorldIcon(wallWeapon.icon), mod.Message('{} ${}', getWeaponName(wallWeapon.weapon), wallWeapon.price));
        mod.EnableWorldIconText(mod.GetWorldIcon(wallWeapon.icon), true);
    }
}

export function OngoingGlobal() {
    if (zombieSpawnsThisRound < (round * 5) && !roundPauseSpawner) {
        spawnZombie();
    } else if (zombieKillsThisRound >= (round * 5) && zombies.length == 0) {
        nextRound();
    }
}

export function OnPlayerJoinGame(player: mod.Player) {
    if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)) {
        zombies.push(player);
        zombieSpawnsThisRound += 1;
        return;
    }
    mod.SetTeam(player, mod.GetTeam(1));
}

export function OnPlayerDeployed(modPlayer: mod.Player) {
    if (mod.GetSoldierState(modPlayer, mod.SoldierStateBool.IsAISoldier))
        return;
    mod.AddEquipment(modPlayer, mod.Weapons.Sidearm_P18, mod.InventorySlots.SecondaryWeapon);
    mod.SetInventoryAmmo(modPlayer, mod.InventorySlots.SecondaryWeapon, 150);
}

export function OnPlayerDied(modPlayer: mod.Player, otherModPlayer: mod.Player, deathType: mod.DeathType, weaponUnlock: mod.WeaponUnlock) {
    if (mod.GetSoldierState(modPlayer, mod.SoldierStateBool.IsAISoldier)) {
        zombies.splice(zombies.findIndex(player => mod.GetObjId(player) == mod.GetObjId(modPlayer)), 1);
        zombieKillsThisRound += 1;
        Player.get(otherModPlayer).points += 90 + 10 * round * playerArray.length;
        return;
    }
}

export function OngoingPlayer(modPlayer: mod.Player) {
    if (mod.GetSoldierState(modPlayer, mod.SoldierStateBool.IsAISoldier)) {
        //mod.AIBattlefieldBehavior(modPlayer);
        return;
    }

    let player: Player = Player.get(modPlayer);
    player.updatePoints();
    player.updateRound();
    player.updateZombieCount();
}

export function OnPlayerInteract(modPlayer: mod.Player, interactPoint: mod.InteractPoint) {
    attemptOpenDoor(modPlayer, interactPoint);
    attemptBuyWeapon(modPlayer, interactPoint);
}

export function OnPlayerUIButtonEvent(modPlayer: mod.Player, widget: mod.UIWidget, event: mod.UIButtonEvent) {
    for (let i = 0; i < playerSwappingWeapons.length; i++) {
        const j: PlayerSwappingWeapon = playerSwappingWeapons[i];
        if (mod.GetObjId(j.player) != mod.GetObjId(modPlayer))
            continue;

        let cancelled = false;

        if (mod.GetUIWidgetName(widget) == mod.GetObjId(j.player) + "_Primary_Slot_Button") {
            mod.AddEquipment(modPlayer, j.weapon, mod.InventorySlots.PrimaryWeapon);
        } else if (mod.GetUIWidgetName(widget) == mod.GetObjId(j.player) + "_Secondary_Slot_Button") {
            mod.AddEquipment(modPlayer, j.weapon, mod.InventorySlots.SecondaryWeapon);
        } else if (mod.GetUIWidgetName(widget) == mod.GetObjId(j.player) + "_Cancel_Button") {
            cancelled = true;
        } else {
            return;
        }
        if (!cancelled)
            Player.get(modPlayer).points -= j.price;
        playerSwappingWeapons.splice(i, 1);
        mod.EnableUIInputMode(false, modPlayer);
        j.deleteWidgets();
        break;
    }
}

function attemptOpenDoor(modPlayer: mod.Player, interactPoint: mod.InteractPoint): boolean {
    for (let i = 0; i < interactableDoors.length; i++) {
        const door: Door = interactableDoors[i];
        if (door.interactable != mod.GetObjId(interactPoint))
            continue;

        const player: Player = Player.get(modPlayer);
        if (player.points < door.price) {
            mod.DisplayNotificationMessage(mod.Message(door.price));
            return false;
        }
        player.points -= door.price;
        mod.MoveObject(mod.GetSpatialObject(door.door), mod.Subtract(mod.GetObjectPosition(mod.GetSpatialObject(door.door)), mod.CreateVector(0, 100, 0)));
        mod.EnableInteractPoint(interactPoint, false);
        door.opened = true;
        return true;
    }
    return false;
}

function attemptBuyWeapon(modPlayer: mod.Player, interactPoint: mod.InteractPoint): boolean {
    for (let i = 0; i < wallWeapons.length; i++) {
        const wallWeapon = wallWeapons[i];
        if (wallWeapon.interactable != mod.GetObjId(interactPoint))
            continue;
        const player: Player = Player.get(modPlayer);
        if (player.points < wallWeapon.price) {
            mod.DisplayNotificationMessage(mod.Message('Required Points: ${}', wallWeapon.price));
            return false;
        }
        openSwapWeaponMenu(modPlayer, wallWeapon.weapon, wallWeapon.price);
        return true;
    }
    return false;
}

const playerSwappingWeapons: PlayerSwappingWeapon[] = [];

function openSwapWeaponMenu(modPlayer: mod.Player, weapon: mod.Weapons, price: number) {

    // Stops the player from opening another menu.
    for (let i = 0; i < playerSwappingWeapons.length; i++) {
        const j: PlayerSwappingWeapon = playerSwappingWeapons[i];
        if (mod.GetObjId(j.player) == mod.GetObjId(modPlayer))
            return;
    }

    playerSwappingWeapons.push(new PlayerSwappingWeapon(modPlayer, weapon, price));
}

function spawnZombie() {
    let spawnerClosestToPlayer: mod.Spawner | undefined;
    let distance = 0;

    //TODO Fix closest spawner finder.

    for (let i = 0; i < zombieSpawners.length; i++) {
        let spawner: mod.Spawner = mod.GetSpawner(zombieSpawners[i]);
        if (spawnerClosestToPlayer === undefined || mod.DistanceBetween(mod.GetObjectPosition(spawner), mod.GetObjectPosition(mod.ClosestPlayerTo(mod.GetObjectPosition(spawner)))) < distance) {
            spawnerClosestToPlayer = spawner;
            distance = mod.DistanceBetween(mod.GetObjectPosition(spawner), mod.GetObjectPosition(mod.ClosestPlayerTo(mod.GetObjectPosition(spawner))));
        }
    }

    if (spawnerClosestToPlayer === undefined)
        return;

    mod.SpawnAIFromAISpawner(spawnerClosestToPlayer, mod.GetTeam(2));
}

let roundPauseSpawner = false;

async function nextRound() {
    for (let i = 0; i < playerArray.length; i++) {
        let player: Player = playerArray[i];
        mod.AddUIText("_Next_Round", mod.CreateVector(0, -300, 0), mod.CreateVector(390, 25, 0), mod.UIAnchor.Center, mod.Message("Round complete! Get ready for more."));
        player.points += round * 100;
    }
    roundPauseSpawner = true;
    round += 1;
    zombieKillsThisRound = 0;
    zombieSpawnsThisRound = 0;
    await mod.Wait(10);
    roundPauseSpawner = false;
    mod.DeleteUIWidget(mod.FindUIWidgetWithName("_Next_Round"));
}

//TODO Create Max ammo, insta kill, double points, nuke.
//TODO Create perks.
//TODO Create mystery box.
//TODO Increase zombie health, zombie speed has rounds get higher.

function fillReserve(player: mod.Player, slot: mod.InventorySlots) {
    let lastReserveAmount: number | undefined;
    let i = 0;
    do {
        lastReserveAmount = mod.GetInventoryMagazineAmmo(player, slot);
        mod.SetInventoryMagazineAmmo(player, slot, lastReserveAmount + 1);
        i += 1;
    } while (mod.GetInventoryMagazineAmmo(player, slot) != lastReserveAmount && i < 1000);
    if (i >= 1000) {
        mod.DisplayNotificationMessage(mod.Message("ADDED TO MUCH AMMOS")); // TODO TEMP
    }
}

function getWeaponName(weapon: mod.Weapons): string {
    switch (weapon) {
        case mod.Weapons.AssaultRifle_AK4D: {
            return "AK4D";
        }
        case mod.Weapons.AssaultRifle_B36A4: {
            return "B36A4";
        }
        case mod.Weapons.AssaultRifle_KORD_6P67: {
            return "KORD 6P67";
        }
        case mod.Weapons.AssaultRifle_L85A3: {
            return "L85A3";
        }
        case mod.Weapons.AssaultRifle_M433: {
            return "M433";
        }
        case mod.Weapons.AssaultRifle_NVO_228E: {
            return "NVO-228E";
        }
        case mod.Weapons.AssaultRifle_SOR_556_Mk2: {
            return "SOR-556 MK2";
        }
        case mod.Weapons.AssaultRifle_TR_7: {
            return "TR-7";
        }
        case mod.Weapons.Carbine_AK_205: {
            return "AK-205";
        }
        case mod.Weapons.Carbine_GRT_BC: {
            return "GRT-BC";
        }
        case mod.Weapons.Carbine_M277: {
            return "M277";
        }
        case mod.Weapons.Carbine_M417_A2: {
            return "M417 A2";
        }
        case mod.Weapons.Carbine_M4A1: {
            return "M4A1";
        }
        case mod.Weapons.Carbine_QBZ_192: {
            return "QBZ-192";
        }
        case mod.Weapons.Carbine_SG_553R: {
            return "SG 553R";
        }
        case mod.Weapons.DMR_LMR27: {
            return "LMR27";
        }
        case mod.Weapons.DMR_M39_EMR: {
            return "M39 EMR";
        }
        case mod.Weapons.DMR_SVDM: {
            return "SVDM";
        }
        case mod.Weapons.DMR_SVK_86: {
            return "SVK-8.6";
        }
        case mod.Weapons.LMG_DRS_IAR: {
            return "DRS-IAR";
        }
        case mod.Weapons.LMG_KTS100_MK8: {
            return "KTS100 MK8";
        }
        case mod.Weapons.LMG_L110: {
            return "L110";
        }
        case mod.Weapons.LMG_M_60: {
            return "M/60";
        }
        case mod.Weapons.LMG_M123K: {
            return "M123K";
        }
        case mod.Weapons.LMG_M240L: {
            return "M240L";
        }
        case mod.Weapons.LMG_M250: {
            return "M250";
        }
        case mod.Weapons.LMG_RPKM: {
            return "RPKM";
        }
        case mod.Weapons.Shotgun__185KS_K: {
            return "18.5KS-K";
        }
        case mod.Weapons.Shotgun_M1014: {
            return "M1014";
        }
        case mod.Weapons.Shotgun_M87A1: {
            return "M87A1";
        }
        case mod.Weapons.Sidearm_ES_57: {
            return "ES 5.7";
        }
        case mod.Weapons.Sidearm_M44: {
            return "M44";
        }
        case mod.Weapons.Sidearm_M45A1: {
            return "M45A1";
        }
        case mod.Weapons.Sidearm_P18: {
            return "P18";
        }
        case mod.Weapons.SMG_KV9: {
            return "KV9";
        }
        case mod.Weapons.SMG_PW5A3: {
            return "PW5A3";
        }
        case mod.Weapons.SMG_PW7A2: {
            return "PW7A2";
        }
        case mod.Weapons.SMG_SCW_10: {
            return "SCW-10";
        }
        case mod.Weapons.SMG_SGX: {
            return "SGX";
        }
        case mod.Weapons.SMG_SL9: {
            return "SL9";
        }
        case mod.Weapons.SMG_UMG_40: {
            return "UMG-40";
        }
        case mod.Weapons.SMG_USG_90: {
            return "USG-90";
        }
        case mod.Weapons.Sniper_M2010_ESR: {
            return "M2010 ESR";
        }
        case mod.Weapons.Sniper_PSR: {
            return "PSR";
        }
        case mod.Weapons.Sniper_SV_98: {
            return "SV-98";
        }
    }
}
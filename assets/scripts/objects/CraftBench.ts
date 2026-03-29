import { _decorator, Component, Node, Vec3, find } from 'cc';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { ResourceManager } from '../managers/ResourceManager';
import { PlayerController } from '../player/PlayerController';
const { ccclass, property } = _decorator;

@ccclass('CraftBench')
export class CraftBench extends Component {

    @property(Node)
    public player: Node = null;

    @property
    public interactRange = 2.0;

    private _playerController: PlayerController = null;
    private _isPlayerInRange: boolean = false;
    private _hasShownModal: boolean = false;


    onLoad() {
        this.player = find('GameRoot/IdBr_character');
        console.log('Craft bench player: ', this.player);
        if (this.player) {
            this._playerController = this.player.getComponent(PlayerController);
        }
    }

    public onUpgradeConfirmed(): void {
        const weaponLevel = GameManager.instance?.weaponLevel;

        if (weaponLevel === WeaponLevel.L1) {
            ResourceManager.instance?.consumeForUpgrade(2);
        } else if (weaponLevel === WeaponLevel.L2) {
            ResourceManager.instance?.consumeForUpgrade(3);
        }
        GameManager.instance?.upgradeWeapon();
        this._hasShownModal = false;
    }

    private _isInRange(): boolean {
        if (!this.player) return;
        const distance = Vec3.distance(
            this.node.worldPosition,
            this.player.worldPosition
        );
        return distance <= this.interactRange;
    }

    private _canUpgrade(): boolean {
        const weaponLevel = GameManager.instance?.weaponLevel;
        const rm = ResourceManager.instance;
        if (!rm || !weaponLevel) return false;

        if (weaponLevel === WeaponLevel.L1 && rm.canUpgradeToL2()) return true;
        if (weaponLevel === WeaponLevel.L2 && rm.canUpgradeToL3()) return true;
        return false;
    }

    start() {

    }

    update(deltaTime: number) {
        const inRange = this._isInRange();
        if (inRange && !this._isPlayerInRange) {
            // Enter
            this._isPlayerInRange = true;
            if (this._canUpgrade() && !this._hasShownModal) {
                this.node.emit('show-upgrade-modal');
            }
        }

        if (!inRange && this._isPlayerInRange) {
            // Left
            this._isPlayerInRange = false;
        }
    }
}



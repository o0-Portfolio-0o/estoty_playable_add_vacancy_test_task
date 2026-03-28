import { _decorator, Component, Game, Node, Vec3, find } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { PlayerController } from '../player/PlayerController';
const { ccclass, property } = _decorator;

@ccclass('ResourceNode')
export class ResourceNode extends Component {

    @property
    public requiredWeaponLevel: number = 1;

    @property
    public hitsToDestroy: number = 3;

    @property
    public attackRange = 1.5;

    @property(Node)
    public meshL1: Node = null;

    @property(Node)
    public meshL2: Node = null;

    @property(Node)
    public meshL3: Node = null;

    private _currentHits: number = 0;
    private _isBeingAttacked: boolean = false;
    private _attackTimer: number = 0;
    private readonly ATTACK_INTERVAL = 1.0;
    private _playerController: PlayerController = null;

    onLoad(): void {
        this.player = find("GameRoot/IdBr_character")
        if (this.player) {

            this._playerController = this.player.getComponent(PlayerController);
        }
        this._updateMeshVisibility();
    }

    private _updateMeshVisibility(): void {
        const hits = this._currentHits;

        if (this.meshL1) this.meshL1.active = hits === 0;
        if (this.meshL2) this.meshL2.active = hits === 1;
        if (this.meshL3) this.meshL3.active = hits === 2;
    }

    private _isPlayerInRange(): boolean {
        if (!this.player) return false;

        const distance = Vec3.distance(
            this.node.worldPosition,
            this.player.worldPosition
        );
        return distance <= this.attackRange;
    }

    private _canBeAttacked(): boolean {
        const weaponLevel = GameManager.instance?.weaponLevel ?? 1;
        return weaponLevel >= this.requiredWeaponLevel;
    }

    private _onHit(): void {
        this._currentHits++;
        this._updateMeshVisibility();

        if (this._currentHits >= this.hitsToDestroy) {
            this._onDestroy();
        }
    }

    private _onDestroy() {
        const weaponLevel = GameManager.instance?.weaponLevel ?? 1;
        if (weaponLevel === 1) {
            ResourceManager.instance?.addResource1(1);
        } else {
            ResourceManager.instance?.addResource2(1);
        }

        this.node.active = false;
        this.scheduleOnce(() => {
            if (this._playerController) {
                this._playerController.isAttacking = false;
            }
        })
    }

    update(deltaTime: number) {
        if (!this._isPlayerInRange() || !this._canBeAttacked()) {
            if (this._isBeingAttacked) {
                this._isBeingAttacked = false;
                if (this._playerController) this._playerController.isAttacking = false;
            }
            return;
        }

        this._isBeingAttacked = true;
        if (this._playerController) this._playerController.isAttacking = true;
        this._attackTimer += deltaTime;

        if (this._attackTimer >= this.ATTACK_INTERVAL) {
            this._attackTimer = 0;
            this._onHit();
        }
    }
}



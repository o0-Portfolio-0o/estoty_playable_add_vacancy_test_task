import { _decorator, Component, Game, Node, Vec3, find, tween, instantiate, ParticleSystem, Prefab } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { PlayerController } from '../player/PlayerController';
import { AudioManager } from '../managers/AudioManager';

const { ccclass, property } = _decorator;

@ccclass('ResourceNode')
export class ResourceNode extends Component {

    @property(Prefab)
    public hitParticlePrefab: Prefab = null;

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

    public player: Node = null;

    protected _playerController: PlayerController = null;
    protected _currentHits: number = 0;
    protected _isBeingAttacked: boolean = false;
    protected _attackTimer: number = 0;
    protected _isDestroyed: boolean = false;

    private readonly ATTACK_INTERVAL = 1.0;
    private _hitFeedbackTriggered:boolean = false;

    onLoad(): void {
        this.player = find("GameRoot/IdBr_character")
        if (this.player) {

            this._playerController = this.player.getComponent(PlayerController);
        }
        this._updateMeshVisibility();
    }

    update(deltaTime: number) {
        if (this._isDestroyed) return;

        if (!this._isPlayerInRange() || !this._canBeAttacked()) {
            if (this._isBeingAttacked) {
                this._isBeingAttacked = false;
                this._hitFeedbackTriggered = false;
                if (this._playerController) this._playerController.isAttacking = false;
            }
            return;
        }

        this._isBeingAttacked = true;
        if (this._playerController) this._playerController.isAttacking = true;
        this._attackTimer += deltaTime;

        if (this._attackTimer >= this.ATTACK_INTERVAL * 0.6 && !this._hitFeedbackTriggered) {
            this._hitFeedbackTriggered = true;
            this._playHitFeedback();
        }

        if (this._attackTimer >= this.ATTACK_INTERVAL) {
            this._attackTimer = 0;
            this._onHit();
        }
    }

    protected _onDestroy() {
        this._isDestroyed = true;

        this.unscheduleAllCallbacks();

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
        }, 0.3);
    }

    private _spawnParticles() {
        if (!this.hitParticlePrefab) return;

        const particles = instantiate(this.hitParticlePrefab);
        this.node.parent.addChild(particles);

        particles.setWorldPosition(new Vec3(
            this.node.worldPosition.x,
            this.node.worldPosition.y + 0.5,
            this.node.worldPosition.z,
        ));

        const particleSystem = particles.getComponent(ParticleSystem);

        if (particleSystem) particleSystem.play();

        this.scheduleOnce(() => {
            particles.destroy();
        }, 1.0);
    }

    private _playHitFeedback() {
        tween(this.node).stop();

        const originalScale = this.node.scale.clone();

        tween(this.node)
            .to(0.08, { scale: new Vec3(
                originalScale.x * 1.2,
                originalScale.y * 1.2,
                originalScale.z * 1.2,
            ) })
            .to(0.08, { scale: originalScale })
            .start();
        AudioManager.instance?.playHit();
        this._spawnParticles();
    }

    private _updateMeshVisibility(): void {
        const hits = this._currentHits;

        if (hits === 0) {
            if (this.meshL1) this.meshL1.active = true;
            if (this.meshL2) this.meshL2.active = false;
            if (this.meshL3) this.meshL3.active = false;
            return;
        }

        const transitions: Record<number, [Node, Node]> = {
            1: [this.meshL1, this.meshL2],
            2: [this.meshL2, this.meshL3],
        };

        const transition = transitions[hits];
        if (!transition) return;

        const [from, to] = transition;
        if (!from || !to) return;

        tween(from)
            .to(0.08, { scale: new Vec3(0, 0, 0) })
            .call(() => {
                from.active = false;
                to.active = true;
            })
            .start();
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
            return;
        }

        this.scheduleOnce(() => {
            this._hitFeedbackTriggered = false;
        }, 0.8);
    }
}



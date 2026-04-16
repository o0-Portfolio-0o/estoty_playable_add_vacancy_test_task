import { _decorator, Component, Node, Vec3, find, tween, Tween, instantiate, ParticleSystem, Prefab, MeshRenderer, Material, Color } from 'cc';
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

    @property
    public blinkRange: number = 5;

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
    private _hitFeedbackTriggered: boolean = false;
    private _hasShownWeaponNeeded: boolean = false;

    private _isPulsing: boolean = false;
    private _wasInBlinkRange: boolean = false;

    private static _outlineMaterial: Material | null = null;
    private _outlineNodes: Map<Node, Node> = new Map();

    onLoad(): void {
        this.player = find("GameRoot/IdBr_character");
        if (this.player) {
            this._playerController = this.player.getComponent(PlayerController);
        }
        this._updateMeshVisibility();
        this._setupOutlines();
        this._startPulse();
    }

    start(): void {
        GameManager.instance?.node.on('weapon-upgraded', this._refreshOutlines, this);
        this._refreshOutlines();
    }

    update(deltaTime: number) {
        if (this._isDestroyed) return;

        const inRange = this._isInBlinkRange();
        if (inRange && !this._wasInBlinkRange) {
            this._wasInBlinkRange = true;
            this._stopPulse();
        } else if (!inRange && this._wasInBlinkRange) {
            this._wasInBlinkRange = false;
            if (this._canBeAttacked()) this._startPulse();
        }

        // One-shot locked feedback: shake the node and show popup when approaching a locked node
        if (this._isPlayerInRange() && !this._canBeAttacked()) {
            if (!this._hasShownWeaponNeeded) {
                this._hasShownWeaponNeeded = true;
                this._playLockedFeedback();
                GameManager.instance?.node.emit('weapon-needed', this.requiredWeaponLevel);
            }
        } else {
            this._hasShownWeaponNeeded = false;
        }

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
        this._stopPulse();
        this.unscheduleAllCallbacks();
        GameManager.instance?.node?.off('weapon-upgraded', this._refreshOutlines, this);

        const weaponLevel = GameManager.instance?.weaponLevel ?? 1;
        if (weaponLevel === 1) {
            ResourceManager.instance?.addResource1(1);
        } else {
            ResourceManager.instance?.addResource2(1);
        }

        this.node.active = false;
        if (this._playerController) {
            this._playerController.isAttacking = false;
        }
    }

    private _startPulse(): void {
        if (this._isDestroyed || this._isPulsing) return;
        if (!this._canBeAttacked()) {
            this.scheduleOnce(() => this._startPulse(), 0.5);
            return;
        }
        if (this._isInBlinkRange()) return;

        const mesh = this._getActiveMesh();
        if (!mesh) return;

        this._isPulsing = true;
        Tween.stopAllByTarget(mesh);

        tween(mesh)
            .to(0.7, { scale: new Vec3(1.02, 1.02, 1.02) }, { easing: 'sineInOut' })
            .to(0.7, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
            .call(() => {
                this._isPulsing = false;
                if (!this._isDestroyed && !this._isInBlinkRange()) {
                    this.scheduleOnce(() => this._startPulse(), 2.0);
                }
            })
            .start();
    }

    private _stopPulse(): void {
        if (!this._isPulsing) return;
        const mesh = this._getActiveMesh();
        if (mesh) {
            Tween.stopAllByTarget(mesh);
            mesh.setScale(1, 1, 1);
        }
        this._isPulsing = false;
        this.unschedule(this._startPulse);
    }

    private _getActiveMesh(): Node | null {
        if (this.meshL1?.active) return this.meshL1;
        if (this.meshL2?.active) return this.meshL2;
        if (this.meshL3?.active) return this.meshL3;
        return null;
    }

    private static _getOutlineMaterial(): Material {
        if (!ResourceNode._outlineMaterial) {
            const mat = new Material();
            mat.initialize({
                effectName: 'builtin-unlit',
                defines: [{ USE_INSTANCING: false }],
                states: [{
                    rasterizerState: { cullMode: 1 }, // CullMode.FRONT — shows back faces only
                }],
            });
            mat.setProperty('mainColor', new Color(255, 255, 255, 255));
            ResourceNode._outlineMaterial = mat;
        }
        return ResourceNode._outlineMaterial;
    }

    private _addOutlineToMesh(meshNode: Node): void {
        const mr = meshNode.getComponent(MeshRenderer)
            ?? meshNode.getComponentInChildren(MeshRenderer);
        if (!mr || !mr.mesh) return;

        const outlineNode = new Node('_outline');
        mr.node.addChild(outlineNode);
        outlineNode.setScale(1.12, 1.12, 1.12);

        const outlineMR = outlineNode.addComponent(MeshRenderer);
        outlineMR.mesh = mr.mesh;
        outlineMR.setSharedMaterial(ResourceNode._getOutlineMaterial(), 0);

        outlineNode.active = this._canBeAttacked();
        this._outlineNodes.set(meshNode, outlineNode);
    }

    private _setupOutlines(): void {
        for (const mesh of [this.meshL1, this.meshL2, this.meshL3]) {
            if (mesh) this._addOutlineToMesh(mesh);
        }
    }

    private _refreshOutlines(): void {
        const canAttack = this._canBeAttacked();
        for (const [, outline] of this._outlineNodes) {
            outline.active = canAttack;
        }
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

        this.scheduleOnce(() => { particles.destroy(); }, 1.0);
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

    private _playLockedFeedback(): void {
        Tween.stopAllByTarget(this.node);
        const s = this.node.scale.clone();
        tween(this.node)
            .to(0.06, { scale: new Vec3(s.x * 1.1, s.y * 1.1, s.z * 1.1) })
            .to(0.06, { scale: new Vec3(s.x * 0.95, s.y * 0.95, s.z * 0.95) })
            .to(0.06, { scale: new Vec3(s.x * 1.08, s.y * 1.08, s.z * 1.08) })
            .to(0.06, { scale: s })
            .start();
        AudioManager.instance?.playHit();

        if (this._playerController) {
            this._playerController.isAttacking = true;
            this.scheduleOnce(() => {
                if (this._playerController) this._playerController.isAttacking = false;
            }, 0.3);
        }
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

        Tween.stopAllByTarget(from);
        this._isPulsing = false;

        tween(from)
            .to(0.04, { scale: new Vec3(0, 0, 0) })
            .call(() => {
                from.active = false;
                to.active = true;
                if (!this._isInBlinkRange() && this._canBeAttacked()) {
                    this.scheduleOnce(() => this._startPulse(), 0.3);
                }
            })
            .start();
    }

    private _isInBlinkRange(): boolean {
        if (!this.player) return false;
        return Vec3.distance(this.node.worldPosition, this.player.worldPosition) <= this.blinkRange;
    }

    private _isPlayerInRange(): boolean {
        if (!this.player) return false;
        return Vec3.distance(this.node.worldPosition, this.player.worldPosition) <= this.attackRange;
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
        }, 0.4);
    }
}

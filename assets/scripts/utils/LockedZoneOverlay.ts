import { _decorator, Component, Node, MeshRenderer, Material, Color, tween } from 'cc';
import { GameManager, WeaponLevel } from '../managers/GameManager';

const { ccclass, property } = _decorator;

@ccclass('LockedZoneOverlay')
export class LockedZoneOverlay extends Component {

    @property(Node)
    public overlayNode: Node = null;

    @property
    public unlockAtWeaponLevel: number = 2;

    @property
    public fadeDuration: number = 0.8;

    @property
    public overlayR: number = 50;
    @property
    public overlayG: number = 50;
    @property
    public overlayB: number = 50;
    @property
    public overlayA: number = 180;

    private _material: Material = null;

    start(): void {
        this._setupMaterial();
        this._syncState();
        GameManager.instance?.node.on('weapon-upgraded', this._onWeaponUpgraded, this);
        GameManager.instance?.node.on('game-reset', this._onGameReset, this);
    }

    onDestroy(): void {
        GameManager.instance?.node?.off('weapon-upgraded', this._onWeaponUpgraded, this);
        GameManager.instance?.node?.off('game-reset', this._onGameReset, this);
    }

    private _setupMaterial(): void {
        if (!this.overlayNode) return;
        const mr = this.overlayNode.getComponent(MeshRenderer)
            ?? this.overlayNode.getComponentInChildren(MeshRenderer);
        if (!mr) return;

        const mat = new Material();
        mat.initialize({
            effectName: 'builtin-unlit',
            defines: [{ USE_INSTANCING: false }],
            states: [{
                blendState: {
                    targets: [{
                        blend: true,
                        blendSrc: 6,        // BlendFactor.SRC_ALPHA
                        blendDst: 7,        // BlendFactor.ONE_MINUS_SRC_ALPHA
                        blendSrcAlpha: 6,
                        blendDstAlpha: 7,
                    }]
                },
                depthStencilState: { depthWrite: false },
            }],
        });
        mat.setProperty('mainColor', new Color(this.overlayR, this.overlayG, this.overlayB, this.overlayA));
        mr.setSharedMaterial(mat, 0);
        this._material = mat;
    }

    private _syncState(): void {
        if (!this.overlayNode) return;
        const level = GameManager.instance?.weaponLevel ?? WeaponLevel.L1;
        this.overlayNode.active = level < this.unlockAtWeaponLevel;
    }

    private _onWeaponUpgraded(level: WeaponLevel): void {
        if (level >= this.unlockAtWeaponLevel) {
            this._fadeOut();
        }
    }

    private _onGameReset(): void {
        if (!this.overlayNode) return;
        tween(this.overlayNode).stop();
        if (this._material) {
            this._material.setProperty('mainColor',
                new Color(this.overlayR, this.overlayG, this.overlayB, this.overlayA));
        }
        this.overlayNode.active = true;
    }

    private _fadeOut(): void {
        if (!this.overlayNode) return;
        if (!this._material) {
            this.overlayNode.active = false;
            return;
        }

        const state = { alpha: this.overlayA };
        const color = new Color(this.overlayR, this.overlayG, this.overlayB, this.overlayA);

        tween(state)
            .to(this.fadeDuration, { alpha: 0 }, {
                onUpdate: (target: { alpha: number }) => {
                    color.a = Math.round(target.alpha);
                    this._material.setProperty('mainColor', color);
                },
            })
            .call(() => { this.overlayNode.active = false; })
            .start();
    }
}

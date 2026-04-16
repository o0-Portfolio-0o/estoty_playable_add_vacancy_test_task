import { _decorator, Component, Node, Camera, Vec3, view, tween, Tween, find } from 'cc';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { ResourceManager } from '../managers/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('ObjectiveArrow')
export class ObjectiveArrow extends Component {

    @property(Camera)
    public gameCamera: Camera = null;


    @property(Node)
    public boxesL1: Node = null;

    @property(Node)
    public boxesL2: Node = null;

    @property(Node)
    public craftBench: Node = null;

    @property(Node)
    public gate: Node = null;

    @property(Node)
    public arrowNode: Node = null;

    @property([Node])
    public arrowNodes: Node[] = [];

    @property
    public startOffset: number = 50;

    @property
    public arrowSpacing: number = 28;

    @property
    public rippleDuration: number = 0.5;

    @property
    public rippleStagger: number = 0.15;

    @property
    public hideDistance: number = 4;


    private _currentTarget: Node = null;
    private _player: Node = null;
    private _screenWidth: number = 0;
    private _screenHeight: number = 0;

    start() {
        const visibleSize = view.getVisibleSize();
        this._screenWidth = visibleSize.width;
        this._screenHeight = visibleSize.height;

        this._player = find('GameRoot/IdBr_character');

        if (this.arrowNode) this.arrowNode.active = false;
        if (this.boxesL1) this._setTarget(this.boxesL1);

        ResourceManager.instance?.node.on('resource-changed', this._onResourceChanged, this);
        GameManager.instance?.node.on('weapon-upgraded', this._onWeaponUpgraded, this);
        GameManager.instance?.node.on('game-win', this._stopArrow, this);
        GameManager.instance?.node.on('game-reset', this._onGameReset, this);
    }

    update() {
        if (!this._currentTarget || !this.arrowNode || !this.gameCamera || !this._player) return;

        const dist = Vec3.distance(this._player.worldPosition, this._currentTarget.worldPosition);
        if (dist < this.hideDistance) {
            this._hideArrow();
            return;
        }

        this._showArrow();

        const playerScreen = new Vec3();
        this.gameCamera.worldToScreen(this._player.worldPosition, playerScreen);
        this.arrowNode.setPosition(
            playerScreen.x - this._screenWidth / 2,
            playerScreen.y - this._screenHeight / 2,
            0
        );

        const targetScreen = new Vec3();
        this.gameCamera.worldToScreen(this._currentTarget.worldPosition, targetScreen);
        const dx = targetScreen.x - playerScreen.x;
        const dy = targetScreen.y - playerScreen.y;
        const angle = Math.atan2(dy, dx);
        this.arrowNode.setRotationFromEuler(0, 0, angle * (180 / Math.PI));
    }

    onDestroy() {
        ResourceManager.instance?.node?.off('resource-changed', this._onResourceChanged, this);
        GameManager.instance?.node?.off('weapon-upgraded', this._onWeaponUpgraded, this);
        GameManager.instance?.node?.off('game-win', this._stopArrow, this);
        GameManager.instance?.node?.off('game-reset', this._onGameReset, this);
        this._stopRipple();
    }


    private _setTarget(target: Node): void {
        this._currentTarget = target;
        if (this.arrowNode) this.arrowNode.active = true;
        this._startRipple();
    }

    private _onResourceChanged() {
        const rm = ResourceManager.instance;
        const gm = GameManager.instance;
        if (!rm || !gm) return;
        if (gm.weaponLevel === WeaponLevel.L1 && rm.canUpgradeToL2()) {
            this._setTarget(this.craftBench);
        } else if (gm.weaponLevel === WeaponLevel.L2 && rm.canUpgradeToL3()) {
            this._setTarget(this.craftBench);
        }
    }

    private _onWeaponUpgraded(level: WeaponLevel) {
        if (level === WeaponLevel.L2) {
            this._setTarget(this.boxesL2 ?? this.craftBench);
        } else if (level === WeaponLevel.L3) {
            this._setTarget(this.gate);
        }
    }

    private _onGameReset(): void {
        if (this.boxesL1) this._setTarget(this.boxesL1);
    }

    private _showArrow() {
        if (!this.arrowNode || this.arrowNode.active) return;
        this.arrowNode.active = true;
        this._startRipple();
    }

    private _hideArrow() {
        if (!this.arrowNode || !this.arrowNode.active) return;
        this.arrowNode.active = false;
    }

    private _stopArrow(): void {
        this._currentTarget = null;
        this._stopRipple();
        if (this.arrowNode) this.arrowNode.active = false;
    }

    private _startRipple(): void {
        this._stopRipple();

        if (this.arrowNodes.length === 0) {
            if (!this.arrowNode) return;
            tween(this.arrowNode)
                .to(0.4, { scale: new Vec3(1.2, 1.2, 1) })
                .to(0.4, { scale: new Vec3(1, 1, 1) })
                .union()
                .repeatForever()
                .start();
            return;
        }

        for (let i = 0; i < this.arrowNodes.length; i++) {
            const arrow = this.arrowNodes[i];
            arrow.setPosition(this.startOffset + i * this.arrowSpacing, 0, 0);
            arrow.setScale(1, 1, 1);
            if (i === 0) {
                this._loopArrow(arrow);
            } else {
                this.scheduleOnce(() => this._loopArrow(arrow), i * this.rippleStagger);
            }
        }
    }

    private _loopArrow(arrow: Node): void {
        if (!arrow?.isValid || !this.isValid) return;
        Tween.stopAllByTarget(arrow);
        tween(arrow)
            .to(this.rippleDuration * 0.4, { scale: new Vec3(1.35, 1.35, 1) }, { easing: 'sineOut' })
            .to(this.rippleDuration * 0.6, { scale: new Vec3(1, 1, 1) }, { easing: 'sineIn' })
            .call(() => this._loopArrow(arrow))
            .start();
    }

    private _stopRipple(): void {
        this.unscheduleAllCallbacks();
        if (this.arrowNode?.isValid) {
            Tween.stopAllByTarget(this.arrowNode);
            this.arrowNode.setScale(1, 1, 1);
        }
        for (const arrow of this.arrowNodes) {
            if (arrow?.isValid) {
                Tween.stopAllByTarget(arrow);
                arrow.setScale(1, 1, 1);
            }
        }
    }
}

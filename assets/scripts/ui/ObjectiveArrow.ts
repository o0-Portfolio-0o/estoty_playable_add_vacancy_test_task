import { _decorator, Component, Node, Camera, Vec3, view, tween, Tween, Game } from 'cc';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { ResourceManager } from '../managers/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('ObjectiveArrow')
export class ObjectiveArrow extends Component {

    @property(Camera)
    public gameCamera: Camera = null;

    @property(Node)
    public craftBench: Node = null;

    @property(Node)
    public gate: Node = null;

    @property(Node)
    public arrowNode: Node = null;

    private _currentTarget: Node = null;
    private _screenWidth: number = 0;
    private _screenHeight: number = 0;
    private _padding: number = 80;

    start() {
        const visibleSize = view.getVisibleSize();
        this._screenWidth = visibleSize.width;
        this._screenHeight = visibleSize.height;
        if (this.arrowNode) this.arrowNode.active = false;

        ResourceManager.instance?.node.on('resource-changed', this._onResourceChanged, this);
        GameManager.instance?.node.on('weapon-upgraded', this._onWeaponUpgraded, this);
        GameManager.instance?.node.on('game-win', this._stopPulseAnim, this);
        this._startPulseAnim();
    }

    update() {
        if (!this._currentTarget || !this.arrowNode) return;
        if (!this.gameCamera) return;

        const screenPos = new Vec3();
        this.gameCamera.worldToScreen(this._currentTarget.worldPosition, screenPos);

        const hw = this._screenWidth / 2;
        const hh = this._screenHeight / 2;

        const onScreen =
            screenPos.x > this._padding &&
            screenPos.x < this._screenWidth - this._padding &&
            screenPos.y > this._padding &&
            screenPos.y < this._screenHeight - this._padding;

        if (onScreen) {
            this._hideArrow();
            return
        } else {
            this._showArrow();
        }

        const dx = screenPos.x - hw;
        const dy = screenPos.y - hh;
        const angle = Math.atan2(dy, dx);

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const edgeX = hw - this._padding;
        const edgeY = hh - this._padding;

        let x: number, y: number;
        if (Math.abs(cos) * edgeY > Math.abs(sin) * edgeX) {
            x = cos > 0 ? edgeX : -edgeX;
            y = x * sin / cos;
        } else {
            y = sin > 0 ? edgeY : -edgeY;
            x = y * cos / sin;
        }

        this.arrowNode.setPosition(x, y, 0);

        const degrees = angle * (180 / Math.PI);
        this.arrowNode.setRotationFromEuler(0, 0, degrees);
    }

    onDestroy() {
        ResourceManager.instance?.node.off('resource-changed', this._onResourceChanged, this);
        GameManager.instance?.node.off('weapon-upgraded', this._onWeaponUpgraded, this);
        GameManager.instance?.node.off('game-win', this._stopPulseAnim, this);
        Tween.stopAllByTarget(this.arrowNode);
    }

    private _showArrow() {
        if (!this.arrowNode || this.arrowNode.active) return;
        this.arrowNode.active = true;
        this._startPulseAnim();
    }

    private _hideArrow() {
        if (!this.arrowNode || !this.arrowNode.active) return;
        this.arrowNode.active = false;
        Tween.stopAllByTarget(this.arrowNode);
        this.arrowNode.setScale(1, 1, 1);
    }

    private _onResourceChanged() {
        const rm = ResourceManager.instance;
        const gm = GameManager.instance;
        if (!rm || !gm) return;

        if (gm.weaponLevel === WeaponLevel.L1 && rm.canUpgradeToL2()) {
            this._currentTarget = this.craftBench;
            if (this.arrowNode) this.arrowNode.active = true;
        } else if (gm.weaponLevel === WeaponLevel.L2 && rm.canUpgradeToL3()) {
            this._currentTarget = this.craftBench;
            if (this.arrowNode) this.arrowNode.active = true;
        }
    }

    private _onWeaponUpgraded(level: WeaponLevel) {
        if (level === WeaponLevel.L3) {
            this._currentTarget = this.gate;
            if (this.arrowNode) this.arrowNode.active = true;
        } else {
            if (this.arrowNode) this.arrowNode.active = false;
            this._currentTarget = null;
        }
    }

    _startPulseAnim() {
        Tween.stopAllByTarget(this.arrowNode);
        tween(this.arrowNode)
            .to(0.4, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.4, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever()
            .start();
    }

    _stopPulseAnim() {
        Tween.stopAllByTarget(this.arrowNode);
        if (this.arrowNode) this.arrowNode.active = false;
        this._currentTarget = null;
    }
}
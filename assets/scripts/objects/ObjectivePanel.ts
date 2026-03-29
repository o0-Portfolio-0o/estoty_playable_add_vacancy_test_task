import { _decorator, Component, Sprite, Node, Color, tween, Tween, Vec3, sp } from 'cc';
const { ccclass, property } = _decorator;
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { ResourceManager } from '../managers/ResourceManager';

@ccclass('ObjectivePanel')
export class ObjectivePanel extends Component {

    @property(Sprite)
    public benchIcon: Sprite = null;

    @property(Sprite)
    public weaponIconL2: Sprite = null;

    @property(Sprite)
    public weaponIconL3: Sprite = null;

    @property(Sprite)
    public gateIcon: Sprite = null;

    private readonly FADED_ALPHA = 100;
    private readonly FULL_ALPHA = 255;

    start() {
        ResourceManager.instance?.node.on('resource-changed', this._onResourceChanged, this);
        GameManager.instance?.node.on('weapon-upgraded', this._onWeaponUpgrade, this);

        this._setFaded(this.benchIcon);
        this._setFaded(this.weaponIconL2);
        this._setFaded(this.gateIcon);
        this.weaponIconL3.node.active = false;
    }

    onDestroy(): void {
        ResourceManager.instance?.node.off('resource-changed', this._onResourceChanged, this);
        GameManager.instance?.node.off('weapon-upgraded', this._onWeaponUpgrade, this);
    }

    private _onResourceChanged() {
        const rm = ResourceManager.instance;
        const gm = GameManager.instance;

        if (!rm || !gm) return;

        if (gm.weaponLevel === WeaponLevel.L1 && rm.canUpgradeToL2()) {
            this._pulseToFull(this.benchIcon);
            this._pulseToFull(this.weaponIconL2);
        } else if (gm.weaponLevel === WeaponLevel.L2 && rm.canUpgradeToL3()) {
            this._pulseToFull(this.benchIcon);
            this._pulseToFull(this.weaponIconL3);
        }
    }

    private _onWeaponUpgrade(level: WeaponLevel) {
        if (level === WeaponLevel.L2) {
            this.weaponIconL2.node.active = false;
            this.weaponIconL3.node.active = true;
            this._setFaded(this.benchIcon);
            this._setFaded(this.weaponIconL3);
        } else if (level === WeaponLevel.L3) {
            this.weaponIconL3.node.active = false;
            this.benchIcon.node.active = false;
            this._pulseToFull(this.gateIcon);
        }
    }

    private _setFaded(sprite: Sprite) {
        if (!sprite) return;
        this._deactivateActiveAnim(sprite);

        sprite.color = new Color(255, 255, 255, this.FADED_ALPHA);
        sprite.node.setScale(1, 1, 1);
    }

    private _pulseToFull(sprite: Sprite) {
        if (!sprite) return;

        sprite.color = new Color(255, 255, 255, this.FULL_ALPHA);

        tween(sprite.node)
            .to(0.15, {scale: new Vec3(1.3, 1.3, 1)})
            .to(0.15, {scale: new Vec3(1, 1, 1)})
            .call(() => {
                this._startActiveAnim(sprite);
            })
            .start();
    }

    private _startActiveAnim(sprite: Sprite) {
        if (!sprite) return;

        tween(sprite.node)
            .to(0.6, {scale: new Vec3(1.1, 1.1, 1.1)})
            .to(0.6, {scale: new Vec3(1, 1, 1)})
            .union()
            .repeatForever()
            .start();
    }

    private _deactivateActiveAnim(sprite: Sprite) {
        if (!sprite) return;
        Tween.stopAllByTarget(sprite.node);
        sprite.node.setScale(1, 1, 1);
    }
}



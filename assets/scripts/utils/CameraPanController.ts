import { _decorator, Component, Node } from 'cc';
import { CameraFollow } from './CameraFollow';
import { GameManager, WeaponLevel } from '../managers/GameManager';

const { ccclass, property } = _decorator;

@ccclass('CameraPanController')
export class CameraPanController extends Component {

    @property(CameraFollow)
    public cameraFollow: CameraFollow = null;

    /** Anchor node placed at the center of the initial breakable boxes cluster */
    @property(Node)
    public introTarget: Node = null;

    /** Craft bench node — panned to on L1→L2 and L2→L3 upgrades */
    @property(Node)
    public upgradePanTarget: Node = null;

    /** Gate node — panned to when weapon reaches L3 */
    @property(Node)
    public gatePanTarget: Node = null;

    @property
    public panDuration: number = 0.8;

    @property
    public holdDuration: number = 1.5;

    @property
    public upgradeDelay: number = 1.2;

    start() {
        GameManager.instance?.node.on('game-started', this._onGameStarted, this);
        GameManager.instance?.node.on('weapon-upgraded', this._onWeaponUpgraded, this);
    }

    onDestroy() {
        GameManager.instance?.node?.off('game-started', this._onGameStarted, this);
        GameManager.instance?.node?.off('weapon-upgraded', this._onWeaponUpgraded, this);
    }

    private _onGameStarted() {
        if (!this.introTarget || !this.cameraFollow) return;
        GameManager.instance?.setIdle();
        this.cameraFollow.panTo(this.introTarget, this.panDuration, this.holdDuration, () => {
            GameManager.instance?.resume();
        });
    }

    private _onWeaponUpgraded(level: WeaponLevel) {
        if (!this.cameraFollow) return;
        const target = level === WeaponLevel.L3 ? this.gatePanTarget : this.upgradePanTarget;
        if (!target) return;
        GameManager.instance?.setIdle();
        this.scheduleOnce(() => {
            this.cameraFollow.panTo(target, this.panDuration, this.holdDuration, () => {
                GameManager.instance?.resume();
            });
        }, this.upgradeDelay);
    }
}

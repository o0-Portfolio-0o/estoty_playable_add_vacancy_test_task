import { _decorator, Component, Game, Node } from 'cc';
import { GameManager, WeaponLevel } from '../managers/GameManager';
const { ccclass, property } = _decorator;

@ccclass('WeaponController')
export class WeaponController extends Component {

    @property(Node)
    public weaponL1: Node = null;

    @property(Node)
    public weaponL2: Node = null;

    @property(Node)
    public weaponL3: Node = null;

    start(): void {
        GameManager.instance?.node.on('weapon-upgraded', this._onWeaponUpgraded, this);
        this._updateWeaponVisibility(WeaponLevel.L1);
    }


    onDestroy(): void {
        GameManager.instance?.node.off('weapon-upgraded', this._onWeaponUpgraded, this);
    }

    private _onWeaponUpgraded(level: WeaponLevel) {
        this._updateWeaponVisibility(level);
    }

    private _updateWeaponVisibility(level: WeaponLevel) {
        if (this.weaponL1) this.weaponL1.active = level === WeaponLevel.L1;
        if (this.weaponL2) this.weaponL2.active = level === WeaponLevel.L2;
        if (this.weaponL3) this.weaponL3.active = level === WeaponLevel.L3;
    }
}



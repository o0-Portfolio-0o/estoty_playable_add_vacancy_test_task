import { _decorator, Component, Node, Vec3, find } from 'cc';
import { GameManager, GameState } from '../managers/GameManager';
const { ccclass, property } = _decorator;

@ccclass('WinZone')
export class WinZone extends Component {

    @property
    public radius: number = 2.0;

    @property
    public requiredWeaponLevel: number = 0;

    private _player: Node = null;
    private _triggered: boolean = false;

    onLoad(): void {
        this._player = find('GameRoot/IdBr_character');
    }

    update(): void {
        if (this._triggered) return;
        if (GameManager.instance?.state !== GameState.PLAYING) return;
        if (this.requiredWeaponLevel > 0 &&
            (GameManager.instance?.weaponLevel ?? 1) < this.requiredWeaponLevel) return;
        if (!this._player) return;

        const dist = Vec3.distance(this.node.worldPosition, this._player.worldPosition);
        if (dist <= this.radius) {
            this._triggered = true;
            GameManager.instance?.triggerWin();
        }
    }
}

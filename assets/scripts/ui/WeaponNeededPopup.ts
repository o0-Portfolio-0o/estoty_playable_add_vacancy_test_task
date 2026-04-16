import { _decorator, Component, Label, Node, Tween, tween, Vec3, UIOpacity } from 'cc';
import { GameManager } from '../managers/GameManager';

const { ccclass, property } = _decorator;

@ccclass('WeaponNeededPopup')
export class WeaponNeededPopup extends Component {

    /** Container holding the label — set label color to red in Inspector */
    @property(Node)
    public container: Node = null;

    @property(Label)
    public label: Label = null;

    @property
    public displayDuration: number = 1.5;

    @property
    public fadeOutDuration: number = 0.3;

    private _uiOpacity: UIOpacity = null;

    start(): void {
        const target = this.container ?? this.label?.node;
        if (target) {
            this._uiOpacity = target.getComponent(UIOpacity) ?? target.addComponent(UIOpacity);
            this._uiOpacity.opacity = 0;
            target.active = false;
        }
        GameManager.instance?.node.on('weapon-needed', this._onWeaponNeeded, this);
    }

    onDestroy(): void {
        GameManager.instance?.node?.off('weapon-needed', this._onWeaponNeeded, this);
    }

    private _onWeaponNeeded(requiredLevel: number): void {
        if (!this.label) return;
        this.label.string = `WEAPON LEVEL ${requiredLevel} NEEDED`;
        this._show();
    }

    private _show(): void {
        const target = this.container ?? this.label.node;

        Tween.stopAllByTarget(target);
        if (this._uiOpacity) Tween.stopAllByTarget(this._uiOpacity);

        target.active = true;
        target.setScale(1, 1, 1);
        if (this._uiOpacity) this._uiOpacity.opacity = 255;

        tween(target)
            .to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'backOut' })
            .to(0.12, { scale: new Vec3(1, 1, 1) }, { easing: 'sineIn' })
            .start();

        if (this._uiOpacity) {
            tween(this._uiOpacity)
                .delay(this.displayDuration)
                .to(this.fadeOutDuration, { opacity: 0 }, { easing: 'sineIn' })
                .call(() => { target.active = false; })
                .start();
        } else {
            this.scheduleOnce(() => { target.active = false; },
                this.displayDuration + this.fadeOutDuration);
        }
    }
}

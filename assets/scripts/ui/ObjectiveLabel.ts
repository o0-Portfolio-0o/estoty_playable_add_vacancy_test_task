import { _decorator, Component, Label, Sprite, SpriteFrame, Tween, tween, Vec3, UIOpacity, Node } from 'cc';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { ResourceManager } from '../managers/ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('ObjectiveLabel')
export class ObjectiveLabel extends Component {

    @property(Node)
    public container: Node = null;

    @property(Label)
    public label: Label = null;

    @property(Sprite)
    public icon: Sprite = null;

    /** SpriteFrames indexed by phase: [0]=gather1, [1]=upgrade, [2]=gather2, [3]=openGate */
    @property([SpriteFrame])
    public iconFrames: SpriteFrame[] = [];

    @property
    public messageGather1: string = 'Gather scrap';

    @property
    public messageUpgrade: string = 'Upgrade weapon!';

    @property
    public messageGather2: string = 'Gather more scrap';

    @property
    public messageOpenGate: string = 'Open the gate!';

    @property
    public displayDuration: number = 3.0;

    @property
    public fadeOutDuration: number = 0.4;

    private _currentMessage: string = '';
    private _uiOpacity: UIOpacity = null;

    start(): void {
        const target = this.container ?? this.label?.node;
        if (target) {
            this._uiOpacity = target.getComponent(UIOpacity) ?? target.addComponent(UIOpacity);
        }
        this._showPhase(0, this.messageGather1, true);
        GameManager.instance?.node.on('weapon-upgraded', this._onWeaponUpgraded, this);
        GameManager.instance?.node.on('game-reset', this._onGameReset, this);
        ResourceManager.instance?.node.on('resource-changed', this._onResourceChanged, this);
    }

    onDestroy(): void {
        GameManager.instance?.node?.off('weapon-upgraded', this._onWeaponUpgraded, this);
        GameManager.instance?.node?.off('game-reset', this._onGameReset, this);
        ResourceManager.instance?.node?.off('resource-changed', this._onResourceChanged, this);
    }

    private _onResourceChanged(): void {
        const rm = ResourceManager.instance;
        const level = GameManager.instance?.weaponLevel;
        if (level === WeaponLevel.L1 && rm?.canUpgradeToL2()) {
            this._showPhase(1, this.messageUpgrade);
        } else if (level === WeaponLevel.L2 && rm?.canUpgradeToL3()) {
            this._showPhase(1, this.messageUpgrade);
        }
    }

    private _onWeaponUpgraded(level: WeaponLevel): void {
        if (level === WeaponLevel.L2) {
            this._showPhase(2, this.messageGather2);
        } else if (level === WeaponLevel.L3) {
            this._showPhase(3, this.messageOpenGate);
        }
    }

    private _onGameReset(): void {
        this._showPhase(0, this.messageGather1, true);
    }

    private _showPhase(iconIndex: number, text: string, force: boolean = false): void {
        if (!this.label) return;
        if (text === this._currentMessage && !force) return;
        this._currentMessage = text;

        this.label.string = text;

        if (this.icon) {
            const frame = this.iconFrames[iconIndex] ?? null;
            this.icon.spriteFrame = frame;
            this.icon.node.active = !!frame;
        }

        const target = this.container ?? this.label.node;
        Tween.stopAllByTarget(target);
        if (this._uiOpacity) Tween.stopAllByTarget(this._uiOpacity);

        target.setScale(1, 1, 1);
        if (this._uiOpacity) this._uiOpacity.opacity = 255;

        tween(target)
            .to(0.12, { scale: new Vec3(1.18, 1.18, 1.18) }, { easing: 'backOut' })
            .to(0.15, { scale: new Vec3(1, 1, 1) }, { easing: 'sineIn' })
            .start();

        if (this._uiOpacity) {
            tween(this._uiOpacity)
                .delay(this.displayDuration)
                .to(this.fadeOutDuration, { opacity: 0 }, { easing: 'sineIn' })
                .start();
        }
    }
}

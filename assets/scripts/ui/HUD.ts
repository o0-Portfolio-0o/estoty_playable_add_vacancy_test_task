import { _decorator, Component, Node, Label, Tween, tween, Vec3 } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { CraftBench } from '../objects/CraftBench';
import { AudioManager } from '../managers/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {

    @property([Node])
    public resourceLabels: Node[] = [];

    @property(Label)
    public currentCountLabel: Label = null;

    @property(Label)
    public separatorLabel: Label = null;

    @property(Label)
    public totalCountLabel: Label = null;

    @property(Node)
    public upgradeModal: Node = null;;

    @property(Node)
    public weaponModalL2: Node = null;

    @property(Node)
    public weaponModalL3: Node = null;

    @property(CraftBench)
    public craftBench: CraftBench = null;

    @property([Node])
    resourceContainers: Node[] = [];

    start() {
        //TODO: Extract to method attachlisteners
        //TODO: replace strings for RESOURCE_CHANGE: 'resource-changed'

        ResourceManager.instance?.node.on('resource-changed', this._updateResourceLabel, this);

        this.craftBench?.node.on('show-upgrade-modal', this._showUpgradeModal, this);

        if (this.upgradeModal) this.upgradeModal.active = false;
        this._updateResourceLabel();
    }

    onDestroy(): void {
        ResourceManager.instance?.node?.off('resource-changed', this._updateResourceLabel, this);

        this.craftBench?.node?.off('show-upgrade-modal', this._showUpgradeModal, this);
    }

    public onUpgradeButtonClicked() {
        this.craftBench?.onUpgradeConfirmed();
        AudioManager.instance?.playClick();
        if (this.upgradeModal) this.upgradeModal.active = false;
        this._updateResourceLabel();
    }

    public onModalClose() {
        if (this.upgradeModal) this.upgradeModal.active = false;
    }

    private _updateResourceLabel() {
        if (!this.resourceLabels.length) return;

        const rm = ResourceManager.instance;

        if (!rm) return;

        const weaponLevel = GameManager.instance?.weaponLevel;

        if (weaponLevel === WeaponLevel.L1) {
            this.resourceLabels[0].active = true;
            this.currentCountLabel.string = `${rm.resource1}`;
            this.separatorLabel.string = '/';
            this.totalCountLabel.string = `${rm.resource1Required}`;
        } else if (weaponLevel === WeaponLevel.L2) {
            this.resourceLabels[0].active = false;
            this.resourceLabels[1].active = true;
            this.currentCountLabel.string = `${rm.resource2}`;
            this.separatorLabel.string = '/';
            this.totalCountLabel.string = `${rm.resource2Required}`;
        } else {
            this.resourceLabels[1].active = false;
            this.resourceContainers.forEach(r => r.active = false);
            this.currentCountLabel.string = "";
            this.separatorLabel.string = "";
            this.totalCountLabel.string = "";
        }

        const shouldPopAllLabels =
            rm.resource1 === rm.resource1Required ||
            rm.resource2 === rm.resource2Required ||
            rm.resource2 === 0 && weaponLevel === WeaponLevel.L2;

        if (shouldPopAllLabels) {
            const scaleIntensity = new Vec3(1.1, 1.1, 1.1);
            this._popAnim(this.resourceLabel, scaleIntensity);
            this._popAnim(this.currentCountLabel, scaleIntensity);
            this._popAnim(this.separatorLabel, scaleIntensity);
            this._popAnim(this.totalCountLabel, scaleIntensity);
        } else {
            const scaleIntensity = new Vec3(1.4, 1.4, 1.4);
            this._popAnim(this.currentCountLabel, scaleIntensity);
        }
    }

    private _popAnim(label: Label, scale: Vec3) {
        if (!label) return;
        Tween.stopAllByTarget(label.node);
        tween(label.node)
            .to(0.1, {scale})
            .to(0.1, {scale: new Vec3(1, 1, 1)})
            .start();
    }

    private _showUpgradeModal() {
        if  (this.upgradeModal){
            AudioManager.instance?.openMenu();
            this.upgradeModal.active = true;
            const weaponLevel = GameManager.instance?.weaponLevel + 1;
            if (weaponLevel > 2) this.weaponModalL2.active = false;
            this[`weaponModalL${weaponLevel}`].active = true;
        }

    }
}



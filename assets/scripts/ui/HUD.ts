import { _decorator, Component, Node, Label, Tween, tween, Vec3 } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { CraftBench } from '../objects/CraftBench';
const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {

    @property(Label)
    public resourceLabel: Label = null;

    @property(Label)
    public currentCountLabel: Label = null;

    @property(Label)
    public separatorLabel: Label = null;

    @property(Label)
    public totalCountLabel: Label = null;

    @property(Node)
    public upgradeModal: Node = null;

    @property(CraftBench)
    public craftBench: CraftBench = null;

    start() {
        //TODO: Extract to method attachlisteners
        //TODO: replace strings for RESOURCE_CHANGE: 'resource-changed'

        ResourceManager.instance?.node.on('resource-changed', this._updateResourceLabel, this);

        this.craftBench?.node.on('show-upgrade-modal', this._showUpgradeModal, this);

        if (this.upgradeModal) this.upgradeModal.active = false;
        this._updateResourceLabel();
    }

    onDestroy(): void {
        ResourceManager.instance?.node.off('resource-changed', this._updateResourceLabel, this);

        this.craftBench?.node.off('show-upgrade-modal', this._showUpgradeModal, this);
    }

    public onUpgradeButtonClicked() {
        this.craftBench?.onUpgradeConfirmed();
        if (this.upgradeModal) this.upgradeModal.active = false;
        this._updateResourceLabel();
    }

    public onModalClose() {
        if (this.upgradeModal) this.upgradeModal.active = false;
    }

    private _updateResourceLabel() {
        if (!this.resourceLabel) return;

        const rm = ResourceManager.instance;

        if (!rm) return;

        const weaponLevel = GameManager.instance?.weaponLevel;

        if (weaponLevel === WeaponLevel.L1) {
            this.resourceLabel.string = 'WOOD:';
            this.currentCountLabel.string = `${rm.resource1}`;
            this.separatorLabel.string = '/';
            this.totalCountLabel.string = `${rm.resource1Required}`;
        } else if (weaponLevel === WeaponLevel.L2) {
            this.resourceLabel.string = 'SCRAP:';
            this.currentCountLabel.string = `${rm.resource2}`;
            this.separatorLabel.string = '/';
            this.totalCountLabel.string = `${rm.resource2Required}`;
        } else {
            this.resourceLabel.string = 'WEAPON MAX';
            this.currentCountLabel.string = "";
            this.separatorLabel.string = "";
            this.totalCountLabel.string = "";
        }

        // this._popAnim(this.currentCountLabel);
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
        if  (this.upgradeModal) this.upgradeModal.active = true;
    }
}



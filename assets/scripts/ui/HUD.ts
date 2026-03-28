import { _decorator, Component, Node, Label } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { GameManager, WeaponLevel } from '../managers/GameManager';
import { CraftBench } from '../objects/CraftBench';
const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {

    @property(Label)
    public resourceLabel: Label = null;
 
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
            this.resourceLabel.string = `Wood: ${rm.resource1} / ${rm.resource1Required}`;
        } else if (weaponLevel === WeaponLevel.L2) {
            this.resourceLabel.string = `Scrap: ${rm.resource2} / ${rm.resource2Required}`;
        } else {
            this.resourceLabel.string = 'Weapon MAX';
        }
    }

    private _showUpgradeModal() {
        if  (this.upgradeModal) this.upgradeModal.active = true;
    }
}



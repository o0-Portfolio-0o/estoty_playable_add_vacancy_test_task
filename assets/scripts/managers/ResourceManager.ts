import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager extends Component {

    private static _instance: ResourceManager = null;

    public static get instance(): ResourceManager {
        return ResourceManager._instance;
    }

    public resource1: number = 0;
    public resource1Required: number = 5;
    public resource2: number = 0;
    public resource2Required: number = 5;

    onLoad() {
        ResourceManager._instance = this;
    }

    public addResource1(amount: number = 1): void {
        this.resource1 +=amount;
        this.node.emit('resource-changed');
    }

    public addResource2(amount: number = 1): void {
        this.resource2 +=amount;
        this.node.emit('resource-changed');
    }

    public canUpgradeToL2(): boolean {
        return this.resource1 >= this.resource1Required;
    }

    public canUpgradeToL3(): boolean {
        return this.resource2 >= this.resource2Required;
    }

    public consumeForUpgrade(toLevel: number): void {
        if (toLevel === 2) this.resource1 = 0;
        if (toLevel === 3) this.resource2 = 0;
        this.node.emit('resources-changed');
    }

    public rest(): void {
        this.resource1 = 0;
        this.resource2 = 0;
        this.node.emit('resources-changed');
    }
}



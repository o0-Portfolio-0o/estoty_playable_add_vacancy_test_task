import { _decorator, Component, Prefab, Node, Vec3, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpawnForest')
export class SpawnForest extends Component {

    @property([Prefab])
    public prefabs: Prefab[] = [];

    @property
    public mapSize: number = 10;

    @property
    public spacing: number = 2;

    @property randomOffset: number = 0.5;

    start() {
        this._spawnBorder();
    }

    private _spawnBorder() {
        if (this.prefabs.length === 0) return;

        const positions: Vec3[] = [];

        for (let x = -this.mapSize; x <= this.mapSize; x += this.spacing) {
            positions.push(new Vec3(x, 0, -this.mapSize));
            positions.push(new Vec3(x, 0, this.mapSize));
        }

        for (let z = -this.mapSize + this.spacing; z < this.mapSize; z+= this.spacing) {
            positions.push(new Vec3(-this.mapSize, 0, z));
            positions.push(new Vec3(this.mapSize, 0, z));
        }

        positions.forEach(pos => {
            const prefab = this.prefabs[Math.floor(Math.random() * this.prefabs.length)];
            const node = instantiate(prefab);
            this.node.addChild(node);

            const offsetX = (Math.random() - 0.5) * this.randomOffset * 2;
            const offsetZ = (Math.random() - 0.5) * this.randomOffset * 2;

            node.setWorldPosition(
                pos.x + offsetX,
                pos.y,
                pos.z + offsetZ
            );

            node.setRotationFromEuler(
                0,
                Math.random() * 360,
                0
            );
        })
    }
}



import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {

    @property(Node)
    public target: Node = null;

    @property
    public offsetX: number = 0;

    @property
    public offsetY: number = 15;

    @property
    public offsetZ: number = 15;

    @property
    public smoothSpeed: number = 5;

    private _targetPosition: Vec3 = new Vec3();

    update(deltaTime: number) {
        if (!this.target) return;

        const targetPos = this.target.worldPosition;

        this._targetPosition.set(
            targetPos.x + this.offsetX,
            targetPos.y + this.offsetY,
            targetPos.z + this.offsetZ
        );

        const currentPos = this.node.worldPosition;
        const newPos = new Vec3();
        Vec3.lerp(newPos, currentPos, this._targetPosition, this.smoothSpeed * deltaTime);
        this.node.worldPosition = newPos;
    }
}



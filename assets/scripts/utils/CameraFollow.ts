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

    // Pan state
    private _isPanning: boolean = false;
    private _panStart: Vec3 = new Vec3();
    private _panEnd: Vec3 = new Vec3();
    private _panDuration: number = 1.0;
    private _panElapsed: number = 0;
    private _holdDuration: number = 1.5;
    private _holdElapsed: number = 0;
    private _isHolding: boolean = false;
    private _onPanComplete: (() => void) | null = null;

    /**
     * Pan the camera to look at a target node (using the same offset as normal follow),
     * hold there for holdDuration seconds, then release back to normal follow.
     */
    public panTo(target: Node, panDuration: number = 1.0, holdDuration: number = 1.5, onComplete?: () => void): void {
        this._panStart.set(this.node.worldPosition);
        this._panEnd.set(
            target.worldPosition.x + this.offsetX,
            target.worldPosition.y + this.offsetY,
            target.worldPosition.z + this.offsetZ
        );
        this._panDuration = panDuration;
        this._holdDuration = holdDuration;
        this._panElapsed = 0;
        this._holdElapsed = 0;
        this._isPanning = true;
        this._isHolding = false;
        this._onPanComplete = onComplete ?? null;
    }

    private _easeInOut(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    update(deltaTime: number) {
        if (this._isPanning) {
            if (!this._isHolding) {
                this._panElapsed += deltaTime;
                const t = Math.min(this._panElapsed / this._panDuration, 1);
                const newPos = new Vec3();
                Vec3.lerp(newPos, this._panStart, this._panEnd, this._easeInOut(t));
                this.node.worldPosition = newPos;
                if (t >= 1) this._isHolding = true;
            } else {
                this._holdElapsed += deltaTime;
                if (this._holdElapsed >= this._holdDuration) {
                    this._isPanning = false;
                    this._onPanComplete?.();
                    this._onPanComplete = null;
                }
            }
            return; // skip normal follow while panning
        }

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

import { _decorator, Camera, Component, EventTouch, geometry, Input, input, Vec3 } from 'cc';
import { PlayerAnimator, AnimationState } from './PlayerAnimator';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property
    public moveSpeed: number = 5;

    @property(Camera)
    public camera: Camera = null;

    @property(PlayerAnimator)
    public animator: PlayerAnimator = null;

    private targetPosition: Vec3 = new Vec3();
    private isMoving: boolean = false;
    private readonly STOP_DISTANCE: number = 0.1;

    onLoad() {
        this.targetPosition.set(this.node.worldPosition);
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    update(deltaTime: number) {
        if (!this.isMoving) {
            this.animator?.playAnimation(AnimationState.IDLE);
            console.log(this.animator.isPlaying(AnimationState.IDLE))
            return;
        };
            console.log(this.animator.isPlaying(AnimationState.IDLE))
        const currentPosition = this.node.worldPosition;
        const direction = new Vec3();
        Vec3.subtract(direction, this.targetPosition, currentPosition);
        direction.y = 0;

        const distance = direction.length();

        if (distance < this.STOP_DISTANCE) {
            this.isMoving = false;
            this.animator?.playAnimation(AnimationState.IDLE)
            return;
        }

        const angle = Math.atan2(direction.x, direction.z);
        this.node.setRotationFromEuler(0, angle * (180 / Math.PI), 0);

        direction.normalize();
        const movement = new Vec3(
            direction.x * this.moveSpeed * deltaTime,
            0,
            direction.z * this.moveSpeed * deltaTime
        );

        this.node.worldPosition = new Vec3(
            currentPosition.x + movement.x,
            currentPosition.y,
            currentPosition.z + movement.z
        );

        this.animator?.playAnimation(AnimationState.RUN);
    }

    private getWorldPositionFromTouch(event: EventTouch):Vec3 | null {
        if (!this.camera) return null;

        const touchPos = event.getLocation();
        const ray = new geometry.Ray();
        this.camera.screenPointToRay(touchPos.x, touchPos.y, ray);

        // Find where ray hits Y = 0 plane (the ground)
        const t = -ray.o.y / ray.d.y;
        if (t < 0) return null;

        return new Vec3(
            ray.o.x + ray.d.x * t,
            0,
            ray.o.z + ray.d.z * t
        );
    }

    private _onTouchStart(event: EventTouch) {
        const worldPos = this.getWorldPositionFromTouch(event);
        if (!worldPos) return;
        this.targetPosition.set(worldPos);
        this.isMoving = true;
    }

    private _onTouchMove(event: EventTouch) {
        if (!this.isMoving) return;
        const worldPos = this.getWorldPositionFromTouch(event);
        if (!worldPos) return;
        this.targetPosition.set(worldPos);
    }

    private _onTouchEnd() {
        this.isMoving = false;
    }
}



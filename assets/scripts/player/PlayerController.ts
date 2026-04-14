import { _decorator, Camera, Component, EventTouch, geometry, Input, input, Vec3 } from 'cc';
import { PlayerAnimator, AnimationState } from './PlayerAnimator';
import { Obstacle } from '../utils/Obstacle';
import { GameManager, GameState } from '../managers/GameManager';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property
    public mapBound: number = 20;

    @property
    public moveSpeed: number = 5;

    @property(Camera)
    public camera: Camera = null;

    @property(PlayerAnimator)
    public animator: PlayerAnimator = null;

    public isAttacking: boolean = false;

    private targetPosition: Vec3 = new Vec3();
    private isMoving: boolean = false;
    private readonly STOP_DISTANCE: number = 0.1;

    private _isTouchActive: boolean = false;
    private _lastScreenX: number = 0;
    private _lastScreenY: number = 0;

    onLoad() {
        this.targetPosition.set(this.node.worldPosition);
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    onDestroy() {
        input?.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input?.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input?.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input?.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    update(deltaTime: number) {
        if (this.isAttacking) {
            this.animator?.playAnimation(AnimationState.AXE);
            return;
        }

        if (this._isTouchActive) {
            const worldPos = this._screenToWorld(this._lastScreenX, this._lastScreenY);
            if (worldPos) {
                this.targetPosition.set(worldPos);
                this.isMoving = true;
            }
        }

        if (!this.isMoving) {
            this.animator?.playAnimation(AnimationState.IDLE);
            return;
        }

        const currentPosition = this.node.worldPosition;
        const direction = new Vec3();
        Vec3.subtract(direction, this.targetPosition, currentPosition);
        direction.y = 0;

        const distance = direction.length();

        if (distance < this.STOP_DISTANCE) {
            if (!this._isTouchActive) {
                this.isMoving = false;
                this.animator?.playAnimation(AnimationState.IDLE);
            }
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

        const newPos = new Vec3(
            currentPosition.x + movement.x,
            currentPosition.y,
            currentPosition.z + movement.z
        );

        if (!this._isPositionBlocked(newPos)) {
            this.node.worldPosition = newPos;
        }

        const clampedPos = this.node.worldPosition.clone();
        clampedPos.x = Math.max(-this.mapBound, Math.min(this.mapBound, clampedPos.x));
        clampedPos.z = Math.max(-this.mapBound, Math.min(this.mapBound, clampedPos.z));
        this.node.worldPosition = clampedPos;

        this.animator?.playAnimation(AnimationState.RUN);
    }

    private _screenToWorld(screenX: number, screenY: number): Vec3 | null {
        if (!this.camera) return null;
        const ray = new geometry.Ray();
        this.camera.screenPointToRay(screenX, screenY, ray);
        const t = -ray.o.y / ray.d.y;
        if (t < 0) return null;
        return new Vec3(
            ray.o.x + ray.d.x * t,
            0,
            ray.o.z + ray.d.z * t
        );
    }

    private _isGamePlaying() {
        return GameManager.instance?.state === GameState.PLAYING;
    }

    private _isPositionBlocked(newPos: Vec3): boolean {
        for (const obstacle of Obstacle.all) {
            if (!obstacle.node.active) continue;
            const dist = Vec3.distance(newPos, obstacle.node.worldPosition);
            if (dist < 1.2) return true;
        }
        return false;
    }

    private _onTouchStart(event: EventTouch) {
        if (!this._isGamePlaying()) return;
        const touchPos = event.getLocation();
        this._lastScreenX = touchPos.x;
        this._lastScreenY = touchPos.y;
        this._isTouchActive = true;

        const worldPos = this._screenToWorld(touchPos.x, touchPos.y);
        if (!worldPos) return;
        this.targetPosition.set(worldPos);
        this.isMoving = true;
    }

    private _onTouchMove(event: EventTouch) {
        if (!this._isGamePlaying()) return;
        const touchPos = event.getLocation();
        this._lastScreenX = touchPos.x;
        this._lastScreenY = touchPos.y;
    }

    private _onTouchEnd() {
        this._isTouchActive = false;
        this.isMoving = false;
    }
}

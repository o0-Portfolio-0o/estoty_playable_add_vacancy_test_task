import { _decorator, Component, SkeletalAnimation} from 'cc';
const { ccclass, property } = _decorator;

export enum AnimationState {
    IDLE = 'Armature.001|Armature.001|IDLE',
    RUN = 'Armature.001|Armature.001|RUN',
    AXE = 'Armature.001|Armature.001|AXE',
};


@ccclass('PlayerAnimator')
export class PlayerAnimator extends Component {

    @property(SkeletalAnimation)
    public animation: SkeletalAnimation = null;

    private _currentState: AnimationState = AnimationState.IDLE;

    onLoad(): void {
        if (!this.animation) {
            this.animation = this.getComponent(SkeletalAnimation);
        }
        this.playAnimation(AnimationState.IDLE);
    }

    public playAnimation(state: AnimationState): void {
        if (this._currentState === state) return;

        this._currentState = state;
        this.animation.play(state);

        if (state === AnimationState.AXE) {
            const animState = this.animation.getState(state);
            if (animState) animState.speed = 2.0;
        }
    }

    public isPlaying(state: AnimationState): boolean {
        return this._currentState === state;
    }
}



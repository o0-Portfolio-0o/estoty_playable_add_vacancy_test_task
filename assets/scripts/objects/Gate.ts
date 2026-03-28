import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { ResourceNode } from './ResourceNode';
import { GameManager } from '../managers/GameManager';
const { ccclass, property } = _decorator;

@ccclass('Gate')
export class Gate extends ResourceNode {

    protected _onDestroy(): void {
        this._isDestroyed = true;

        if (this._playerController) {
            this._playerController.isAttacking = false;
        }

        tween(this.node)
            .to(0.5, {scale: new Vec3(1, 0.1, 1)})
            .call(() => {
                this.node.active = false;
                GameManager.instance?.triggerWin();
            })
            .start();
    }
}



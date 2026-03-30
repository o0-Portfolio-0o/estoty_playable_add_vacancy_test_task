import { _decorator, Component, Node } from 'cc';
import { GameManager, GameState } from '../managers/GameManager';
const { ccclass, property } = _decorator;

@ccclass('StartScreen')
export class StartScreen extends Component {
    @property(Node)
    public hud: Node = null;

    @property(Node)
    public objectiveArrow: Node = null;

    start() {
        if (this.hud) this.hud.active = false;
        if (this.objectiveArrow) this.objectiveArrow.active = false;

        GameManager.instance?.setIdle();
    }

    public onPlayButtonClicked() {
        this.node.active = false;
        if (this.hud) this.hud.active = true;
        if (this.objectiveArrow) this.objectiveArrow.active = true;
        GameManager.instance?.startGame();
    }
}



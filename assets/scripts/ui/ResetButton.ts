import { _decorator, Component, director, Node } from 'cc';
import { AudioManager } from '../managers/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ResetButton')
export class ResetButton extends Component {
    public onResetButtonClicked() {
        AudioManager.instance?.playClick();
        director.loadScene(director.getScene().name);
    }
}



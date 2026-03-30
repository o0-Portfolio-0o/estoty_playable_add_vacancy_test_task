import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResetButton')
export class ResetButton extends Component {
    public onResetButtonClicked() {
        director.loadScene(director.getScene().name);
    }
}



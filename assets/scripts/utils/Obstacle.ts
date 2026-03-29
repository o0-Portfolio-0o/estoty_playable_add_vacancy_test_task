import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Obstacle')
export class Obstacle extends Component {

    private static _obstacles: Obstacle[] = [];

    public static get all(): Obstacle[] {
        return Obstacle._obstacles;
    }

    onLoad() {
        Obstacle._obstacles.push(this);
    }

    onDestroy(): void {
        const index = Obstacle._obstacles.indexOf(this);
        if (index > -1) {
            Obstacle._obstacles.splice(index, 1);
        }
    }
}




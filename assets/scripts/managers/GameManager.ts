import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum GameState {
    IDLE,
    PLAYING,
    WIN,
};

export enum WeaponLevel {
    L1 = 1,
    L2 = 2,
    L3 = 3,
};

@ccclass('GameManager')
export class GameManager extends Component {

    private static _instance: GameManager = null;

    public static get instance(): GameManager {
        return GameManager._instance;
    }

    public state: GameState = GameState.PLAYING;
    public weaponLevel: WeaponLevel = WeaponLevel.L1;

    onLoad() {
        GameManager._instance = this;
    }

    public setIdle() {
        this.state = GameState.IDLE;
    }

    public startGame() {
        this.state = GameState.PLAYING;
        this.node.emit('game-started');
    }

    public upgradeWeapon() {
        if (this.weaponLevel < WeaponLevel.L3) {
            this.weaponLevel++;
            this.node.emit('weapon-upgraded', this.weaponLevel);
        }
    }

    public triggerWin() {
        console.log('Game manager game-win fired!')
        this.state = GameState.WIN;
        this.node.emit('game-win');
    }

    public reset() {
        this.state = GameState.PLAYING;
        this.weaponLevel = WeaponLevel.L1;
        this.node.emit('game-reset');
    }

    onDestroy(): void {
        GameManager._instance = null;
    }
}



import { _decorator, Component, Node } from 'cc';
import { GameManager } from '../managers/GameManager';
const { ccclass, property } = _decorator;

@ccclass('WinScreen')
export class WinScreen extends Component {

    @property(Node)
    public winScreen: Node = null;

    start(): void {
        GameManager.instance?.node.on('game-win', this._onGameWin, this);
    }

    onDestroy(): void {
        GameManager.instance?.node.off('game-win', this._onGameWin, this);
    }

    public onPlayNowClicked() {
        this._triggerMRAID();
    }

    private _triggerMRAID() {
        try {
            if (typeof window !== 'undefined') {
                const w = window as any;
                if (w.mraid) {
                    if (w.mraid.getState() === 'default' ||
                        w.mraid.getState() === 'expanded') {
                            w.mraid.open('https://play.google.com/store');
                        }
                } else {
                    // Fallback for testing outside MRAID
                    console.log('MRAID not available - would redirect to store');
                    window.open('https://play.google.com/store', '_blank');
                }
            }
        } catch(error) {
            console.error('MRAID error:', error)
        }
    }

    private _onGameWin() {
        console.log('game-win event received');
        if (this.winScreen) this.winScreen.active = true;
    }
}



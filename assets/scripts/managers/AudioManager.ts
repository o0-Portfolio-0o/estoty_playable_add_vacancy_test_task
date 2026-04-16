import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager = null;

    public static get instance() {
        return AudioManager._instance;
    }

    @property([AudioClip])
    public hitSounds: AudioClip[] = [];

    @property(AudioClip)
    public clickSound: AudioClip = null;

    @property(AudioClip)
    public uiOpenSound: AudioClip = null;

    @property(AudioClip)
    public bgMusic: AudioClip = null;

    @property
    public bgMusicVolume: number = 0.3;

    private _audioSource: AudioSource = null;
    private _bgMusicSource: AudioSource = null;

    onLoad(): void {
        AudioManager._instance = this;
        if (!this._audioSource) {
            this._audioSource = this.addComponent(AudioSource);
        }
        if (this.bgMusic) {
            this._bgMusicSource = this.addComponent(AudioSource);
            this._bgMusicSource.clip = this.bgMusic;
            this._bgMusicSource.loop = true;
            this._bgMusicSource.volume = this.bgMusicVolume;
        }
    }

    public startBgMusic(): void {
        this._bgMusicSource?.play();
    }

    public stopBgMusic(): void {
        this._bgMusicSource?.stop();
    }

    public playHit() {
        if (!this.hitSounds.length) return;
        const randomIndex = Math.ceil(Math.random() * this.hitSounds.length - 1);
        this._audioSource.playOneShot(this.hitSounds[randomIndex], 1.0);
    }

    public playClick() {
        if (!this.clickSound) return;
        this._audioSource.playOneShot(this.clickSound, 1.0);
    }

    public openMenu() {
        if (!this.uiOpenSound) return;
        this._audioSource.playOneShot(this.uiOpenSound, 1.0);
    }
}



import { _decorator, Color, Component, Material, MeshRenderer, Node, Tween, tween, Vec3 } from 'cc';
import { GameManager, WeaponLevel } from '../managers/GameManager';
const { ccclass, property } = _decorator;

@ccclass('WeaponController')
export class WeaponController extends Component {

    @property(Node)
    public weaponL1: Node = null;

    @property(Node)
    public weaponL2: Node = null;

    @property(Node)
    public weaponL3: Node = null;

    start(): void {
        console.log('WeaponController start, Game Manager', GameManager.instance);
        GameManager.instance?.node.on('weapon-upgraded', this._onWeaponUpgraded, this);
        this._updateWeaponVisibility(WeaponLevel.L1);
    }


    onDestroy(): void {
        GameManager.instance?.node?.off('weapon-upgraded', this._onWeaponUpgraded, this);
    }

    private _onWeaponUpgraded(level: WeaponLevel) {
        console.log('weapon upgrade to: ', level)
        this._updateWeaponVisibility(level);
        const newWeapon = level === WeaponLevel.L2 ? this.weaponL2
                        : level === WeaponLevel.L3 ? this.weaponL3
                        : this.weaponL1;
        if (newWeapon) this._glowWeapon(newWeapon);
    }

    private _glowWeapon(weaponNode: Node): void {
        Tween.stopAllByTarget(weaponNode);
        const s = weaponNode.scale.clone();
        tween(weaponNode)
            .to(0.15, { scale: new Vec3(s.x * 1.4, s.y * 1.4, s.z * 1.4) }, { easing: 'backOut' })
            .to(0.2, { scale: s }, { easing: 'sineIn' })
            .start();

        const mr = weaponNode.getComponent(MeshRenderer)
            ?? weaponNode.getComponentInChildren(MeshRenderer);
        if (!mr?.mesh) return;

        const glowNode = new Node('_glow');
        weaponNode.addChild(glowNode);
        glowNode.setScale(1.15, 1.15, 1.15);

        const glowMR = glowNode.addComponent(MeshRenderer);
        glowMR.mesh = mr.mesh;

        const mat = new Material();
        mat.initialize({ effectName: 'builtin-unlit' });
        const glowColor = new Color(255, 220, 80, 255);
        mat.setProperty('mainColor', glowColor);
        glowMR.setSharedMaterial(mat, 0);

        const proxy = { alpha: 255 };
        tween(proxy)
            .to(1.0, { alpha: 0 }, {
                easing: 'sineIn',
                onUpdate: () => {
                    glowColor.a = Math.round(proxy.alpha);
                    mat.setProperty('mainColor', glowColor);
                },
            })
            .call(() => { if (glowNode?.isValid) glowNode.destroy(); })
            .start();
    }

    private _updateWeaponVisibility(level: WeaponLevel) {
            console.log('updating weapons - L1:', this.weaponL1, 'L2:', this.weaponL2, 'L3:', this.weaponL3);
        if (this.weaponL1) this.weaponL1.active = level === WeaponLevel.L1;
        if (this.weaponL2) this.weaponL2.active = level === WeaponLevel.L2;
        if (this.weaponL3) this.weaponL3.active = level === WeaponLevel.L3;
    }
}



/// <reference path="./BreakoutGame.ts" />

class Ball extends THREE.Sprite {
    private _velocity: THREE.Vector3 = new THREE.Vector3(200, 200, 0);
    public set velocity(velocity: THREE.Vector3) {
        this._velocity = velocity;
    }
    public get velocity(): THREE.Vector3 {
        return this._velocity;
    }

    private static readonly TOP_LIMIT = BreakoutGame.SCENE_HEIGHT / 2;
    private static readonly LEFT_LIMIT = -BreakoutGame.SCENE_WIDTH / 2 + 5;
    private static readonly RIGHT_LIMIT = +BreakoutGame.SCENE_WIDTH / 2 - 5;
    private static readonly BOTTOM_LIMIT = -BreakoutGame.SCENE_HEIGHT / 2;

    public isBurretMode = false;
    public isFired = false;
    public isDead = false;
    public onDeadCallback: Function;
    private _playerBar:PlayerBar;
    private _blocks:Array<Block>;

    public constructor(playerBar: PlayerBar, blocks : Array<Block>) {
        super(new THREE.SpriteMaterial({ color: new THREE.Color("red") }));
        this._playerBar = playerBar;
        this._blocks = blocks;

        this.scale.set(5, 5, 5);
        this.position.set(0, 0, 0);
    }

    public fire() {
        this.isFired = true;
    }

    public onDead() {
        this.isDead = true;
        if(!this.onDeadCallback) {
            return;
        }
        this.onDeadCallback();
    }

    public onUpdate(delta): void {
        if (!this.isFired || this.isDead) {
            return;
        }

        let newPosition = this.position.clone().add(this._velocity.clone().multiplyScalar(delta));

        if (newPosition.x < Ball.LEFT_LIMIT) {
            newPosition.x = Ball.LEFT_LIMIT + (Ball.LEFT_LIMIT - newPosition.x);
            this._velocity.x = -this._velocity.x;
        } else if (newPosition.x > Ball.RIGHT_LIMIT) {
            newPosition.x = Ball.RIGHT_LIMIT - (Ball.RIGHT_LIMIT - newPosition.x);
            this._velocity.x = -this._velocity.x;
        }
        if (newPosition.y > Ball.TOP_LIMIT) {
            newPosition.y = Ball.TOP_LIMIT - (Ball.TOP_LIMIT - newPosition.y);
            this._velocity.y = -this._velocity.y;
        }

        let collision = this._playerBar.calcCollision(this, newPosition);
        if (collision) {
            newPosition = collision.newPosition;
            this._velocity = collision.newVelocity;
        }

        this.position.set(newPosition.x, newPosition.y, newPosition.z);

        if (newPosition.y < Ball.BOTTOM_LIMIT) {
            this.onDead();
            return;
        } 
    }
}
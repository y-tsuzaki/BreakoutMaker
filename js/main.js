class BreakoutGame {
    constructor(canvas) {
        this._width = BreakoutGame.SCENE_WIDTH;
        this._height = BreakoutGame.SCENE_HEIGHT;
        this._canvas = canvas;
    }
    get canvas() {
        return this._canvas;
    }
    get renderer() {
        return this._renderer;
    }
    init() {
        this._renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this._canvas });
        this._renderer.setClearColor(0x000011);
        var pixelRatio = window.devicePixelRatio;
        this._renderer.setSize(this._width, this._height);
        this._renderer.setPixelRatio(pixelRatio);
        this._camera = new THREE.OrthographicCamera(-400 / 2, 400 / 2, 600 / 2, -600 / 2, 0, 1000);
        this._camera.position.set(0, 0, 100);
        this._scene = new THREE.Scene();
        this._scene.add(this._camera);
        var textureLoader = new THREE.TextureLoader();
        this.bar = new PlayerBar();
        this._scene.add(this.bar);
        this.ball = new Ball(this.bar, null);
        this.ball.onDeadCallback = () => {
            alert("GAME OVER");
        };
        this.ball.position.setY(PlayerBar.Y_POSITION + PlayerBar.HEIGHT / 2);
        this.ball.position.setZ(10);
        this._scene.add(this.ball);
        this._initGUI();
        window.addEventListener("mousemove", (e) => { this._onMousemove(e); });
        window.addEventListener("click", (e) => { this._onClicked(e); });
        this.doUpdate();
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }
    doUpdate() {
        if (this.stats) {
            this.stats.begin();
        }
        if (!this.oldUpdateTime) {
            this.oldUpdateTime = new Date().getTime();
        }
        let now = new Date().getTime();
        let delta = (now - this.oldUpdateTime) / 1000;
        this.oldUpdateTime = now;
        if (delta < 0) {
            throw new Error();
        }
        requestAnimationFrame(() => {
            this.doUpdate();
        });
        if (!this._scene) {
            return;
        }
        this.onUpdate(delta);
        let doUpdateSubRoutine = (obj) => {
            if (obj['onUpdate'] instanceof Function) {
                obj['onUpdate'](delta);
            }
            for (let child of obj.children) {
                doUpdateSubRoutine(child);
            }
        };
        doUpdateSubRoutine(this._scene);
        this._renderer.render(this._scene, this._camera);
        if (this.stats) {
            this.stats.end();
        }
    }
    onUpdate(delta) {
    }
    _initGUI() {
    }
    _onMousemove(e) {
        let x = e.clientX - this._canvas.getBoundingClientRect().left;
        x = x / this._canvas.offsetWidth * BreakoutGame.SCENE_WIDTH;
        x = x - BreakoutGame.SCENE_WIDTH / 2;
        this.bar.setPosition(x);
        if (!this.ball.isFired) {
            this.ball.position.setX(x);
        }
    }
    _onClicked(e) {
        this.ball.fire();
    }
}
BreakoutGame.DEFAULT_ASPECT = 400 / 600;
BreakoutGame.SCENE_WIDTH = 400;
BreakoutGame.SCENE_HEIGHT = 600;
class Ball extends THREE.Sprite {
    constructor(playerBar, blocks) {
        super(new THREE.SpriteMaterial({ color: new THREE.Color("red") }));
        this._velocity = new THREE.Vector3(200, 200, 0);
        this.isBurretMode = false;
        this.isFired = false;
        this.isDead = false;
        this._playerBar = playerBar;
        this._blocks = blocks;
        this.scale.set(5, 5, 5);
        this.position.set(0, 0, 0);
    }
    set velocity(velocity) {
        this._velocity = velocity;
    }
    get velocity() {
        return this._velocity;
    }
    fire() {
        this.isFired = true;
    }
    onDead() {
        this.isDead = true;
        if (!this.onDeadCallback) {
            return;
        }
        this.onDeadCallback();
    }
    onUpdate(delta) {
        if (!this.isFired || this.isDead) {
            return;
        }
        let newPosition = this.position.clone().add(this._velocity.clone().multiplyScalar(delta));
        if (newPosition.x < Ball.LEFT_LIMIT) {
            newPosition.x = Ball.LEFT_LIMIT + (Ball.LEFT_LIMIT - newPosition.x);
            this._velocity.x = -this._velocity.x;
        }
        else if (newPosition.x > Ball.RIGHT_LIMIT) {
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
Ball.TOP_LIMIT = BreakoutGame.SCENE_HEIGHT / 2;
Ball.LEFT_LIMIT = -BreakoutGame.SCENE_WIDTH / 2 + 5;
Ball.RIGHT_LIMIT = +BreakoutGame.SCENE_WIDTH / 2 - 5;
Ball.BOTTOM_LIMIT = -BreakoutGame.SCENE_HEIGHT / 2;
class Block extends THREE.Sprite {
    constructor() {
        super(new THREE.SpriteMaterial({ color: new THREE.Color("#58F") }));
        this.hitBox = { width: 20, height: 20 };
        this.scale.set(20, 20, 20);
        this.position.set(0, 0, 0);
    }
}
class PlayerBar extends THREE.Object3D {
    constructor() {
        super();
        this._width = 50;
        this.speedVector = new THREE.Vector3(1, 1, 0);
        let mainColor = new THREE.Color("#FFF");
        this._mainSprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: mainColor }));
        this._mainSprite.scale.set(this._width, PlayerBar.HEIGHT, 1);
        this.add(this._mainSprite);
        let boostLineColor = new THREE.Color("#E52");
        this._boostLineSprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: boostLineColor }));
        this._boostLineSprite.scale.set(2, PlayerBar.HEIGHT, 1);
        this._boostLineSprite.position.set(0, 0, 1);
        this.add(this._boostLineSprite);
        this.position.set(0, PlayerBar.Y_POSITION, 0);
    }
    calcCollision(ball, newBallPosition) {
        if (ball.velocity.y > 0) {
            return null;
        }
        if (newBallPosition.y >= this.position.y + PlayerBar.HEIGHT / 2) {
            return null;
        }
        if (newBallPosition.y < this.position.y - PlayerBar.HEIGHT / 2) {
            return null;
        }
        if (newBallPosition.x < this.position.x - this._width / 2 || newBallPosition.x > this.position.x + this._width / 2) {
            return null;
        }
        let newBallPositionTmp = newBallPosition.clone();
        let newVelocity = ball.velocity.clone();
        newVelocity.y = -newVelocity.y;
        return { newPosition: newBallPositionTmp, newVelocity };
    }
    setPosition(x) {
        let minX = -BreakoutGame.SCENE_WIDTH / 2 + this._width / 2;
        let maxX = BreakoutGame.SCENE_WIDTH / 2 - this._width / 2;
        this.position.x = Math.min(Math.max(x, minX), maxX);
    }
    onUpdate(delta) {
    }
}
PlayerBar.Y_POSITION = -BreakoutGame.SCENE_HEIGHT / 2 + 40;
PlayerBar.HEIGHT = 10;
$(window).on('load', () => {
    let canvas = document.getElementById("canvas");
    let game = new BreakoutGame(canvas);
    game.init();
});

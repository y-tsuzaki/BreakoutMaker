
class PlayerBar extends THREE.Object3D {
    public static readonly Y_POSITION = -BreakoutGame.SCENE_HEIGHT/2 + 40;
    public static readonly HEIGHT = 10;

    private _width = 50;
    
    public speedVector: THREE.Vector3 = new THREE.Vector3(1, 1, 0);

    private _mainSprite: THREE.Sprite;
    private _boostLineSprite: THREE.Sprite;

    public constructor() {
        super();
        let mainColor = new THREE.Color("#FFF");
        this._mainSprite = new THREE.Sprite(new THREE.SpriteMaterial( {  color: mainColor } ));
        this._mainSprite.scale.set(this._width, PlayerBar.HEIGHT, 1);
        this.add(this._mainSprite);

        let boostLineColor = new THREE.Color("#E52");
        this._boostLineSprite = new THREE.Sprite(new THREE.SpriteMaterial( {  color: boostLineColor} ));
        this._boostLineSprite.scale.set(2, PlayerBar.HEIGHT, 1);
        this._boostLineSprite.position.set(0, 0, 1);
        this.add(this._boostLineSprite);


        this.position.set(0, PlayerBar.Y_POSITION, 0);

    }

    public calcCollision(ball:Ball, newBallPosition) : {newPosition:THREE.Vector3, newVelocity:THREE.Vector3} {
        // 弾速が早くなるか、FPSが低下した場合、計算の精度が悪くなるが、そのうち直す
        if (ball.velocity.y > 0) {
            return null;
        }
        if (newBallPosition.y >= this.position.y + PlayerBar.HEIGHT/2) {
            return null;
        }
        if (newBallPosition.y < this.position.y - PlayerBar.HEIGHT/2) {
            return null;
        }
        if (newBallPosition.x < this.position.x - this._width/2 || newBallPosition.x > this.position.x + this._width/2 ){
            return null;
        }

        let newBallPositionTmp = newBallPosition.clone();
       // newBallPositionTmp = this.position.y +  PlayerBar.HEIGHT/2 + (this.position.y + PlayerBar.HEIGHT/2 - newBallPositionTmp.y);
        let newVelocity = ball.velocity.clone();
        newVelocity.y = - newVelocity.y;
        return {newPosition:newBallPositionTmp, newVelocity};
    }

    public setPosition(x : number) {
        let minX = -BreakoutGame.SCENE_WIDTH/2 + this._width/2;
        let maxX = BreakoutGame.SCENE_WIDTH/2 - this._width/2;
        this.position.x = Math.min(Math.max(x, minX), maxX);
    }

    public onUpdate(delta): void {

     //  this.position.add(newPosition);
    }
}
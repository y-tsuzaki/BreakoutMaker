/// <reference path="./BreakoutGame.ts" />

class Block extends THREE.Sprite {
    public hitBox: {width:number, height:number};

    public constructor() {
        super(new THREE.SpriteMaterial({ color: new THREE.Color("#58F") }));

        this.hitBox = {width: 20, height:20}
        this.scale.set(20, 20, 20);
        this.position.set(0, 0, 0);
    }
}
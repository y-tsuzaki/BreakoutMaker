class BreakoutGame {
  private _canvas: HTMLCanvasElement;
  get canvas() : HTMLCanvasElement {
    return this._canvas;
  }

  public constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  private _renderer: THREE.WebGLRenderer;
  public get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;

  public stats: any;
  public static readonly DEFAULT_ASPECT = 400 / 600;
  public static readonly SCENE_WIDTH = 400; // Scene内のサイズ
  public static readonly SCENE_HEIGHT = 600;
  public ball: Ball;
  public bar: PlayerBar;


  private _width = BreakoutGame.SCENE_WIDTH;
  private _height = BreakoutGame.SCENE_HEIGHT;

  public init(): void {

    // init renderer
    this._renderer = new THREE.WebGLRenderer({ antialias: true , canvas: this._canvas});
    this._renderer.setClearColor(0x000011);
    var pixelRatio = window.devicePixelRatio;
    this._renderer.setSize(this._width, this._height);
    this._renderer.setPixelRatio(pixelRatio);

    // init camera
    this._camera = new THREE.OrthographicCamera(-400/2, 400/2, 600/2, -600/2, 0, 1000); //あとでOrthographicCameraに変える
    this._camera.position.set(0, 0, 100);
    //init scene
    this._scene = new THREE.Scene();
    this._scene.add(this._camera);

    var textureLoader = new THREE.TextureLoader();
    //var sprite1 = textureLoader.load( 'https://threejs.org/examples/textures/sprites/snowflake1.png' );
    
    
    this.bar = new PlayerBar();
    this._scene.add(this.bar);

    this.ball = new Ball(this.bar, null);
    this.ball.onDeadCallback = ()=> {
      alert("GAME OVER");
    };
    this.ball.position.setY( PlayerBar.Y_POSITION + PlayerBar.HEIGHT/2);
    this.ball.position.setZ(10);
    this._scene.add(this.ball);

    
    this._initGUI();

    window.addEventListener("mousemove", (e) => {this._onMousemove(e)});
    window.addEventListener("click", (e) => {this._onClicked(e)});

    this.doUpdate();

    // Stats
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  //
  private oldUpdateTime: number;
  public doUpdate(): void {
    if (this.stats) {
      this.stats.begin();
    }

    if (!this.oldUpdateTime) {
      this.oldUpdateTime = new Date().getTime();
    }
    let now = new Date().getTime();
    let delta = (now - this.oldUpdateTime)/1000;
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

    let doUpdateSubRoutine = (obj: THREE.Object3D) => {
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

  public onUpdate(delta: number): void {
  }

  private _initGUI():void {

    // init GUI 
    // var gui = new dat.GUI();
    // gui.add(params, 'exposure', 0.1, 2).onChange(function (value) {
    //   this._renderer.toneMappingExposure = Math.pow(value, 4.0);
    // });
    // gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
    //   bloomPass.threshold = Number(value);
    // });
    // gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
    //   bloomPass.strength = Number(value);
    // });
    // gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
    //   bloomPass.radius = Number(value);
    // });
  }

  private _onMousemove(e:MouseEvent) {
    let x = e.clientX - this._canvas.getBoundingClientRect().left;
    x = x/this._canvas.offsetWidth * BreakoutGame.SCENE_WIDTH;
    x = x - BreakoutGame.SCENE_WIDTH/2;

    this.bar.setPosition(x);
    if(!this.ball.isFired) {
      this.ball.position.setX(x);
    }
  }

  private _onClicked(e:MouseEvent) {
    this.ball.fire();
  }
}
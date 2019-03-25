$(window).on('load', () => {
    let canvas = <HTMLCanvasElement>document.getElementById("canvas");
    let game = new BreakoutGame(canvas);
    game.init();
});

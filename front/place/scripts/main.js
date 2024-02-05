function init() {
    var stage = new createjs.Stage("PlaceCanvas");
    var rectangle = new createjs.Shape();

    for(var i = 0; i < 10; i++) {
        for(var j = 0; j < 10; j++) {
            var rectangle = new createjs.Shape();
            rectangle.graphics.beginFill("red").drawRect(0, 0, 10, 10);
            rectangle.x = 100 + i * 20;
            rectangle.y = 100 + j * 20;
            stage.addChild(rectangle);
        }
    }
    stage.update();
}
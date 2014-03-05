var _Score = 0,
    _yOffset = 0,
    _xOffset = 5,
    _introStartUp = [];

function setupUI() {
    setupIntro();
    //setupGUI()
}

function setupIntro() {
    var bimg = new Image();
    bimg.src = "images/pattern.png";
    bimg.onload = function(evt) {
        _txtWelcome = new createjs.Text("Welcome", "bold 62px airone", "");
        _txtWelcome.color = "#00a7f7";
        stage.addChild(_txtWelcome);
        _txtWelcome = widthAdjust(_txtWelcome);
        _txtWelcome.y = 20;
        _introStartUp.push(_txtWelcome);


        _txtStart = new createjs.Text("Get Ready!", "bold 62px airone", "");
        _txtStart.color = "#00a7f7";
        _txtStart = widthAdjust(_txtStart);
        _txtStart.y = (stage.height - _txtStart.getTransformedBounds().height) / 2;
        _introStartUp.push(_txtStart);
        stage.addChild(_txtWelcome);
        stage.addChild(_txtStart);

        _txtInsturctions = new createjs.Text("W == Thrust / SpaceBar == Fire", "bold 52px airone", "");
        _txtInsturctions.color = "#ffffff";
        _txtInsturctions = widthAdjust(_txtInsturctions);
        _txtInsturctions.y = ((stage.height - _txtInsturctions.getTransformedBounds().height) / 2) + 80;
        stage.addChild(_txtInsturctions);
        _introStartUp.push(_txtInsturctions);


        _txtCountDown = new createjs.Text("5", "bold 400px airone", "");
        _txtCountDown.color = "#ffffff";
        _txtCountDown = widthAdjust(_txtCountDown);
        _txtCountDown.y = (_txtWelcome.y - 20);
        stage.addChild(_txtCountDown);
        _introStartUp.push(_txtCountDown);

        var CountDown = setInterval(function() {
            if (parseInt(_txtCountDown.text) != 0) {
                if (parseInt(_txtCountDown.text) == 4) {
                    _txtStart.text = "too Be.."
                    _txtStart = widthAdjust(_txtStart);
                    _txtStart.y = (stage.height - _txtStart.getTransformedBounds().height) / 2;
                }
                if (parseInt(_txtCountDown.text) == 2) {
                    _txtStart.text = "Blasted"
                    _txtStart = widthAdjust(_txtStart);
                    _txtStart.y = (stage.height - _txtStart.getTransformedBounds().height) / 2;
                }
                _txtCountDown.text = parseInt(_txtCountDown.text) - 1;
            } else {
                ppReset();
                clearInterval(CountDown);
                delete CountDown;
            }
        }, 1000);

        /*bg = new createjs.Shape();
        stage.addChild(bg);
        bg.x = 0;
        bg.y = 0;
        bg.graphics.beginBitmapFill(evt.target, 'repeat').drawRect(0, 0, canvas.width, canvas.height);
        var blurFilter = new createjs.BlurFilter(4, 4, 1);
        bg.alpha = 0.5;
        bg.filters = [blurFilter];
        bg.cache(0, 0, canvas.width, canvas.height);
        */
    }


}

function widthAdjust(_txt) {
    if (_txt.getBounds().width > (_width * 0.4)) {
        _txt.scaleY = _txt.scaleX = ((_width * 0.4) / _txt.getBounds().width);
        setTimeout(function() {
            _txt.x = ((stage.width - _txt.getTransformedBounds().width) / 2);
            simpleFade(_txt);
        }, 500);
    }
    setTimeout(function() {
        _txt.x = ((stage.width - _txt.getTransformedBounds().width) / 2);
        simpleFade(_txt);
    }, 500);
    _txt.alpha = 0;
    _txt.shadow = new createjs.Shadow("#00a7f7", _xOffset, _yOffset, 20);


    return _txt;

}

function simpleFade(obj) {
    createjs.Tween.get(obj).to({
        alpha: 1
    }, 400);

}

function setupGUI() {
    for (var i = 0; i < _introStartUp.length; i++) {
        stage.removeChild(_introStartUp[i]);
        _introStartUp[i] = null;
    }
    var cimg = new Image();
    cimg.src = "images/cockpit.png";
    cimg.onload = function(evt) {
        var cpOrigWidth = 1366;
        cpOrigHeight = 543;
        cockpit = new createjs.Bitmap(evt.target);
        stage.addChild(cockpit);
        _cpScale = (_height / cpOrigHeight);
        cockpit.scaleX = _cpScale;
        cockpit.scaleY = _cpScale;
        cpBounds = cockpit.getBounds();
        cockpit.x = (stage.width - (cpBounds.width * _cpScale)) / 2;
        cockpit.y = (stage.height - (cpBounds.height * _cpScale)) / 2;
        var _txtScore = new createjs.Text("Score: " + _Score, "bold 20px airone", "");
        _txtScore.color = "#00a7f7";
        _txtScore.x = 20;
        _txtScore.y = 20;

        _txtScore.shadow = new createjs.Shadow("#00a7f7", _xOffset, _yOffset, 10);
        var img = new Image();
        img.src = "images/shipIco.png";
        img.onload = function(evt) {
            shipIco = new createjs.Bitmap(evt.target);
            stage.addChild(shipIco);
            shipIco.scaleX = 0.2;
            shipIco.scaleY = 0.2;
            var sBounds = shipIco.getBounds();
            shipIco.x = (stage.width - 80)
            shipIco.y = 20;
            _txtLives = new createjs.Text("X 3:", "bold 20px airone", "");
            _txtLives.color = "#ff1a00";
            _txtLives.shadow = new createjs.Shadow("#ff1a00", _xOffset, _yOffset, 10);
            _txtLives.x = (stage.width - 140);
            _txtLives.y = 35;
            //shipIco.shadow = new createjs.Shadow("#ff1a00", randomXOffset, randomYOffset, 10);
            stage.addChild(_txtLives);

        }


        stage.addChild(_txtScore);
    }

}
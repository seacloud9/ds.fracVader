    function startFracVader() {
        window.onload = function() {
            _width = window.innerWidth,
            _height = window.innerHeight,
            canvas = document.getElementById("uiCanvas");
            canvas.style.height = _height + "px";
            canvas.style.width = _width + "px";
            stage = new createjs.Stage(canvas),
            stage.width = stage.canvas.width = _width,
            stage.height = stage.canvas.height = _height,
            _stBounds = stage.getBounds();
            var img = new Image();
            img.src = "images/logoOmega.png";
            img.onload = function(evt) {
                logoBt = new createjs.Bitmap(evt.target);
                stage.addChild(logoBt);
                logoBt.scaleX = 0.8;
                logoBt.scaleY = 0.8;
                var lBounds = logoBt.getBounds();
                logoBt.x = (stage.width - (lBounds.width * 0.8)) / 2;
                logoBt.y = (stage.height - (lBounds.height * 0.8)) / 2;
                logoBt.alpha = 0;
                createjs.Tween.get(logoBt).to({
                    alpha: 1
                }, 400);
                logoBt.on('click', function() {
                    logoBt.alpha = 0;
                    canvas.className = canvas.className + " unselectable";
                    startFracVaders()
                });
            }

            startFracIntro();
            createjs.Ticker.addEventListener("tick", handleTick);

            function handleTick(event) {
                stage.update();
            }
        }
    }

    function setupUI() {
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
            var _txtScore = new createjs.Text("Score: 0", "bold 20px Arial", "");
            _txtScore.color = "#A3FF24";
            _txtScore.x = 20;
            _txtScore.y = 20;
            var randomXOffset = Math.floor(Math.random() * 5) + 5;
            var randomYOffset = Math.floor(Math.random() * 5) + 5;
            _txtScore.shadow = new createjs.Shadow("#A3FF24", randomXOffset, randomYOffset, 10);
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
                _txtLives = new createjs.Text("X 3:", "bold 20px Arial", "");
                _txtLives.color = "#ff1a00";
                var randomXOffset = Math.floor(Math.random() * 5) + 5;
                var randomYOffset = Math.floor(Math.random() * 5) + 5;
                _txtLives.shadow = new createjs.Shadow("#ff1a00", randomXOffset, randomYOffset, 10);
                _txtLives.x = (stage.width - 125);
                _txtLives.y = 35;
                //shipIco.shadow = new createjs.Shadow("#ff1a00", randomXOffset, randomYOffset, 10);
                stage.addChild(_txtLives);

            }


            stage.addChild(_txtScore);
        }

    }
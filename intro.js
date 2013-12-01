
var background;
var filter;
startupScreen = function(){
	gameP = new Phaser.Game($(window).width(), $(window).height(), Phaser.WEBGL, 'phaser', { preload: preloadPhaser, create: create, update: update });
}




preloadPhaser = function() {

    gameP.load.image('phaserL', 'images/fracvader_intro.png');
    gameP.load.image('texture', 'images/tex512.png');
    gameP.load.script('filter', 'scripts/phaser/filters/Tunnel.js');

}

create = function() {

	

	//background = gameP.add.sprite(0, 0);
	background = gameP.add.sprite(0, 0, 'texture');
	background.width = $(window).width();
	background.height = $(window).height();

	filter = gameP.add.filter('Tunnel', $(window).width(), $(window).height(), background.texture);

	background.filters = [filter];
	var logo = gameP.add.sprite(gameP.world.centerX, gameP.world.centerY, 'phaserL');
	logo.anchor.setTo(0.5, 0.5);
	$('#loader').hide();
	$('#phaser').fadeIn('fast');
	$('#phaser').click(function(){
		$('#phaser').hide();
		startFracVaders();
	});

}

function update() {

	filter.update();

}
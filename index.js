
var createGame = require('voxel-engine');
var perlinTerrain = require('voxel-perlin-terrain');
var tic = require('tic')();
var voxel = require('voxel');
voxelpp = require('voxel-pp')
var hasGenerated = false;
var hasGeneratedMod = false;

window.game = createGame({
      chunkDistance: 3,
      skyColor:0x000000,
      chunkSize: 32,
      worldOrigin: [0, 0, 0],
      //gravity: [0,0,0],
      /*generate: function(x, y, z) {
            return y === 1 ? 1 : 0
      },*/
      generateChunks: false,
      texturePath: 'textures/',
      controls: { discreteFire: false },
      materials: [['glass2'], 'brick', 'dirt', 'obsidian']
});
clock = new game.THREE.Clock();
window.game.view.renderer.autoClear = true;
game.tic = tic;
game.scene.fog.far = 1500;
game.gravity = [0,0,0];
//var terrainGenerator = perlinTerrain('abc123', 0, 5)
game.paused = false

/*
game.voxels.on('missingChunk', function(chunkPosition) {
      var size = game.chunkSize
      var voxels = terrainGenerator(chunkPosition, size)
      var chunk = {
        position: chunkPosition,
        dims: [size, size, size],
        voxels: voxels
      }
      game.showChunk(chunk)
})
*/
//game.tic = tic;
var createPlayer = require('voxel-player')(game);
player = createPlayer('textures/substack.png');
player.yaw.position.set(0, 2, 0);
player.position.y = 10;
player.subjectTo([0,0,0]);
//player.friction = new game.THREE.Vector3(1, 1, 10);
//player.move([0,0,-0.000005]);
player.possess();
game.appendTo('#container');

window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) {
        player.toggle();
    }
});

createCr = function (game){
    var sz = 5;
    var step = sz/5;
    var padding = parseInt(sz/2);
    var mx,my;
    var T = game.THREE;
    var body = new T.Object3D;

    var head = new T.Mesh(
        new T.CubeGeometry(5, 5, 5),
        new T.MeshLambertMaterial({
            color: 0x800830,
            ambient: 0x800830
        })
    );
    head.position.set(0, 5, 0);
    body.add(head);
  
    var eyes = [0,1].map(function () {
        var eye = new T.Mesh(
            new T.CubeGeometry(1, 1, 1),
            new T.MeshLambertMaterial({
                color: 0xffffff,
                ambient: 0xffffff
            })
        );
        body.add(eye);
        return eye;
    });
    eyes[0].position.set(2, 3, 5);
    eyes[1].position.set(-2, 3, 5);

    return body;
};


createInvader = function (game){
    var sz = 5;
    var step = sz/5;
    var padding = parseInt(sz/2);
    var mx,my;
    var T = game.THREE;
    body = new T.Object3D;
    bg = new T.Object3D();
    var createVader = function(clr,amb){
        var vaders = new T.Mesh(
            new T.CubeGeometry(1, 1, 1),
            new T.MeshLambertMaterial({
                color:clr,
                ambient: amb
            })
        );
        return vaders;
    }

    col = [];
    for (var j=0;j<sz;j+=step) {
      var m = 1;
      col[j] = [];
      for (var i=0;i<sz/2;i+=step) {
        c = (Math.random(1) > .5)? false:true; 
        col[j][i]= c;
        col[j][i+(sz-step)/m] = c;
        m++;
      }
    }
    for (var j=0;j<sz; j+=step) {
      for (var i=0;i<sz; i+= step) {
        var vaders = createVader(0x91e842, 0xffffff);
        var vader2 = createVader(0x91e842, 0xffffff);
        var vadersBG = createVader(0x800830, 0x800830);
        vadersBG.position.set(i, j, 4);
        vaders.position.set(i, j, 5);
        vaders.visible = col[j][i];
        vader2.position.set(i, j, 6);
        vader2.visible = col[j][i];
        bg.add(vadersBG);
        body.add(bg);
        body.add(vaders);
        body.add(vader2);
      }
    }

    return body;
};
createCreature = require('voxel-creature')(game);
cr = createInvader(game);
//cr = createCr(game);
//var bd = body.clone();
//creature2 = createCreature(bd);
creature = createCreature(cr);
window.creature = creature;
creature.position.y = 10;
creature.position.x = 0;
creature.position.z = -30;

postprocessor = voxelpp(game);
var bS = new postprocessor.EffectComposer.BloomPass( 9.25, 2, 0.0001, 1024 );
var fS = new postprocessor.EffectComposer.FilmPass( 0.35, 0.95, 2048, false );
fS.renderToScreen = true
postprocessor.addPass( bS );
postprocessor.addPass('ShaderPass', postprocessor.EffectComposer.ShaderExtras[ "screen" ]);

//creature.item.subjectTo([0,0.0000036,0]);
creature.on('notice', function (player) {
    creature.lookAt(player);
    //creature.move(0, 0, -0.5);
});
/*
creature.on('block', function () { creature.jump() });
creature.notice(player, { radius: 500 });

creature.on('notice', function (player) {
    creature.lookAt(player);
    creature.move(0, 0, 0.5);
});*/

onWindowResize = function( event ) {
        //customUniforms.resolution.value.x = window.innerWidth;
        //customUniforms.resolution.value.y = window.innerHeight;
         postprocessor.composer.setSize( window.innerWidth, window.innerHeight );
         window.game.camera.aspect = window.innerWidth / window.innerHeight;
         window.game.camera.updateProjectionMatrix();
         postprocessor.composer.reset();
}
    
window.addEventListener( 'resize', onWindowResize, false );    

setInterval(function () {
    if (creature.noticed) return;
    //creature.rotation.y += Math.random() * Math.PI / 2 - Math.PI / 4;
    //creature.move(0, 0, 0.5 * Math.random());
}, 1000);


$(function(){
/*  $('#cockpit').height($('body').height());
  $('#cockpit').width($('body').width());
  $('#cockpit').show();*/
    var starTunnel = {
            positionStyle  : Type.CUBE,
            positionBase   : new window.game.THREE.Vector3( 0, 5, -10 ),
            positionSpread : new window.game.THREE.Vector3( 10, 10, 10 ),

            velocityStyle  : Type.CUBE,
            velocityBase   : new window.game.THREE.Vector3( 0, 5, 20 ),
            velocitySpread : new window.game.THREE.Vector3( 5, 5, 5 ), 
            
            angleBase               : 0,
            angleSpread             : 720,
            angleVelocityBase       : 10,
            angleVelocitySpread     : 0,
            
            particleTexture : window.game.THREE.ImageUtils.loadTexture( 'images/spikey.png' ),

            sizeBase    : 4.0,
            sizeSpread  : 2.0,              
            colorBase   : new window.game.THREE.Vector3(0.15, 1.0, 0.8), // H,S,L
            opacityBase : 1,
            blendStyle  : window.game.THREE.AdditiveBlending,

            particlesPerSecond : 500,
            particleDeathAge   : 10.0,       
            emitterDeathAge    : 60000000
    }
    window.game.scene.fog.color = {r:0,g:0,b:0};
    game.view.renderer.setClearColor(0x000000, 1.0)
    window.game.engine = new ParticleEngine();
    window.game.engine.setValues( starTunnel ); 
    window.game.engine.initialize();
    game.on('postrender', function(dt) { 
      var dt = clock.getDelta();
      window.game.engine.update( dt * 0.5 ); 
      window.game.view.renderer.clear();
      postprocessor.composer.render( 0.01 );
      //console.log("-wtf" + dt);
    });
});



var createGame = require('voxel-engine');
var perlinTerrain = require('voxel-perlin-terrain');
var tic = require('tic')();
var voxel = require('voxel');
voxelpp = require('voxel-pp')
var hasGenerated = false;
var hasGeneratedMod = false;

var wrapTexture = function(){
  canvas = document.getElementById('starz');
  tex = new window.game.THREE.Texture(canvas);
  tex.needsUpdate = true;

  var materialCanvas = new window.game.THREE.MeshBasicMaterial({
    overdraw:true, map:tex, side:window.game.THREE.DoubleSide, transparent: true
  });
  tex.wrapS = tex.wrapT = window.game.THREE.RepeatWrapping;
  return materialCanvas;
}

window.game = createGame({
  chunkDistance: 3,
  skyColor:0x000000,
  chunkSize: 32,
  worldOrigin: [0, 0, 0],
  generateChunks: false,
  texturePath: 'textures/',
  controls: { discreteFire: false },
  materials: [['glass2'], 'brick', 'dirt', 'obsidian']
});
var critterCreator = require('voxel-critter')(game);
clock = new game.THREE.Clock();
window.game.view.renderer.autoClear = true;
game.tic = tic;
game.scene.fog.far = 90000;
game.gravity = [0,0,0];
game.paused = false


game.appendTo('#container');

window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'R'.charCodeAt(0)) {
    player.toggle();
    var d = $('#cockpit').css('display');
    if(d == 'block'){
      $('#cockpit').hide();
    }else{
      $('#cockpit').show();
    }
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
  var body = new T.Object3D;
  var bg = new T.Object3D();
  var createVader = function(clr,amb){
    mats = [
    new T.MeshLambertMaterial({
      color:clr,
      ambient: amb
    }),
    wrapTexture()
    ];
    var vaders = new T.Mesh(
      new T.CubeGeometry(1, 1, 1),
            //new T.MeshFaceMaterial(mats)
            //wrapTexture()
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
      vadersBG.visible = col[j][i];
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
createCreaures = function(){
  createCreature = require('voxel-creature')(game);
  cr = createInvader(game);
    /// exp
    var visibileArr = new Array();
    var meshInvaderVisibile = function(obj){
      for(var i=0; obj.children.length > i; i++){
        if(obj.children[i].children.length == 0 && obj.children[i].visible == true){
          visibileArr.push(obj.children[i]);
        }else{
          meshInvaderVisibile(obj.children[i])
        }
        
      }
    } 
    meshInvaderVisibile(cr); 
    mergedGeo  = new game.THREE.Geometry();
    for(var i=0; visibileArr.length > i; i++){
      if(i != 0){
        window.game.THREE.GeometryUtils.merge(mergedGeo, visibileArr[i]);
      }
    }
    groupM  = new game.THREE.Mesh( mergedGeo, new game.THREE.MeshLambertMaterial({
      color: 0x800830,
      ambient: 0x800830
    }) );
    window.game.scene.add(groupM);
   //exp
   creature = createCreature(cr);
   window.creature = creature;
   creature.position.y = 10;
   creature.position.x = 0;
   creature.position.z = -30;
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
setInterval(function () {
  if (creature.noticed) return;
        //creature.rotation.y += Math.random() * Math.PI / 2 - Math.PI / 4;
        //creature.move(0, 0, 0.5 * Math.random());
      }, 1000);
}


/// postprocess rendering

postprocessor = voxelpp(game);
var bS = new postprocessor.EffectComposer.BloomPass( 9.25, 2, 0.0001, 1024 );
var fS = new postprocessor.EffectComposer.FilmPass( 0.35, 0.95, 2048, false );
fS.renderToScreen = true
postprocessor.addPass( bS );
postprocessor.addPass('ShaderPass', postprocessor.EffectComposer.ShaderExtras[ "screen" ]);



onWindowResize = function( event ) {
        //customUniforms.resolution.value.x = window.innerWidth;
        //customUniforms.resolution.value.y = window.innerHeight;
        postprocessor.composer.setSize( window.innerWidth, window.innerHeight );
        window.game.camera.aspect = window.innerWidth / window.innerHeight;
        window.game.camera.updateProjectionMatrix();
        postprocessor.composer.reset();
      }

      window.addEventListener( 'resize', onWindowResize, false );    
      prCodeInit = function(){

        var $projDiv = $('#pContain');
        var canvasRef = $('<canvas id="starz"/>');
        p1 = new Processing.loadSketchFromSources('starz', ['scripts/starz.pde']);
        $projDiv.append(canvasRef); 
      }
      prCodeInit();



      startFracVaders = function(){
        canvasCallback = $.Callbacks();




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
          });
          var hellcat = new Image();
          hellcat.onload = function() {
            hellcatMod = critterCreator(hellcat);
            hellcatMod.children[0].visibile = false;
            var createPlayer = require('voxel-player')(game);
            player = createPlayer('textures/substack.png');
            player.playerSkin.body.visible = false;
            player.playerSkin.rightArm.visible = false;
            player.playerSkin.rightLeg.visible = false;
            player.playerSkin.leftArm.visible = false;
            player.playerSkin.leftLeg.visible = false;
            player.playerSkin.head.visible = false;
            player.yaw.position.set(0, 2, 0);
            var myMat = new game.THREE.MeshLambertMaterial({
              color: 0x800830,
              ambient: 0x800830
            });
            player.avatar.head.add(hellcatMod);
            hellcatMod.children[0].material = myMat;
            hellcatMod.rotation.y = -1.56;
            hellcatMod.rotation.z = 1.6;
            hellcatMod.children[0].visibile = true;
            hellcatMod.position.y = 1;
            hellcatMod.position.z = 95;
            player.subjectTo([0,0,0]);
      //player.friction = new game.THREE.Vector3(1, 1, 10);
      //player.move([0,0,-0.000005]);
      player.possess();
      $('#loader').hide();
      $('#container').fadeIn("fast");
      $('#cockpit').css('bottom', '0px');
      $('#cockpit').fadeIn("fast");
      $('#phaser').remove();
      gameP = null;

    }
    hellcat.src = 'images/hellcat2.png';
    createCreaures();
    //canvasCallback.add(prCodeInit);
    //canvasCallback.add(createCreaures);
    //canvasCallback.fire('createCreaures');



  };


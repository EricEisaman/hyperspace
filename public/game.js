let player = window.player;
player.within = function(distance,name){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position) <= distance;
}
player.distanceTo = function(name){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position);
}
player.awayFrom = function(name,distance){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position) > distance;
}

let bodiesWithin = function(distance,names){
  let result = true;
  names.forEach(name=>{
    names.forEach(n=>{
      if(window.bodies[name].object3D.position.distanceTo(window.bodies[n].object3D.position) > distance)
      {
        result = false;
        return;
      }
    });
  });
  return result;
 }

let stopBodySound = function(name){
  if(window.bodies[name].soundState === 0) return;
  window.bodies[name].querySelector('a-sound').components.sound.stopSound();
  //console.log("STOP BODY SOUND");
  window.bodies[name].dirty = true;
  window.bodies[name].soundState = 0;
}

let playBodySound = function(name){
  if(window.bodies[name].soundState == 1) return;
  window.bodies[name].querySelector('a-sound').components.sound.playSound();
  //console.log("PLAY BODY SOUND");
  window.bodies[name].dirty = true;
  window.bodies[name].soundState = 1;
}

let bodySoundIsPlaying = function(name){
  return window.bodies[name].soundState;
  //return window.bodies[name].querySelector('a-sound').components.sound.isPlaying;
}

let bodyHasSound = function(name){
  return window.bodies[name].querySelectorAll('a-sound').length > 0;
}



/*********************************************
/
/ User Defined Callbacks and Helper Functions
/
/*********************************************/

window.addPoints = function(playerId,params){
  if(window.socket.id == playerId){
   if(!player.score)player.score = 0;
   console.log(`Your Score: ${player.score+=params.amount}`);
   if(player.score >= 100 && !player.hasAttribute('hyperspace-ability__blue')){
     player.setAttribute('hyperspace-ability__blue','station1:#sta1; station2:#sta2; threshold:3');
   }
   if(player.score >= 200 && !player.hasAttribute('hyperspace-ability__red')){
     player.setAttribute('hyperspace-ability__red','station1:#sta3; station2:#sta4; threshold:3; effectColor:#f00; price:200');
   }
  }else{
   if(!window.otherPlayers[playerId].score)window.otherPlayers[playerId].score = 0;
   console.log(`${window.otherPlayers[playerId].name}'s Score: ${window.otherPlayers[playerId].score+=params.amount}`);
  }
  window.setReadout('scoreboard',stringFromRankedPlayers(sortScores()));
}

window.updateScoreboard = function(){
  window.setReadout('scoreboard',stringFromRankedPlayers(sortScores()));
}

// Lazy Naive sort
function sortScores(){
  let topId,topScore;
  let rankedPlayers = [];
  let ap = {...window.otherPlayers};
  ap[window.socket.id]={score:player.score,name:player.name,id:window.socket.id};
  for(let i=0;i<=Object.keys(window.otherPlayers).length;i++){
    topId;
    topScore = 0;
    for(var key in ap){
      if(typeof ap[key].score == "undefined")ap[key].score = 0;
      if(ap[key].score >= topScore){
        topScore = ap[key].score;
        topId = ap[key].id;
      }
    };
    window.setReadout('scoreboard',topScore);
    rankedPlayers.push(ap[topId]);
    delete ap[topId];
  }
  return rankedPlayers;
}

//Generate string with line new line characters
function stringFromRankedPlayers(rp){
  let s = '';
  rp.forEach(p=>{
    if(!s=='')s+='\n';
    s+=`${p.name}: ${p.score}`;
  });
  return s;
}

/*

  Custom code to track whether the player is entering or leaving the water.

*/

let playerIsUnderWater = false;
setInterval( ()=>{
  if(!window.gameHasBegun)return;
  let py = window.player.getAttribute('position').y;
  if(playerIsUnderWater && py>25){
     let sy =Math.abs(player.getAttribute('velocity').y);
     if(sy>80) sy = 80;
     window.sounds.splashOut.volume = sy/80;
     window.sounds.splashOut.play();
     window.environment.setAttribute('environment','fog:0.25');
     }else if(!playerIsUnderWater && py<25){
     let sy =Math.abs(player.getAttribute('velocity').y);
     if(sy>80) sy = 80;
     window.sounds.splashIn.volume = sy/80;
     window.sounds.splashIn.play();
     window.environment.setAttribute('environment','fog:0.9');
  }
  if(py<25){
    playerIsUnderWater = true;
  }else{
    playerIsUnderWater = false;
  }
},100);




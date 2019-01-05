window.AFRAME.registerComponent('hyperspace-ability', {
  schema: {
    station1: {type: 'selector',default:'#sta1'},
    station2: {type: 'selector',default:'#sta2'},
    threshold: {type: 'number',default:2},
    deltaT: {type: 'number',default:3000},
    effectColor: {type: 'string',default:'#00f'},
    price: {type: 'number', default:100},
    callbackName: {type: 'string',default:''}
  },
  
  multiple: true,

  init: function () {
    this.isHyperspacing = false;
  },
  
  isAt: function (station) {
    return this.el.object3D.position.distanceTo(station.object3D.position) <= this.data.threshold;
  },
  
  goTo: function (station) {
    let p = station.object3D.position;
    this.el.setAttribute('position',`${p.x} ${p.y+3} ${p.z}`);
    this.el.setAttribute('velocity','0 0 0');
  },
  
  timeout: function(){
    setTimeout(()=>{
       this.isHyperspacing = false;
      },this.data.deltaT);
  },
  
  hyperspace: function(destination){
    if(window.player.score<this.data.price){
      window.player.removeAttribute(this.attrName);
      return;
    }
    let p0 =this.el.getAttribute('position');
    let pos0 = {x:p0.x,y:p0.y-3,z:p0.z};
    window.socket.emit('hyperspace-alert',{pos:pos0,color:this.data.effectColor});
    window.createParticleEffect(pos0,{type:'magic',scale:4,color:this.data.effectColor});
    this.goTo(destination);
    this.isHyperspacing = true;
    this.timeout();
    let p =this.el.getAttribute('position');
    let pos = {x:p.x,y:p.y-3,z:p.z};
    window.socket.emit('hyperspace-alert',{pos:pos,color:this.data.effectColor});
    window.createParticleEffect(pos,{type:'magic',scale:4,color:this.data.effectColor});
    window.sounds.hyperspace.play();
    window.player.score-=this.data.price;
    window.updateScoreboard();
    if(window.player.score<this.data.price)
      window.player.removeAttribute(this.attrName);   
  },

  tick: function (time, timeDelta) {
    if(this.isHyperspacing)return;
    if(this.isAt(this.data.station1)){
      this.hyperspace(this.data.station2);
    }else if(this.isAt(this.data.station2)){
      this.hyperspace(this.data.station1);
    } 
  }
});

setTimeout(()=>{
  window.socket.on('hyperspace',data=>{
      window.createParticleEffect(data.pos,{type:'magic',scale:4,color:data.color});
    });
},3000);

//By Ada Rose Cannon
AFRAME.registerComponent('wobble-normal', {
	schema: {},
	tick: function (t) {
		if (!this.el.components.material.material.normalMap) return;
		this.el.components.material.material.normalMap.offset.x += 0.0001 * Math.sin(t/5000);
		this.el.components.material.material.normalMap.offset.y += 0.0001 * Math.cos(t/4000);
		this.el.components.material.material.normalScale.x = 0.5 + 0.5 * Math.cos(t/500);
		this.el.components.material.material.normalScale.x = 0.5 + 0.5 * Math.sin(t/600);
	}
})
//By Ada Rose Cannon
AFRAME.registerPrimitive('a-ocean-plane', {
	defaultComponents: {
		geometry: {
			primitive: 'plane',
			height: 10000,
			width: 10000
		},
		rotation: '-90 0 0',
		material: {
			shader: 'standard',
			color: '#8ab39f',
			metalness: 1,
			roughness: 0.2,
			normalMap: 'url(https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg)',
			normalTextureRepeat: '50 50',
			normalTextureOffset: '0 0',
			normalScale: '0.5 0.5',
			opacity: 0.8
		},
		'wobble-normal': {}
	},
});
enchant();

PARTICLE_MIN_SIZE = 5;
PARTICLE_MAX_SIZE = 30;
PARTICLE_MIN_SPEED = 100;
PARTICLE_MAX_SPEED = 1000;
PARTICLE_MIN_OPACITY_SPEED = 1;
PARTICLE_MAX_OPACITY_SPEED = 5;
var Particle = enchant.Class.create(enchant.Entity,{
	initialize: function(game, x, y, color){
		enchant.Entity.call(this);
		this.game = game;
		this.x = x;
		this.y = y;
		this.moveTo(this.x, this.y);
		var size = getRangedRandomNum(PARTICLE_MIN_SIZE, PARTICLE_MAX_SIZE)
		this.width = size;
		this.height= size;
		this.backgroundColor = color;
		this.degree = getRangedRandomNum(0, 360);
		this.vx = Math.cos((Math.PI / 180) * this.degree);
		this.vy = Math.sin((Math.PI / 180) * this.degree);
		this.opacity = getRangedRandomNum(1, 10)/10;
		this.movement_speed = getRangedRandomNum(PARTICLE_MIN_SPEED, PARTICLE_MAX_SPEED)/100;
		this.opacity_speed = getRangedRandomNum(PARTICLE_MIN_OPACITY_SPEED, PARTICLE_MAX_OPACITY_SPEED)/100;
		game.rootScene.addChild(this);
	},
	move: function(enemies){
		this.addEventListener('enterframe', function(){
			var enemy;
			for(var i in enemies){
				enemy = enemies[i];
				if(enemy.hp > 0 && this.intersect(enemy)){
					if(--enemy.hp <= 0){
						enemy.hp = 0;
						enemy.explode();
					}
					this.game.rootScene.removeChild(this);
					delete this;
					return;
				}
			}
			
			this.moveBy(this.vx*this.movement_speed, this.vy*this.movement_speed);
			this.vy += 0.1;
			this.opacity -= this.opacity_speed;
			if(this.opacity <= 0){
				this.opacity = 0;
				this.game.rootScene.removeChild(this);
				delete this;
			}
		});
	}
});

var Enemy = enchant.Class.create(enchant.Entity,{
	initialize: function(game, x, y, size, hp, color, particle_color, particle_num){
		enchant.Entity.call(this);
		this.game = game;
		this.className = "enemy";
		this.x = x;
		this.y = y;
		this.moveTo(this.x, this.y);
		this.width = size;
		this.height= size;
		this.backgroundColor = color;
		this.particle_color = particle_color;
		this.hp = hp;
		this.particle_num = particle_num;
		game.rootScene.addChild(this);
	},
	registerEnemies: function(enemies){
		this.enemies = enemies;
	},
	explode: function(){
		var particle;
		this.addEventListener('enterframe', function(){
			this.opacity -= 0.2;
			if(this.opacity <= 0){
				this.opacity = 0;
				for(var i=0; i<this.particle_num; i++){
					particle = new Particle(this.game, this.x + this.width/2, this.y + this.height/2, this.particle_color);
					particle.move(this.enemies);
				}
				this.game.rootScene.removeChild(this);
				delete this;
			}
		});
	}
});

var Grid = enchant.Class.create({
	initialize: function(game, canvas_width, canvas_height, grid_width, line_width, color){
		var vertical_line_num = Math.floor(Math.abs(canvas_width/grid_width))+1;
		var horizon_line_num = Math.floor(Math.abs(canvas_width/grid_width))+1;
		var screen = new Sprite(canvas_width, canvas_height);
		var surface = new Surface(canvas_width, canvas_height);
    	screen.image=surface;
    	game.rootScene.addChild(screen);
    	var context = surface.context;
    	context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = line_width;
        for(var i=0; i<vertical_line_num; i++){
        	var offset = i*grid_width;
	        context.moveTo(offset, 0);
	        context.lineTo(offset, canvas_height);
        }
        for(var i=0; i<horizon_line_num; i++){
        	var offset = i*grid_width;
	        context.moveTo(0, offset);
	        context.lineTo(canvas_width, offset);
        }
        context.stroke();
	}
});

function getRangedRandomNum(min, max){
	return min + Math.floor( Math.random() * (max+1) ); 
}

var DEFAULT_ENEMY_HORIZON_NUM = 20;
var DEFAULT_ENEMY_VERTICAL_NUM = 20;
var DEFAULT_ENEMY_SIZE = 30;
var DEFAULT_ENEMY_PERTICLE_NUM = 3;
var DEFAULT_ENEMY_COLOR = "#FF00FF";
var DEFAULT_ENEMY_PERTICLE_COLOR = "#000000";
var DEFAULT_ENEMY_HP = 1;
var DEFAULT_ENEMY_OFFSET_X = 50;
var DEFAULT_ENEMY_OFFSET_Y = 90;
var DEFAULT_ENEMY_MERGIN = 10;
var enemy_color = "";
var enemy_horizon_num = "";
var enemy_vertical_num = "";
var enemy_size = "";
var enemy_perticle_num = "";
$(document).ready(function() {
	$("#regenerate").click(function() {
		enemy_color = $('#enemy_color').val();
		enemy_horizon_num = $('#enemy_horizon_num').val();
		enemy_vertical_num = $('#enemy_vertical_num').val();
		enemy_size = $('#enemy_size').val();
		enemy_perticle_num = $('#enemy_particle_num').val();
		game_main();
	});
	game_main();
	function game_main(){
		// game
		var game = new Game($(window).width(), $(window).height());

		// onload
		game.onload = function() {
			// scene
			var scene = game.rootScene;
			scene.backgroundColor = "#FAFAFA";

			// grid
			var grid = new Grid(game, scene.width, scene.height, 15, 1, '#E0E0E0');

			// enemies
			if(enemy_color == ""){
				enemy_color = DEFAULT_ENEMY_COLOR;
			}
			if(enemy_horizon_num == ""){
				enemy_horizon_num = DEFAULT_ENEMY_HORIZON_NUM;
			}
			if(enemy_vertical_num == ""){
				enemy_vertical_num = DEFAULT_ENEMY_VERTICAL_NUM;
			}
			if(enemy_size == ""){
				enemy_size = DEFAULT_ENEMY_SIZE;
			}
			if(enemy_perticle_num == ""){
				enemy_perticle_num = DEFAULT_ENEMY_PERTICLE_NUM;
			}
			var enemies = new Array();
			var enemy;
			for(var i=0; i<enemy_vertical_num; i++){
				for(var j=0; j<enemy_horizon_num; j++){
					enemy = new Enemy(game,
														j*(enemy_size)+DEFAULT_ENEMY_OFFSET_X + j*DEFAULT_ENEMY_MERGIN,
														i*(enemy_size)+DEFAULT_ENEMY_OFFSET_Y + i*DEFAULT_ENEMY_MERGIN,
														enemy_size,
														DEFAULT_ENEMY_HP,
														enemy_color,
														DEFAULT_ENEMY_PERTICLE_COLOR,
														enemy_perticle_num);
					enemies.push(enemy);
				}
			}
			for(var i in enemies){
				enemies[i].registerEnemies(enemies);
			}
			
			// generate particle by touch
			scene.addEventListener("touchend", function(e) {
			    for(var i=0; i<50; i++){
					var particle = new Particle(game, e.x, e.y, "#000000");
					particle.move(enemies);
				}
			});
			
			var label_message = new Label("click and generate particle");
			label_message.color = '#C0C0C0';
			label_message.font = '24px helvetica';
			label_message.x = 10;
			label_message.y = 50;
			scene.addChild(label_message);
		};
		
		// game start
		game.start();
	}
});

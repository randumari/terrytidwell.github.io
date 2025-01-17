const MinionSpawn = function (x, y, minion)
{
  this.m_pos = [x,y],
  this.m_timer = 0,
  this.m_state = 0,
  this.WARM_UP_DURATION = 30,
  this.COOL_DOWN_DURATION = 3,
  this.minion = minion;
      
  this.handleTimeStep = function (gamestate)
  {
    this.m_timer++;
    if(this.m_state == 0)
    {
      if(this.m_timer >= this.WARM_UP_DURATION)
      {
        gamestate.gameEntities.push(this.minion);
        this.m_timer = 0;
        this.m_state = 1;
      }
    }
  }
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.ENTITIES + (this.m_pos[1] + .5) * 1000;
  };
  
  this.paint = function(gamestate, layout, canvas, ctx)
  {
    var alpha = (this.m_timer / this.WARM_UP_DURATION) + (Math.random() - .5) * .2;
    
    if(this.m_state == 1)
    {
      alpha = 1 - (this.m_timer / this.COOL_DOWN_DURATION);
    }
    if(this.m_state == 0)
    {
      ctx.globalAlpha = alpha * alpha * alpha;
      this.minion.paint(gamestate, layout, canvas, ctx);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "rgba(255,255,255,"+.05*alpha+")";
    ctx.strokeStyle = ctx.fillStyle;

    for(var x = 0.1; x < .9; x*=1.05)
    {
      
      var width = layout.tile_width * alpha * x;
      ctx.lineCap = "round";
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(
        layout.left(this.m_pos[0] + .5),
        -1 * layout.tile_height);
      ctx.lineTo(
        layout.left(this.m_pos[0] + .5),
        layout.top(this.m_pos[1] + .5), - width * .10);
      ctx.stroke();
      /*
      g_ctx.fillRect(
        (this.m_pos[0] + .5) * this.m_layout.m_cell_width - (width / 2),
        0,
        width,
        (this.m_pos[1] + .75) * this.m_layout.m_cell_height - width
      );
      */
      var cx = layout.left(this.m_pos[0] + .5);
      var cy = layout.top(this.m_pos[1] + .5);
      var rx = width/2;
      var ry = width/4;
      ctx.save(); // save state
      ctx.beginPath();

      ctx.translate(cx-rx, cy-ry);
      ctx.scale(rx, ry);
      ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);

      ctx.restore(); // restore to original state
      ctx.fill();
    }

    if(this.m_state == 2)
    {
      ctx.globalAlpha = alpha * alpha * alpha;
      this.minion.paint(gamestate, layout, canvas, ctx);
      ctx.globalAlpha = 1;
    }
  }

  this.active = function()
  {
    return this.m_state != 1 || this.m_timer < this.COOL_DOWN_DURATION;
  };
};

const FlameFountain = function (x, y, continuous)
{
  this.x = x;
  this.y = y;
  this.attack = new Attack(x,y,0,0);
  this.m_timer = 25;
  this.m_active = true;
  this.continuous = continuous;
  
  this.handleTimeStep = function(gamestate)
  {
    this.m_timer--
    if(this.m_timer === 0)
    {
      gamestate.gameEntities.push(new FlameWave(this.x, this.y, gamestate));
      if (this.continuous)
      {
        this.m_timer = 100;
      }
      else
      {
        this.m_active = false;
      }
    }
  }
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + this.y * 1000;
  }
  
  this.paint = function(gamestate, layout, canvas, ctx)
  {
    if(this.m_timer < 25 && this.m_timer % 2 == 0)
    {
      this.attack.paint(gamestate, layout, canvas, ctx);
    }
  }
  
  this.active = function()
  {
    return this.m_active;
  }
}

const FlameWave = function (x,y,gamestate)
{
  this.m_pos = [x,y],
  this.m_width = 0,
  this.m_timer = 0,
  this.FLAME_DURATION = 120,
  this.FLAME_WIDEN_TIME = 10,
  this.attacks = [new Attack(x,y,0,0)];
  gamestate.gameEntities.push(this.attacks[0]);
        
  this.handleTimeStep = function (gamestate)
  {
    this.m_timer++;
    if((this.m_timer % this.FLAME_WIDEN_TIME) == 0)
    {
      for (let i = 0; i < this.attacks.length; i++)
      {
        this.attacks[i].m_active = false;
      }
      this.attacks = [];
      this.m_width++;
      for (let i = -1 * this.m_width; i <= this.m_width; i++)
      {
        let j = this.m_width - Math.abs(i);
        if(x+i >= 2 && x+i <= 9 && y+j >= 2 && y+j <= 9)
        {
          let attack = new Attack(x+i, y+j, i, j);
          this.attacks.push(attack);
          gamestate.gameEntities.push(attack);
        }
        if (0 !== j)
        {
          if(x+i >= 2 && x+i <= 9 && y-j >= 2 && y-j <= 9)
          {
            let attack = new Attack(x+i, y-j, i, -1 * j);
            this.attacks.push(attack);
            gamestate.gameEntities.push(attack);
          }
        }
      }
    }
  }
  this.active = function()
  {
    return this.attacks.length !== 0;
  };
};

const Sparkle = function (x, y){
  this.LIFETIME = 30;
  this.pixel_pos = [0,0];
  this.pos = [x,y];
  this.m_active = true;

  //initialization continued below
  this.reset = function()
  {
    //all these numbers were scaled to a grid_size of 10
    this.m_timer = 0;
    this.pixel_pos[0] = Math.random();// * this.m_layout.m_cell_width;
    this.pixel_pos[1] = Math.random() * 2;// * this.m_layout.m_cell_height;
    this.alpha = Math.random();
    //this.plane = Math.floor(2 * Math.random());
    this.rise_rate = Math.random() / 40; // layout.tile_width/5;
    this.size = Math.random() * .0625 + .025; //2 to 6
  }
  
  //end initialization
  this.reset();
  
  this.handleTimeStep = function (gamestate)
  {
    this.m_timer++;
    if(this.m_timer >= this.LIFETIME)
    {
      if(Math.random() < .1)
      {
        this.reset();
      }
    }
    this.alpha+=(Math.random()-.5)*.05;
    this.pixel_pos[1] -= this.rise_rate;
    this.pixel_pos[0] += Math.random() * .025 - .0125;    
  }
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.ENTITIES + (this.pos[1] + this.pixel_pos[1] + .75) * 1000;
  };
  
  this.paint = function(gamestate, layout, canvas, ctx)
  {
    //g_ctx.globalAlpha = this.m_timer/this.LIFETIME;
    ctx.fillStyle="rgba(255,255,255,"+this.alpha+")"
    ctx.beginPath();
    ctx.arc(
      layout.left(this.pos[0] + this.pixel_pos[0]),
      layout.top(this.pos[1] - 2 + this.pixel_pos[1]),
      layout.tile_width * (this.size +  Math.random() * .025 - .0125),0,2*Math.PI);
    ctx.fill();
  }
  
  this.active = function()
  {
    return this.m_active;
  }
}

const EnemyWave = function ()
{
  this.ELEMENT_TYPE = 0;
  this.TIMER_TYPE = 1;
  this.ON_IDLE_TYPE = 2;
  this.m_queue = [];
  this.m_active_queue = [];
        
  this.handleTimeStep = function (gamestate)
  {
    var new_active_queue = [];
    for (let i = 0; i < this.m_active_queue.length; i++)
    {
      if (this.m_active_queue[i].active && this.m_active_queue[i].active())
      {
        new_active_queue.push(this.m_active_queue[i]);
      }
    }
    this.m_active_queue = new_active_queue;
    
    while(true)
    {
      if(this.m_queue.length == 0)
      {
        return;
      }
      var queue_item = this.m_queue[this.m_queue.length - 1];
      if(queue_item.type == this.ON_IDLE_TYPE)
      {
        if(this.m_active_queue.length < queue_item.value)
        {
          this.m_queue.pop();
        }
        else
        {           
          return;
        }
      }
      if(queue_item.type == this.TIMER_TYPE)
      {
        queue_item.value--;
        if(queue_item.value <= 0)
        {
          this.m_queue.pop();
        }
        else
        {
          return;
        }
      }
      if(queue_item.type == this.ELEMENT_TYPE)
      {
        var elemenent = this.m_queue.pop().value;
        gamestate.gameEntities.push(elemenent);
        this.m_active_queue.push(elemenent.minion);
      }
    }
  }
  this.addOnIdle = function(level)
  {
    this.m_queue.push({type: this.ON_IDLE_TYPE, value: level});
    return this;
  }
  this.addOnTimeout = function(timesteps)
  {
    this.m_queue.push({type: this.TIMER_TYPE, value: timesteps});
    return this;
  }
  this.addElement = function(element)
  {
    this.m_queue.push({type: this.ELEMENT_TYPE, value: element});
    return this;
  }
  this.active = function()
  {
    return this.m_queue.length > 0 || this.m_active_queue.length > 0;
  };
};

const SlowBishop = function(x,y)
{
  var bishop = new Bishop(x,y);
  bishop.CAST_TIME = 60;
  bishop.MOVE_TIME = 8;
  bishop.FULL_HEALTH = 3;
  bishop.m_health = 3;
  bishop.m_state_timers[bishop.SLIDE_1] = bishop.MOVE_TIME*3;
  bishop.m_state_timers[bishop.PAUSE_1] = 18;
  bishop.m_state_timers[bishop.SLIDE_2] = bishop.MOVE_TIME*3;
  bishop.m_state_timers[bishop.PAUSE_2] = 18;
  bishop.m_state_timers[bishop.SLIDE_3] = bishop.MOVE_TIME*3;
  bishop.m_state_timers[bishop.PAUSE_3] = 18;
  bishop.m_state_timers[bishop.CAST] = bishop.CAST_TIME;
  bishop.m_state_timers[bishop.REST] = 90;
  return bishop;
}

const Bishop = function (x, y)
{
  this.CAST_TIME = 30,
  this.MOVE_TIME = 4,
  this.INVINCIBLE_TIME = 50,
  this.FULL_HEALTH = 9,

  this.m_pos = [x,y],
  this.m_vel = [-1,-1],
  this.m_invincible = false,
  this.m_invincible_timer = 0,
  this.m_pushed = false,
  this.m_health = this.FULL_HEALTH,
  this.m_x_offset = 0,
  this.m_y_offset = 0,
  this.m_shadows = [],
  this.m_sparkles = [];
  for(var i = 0; i < 30; i++)
  {
    this.m_sparkles.push(new Sparkle(x, y));
  }

  //state machine
  this.m_state_timers = [this.MOVE_TIME*3,9,this.MOVE_TIME*3,9,this.MOVE_TIME*3,this.CAST_TIME,45,0,40],
  this.SLIDE_1 = 0,
  this.PAUSE_1 = 1,
  this.SLIDE_2 = 2,
  this.PAUSE_2 = 3,
  this.SLIDE_3 = 4,
  this.CAST = 5,
  this.REST = 6,
  this.END_LOOP = 7,
  this.STUNNED = 8,
  this.m_state = this.REST,
  this.m_state_timer = this.m_state_timers[this.REST],
  this.m_spells_since_summon = 0,
  
  this.handleTimeStep = function (gamestate)
  {
    for(var i = 0; i < this.m_shadows.length; i++)
    {
      this.m_shadows[i].handleTimeStep();
    }
    if(this.m_shadows.length > 0)
    {
      if(!this.m_shadows[0].active())
      {
        this.m_shadows.shift();
      }
    }
    
    if(this.m_invincible)
    {
      this.m_invincible_timer++;
      if(this.m_invincible_timer >= this.INVINCIBLE_TIME)
      {
        this.m_invincible = false;
        this.m_invincible_timer = 0;
      }
    }
    this.m_state_timer++;
    if(this.m_state_timer >= this.m_state_timers[this.m_state])
    {
      //exit state
      if(this.m_state == this.SLIDE_1 || 
      this.m_state == this.SLIDE_2 ||
      this.m_state == this.SLIDE_3)
      {
        /*
        var shadow = new BishopShadow(this.m_layout);
        shadow.pos[0] = this.m_pos[0];
        shadow.pos[1] = this.m_pos[1];
        shadow.pixel_pos[0] = this.m_pos[0] * this.m_layout.m_cell_width + this.m_x_offset;
        shadow.pixel_pos[1] = (this.m_pos[1] + 1) * this.m_layout.m_cell_height
          - Math.floor(2.5 * this.m_layout.m_cell_width) + this.m_y_offset;
        this.m_shadows.push(shadow);
        */
        this.m_x_offset = 0;
        this.m_y_offset = 0;
        
      }
      if(this.m_state == this.CAST)
      {
        if(this.m_spells_since_summon >= 4 && Math.random() <= .33)
        {
          this.m_spells_since_summon = 0;
          let minion_pos = gamestate.getRandomSpawnSquare()
          var minion = new MinionSpawn
          (
            minion_pos[0],
            minion_pos[1],
            new Pawn(minion_pos[0], minion_pos[1])
          );
          gamestate.gameEntities.push(minion);
        }
        else
        {
          this.m_spells_since_summon++;
          var flame = new FlameWave(this.m_pos[0], this.m_pos[1], gamestate);
          gamestate.gameEntities.push(flame);
        }
        for(let i = 0; i < this.m_sparkles.length; i++)
        {
          this.m_sparkles[i].m_active = false;
        }
      }
      //change state
      this.m_state = (this.m_state + 1);
      if(this.m_state >= this.END_LOOP)
      {
        this.m_state = 0;
      }
      this.m_state_timer = 0;
      //enter state
      if(this.m_state == this.CAST)
      {
        for(let i = 0; i < this.m_sparkles.length; i++)
        {
          this.m_sparkles[i].pos[0] = this.m_pos[0];
          this.m_sparkles[i].pos[1] = this.m_pos[1];
          this.m_sparkles[i].m_active = true;
          gamestate.gameEntities.push(this.m_sparkles[i]);
        }
      }
      if(this.m_state == this.SLIDE_1)
      {
        this.m_vel[0] = 2 * Math.floor(Math.random() * 2) - 1;
        this.m_vel[1] = 2 * Math.floor(Math.random() * 2) - 1;
      }
      if(this.m_state == this.SLIDE_2 ||
        this.m_state == this.SLIDE_3)
      {
        var direction = Math.floor(Math.random() * 2);
        this.m_vel[direction] = -1 * this.m_vel[direction];
      }
    }
    
    var move_me = false;
    if(this.m_state == this.SLIDE_1 || 
      this.m_state == this.SLIDE_2 ||
      this.m_state == this.SLIDE_3)
    {
      if((this.m_state_timer % this.MOVE_TIME) == Math.round(this.MOVE_TIME/2))
      {
        move_me = true;
      }
      if((this.m_state_timer % this.MOVE_TIME) == 0)
      {
        for (let i = 0; i < 4; i++)
        {
          if (gamestate.board[this.m_pos[0] + this.m_vel[0]][this.m_pos[1] + this.m_vel[1]].solid)
          {
            break;
          }
          
          let old_vel_0 = this.m_vel[0];
          let old_vel_1 = this.m_vel[1]
          
          if (i == 0)
          {
            //90 degrees counter-clockwise
            this.m_vel[0] = old_vel_1 * -1;
            this.m_vel[1] = old_vel_0 * 1;
          }
          else if (i == 1)
          {
            //180 degrees
            this.m_vel[0] = old_vel_0 * -1;
            this.m_vel[1] = old_vel_1 * -1;
          }
          else if (i == 2)
          {
            //90 degrees clockwise
            this.m_vel[0] = old_vel_1 * 1;
            this.m_vel[1] = old_vel_0 * -1;
          }
          else if (i == 3)
          {
            this.m_vel[0] = 0;
            this.m_vel[1] = 0;
          }
        }
      }
      /*
      var shadow = new BishopShadow(this.m_layout);
      shadow.pos[0] = this.m_pos[0];
      shadow.pos[1] = this.m_pos[1];
      shadow.pixel_pos[0] = this.m_pos[0] * this.m_layout.m_cell_width + this.m_x_offset;
      shadow.pixel_pos[1] = (this.m_pos[1] + 1) * this.m_layout.m_cell_height
        - Math.floor(2.5 * this.m_layout.m_cell_width) + this.m_y_offset;
      this.m_shadows.push(shadow);
      */
      this.m_x_offset = this.m_vel[0] *
        (this.m_state_timer % this.MOVE_TIME) / this.MOVE_TIME;
      this.m_y_offset = this.m_vel[1] * 
        (this.m_state_timer % this.MOVE_TIME) / this.MOVE_TIME;
      if((this.m_state_timer % this.MOVE_TIME) >= Math.round(this.MOVE_TIME/2))
      {
        this.m_x_offset = this.m_x_offset - this.m_vel[0];
        this.m_y_offset = this.m_y_offset - this.m_vel[1];
      }
    }

    if(this.m_pushed)
    {
      move_me = true;
      this.m_pushed = false;
      for (let i = 0; i < 4; i++)
      {
        if (gamestate.board[this.m_pos[0] + this.m_vel[0]][this.m_pos[1] + this.m_vel[1]].solid)
        {
          break;
        }
        
        let old_vel_0 = this.m_vel[0];
        let old_vel_1 = this.m_vel[1]
        
        this.m_vel[0] = old_vel_1 * -1;
        this.m_vel[1] = old_vel_0 * 1;
        
        if (i == 3)
        {
          this.m_vel[0] = 0;
          this.m_vel[1] = 0;
        }
      }
      this.m_x_offset = 0;
      this.m_y_offset = 0;
    }
    
    if(move_me)
    {
      this.m_pos[0] += this.m_vel[0];
      this.m_pos[1] += this.m_vel[1];
    }
  };
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.ENTITIES + (this.m_pos[1] + this.m_y_offset + .75) * 1000;
  };
  
  this.paint = function(gamestate, layout, canvas, ctx)
  {
    /*
      g_ctx.fillStyle = "rgba(0,0,255,.5)";
      g_ctx.fillRect(
        this.m_pos[0] * this.m_layout.m_cell_width,
        this.m_pos[1] * this.m_layout.m_cell_height,
        this.m_layout.m_cell_width,
        this.m_layout.m_cell_height
      );
    */
    ctx.fillStyle = "rgba(255,0,0,.5)";
    ctx.fillRect(
      layout.left(this.m_pos[0] + this.m_x_offset),
      layout.top(this.m_pos[1] + 1 + this.m_y_offset)
        - Math.floor(2.5 * layout.tile_width) + Math.floor(layout.tile_height/4),
      Math.floor(layout.tile_width * this.m_health / this.FULL_HEALTH),
      Math.floor(layout.tile_height/8)
    );
  
    if(!this.m_invincible || this.m_invincible_timer % 2 != 0)
    {
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.drawImage(
        GlobalResources.graphic_components.m_pieces,
        223,
        15,
        100,
        250,
        layout.left(this.m_pos[0] + this.m_x_offset),
        layout.top(this.m_pos[1] + 1 + this.m_y_offset)
          - Math.floor(2.5 * layout.tile_width),
        layout.tile_width,
        Math.floor(layout.tile_width * 2.5)
      );
    }

    for(var i = this.m_shadows.length-1; i > 0; --i)
    {
      this.m_shadows[i].paint(y, priority);
    }
  };
  
  this.handlePlayerCollision = function(x, y, gamestate)
  {
    if(!this.m_invincible)
    {
      if(x == this.m_pos[0] && y == this.m_pos[1])
      {
        gamestate.player.handleDamage(this.m_vel[0], this.m_vel[1]);
      }
    }
  };
  
  this.handlePlayerAttack = function(x,y)
  {
    if(x != this.m_pos[0] || y != this.m_pos[1])
    {
      return;
    }
  
    if(this.m_invincible)
    {
      return;
    }
    this.m_state = this.STUNNED;
    this.m_state_timer = 0;
    this.m_invincible = true;
    this.m_invincible_timer = 0;
    this.m_vel[0] = 2 * Math.floor(Math.random() * 2) - 1;
    this.m_vel[1] = 2 * Math.floor(Math.random() * 2) - 1;
    for(let i = 0; i < this.m_sparkles.length; i++)
    {
      this.m_sparkles[i].m_active = false;
    }
    this.m_pushed = true;
    this.m_health--;
  }
  
  this.active = function()
  {
     return this.m_health > 0;
  }
};

const SlowPawn = function(x,y)
{
  var pawn = new Pawn(x,y);
  pawn.m_health = 1;
  pawn.MOVE_TIME = 24;
  pawn.DELAY_BEFORE_MOVE = 24;
  pawn.ATTACK_DELAY = 16;
  return pawn;
}

const Pawn = function (x,y){
  this.x = x;
  this.y = y;
  this.m_vel = [-1,-1];
  this.m_invincible = false;
  this.m_invincible_timer = 0;
  this.m_state_timer = 0;
  this.m_pushed = false;
  this.m_attack_pos = [8,8];
  this.m_move_flip_flop = 0;
  this.m_health = 2;
  this.offset_x = 0;
  this.offset_y = 0;
  this.attack = new Attack(8,8,-1,-1);
  
  this.INVINCIBLE_TIME = 50,
  this.STUNNED_TIME = 40,
  this.ATTACK_TIME = 16;
  this.MOVE_TIME = 4;
  this.DELAY_BEFORE_MOVE = 12;
  this.ATTACK_DELAY = 8;
  
  //state machine
  this.PREMOVE = 0,
  this.MOVE = 1,
  this.ATTACK = 2,
  this.STUNNED = 3,
  this.m_state = this.PREMOVE,
  
  this.handleTimeStep = function (gamestate)
  {
    if(this.m_invincible)
    {
      this.m_invincible_timer++;
      if(this.m_invincible_timer >= this.INVINCIBLE_TIME)
      {
        this.m_invincible = false;
        this.m_invincible_timer = 0;
      }
    }
    var move_me = false;
    var delta_x = gamestate.player.x - this.x;
    var delta_y = gamestate.player.y - this.y;
    
    this.m_state_timer++;
    
    if(this.m_state != this.MOVE)
    {
      this.offset_x = 0;
      this.offset_y = 0;
    }
    
    if(this.m_state != this.ATTACK)
    {
      this.attack.m_active = false;
    }
    
    if(this.m_state == this.ATTACK && this.m_state_timer >= this.ATTACK_TIME)
    {
      this.m_state_timer = 0;
      this.m_state = this.PREMOVE;
      return;
    }
    
    if(this.m_state == this.PREMOVE && this.m_state_timer >= this.DELAY_BEFORE_MOVE)
    {
      if(Math.abs(delta_x) + Math.abs(delta_y) == 2 &&
        delta_x != 0 &&
        delta_y != 0)
      {
        this.m_state = this.ATTACK;
        this.m_state_timer = 0;
        this.m_attack_pos[0] = gamestate.player.x;
        this.m_attack_pos[1] = gamestate.player.y;
        this.attack.x = this.m_attack_pos[0];
        this.attack.y = this.m_attack_pos[1];
        this.attack.dx = delta_x;
        this.attack.dy = delta_y;
        this.attack.m_active = true;
        gamestate.gameEntities.push(this.attack);
        return;
      }
      else
      {
        this.m_state = this.MOVE;
        this.m_state_timer = 0;
        this.m_vel[0] = 1; 
        if(delta_x < 0 || (delta_x == 0 && Math.floor(Math.random()*2) == 0))
        {
          this.m_vel[0] = -1; 
        }
        this.m_vel[1] = 1; 
        if(delta_y < 0 || (delta_y == 0 && Math.floor(Math.random()*2) == 0))
        {
          this.m_vel[1] = -1; 
        }
        if(Math.abs(delta_x) + Math.abs(delta_y) < 2)
        {
          this.m_vel[0] *= -1;
          this.m_vel[1] *= -1;
        }
        if(Math.random() < .80)
        {
          this.m_move_flip_flop = (this.m_move_flip_flop + 1) % 2;
        }
        var potential_moves;
        if (this.m_move_flip_flop == 0)
        {
          //preferentially prefer vertical
          potential_moves = [[0,this.m_vel[1]],[0,-1 *this.m_vel[1]],[this.m_vel[0],0],[-1 * this.m_vel[0],0]];
        }
        else
        {
          //preferentially prefer horizontal
          potential_moves = [[this.m_vel[0],0],[-1 * this.m_vel[0],0],[0,this.m_vel[1]],[0,-1 *this.m_vel[1]]];
        }
        for(let p = 0; p < potential_moves.length; p++)
        {
          if(gamestate.board[this.x+potential_moves[p][0]][this.y+potential_moves[p][1]].solid)
          {
            this.m_vel[0] = potential_moves[p][0];
            this.m_vel[1] = potential_moves[p][1];
            break;
          }
        }
        return;
      }
    }
    
    if(this.m_state == this.MOVE)
    {
      if(this.m_state_timer == Math.round(this.MOVE_TIME / 2))
      {
        move_me = true;
      }
      var ratio = this.m_state_timer / this.MOVE_TIME;
      if(this.m_state_timer >= Math.round(this.MOVE_TIME / 2))
      {
        ratio = ratio - 1;
      }
      this.offset_x = this.m_vel[0] * ratio;
      this.offset_y = this.m_vel[1] * ratio;
      if(this.m_state_timer >= this.MOVE_TIME)
      {
        this.m_state_timer = 0;
        this.m_state = this.PREMOVE;
      }
    }
    if(this.m_state == this.STUNNED && this.m_state_timer >= this.STUNNED_TIME)
    {
      this.m_state = this.PREMOVE;
      this.m_state_timer = 0;
    }
    if(this.m_pushed)
    {
      this.m_vel[0] = 0;
      this.m_vel[1] = 0;
      var potential_directions = Util.shuffle([[1,0],[0,1],[-1,0],[0,-1]]);
      for(p in potential_directions)
      {
        if(gamestate.board[this.x+potential_directions[p][0]][this.y+potential_directions[p][1]].solid)
        {
          this.m_vel[0] = potential_directions[p][0];
          this.m_vel[1] = potential_directions[p][1];
          break;
        }
      }
      move_me = true;
      this.m_pushed = false;
    }
    
    if(move_me)
    {
      this.x += this.m_vel[0];
      this.y += this.m_vel[1];
    }       
  };
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.ENTITIES + (this.y + this.offset_y + .75) * 1000;
  };
  
  this.paint = function(gamestate, layout, canvas, ctx)
  {
    if(this.m_invincible && this.m_invincible_timer % 2 == 0)
    {
      return;
    }
    
    ctx.drawImage(
      GlobalResources.graphic_components.m_pieces,
      536,
      15,
      100,
      250,
      layout.left(this.x + this.offset_x),
      layout.top(this.y + this.offset_y + 1)
        - Math.floor(2.5 * layout.tile_width),
      layout.tile_width,
      Math.floor(2.5 * layout.tile_width)
    );
  };
  
  this.handlePlayerCollision = function(x, y, gamestate)
  {
    if(this.m_state == this.ATTACK)
    {
      if(x == this.m_attack_pos[0] && y == this.m_attack_pos[1])
      {
        delta_x = 1;
        if(this.x > x)
        {
          delta_x = -1;
        }
        delta_y = 1;
        if(this.y > y)
        {
          delta_y = -1;
        }
        gamestate.player.handleDamage(delta_x, delta_y);
      }
    }
    
    if(!this.m_invincible)
    {
      if(x == this.x && y == this.y)
      {
        gamestate.player.handleDamage(this.m_vel[0], this.m_vel[1]);
      }
    }
  };
  
  this.handlePlayerAttack = function(x,y)
  {
    if(x != this.x || y != this.y)
    {
      return;
    }
  
    if(this.m_invincible)
    {
      return;
    }
    
    this.m_state = this.STUNNED;
    this.m_state_timer = 0;
    this.m_invincible = true;
    this.m_invincible_timer = 0;
    this.m_pushed = true;
    this.m_health--;
    if(this.m_health <= 0)
    {
      this.attack.m_active = false;
    }
  }
  
  this.active = function()
  {
    return this.m_health > 0;
  }
};

var TimerLoop = function(initial_offset)
{
  this.ttl = initial_offset;
  this.state = -1;
  this.states = []
  this.addState = function(max_ttl, entry_function, warning_function, exit_function)
  {
    this.states.push({max_ttl: max_ttl, entry_function: entry_function, warning_function: warning_function, exit_function: exit_function});
  }
  
  this.handleTimeStep = function(gamestate)
  {
    if(this.ttl > 0)
    {
      this.ttl--;
    }
    else if (this.ttl == 0)
    {
      if(this.states[this.state] && this.states[this.state].exit_function)
      {
        this.states[this.state].exit_function(gamestate);
      }
      this.state++;
      if(this.states.length <= this.state)
      {
        this.state = 0;
      }
      if(this.states[this.state] && this.states[this.state].entry_function)
      {
        this.states[this.state].entry_function(gamestate);
      }
      this.ttl = this.states[this.state].max_ttl;
    }
    
    if (this.ttl < 25 && this.states[this.state] && this.states[this.state].warning_function)
    {
      this.states[this.state].warning_function(gamestate);
    }
  };
};

var Button = function(x, y, ttl, pressed_function, warning_function,
  released_function)
{
  this.x = x;
  this.y = y;
  this.reset = ttl === 0;
  this.ttl_max = ttl;
  
  this.ttl = 0;
  this.pushed = false;
  
  this.pressed_function = pressed_function;
  this.warning_function = warning_function;
  this.released_function = released_function;
  
  this.handlePlayerAttack = function(x, y, gamestate)
  {
    if (x == this.x &&
      y == this.y)
    {
      this.pushed = true;
      this.ttl = this.ttl_max;
      this.pressed_function(gamestate);
    }
  };
  
  this.handlePlayerCollision = function(x, y, gamestate)
  {
    if (x != this.x || y != this.y)
    {
      return;
    }
    
    this.pushed = true;
    this.ttl = this.ttl_max;
  };
  
  this.handleTimeStep = function(gamestate)
  {
    if (this.max_ttl === 0)
    {
      return;
    }
    if (!this.pushed)
    {
      return;
    }
    
    if (this.ttl === 0)
    {
      this.pushed = false;
      this.released_function(gamestate);
    }
    
    if (this.ttl > 0)
    {
      this.ttl--;
    }
    
    if (this.ttl > 0 && this.ttl < 25)
    {
      this.warning_function(gamestate);
    }
  };
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + this.y * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if(!this.pushed)
    {
      ctx.fillStyle = "rgb(192,128,128)";
      ctx.fillRect(
        layout.left(this.x + .25),
        layout.top(this.y + .125),
        layout.tile_width/2,
        layout.tile_height/2);
      ctx.fillStyle = "rgb(256,192,192)";
      ctx.fillRect(
        layout.left(this.x + .25),
        layout.top(this.y + .5),
        layout.tile_width/2,
        layout.tile_height/4);
    }
    else
    {
      ctx.fillStyle = "rgb(192,128,128)";
      ctx.fillRect(
        layout.left(this.x + .25),
        layout.top(this.y + .25),
        layout.tile_width/2,
        layout.tile_height/2);    
    }
  };
};

var Key = function(x, y)
{
  this.x = x;
  this.y = y;
  this.m_active = true;
  this.y_offset = -12;
  this.dy_offset = 0;
  this.bounce = 0;
  
  this.handlePlayerCollision = function(x, y, gamestate)
  {
    if(this.x != x || this.y != y || !this.m_active || this.y_offset < -3)
    {
      return;
    }
    this.m_active = false;
    gamestate.player.keys++;
  };
  
  this.handleTimeStep = function(gamestate)
  {
    if (this.bounce < 5)
    {
      this.y_offset += this.dy_offset;
      this.dy_offset += 1/16;
      if (this.y_offset > 0)
      {
        this.bounce++;
        this.y_offset *= -1;
        this.dy_offset *= -.30;
      }
    }
  }
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + this.y * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.beginPath()
    ctx.ellipse(
      layout.left(this.x + .5),
      layout.top(this.y + .50),
      layout.tile_width * .25 / (Math.abs(this.y_offset) + 1),
      layout.tile_width / 16 / (Math.abs(this.y_offset) + 1),
      0,
      0,
      2 * Math.PI
    )
    ctx.fill();

    ctx.drawImage(
      GlobalResources.graphic_components.key,
      0,
      0,
      512,
      1024,
      layout.left(this.x + .25),
      layout.top(this.y + .60 + this.y_offset)
        - Math.floor(.5 * layout.tile_width * 2),
      layout.tile_width * .5,
      Math.floor(.5 * layout.tile_width * 2)
    );
  };
  
  this.active = function()
  {
    return this.m_active;
  };
};

var LockPaint = function(x, y)
{
  this.x = x;
  this.y = y;
  this.m_active = true;
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + this.y * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    ctx.fillStyle = "rgba(128,128,0,.2)";
    ctx.fillRect(
      layout.left(this.x),
      layout.top(this.y),
      layout.tile_width,
      layout.tile_height);
    ctx.drawImage(
      GlobalResources.graphic_components.lock,
      0,
      0,
      50,
      50,
      layout.left(this.x + .25),
      layout.top(this.y),
      layout.tile_height,
      layout.tile_height
    );
  };
  
  this.active = function()
  {
    return this.m_active
  };
};

var Lock = function(victory_function)
{
  this.locks = [];
  this.m_active = true;
  this.victory_function = victory_function;

  this.handlePlayerAttack = function(x, y, gamestate)
  {
    if (!this.m_active)
    {
      return;
    }
  
    for (let l = 0; l < this.locks.length; l++)
    {
      if (this.locks[l].x === x && this.locks[l].y === y)
      {
        if (gamestate.player.keys > 0)
        {
          gamestate.player.keys--;
          this.victory_function(gamestate);
          this.m_active = false;
          for (let i = 0; i < this.locks.length; i++)
          {
            this.locks[i].m_active = false;
          }
        }
      }
    }
    
  };
  
  this.active = function()
  {
    return this.m_active
  };
};

var ButtonArrayButton = function(x, y)
{
  this.x = x;
  this.y = y;
  this.pushed = false;
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + this.y * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if(!this.pushed)
    {
      ctx.fillStyle = "rgb(192,128,128)";
      ctx.fillRect(
        layout.left(this.x + .25),
        layout.top(this.y + .125),
        layout.tile_width/2,
        layout.tile_height/2);
      ctx.fillStyle = "rgb(256,192,192)";
      ctx.fillRect(
        layout.left(this.x + .25),
        layout.top(this.y + .5),
        layout.tile_width/2,
        layout.tile_height/4);
    }
    else
    {
      ctx.fillStyle = "rgb(192,128,128)";
      ctx.fillRect(
        layout.left(this.x + .25),
        layout.top(this.y + .25),
        layout.tile_width/2,
        layout.tile_height/2);
    }
  };
};

var ButtonArray = function(victory_function)
{
  this.buttons = [];
  this.pressed = false;
  this.victory_function = victory_function;

  this.handlePlayerAttack = function(x, y, gamestate)
  {
    if (this.pressed)
    {
      return;
    }
    var needs_reset = true;
    this.pressed = true;
    var collidided = -1;
    for (let b = 0; b < this.buttons.length; b++)
    {
      if(this.buttons[b].x === x && this.buttons[b].y === y)
      {
        collidided = b;
        if (!this.buttons[b].pushed)
        {
          needs_reset = false;
          this.buttons[b].pushed = true;
        }
      }
      if (!this.buttons[b].pushed)
      {
        this.pressed = false;
      }
    }
    
    if (needs_reset)
    {
      for (let b = 0; b < this.buttons.length; b++)
      {
        if (b !== collidided)
        {
          this.buttons[b].pushed = false;
        }
      }
    }
    
    if (this.pressed)
    {
      if(this.victory_function)
      {
        this.victory_function(gamestate);
      }
    }
  };
};

var Attack = function(x, y, dx, dy)
{
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.m_active = true;

  this.handlePlayerCollision = function (x, y, gamestate)
  {
    if(x == this.x && y == this.y)
    {
      gamestate.player.handleDamage(dx, dy);
    }
  }
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + (this.y) * 1000;
  };
  
  this.paint = function(gamestate, layout, canvas, ctx)
  {
    let height = layout.tile_height;
    let y = layout.top(this.y + 1/4);
    if(gamestate.board[this.x][this.y].solid)
    {
      y = layout.top(this.y)
      height *= 1.25;
    }
    ctx.fillStyle = "rgba(255,0,0,.5)";
    ctx.fillRect(
      layout.left(this.x),
      y,
      layout.tile_width,
      height
    );
  };
  
  this.active = function()
  {
    return this.m_active;
  };
};

var FloorTile = function(x, y, solid)
{
  this.x = x;
  this.y = y;
  this.visible = solid;
  this.solid = solid;
  
  this.paintLevel = function()
  {
    return PaintLevelEnum.FLOOR + this.y * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if(!this.visible)
    {
      return;
    }
    
    if (((this.x + this.y)%2) == 0)
    {
      ctx.fillStyle = "rgb(128,128,128)";
    }
    else
    {
      ctx.fillStyle = "rgb(192,192,192)";
    }
    ctx.fillRect
    (
      layout.left(this.x),
      layout.top(this.y),
      layout.tile_width,
      layout.tile_height
    );
    if (((this.x + this.y)%2) == 0)
    {
      ctx.fillStyle = "rgb(96,96,96)";
    }
    else
    {
      ctx.fillStyle = "rgb(160,160,160)";
    }
    ctx.fillRect
    (
      layout.left(this.x),
      layout.top(this.y + 1),
      layout.tile_width,
      layout.tile_height / 4
    );
    
    if(gamestate.player.player_health == 0 || !gamestate.player.acceptInput())
    {
      return;
    }
    if(x != gamestate.player.x && y != gamestate.player.y && Math.abs(x - gamestate.player.x) + Math.abs(y - gamestate.player.y) == 3)
    {
      ctx.fillStyle = "rgba(0,255,0,.2)";
      ctx.fillRect
      (
        layout.left(this.x),
        layout.top(this.y),
        layout.tile_width,
        layout.tile_height * 1.25
      );
    }
  };
};

var DeathWatch = function(victory_function)
{
  this.m_active = true;
  this.children = [];
  this.victory_function = victory_function;
  
  this.addChild = function(child)
  {
    this.children.push(child);
  };
  
  this.handleTimeStep = function(gamestate)
  {
    if(!this.m_active)
    {
      return;
    }
    this.m_active = false;
    for (let c = 0; c < this.children.length; c++)
    {
      if (this.children[c].active)
      {
        if (this.children[c].active())
        {
          this.m_active = true;
        }
      }
    }
    if(!this.m_active)
    {
      if(this.victory_function)
      {
        this.victory_function(gamestate);
      }
    }
  };
  
  this.active = function()
  {
    return this.m_active;
  };
};

var RoomEnter = function(victory_function)
{
  this.m_active = true;
  this.victory_function = victory_function;
  
  this.addChild = function(child)
  {
    this.children.push(child);
  };
  
  this.handlePlayerCollision = function(x, y, gamestate)
  {
    if(!this.m_active)
    {
      return;
    }
    this.m_active = x < 2 || x > 9 || y < 2 || y > 9;
    if(!this.m_active)
    {
      if(this.victory_function)
      {
        this.victory_function(gamestate);
      }
    }
  };
  
  this.active = function()
  {
    return this.m_active;
  };
};

var LeftArrowTop = function()
{
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + 5 * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if (gamestate.player.x > 1 || gamestate.player.player_gamestate_unmovable)
    {
      return;
    }
    
    ctx.fillStyle = "rgba(0,255,0,.2)";
    ctx.beginPath();
    ctx.moveTo(
      layout.left(.75),
      layout.top(6));
    ctx.lineTo(
      layout.left(1.25),
      layout.top(5.25));
    ctx.lineTo(
      layout.left(1.25),
      layout.top(6));
    ctx.closePath();
    ctx.fill();
  }
};

var LeftArrowBottom = function()
{
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + 6 * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if (gamestate.player.x > 1 || gamestate.player.player_gamestate_unmovable)
    {
      return;
    }
    
    ctx.fillStyle = "rgba(0,255,0,.2)";
    ctx.beginPath();
    ctx.moveTo(
      layout.left(.75),
      layout.top(6));
    ctx.lineTo(
      layout.left(1.25),
      layout.top(6));
    ctx.lineTo(
      layout.left(1.25),
      layout.top(6.75));
    ctx.closePath();
    ctx.fill();
  }
};

var RightArrowTop = function()
{
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + 5 * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if (gamestate.player.x < 10 || gamestate.player.player_gamestate_unmovable)
    {
      return;
    }
    
    ctx.fillStyle = "rgba(0,255,0,.2)";
    ctx.beginPath();
    ctx.moveTo(
      layout.left(11.25),
      layout.top(6));
    ctx.lineTo(
      layout.left(10.75),
      layout.top(5.25));
    ctx.lineTo(
      layout.left(10.75),
      layout.top(6));
    ctx.closePath();
    ctx.fill();
  }
};

var TopArrowTop = function()
{
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + 1 * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if (gamestate.player.y > 1 || gamestate.player.player_gamestate_unmovable)
    {
      return;
    }
    
    ctx.fillStyle = "rgba(0,255,0,.2)";
    ctx.beginPath();
    ctx.moveTo(
      layout.left(6.75),
      layout.top(1.5));
    ctx.lineTo(
      layout.left(6),
      layout.top(.5));
    ctx.lineTo(
      layout.left(5.25),
      layout.top(1.5));
    ctx.closePath();
    ctx.fill();
  }
};

var BottomArrowTop = function()
{
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + 11 * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if (gamestate.player.y < 10 || gamestate.player.player_gamestate_unmovable)
    {
      return;
    }
    
    ctx.fillStyle = "rgba(0,255,0,.2)";
    ctx.beginPath();
    ctx.moveTo(
      layout.left(6.375),
      layout.top(11));
    ctx.lineTo(
      layout.left(6),
      layout.top(11.5));
    ctx.lineTo(
      layout.left(5.625),
      layout.top(11));
    ctx.closePath();
    ctx.fill();
  }
};

var BottomArrowBottom = function()
{
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + 10 * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if (gamestate.player.y < 10 || gamestate.player.player_gamestate_unmovable)
    {
      return;
    }
    
    ctx.fillStyle = "rgba(0,255,0,.2)";
    ctx.beginPath();
    ctx.moveTo(
      layout.left(5.25),
      layout.top(10.5));
    ctx.lineTo(  
      layout.left(5.625),
      layout.top(11));
    ctx.lineTo(  
      layout.left(6.375),
      layout.top(11));
    ctx.lineTo(
      layout.left(6.75),
      layout.top(10.5));
    ctx.lineTo(
      layout.left(5.25),
      layout.top(10.5));
    ctx.closePath();
    ctx.fill();
  }
};

var RightArrowBottom = function()
{
  this.paintLevel = function()
  {
    return PaintLevelEnum.LOWER + 6 * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if (gamestate.player.x < 10 || gamestate.player.player_gamestate_unmovable)
    {
      return;
    }
    
    ctx.fillStyle = "rgba(0,255,0,.2)";
    ctx.beginPath();
    ctx.moveTo(
      layout.left(11.25),
      layout.top(6));
    ctx.lineTo(
      layout.left(10.75),
      layout.top(6));
    ctx.lineTo(
      layout.left(10.75),
      layout.top(6.75));
    ctx.closePath();
    ctx.fill();
  }
};

var Player = function(x,y)
{
  this.x = x;
  this.y = y;
  this.y_offset = 0;
  this.keys = 0;
  this.player_health = 20;
  this.PLAYER_FULL_HEALTH = 20;
  this.player_pushed = false;
  this.player_push_x = 0;
  this.player_push_y = 0;
  this.player_stun_timer = 0;
  this.PLAYER_STUN_PERIOD = 10;
  this.PLAYER_INVINCIBLE_PERIOD = 30;
  this.player_invincible_timer = 0;
  this.player_gamestate_unmovable = false;
  
  this.acceptInput = function()
  {
    return this.player_stun_timer === 0 && this.y_offset === 0 && !this.player_gamestate_unmovable;
  };
  
  this.handleTimeStep = function(gamestate)
  {
    if(this.player_stun_timer > 0)
    {
      this.player_stun_timer--;
    }
    
    if(this.player_pushed)
    {
      this.player_push_x = Math.sign(this.player_push_x);
      this.player_push_y = Math.sign(this.player_push_y);
      var lookup=[
        [4,5,6],
        [3,8,7],
        [2,1,0]
      ];
      var rev_lookup=
      [
        [1,1],
        [1,0],
        [1,-1],
        [0,-1],
        [-1,-1],
        [-1,0],
        [-1,1],
        [0,1]
      ];
      var possible_moves = [];
      if (this.player_push_x == 0 && this.player_push_y == 0)
      {
        possible_moves = Util.shuffle(rev_lookup);
      }
      else
      {
        var original_pos = lookup[this.player_push_x + 1][this.player_push_y + 1];
        possible_moves.push(rev_lookup[original_pos]);
        
        for (let j = 1; j <= 3; j++)
        {
          var next_moves = 
            Util.shuffle([(original_pos + j) % 8,(original_pos + (7*j)) % 8]);
          for(let i = 0; i < next_moves.length; ++i)
          {
            possible_moves.push(rev_lookup[next_moves[i]]);
          }
        }
      }
      
      this.player_push_x = 0;
      this.player_push_y = 0;
      for (let i = 0; i < possible_moves.length; i++)
      {
        if (this.x + possible_moves[i][0] < 10 && this.x + possible_moves[i][0] > 1 &&
          this.y + possible_moves[i][0] < 10 && this.y + possible_moves[i][0] > 1 &&
          gamestate.board[this.x + possible_moves[i][0]][this.y + possible_moves[i][1]].solid)
        {
          this.player_push_x = possible_moves[i][0];
          this.player_push_y = possible_moves[i][1];
          break;
        }
      }
      this.player_pushed = false;
      this.x += this.player_push_x;
      this.y += this.player_push_y;
    }
    
    if(this.player_invincible_timer > 0)
    {
      this.player_invincible_timer--;
    }
  }
  
  this.handleDamage = function(delta_x, delta_y)
  {
    if(this.player_invincible_timer > 0)
    {
      return;
    }
    this.player_stun_timer = this.PLAYER_STUN_PERIOD;
    this.player_invincible_timer = this.PLAYER_INVINCIBLE_PERIOD;
    this.player_pushed = true;
    this.player_push_x = delta_x;
    this.player_push_y = delta_y;
    if(this.player_health > 0)
    {
      this.player_health--;
    }
  }

  this.paintLevel = function()
  {
    return PaintLevelEnum.ENTITIES + (this.y + .75) * 1000;
  }
  
  this.paint = function (gamestate, layout, canvas, ctx)
  {
    if (this.player_invincible_timer > 0 && this.player_invincible_timer % 2 === 0)
    {
      return;
    }
    if (this.player_health === 0)
    {
      return;
    }
    ctx.drawImage(
      GlobalResources.graphic_components.m_pieces,
      436,
      15,
      100,
      250,
      layout.left(this.x),
      layout.top(this.y + 1 + this.y_offset)
        - Math.floor(2.5 * layout.tile_width),
      layout.tile_width,
      Math.floor(layout.tile_width * 2.5)
    );
  };
};

let game_model = {
    m_global_resources: {
        m_gold: 0,
        m_max_gold: 100,
        m_cows: 0,
        m_max_cows: 20
    },
    m_village_area: new VillageArea(),
    m_selected_tile: null,
};

let layout_info = {
    m_score_height: 64,

    m_action_height: 64 * 2,

    m_map_size_x: 20,
    m_map_size_y: 20,
    m_tile_width: 64,
    m_tile_height: 64,
    m_add_grid_overlay: false,

    m_button_width: 265,
    m_button_height: 64,
    m_button_spacing: 5,
    m_button_left_margin: 300,
};

let LoadingScreen = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'LoadingScreen', active: true });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;
        this.cameras.main.setBackgroundColor("#000000");
        /*
        this.graphics = this.add.graphics();
        this.newGraphics = this.add.graphics();
        let progressBar = new Phaser.Geom.Rectangle(200, 200, 400, 50);
        let progressBarFill = new Phaser.Geom.Rectangle(205, 205, 290, 40);

        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRectShape(progressBar);

        this.newGraphics.fillStyle(0x3587e2, 1);
        this.newGraphics.fillRectShape(progressBarFill);
        */

        this.loadingText = this.add.text(game_width/2, game_height/2, "0%", { fontSize: '32px', fill: '#FFF' })
            .setOrigin(0.5, 0.5);

        this.load.image('farm_tile', 'assets/farm.png');
        this.load.image('mine_tile', 'assets/mine/mine2.png');
        this.load.image('mountains_tile', 'assets/mountains.png');
        this.load.image('plains_tile', 'assets/plains.png');
        this.load.image('selection_overlay', 'assets/selection_box/selection_box.png');
        this.load.image('hover_overlay', 'assets/selection_box/selection_box_hover.png');
        this.load.spritesheet('terrain', 'assets/terrain-v7.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.image('action_texture', 'assets/dashboard/detail_display.png');
        this.load.image('score_texture', 'assets/dashboard/stats_display2.png');
        this.load.image('control_texture', 'assets/dashboard/control_display.png');
        this.load.image('coin', 'assets/coin/coin_straight_on.png');
        this.load.spritesheet('coin_animated', 'assets/coin/coin.png',
            { frameWidth: 32, frameHeight: 32 });
        this.load.image('cow_head', 'assets/cow/cow_head.png');
        this.load.image('button_passive', 'assets/buttons/button_grey2A.png');
        this.load.image('button_active',
            'assets/buttons/button_grey2C.png');
        this.load.image('button_busy',
            'assets/buttons/button_grey2B.png');
        this.load.svg('volume_off',
            'assets/volume_off-48px.svg');
        this.load.svg('volume_on',
            'assets/volume_up-48px.svg');
        this.load.audio('bgm', 'assets/Suonatore_di_Liuto.mp3');

        this.load.on('progress', this.updateBar, this);
        this.load.on('complete', this.complete, {scene:this.scene});
    },

    updateBar: function(percentage) {
        /*
        this.newGraphics.clear();
        this.newGraphics.fillStyle(0x3587e2, 1);
        this.newGraphics.fillRectShape(new Phaser.Geom.Rectangle(205, 205, percentage*390, 40));
        */
        percentage = percentage * 100;
        console.log("P:" + percentage);
        this.loadingText.setText(percentage.toFixed(0) + "%");

    },

    complete : function()
    {
        this.scene.start('GameScene');
        this.scene.start('UIScene');
        this.scene.get('GameScene').time.delayedCall(250, function() {game.scene.remove('LoadingScreen')});
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
    },

    //--------------------------------------------------------------------------
    update: function()
    {
    }
});


let GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    m_grid_color: 0xffffff,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'GameScene', active: false });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {
    },

    //--------------------------------------------------------------------------
    addGridOverlay: function ()
    {
        // Draw map exterior rectangle.
        let graphics = this.add.graphics();
        graphics.lineStyle(2, this.m_grid_color, 1);
        graphics.strokeRect(0, 0,
            layout_info.m_map_size_x * layout_info.m_tile_width,
            layout_info.m_map_size_y * layout_info.m_tile_height);

        graphics.beginPath();
        // Draw vertical lines.
        for (let i = 1; i < layout_info.m_map_size_x; i++)
        {
            graphics.moveTo(i * layout_info.m_tile_width, 0);
            graphics.lineTo(i * layout_info.m_tile_width,
                layout_info.m_map_size_y * layout_info.m_tile_height);
        }

        // Draw horizontal lines.
        for (let j = 1; j < layout_info.m_map_size_y; j++)
        {
            graphics.moveTo(0, j * layout_info.m_tile_height);
            graphics.lineTo(layout_info.m_map_size_x * layout_info.m_tile_width,
                j * layout_info.m_tile_height);
        }
        graphics.closePath();
        graphics.strokePath();

        // Add text to each cell of map.
        for (let i = 1; i <= layout_info.m_map_size_x; i++)
        {
            for (let j = 1; j <= layout_info.m_map_size_y; j++)
            {
                let text = this.add.text(
                    (i - 0.5) * layout_info.m_tile_width,
                    (j - 0.5) * layout_info.m_tile_height,
                    j + "," + i);
                text.setOrigin(0.5, 0.5);
            }
        }
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;

        this.m_tile_map_view = new TileMapView(
            this, layout_info.m_tile_width, layout_info.m_tile_height);
        this.m_tile_map_view.attachTileMap(
            game_model.m_village_area.m_tile_map);

        // Set camera bounds.
        this.cameras.main.setBounds(
            0, 0, 
            layout_info.m_map_size_x * layout_info.m_tile_width,
            layout_info.m_map_size_y * layout_info.m_tile_height);
        this.cameras.main.setPosition(0, layout_info.m_score_height, 0);
        this.cameras.main.setSize(
            game_width,
            game_height - layout_info.m_score_height - layout_info.m_action_height);

        if (layout_info.m_add_grid_overlay)
        {
            this.addGridOverlay();
        }

        this.m_cursor_keys = this.input.keyboard.createCursorKeys();
        this.m_cursor_keys.letter_left = this.input.keyboard.addKey("a");
        this.m_cursor_keys.letter_right = this.input.keyboard.addKey("d");
        this.m_cursor_keys.letter_up = this.input.keyboard.addKey("w");
        this.m_cursor_keys.letter_down = this.input.keyboard.addKey("s");
    },

    //--------------------------------------------------------------------------
    update: function()
    {
        if (this.m_cursor_keys.left.isDown
            || this.m_cursor_keys.letter_left.isDown)
        {
            this.cameras.main.scrollX -= 8;
        }
        if (this.m_cursor_keys.right.isDown
            || this.m_cursor_keys.letter_right.isDown)
        {
            this.cameras.main.scrollX += 8;
        }
        if (this.m_cursor_keys.up.isDown
            || this.m_cursor_keys.letter_up.isDown)
        {
            this.cameras.main.scrollY -= 8;
        }
        if (this.m_cursor_keys.down.isDown
            || this.m_cursor_keys.letter_down.isDown)
        {
            this.cameras.main.scrollY += 8;
        }
    }
});

let UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    //--------------------------------------------------------------------------
    initialize: function ()
    {
        Phaser.Scene.call(this, { key: 'UIScene', active: false });
    },

    //--------------------------------------------------------------------------
    preload: function ()
    {

    },

    //--------------------------------------------------------------------------
    create_score_area: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;
        let game_scene = this.scene.get("GameScene");

        this.textures.get("score_texture").add(
            "score_area", 0, 0, 0, game_width, layout_info.m_score_height);
        let background = this.add.sprite(
            0, 0,
            "score_texture", "score_area");
        background.setOrigin(0, 0);

        let gold_text = this.add.text(
            50, 20, "0/" + game_model.m_global_resources.m_max_gold, { font: "26px Arial", fill: "#ffffff" });
        this.add.sprite(
            30, layout_info.m_score_height / 2 + 2, "coin");
        // sprite = this.add.sprite(
        //     30, layout_info.m_score_height / 2 + 2, "coin_animated");
        // this.anims.create({
        //     key: "spin_coin",
        //     frames: this.anims.generateFrameNumbers("coin_animated"),
        //     frameRate: 20,
        //     repeat: -1
        // });
        // sprite.anims.load("spin_coin");
        // sprite.anims.play("spin_coin");
        let cows_text = this.add.text(
            200, 20, "0/" + game_model.m_global_resources.m_max_cows, { font: "26px Arial", fill: "#ffffff" });
        this.add.sprite(
            180, layout_info.m_score_height / 2 + 2, "cow_head");

        game_scene.events.on('update_global_resources',
            function ()
            {
                gold_text.setText(
                    game_model.m_global_resources.m_gold + "/" + game_model.m_global_resources.m_max_gold);
                cows_text.setText(
                    game_model.m_global_resources.m_cows + "/" + game_model.m_global_resources.m_max_cows);
            }, this);

        this.create_volume_control();
    },

    //--------------------------------------------------------------------------
    create_volume_control: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;

        let bgm = this.sound.add('bgm');
        bgm.setLoop(true);
        this.sound.pauseOnBlur = false;

        let icon_size = 48;
        let icon_scale = 1;
        let icon_right_padding = 10;
        icon_size *= icon_scale;
        let volume_control = this.add.sprite(
            game_width - icon_size - icon_right_padding,
            (layout_info.m_score_height - icon_size) / 2, 'volume_off');
        volume_control.setOrigin(0, 0);
        volume_control.scale = icon_scale;

        volume_control.setInteractive();
        volume_control.my_state = {on:false};
        volume_control.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
            function(pointer, localX, localY, event)
            {
                event.stopPropagation();
                if (volume_control.my_state.on)
                {
                    volume_control.my_state.on = false;
                    volume_control.setTexture('volume_off');
                    bgm.stop()
                }
                else
                {
                    if (this.load.isLoading())
                    {
                        return;
                    }
                    bgm.play();
                    volume_control.my_state.on = true;
                    volume_control.setTexture('volume_on');
                }
            }, this);

    },

    //--------------------------------------------------------------------------
    create_action_area: function ()
    {
        let game_width = this.game.config.width;
        let game_height = this.game.config.height;
        let game_scene = this.scene.get("GameScene");
        let action_area_top = game_height - layout_info.m_action_height;

        this.textures.get("action_texture").add(
            "action_area", 0, 0, 0, game_width, layout_info.m_action_height);
        let background = this.add.sprite(
            0, action_area_top,
            "action_texture", "action_area");
        background.setOrigin(0, 0);

        this.m_selected_tile_state = {
            m_game_scene: game_scene,
            m_action_area_top: action_area_top,
            m_tile_label_text: null,
            m_clean_up_steps: [],
            destroy_on_clean_up: function (obj)
            {
                this.add_clean_up_step(function(){obj.destroy();});
            },
            add_clean_up_step: function (fn)
            {
                this.m_clean_up_steps.push(fn);
            },
            clean_up: function (obj)
            {
                for (let key in this.m_clean_up_steps)
                {
                    this.m_clean_up_steps[key]();
                }
                this.m_clean_up_steps = [];
            }
        };

        let tile_label_text = this.add.text(
            40 + layout_info.m_tile_width / 2, action_area_top + 5,
            "", { font: "30px Arial", fill: "#FFFF00" });
        tile_label_text.setOrigin(0.5, 0);
        this.m_selected_tile_state.m_tile_label_text = tile_label_text;

        game_scene.events.on("update_selected_tile",
            this.update_selected_tile, this);
    },

    //--------------------------------------------------------------------------
    update_selected_tile: function (tile)
    {
        let state = this.m_selected_tile_state;
        state.clean_up();

        game_model.m_selected_tile = tile;

        // show the tile
        let tile_game_object = tile.createGameObject(this);
        state.destroy_on_clean_up(tile_game_object);
        tile_game_object.setPosition(
            40 + layout_info.m_tile_width / 2,
            state.m_action_area_top + 40 + layout_info.m_tile_height / 2);
        state.m_tile_label_text.setText(tile.getDisplayName());

        let actions = tile.getActions();
        if (undefined === actions)
        {
            return;
        }

        for (let index = 0, max_index = actions.length;
            index < max_index; ++index)
        {
            let action = actions[index];

            let button_x = layout_info.m_button_left_margin
                + index * (layout_info.m_button_width
                    + layout_info.m_button_spacing);
            let button_y = layout_info.m_action_height / 2
                + state.m_action_area_top;
            let button_initial_texture = action.isActive()
                || !action.isCostMet()
                ? "button_busy" : "button_passive";
            let button_initial_text = action.isActive()
                ? action.getActiveText() : action.getButtonText();

            let button_game_object = this.add.sprite(
                button_x, button_y, button_initial_texture);
            state.destroy_on_clean_up(button_game_object);
            let text_game_object = this.add.text(
                button_x, button_y, button_initial_text,
                { font: "20px Arial", fill: "#FFFFFF", background:"#808080" });
            text_game_object.setAlign("center");
            text_game_object.setOrigin(0.5, 0.5);
            state.destroy_on_clean_up(text_game_object);

            let button_state = {
                m_pointer_texture: "button_passive",
            };
            let updateAppearance = function () {
                if (action.isActive())
                {
                    text_game_object.setText(action.getActiveText());
                    button_game_object.setTexture("button_busy");
                }
                else if (!action.isCostMet())
                {
                    text_game_object.setText(action.getButtonText());
                    button_game_object.setTexture("button_busy");
                }
                else
                {
                    text_game_object.setText(action.getButtonText());
                    button_game_object.setTexture(
                        button_state.m_pointer_texture);
                }
            };

            button_game_object.setInteractive();

            button_game_object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
                function ()
                {
                    button_state.m_pointer_texture = "button_active";
                    updateAppearance();
                });
            button_game_object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
                function ()
                {
                    button_state.m_pointer_texture = "button_passive";
                    updateAppearance();
                });
            button_game_object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                function ()
                {
                    if (!action.isActive() && action.isCostMet())
                    {
                        action.getExecuteFn()(state.m_game_scene);
                        updateAppearance();
                    }
                });
            state.m_game_scene.events.on(
                "update_actions", updateAppearance);
            state.add_clean_up_step(function () {
                state.m_game_scene.events.off(
                    "update_actions", updateAppearance);
            });
            state.m_game_scene.events.on(
                "update_global_resources", updateAppearance);
            state.add_clean_up_step(function () {
                state.m_game_scene.events.off(
                    "update_global_resources", updateAppearance);
            });
        }
    },

    //--------------------------------------------------------------------------
    create: function ()
    {
        this.create_score_area();
        this.create_action_area();
    }
});

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#70D070',
    autoFocus: true,
    render: {pixelArt: true},
    scene: [ LoadingScreen, GameScene, UIScene ]
};

let game = new Phaser.Game(config);

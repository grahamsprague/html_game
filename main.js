//load the room
loaded_map = null;

load_room(maps['1']);




//room loader
function load_room(map){

    map_data = map.data;
    nav = map.nav;

    if(nav.n == null){  $('.door-top').hide()  } else { $('.door-top').show() }
    if(nav.w == null){  $('.door-left').hide()  } else { $('.door-left').show() }
    if(nav.e == null){  $('.door-right').hide()  } else { $('.door-right').show() }
    if(nav.s == null){  $('.door-bottom').hide()  } else { $('.door-bottom').show() }

    $('.tile, .block').remove();
    for (let i = 0; i < map_data.length; i++) {
        // console.log(map[i]);
        var type = '';
        if (map_data[i] == '0'){  mytype='tile';    }
        if (map_data[i] == '1'){  mytype='block';    }
        if (map_data[i] == '2'){  mytype='block water';    }
        if (map_data[i] == '3'){  mytype='tile ladder';    }
        // console.log('type:'+ type);
        $('.floor').append('<div id="block_'+i+'" class="'+ mytype +'"></div>');
    }
    loaded_map = map;
    console.log('room:' + map.name + ' loaded.');
}

// navigation events up, down, left, right keys
$(document).on('keydown',function(e) {
    //get current position
    var position = $('.player').position();
    var left_int = parseInt(position.left);
    var top_int  = parseInt(position.top);
    var low_bound = -25;
    var bounding_top = 425;
    var bounding_left = 830;
    var move_units = 10;
    var move_duration = 0;
    var col = false;

    // calc player center point
    var pl= $('.player')[0].getBoundingClientRect();

    var pp = {};
    pp['t'] = pl.bottom - (pl.height/2);
    pp['l'] = pl.right - (pl.width/2);

    var pp_new = jQuery.extend(true, {}, pp);

    switch (e.keyCode) {
        case 37:
            // LEFT

            var new_left = left_int - move_units;
            
            // check boundry
            if( new_left <= low_bound ){
                console.log('bounds reached');
                break;
            }
            console.log('left');

            // create proposed bounds
            pp_new.l = pp_new.l - move_units;
            
            // check for collision
            col = check_collision_new( pp_new , $('.block, .door') );

            if (col == false){
                var next_image = get_next_image( 'left' );
                $('.player').animate({left: new_left + 'px'}, move_duration);
            }
            break;
        case 39:

            // RIGHT

            var new_left = left_int + move_units;
            // check boundry
            if( new_left >= bounding_left ){
                console.log('bounds reached');
                break;
            }
            
            console.log('right');

            // create proposed bounds
            pp_new.l = pp_new.l + move_units;

            // check for collision
            col = check_collision_new( pp_new , $('.block, .door') );
            
            if (col == false){
                var next_image = get_next_image( 'right' );
                $('.player').animate({left: new_left + 'px'}, move_duration);
            }
            
            break;
        case 38:

            // UP

            var new_top = top_int - move_units;
            // check boundry
            if( new_top <= low_bound ){
                console.log('bounds reached');
                break;
            }
            console.log('up');
            
            // create proposed bounds
            pp_new.t = pp_new.t - move_units;

            // check for collision
            col = check_collision_new( pp_new , $('.block, .door') );

            if (col === false){
                var next_image = get_next_image( 'up' );
                $('.player').animate({top: new_top + 'px'}, move_duration);
            }
            
            break;
        case 40:

            // DOWN

            var new_top = top_int + move_units;
            // check boundry
            if( new_top >= bounding_top ){
                console.log('bounds reached');
                break;
            }
            console.log('down');

            // create proposed bounds
            
            pp_new.t = pp_new.t + move_units;

            // check for collision
            col = check_collision_new( pp_new , $('.block, .door') );
            console.log('col:'+ col);
            if (col == false){
                var next_image = get_next_image( 'down' );
                $('.player').animate({top: new_top + 'px'}, move_duration);
            }
            break;
    }
});




function check_collision_new(my_pp,my_blocks){

    var col_pad = 5;
    my_col = false;

    my_blocks.each(function(index) {

        // isolate the current block
        var my_block = my_blocks[index];

        // console.log(my_block);

        // get bounds of the current block
        var bb = my_block.getBoundingClientRect();
 
        if ( 
            my_pp.t + col_pad >= bb.top &&
            my_pp.t - col_pad <= bb.bottom &&
            my_pp.l + col_pad >= bb.left &&
            my_pp.l - col_pad <= bb.right
        ){
            console.log('collision!!');
            console.log(my_block.id);
            var col_id = my_block.id;
            my_col = true;
            if($(my_block).hasClass('door')){
                console.log('DOOR:'+ col_id);

                if(col_id == '1N'){
                    $('.floor').fadeOut('fast');
                    load_room(maps[loaded_map.nav.n]);
                    $('.player').css('left',400);
                    $('.player').css('top',400);
                    $('.floor').fadeIn();
                }

                if(col_id == '1E'){
                    $('.floor').fadeOut('fast');
                    load_room(maps[loaded_map.nav.e]);
                    $('.player').css('left',10);
                    $('.player').css('top',200);
                    $('.floor').fadeIn();
                }

                if(col_id == '1W'){
                    $('.floor').fadeOut('fast');
                    load_room(maps[loaded_map.nav.w]);
                    $('.player').css('left',800);
                    $('.player').css('top',200);
                    $('.floor').fadeIn();
                }
                
                if(col_id == '1S'){
                    $('.floor').fadeOut('fast');
                    load_room(maps[loaded_map.nav.s]);
                    $('.player').css('left',400);
                    $('.player').css('top',10);
                    $('.floor').fadeIn();
                }

                return false;

            }
        }else{
            // console.log( 'NO COLLISION!' );
        }

    });
    return my_col;
}


function get_next_image(dir){

    var cur_img = $('.player').css('background-image');

    var filename = cur_img.match(/.*\/(.*)$/)[1];
    filename = filename.substr(0, filename.length - 2);
    // console.log('filename:' + filename)
    
    if ( filename == dir + '-00.png' ){
        $('.player').css('background-image', 'url(./player/'+dir+'-01.png)');
    } else if( filename == dir+'-01.png' ){
        $('.player').css('background-image', 'url(./player/'+dir+'-02.png)');
    } else if( filename == dir+'-02.png' ){
        $('.player').css('background-image', 'url(./player/'+dir+'-01.png)');
    } else{
        $('.player').css('background-image', 'url(./player/'+dir+'-00.png)');
    }
   
}
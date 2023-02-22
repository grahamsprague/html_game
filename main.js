//load the room
loaded_map = null;

load_room(maps['1']);

inventory = {
    weapons:{},
    items:{},
};


//room loader
function load_room(map){

    map_data = map.data;
    nav =   map.nav;
    locks = map.locks;
    key = map.items.key;
    cheeseburger = map.items.cheeseburger;

    if(locks.n ){  $('.door-top').addClass('door-locked-top')  } else { $('.door-top').removeClass('door-locked-top') }
    if(locks.w ){  $('.door-left').addClass('door-locked-left')  } else { $('.door-left').removeClass('door-locked-left') }
    if(locks.e ){  $('.door-right').addClass('door-locked-right')  } else { $('.door-right').removeClass('door-locked-right') }
    if(locks.s ){  $('.door-bottom').addClass('door-locked-bottom')  } else { $('.door-bottom').removeClass('door-locked-bottom') }

    if(nav.n == null){  $('.door-top').hide()  } else { $('.door-top').show() }
    if(nav.w == null){  $('.door-left').hide()  } else { $('.door-left').show() }
    if(nav.e == null){  $('.door-right').hide()  } else { $('.door-right').show() }
    if(nav.s == null){  $('.door-bottom').hide()  } else { $('.door-bottom').show() }

    if (key){ $('.item.key').show() }else{ $('.item.key').hide() }

    if (cheeseburger){ $('.item.cheeseburger').show() }else{ $('.item.cheeseburger').hide() }

    $('.tile, .block').remove();
    for (let i = 0; i < map_data.length; i++) {
        // console.log(map[i]);
        var type = '';
        if (map_data[i] == '0'){  mytype='tile';    }
        if (map_data[i] == '1'){  mytype='block';    }
        if (map_data[i] == '2'){  mytype='block water';    }
        if (map_data[i] == '3'){  mytype='tile ladder';    }
        if (map_data[i] == '4'){  mytype='tile grass';    }
        if (map_data[i] == '5'){  mytype='block shrub';    }
        if (map_data[i] == '6'){  mytype='tile stairs';    }
        // console.log('type:'+ type);
        $('.floor').append('<div id="block_'+i+'" class="'+ mytype +'"></div>');
    }
    loaded_map = map;
    console.log('room:' + map.name + ' loaded.');
}

// navigation events up, down, left, right keys
$(document).on('keydown',function(e) {
    // get current position
    var position = $('.player').position();
    var left_int = parseInt(position.left);
    var top_int  = parseInt(position.top);
    // define map bounds
    var low_bound = -25;
    var bounding_top = 425;
    var bounding_left = 830;
    // movement and collision
    var move_units = 10;
    var move_duration = 0;
    var col = false;

    // calc player center point(pp)
    var pl= $('.player')[0].getBoundingClientRect();
    var pp = {};
    pp['t'] = pl.bottom - (pl.height/2);
    pp['l'] = pl.right - (pl.width/2);

    // create a copy to store potential movement point
    var pp_new = jQuery.extend(true, {}, pp);

    // handle key down events
    switch (e.keyCode) {
        case 37:
            console.log('left');
            var new_left = left_int - move_units;
            
            // check boundry to prevent walking out side of play area
            if( new_left <= low_bound ){
                console.log('bounds reached');
                break;
            }
            
            // create proposed bounds
            pp_new.l = pp_new.l - move_units;
            
            // check for collision
            col = check_collision_new( pp_new , $('.block, .door, .item, .stairs') );

            // if no collision, allow movement to new position
            if (col == false){
                var next_image = get_next_image( 'left' );
                $('.player').animate({left: new_left + 'px'}, move_duration);
            }
            break;
        case 39:
            console.log('right');
            var new_left = left_int + move_units;

            // check boundry to prevent walking out side of play area
            if( new_left >= bounding_left ){
                console.log('bounds reached');
                break;
            }

            // create proposed bounds
            pp_new.l = pp_new.l + move_units;

            // check for collision
            col = check_collision_new( pp_new , $('.block, .door, .item, .stairs') );
            
            // if no collision, allow movement to new position
            if (col == false){
                var next_image = get_next_image( 'right' );
                $('.player').animate({left: new_left + 'px'}, move_duration);
            }
            break;
        case 38:
            console.log('up');
            var new_top = top_int - move_units;

            // check boundry
            if( new_top <= low_bound ){
                console.log('bounds reached');
                break;
            }
            
            // create proposed bounds
            pp_new.t = pp_new.t - move_units;

            // check for collision
            col = check_collision_new( pp_new , $('.block, .door, .item, .stairs') );

            // if no collision, allow movement to new position
            if (col === false){
                var next_image = get_next_image( 'up' );
                $('.player').animate({top: new_top + 'px'}, move_duration);
            }
            break;
        case 40:
            console.log('down');
            var new_top = top_int + move_units;

            // check boundry
            if( new_top >= bounding_top ){
                console.log('bounds reached');
                break;
            }
           
            // create proposed bounds
            pp_new.t = pp_new.t + move_units;

            // check for collision
            col = check_collision_new( pp_new , $('.block, .door, .item, .stairs') );

            // if no collision, allow movement to new position
            if (col == false){
                var next_image = get_next_image( 'down' );
                $('.player').animate({top: new_top + 'px'}, move_duration);
            }
            break;
    }
});




function check_collision_new(my_pp,my_blocks){

    //buffer around player center
    var col_pad = 5;
    my_col = false;

    // loop over all potential collision objects
    my_blocks.each(function(index) {

        // isolate the current block
        var my_block = my_blocks[index];

        // console.log(my_block);

        // get bounds of the current block
        var bb = my_block.getBoundingClientRect();
        
        // are we in collision?
        if ( 
            my_pp.t + col_pad >= bb.top &&
            my_pp.t - col_pad <= bb.bottom &&
            my_pp.l + col_pad >= bb.left &&
            my_pp.l - col_pad <= bb.right
        ){
            // yes we are colliding
            console.log('collision!!');
            console.log(my_block.id);
            // capture the block we are in collision with
            var col_id = my_block.id;
            my_col = true;

            // what are we in collision if its not just a block?
            if($(my_block).hasClass('door')){
                //DOOR
                console.log('DOOR:'+ col_id);

                if( 
                    $(my_block).hasClass('door-locked-top') ||
                    $(my_block).hasClass('door-locked-left') ||
                    $(my_block).hasClass('door-locked-right') ||
                    $(my_block).hasClass('door-locked-bottom')
                ){

                    if(inventory.items.key == true){
                        if(col_id == '1N'){
                            $(my_block).removeClass('door-locked-top');
                        }
                        if(col_id == '1E'){
                            $(my_block).removeClass('door-locked-right');
                        }
                        if(col_id == '1W'){
                            $(my_block).removeClass('door-locked-left');
                        }
                        if(col_id == '1S'){
                            $(my_block).removeClass('door-locked-bottom');
                        }
                        return false;
                    }

                    return true;
                }

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

            }else if($(my_block).hasClass('stairs')){

                console.log('STAIRS: '+ my_block.id);
                

                $('.floor').fadeOut('fast');
                load_room(maps[loaded_map.portal.room]);

                // get position of the stairs(portal) in this room...
                stairs_top = loaded_map.portal.top;
                stairs_left = loaded_map.portal.left;

                $('.player').css('top',stairs_top);
                $('.player').css('left',stairs_left);
                $('.floor').fadeIn();

                return false;

            }else if( $(my_block).hasClass('item') ){
                // ITEM
                // create pickup item function
                // add item to inventory
                // remove item from display or hide it

                // what kind of item?
                if (  $(my_block).hasClass('key') ){
                    // KEY
                    console.log('ITEM: KEY:'+ col_id);
                    inventory.items['key'] = true;
                    $(my_block).hide();
                    $('#inventory').append('<div class="inv-item"><img src="./items/key.png" /></div>');
                    loaded_map.items.key = false;
                    
                    return false;
                }

                if (  $(my_block).hasClass('cheeseburger') ){
                    // KEY
                    console.log('ITEM: CHEESEBURGER:'+ col_id);
                    inventory.items['cheeseburger'] = true;
                    $(my_block).hide();
                    $('#inventory').append('<div class="inv-item"><img src="./items/cheeseburger.png" /></div>');
                    loaded_map.items.cheeseburger = false;
                    
                    window.location = './winner.html';

                    return false;
                }
                
                
            }// end check non block(doors and items)
        }else{
            // console.log( 'NO COLLISION!' );
        } // end collision check
    });
    return my_col;
}


function get_next_image(dir){

    // decide what the next animation image should be and chance it out.
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
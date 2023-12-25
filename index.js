// console.log("hello");

const POSITION = {
    UP : 1,
    DOWN : 2,
    OPPSITE : (pos) => {if (pos === POSITION.UP) return POSITION.DOWN; return POSITION.UP;}
}
const CHECKERS = {
    NOT_PALCE : -1,
    EMPTY : 0,
    PLAYER1 : 1,
    PLAYER2 : 2,
}

const STEPS = {
    UP_LEFT : "UP_LEFT",
    UP_RIGHT : "UP_RIGHT",
    DOWN_LEFT : "DOWN_LEFT",
    DOWN_RIGHT : "DOWN_RIGHT",
    TWO_TIMES_UP_LEFT : "TWO_TIMES_UP_LEFT",
    TWO_TIMES_UP_RIGHT : "TWO_TIMES_UP_RIGHT",
    TWO_TIMES_DOWN_LEFT : "TWO_TIMES_DOWN_LEFT",
    TWO_TIMES_DOWN_RIGHT : "TWO_TIMES_DOWN_RIGHT",
}


// ELEMENTS
const board_obj = document.querySelector(".game");



class Board {
    player1_position = POSITION.UP;
    player2_position = POSITION.DOWN;

    static size = 8;
    board = [
        1,0,1,0,1,0,1,0,
        0,1,0,1,0,1,0,1,
        1,0,1,0,1,0,1,0,
        0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,
        0,2,0,2,0,2,0,2,
        2,0,2,0,2,0,2,0,
        0,2,0,2,0,2,0,2,
    ]

    
    print() {
        for (let index = 0; index < this.size; index++) {
            console.log(this.board.slice(index*this.size,(index+1)*this.size ));
        }
    }

    move(from=0, to=0) {
        // TODO: add validations

        this.board[to] = this.board[from];
        this.board[from] = CHECKERS.EMPTY;
    }

    static index_to_cordinats(index) {
        const y = Math.floor(index / this.size);
        const x = index % this.size;
        return [y, x];    
    }
    
    static cordinats_to_index(y, x) {
        if (x == null || y == null || x < 0 || y < 0 || x >= this.size || y >= this.size ) {
            // console.log(`cordinats_to_index: error: the cordinats out of bound (${y},${x})`);
            return null;  
        } 
        return y * this.size + x;
    }
}


class ScreenBoard {
    clicks_square_indexes = [];

    square_lst = [];

    constructor(size, move_cb) {
        console.log('ScreenBoard created')
        this.size = size;
        this.move_cb = move_cb;

        this.#create_board();
        this.#update_square_click_event();
    }

    attribute_square_index = 'square_index';
    #create_board() {
        // this.board.board.forEach((checker, index)=>{
        for (let index = 0; index < this.size*this.size; index++) {
            const square = document.createElement("div");
            square.classList.add('square');
            square.classList.add((index + Math.floor(index/8)) %2 === 0 ? 'square-1':'square-2');
            square.id = 'id_'+index;
            square.dataset[this.attribute_square_index] = index;
            board_obj.append(square);
            this.square_lst.push(square);
        }
        // console.log(this.square_lst);
    }

    update_pices(board) {
        board.forEach((checker, index)=>{
            const square = this.square_lst[index];
            square.replaceChildren();
            
            if (checker === CHECKERS.PLAYER1 || checker === CHECKERS.PLAYER2 ){
                const checker_pices = document.createElement('div');
                checker_pices.classList.add('checkers');
                checker_pices.classList.add(checker === CHECKERS.PLAYER1 ? 'checkers-player-1' : 'checkers-player-2');
                
                square.append(checker_pices);
            }
        });
    }
    
   
    #update_square_click_event() {
        this.square_lst.forEach(square_div => {
            square_div.addEventListener('click', (event) => {
                
                console.log('click');

                // check if element has index of square, if not get from parent.
                let element;
                if ( this.attribute_square_index in event.target.dataset) {
                    element = event.target;
                } else {
                    element = event.target.parentElement;
                }
                const index = element.dataset[this.attribute_square_index];
                
                console.log(`index=${index}`);

                // there are at list 2 step and the last one is dublled.
                if (this.clicks_square_indexes.length >= 2 && index === this.clicks_square_indexes[this.clicks_square_indexes.length-1]) {
                    this.move_cb(this.clicks_square_indexes);
                    this.clicks_square_indexes = [];
                } else {
                    this.clicks_square_indexes.push(index);
                }
                
            });
        });
    }

}


class player {
    constructor(name = "Player") {
        this.name = name;
    }

}


class Game {
    is_game_over = false;

    constructor(player1, player2, board) {
        this.player1 = player1;
        this.player2 = player2;
        this.screen =  new ScreenBoard(Board.size, this.move_cb_from_to.bind(this));
        
        this.board = board;

        //the first player
        this.player_turn = player1;

        this.screen.update_pices(board.board);
        
        console.log('Game created');
    }

    move_cb_from_to(move_lst) {
        // console.log(`move_cb_from_to from:${from_index} to:${to_index}`);
        this.game_move(this.player_turn, move_lst);

    }

    #other_player(player) {
        if (player === this.player1) return this.player2;
        if (player === this.player2) return this.player1;
        console.log(`other_player: Warning: return null for player:${player}`);
        return null;
    }

    next_turn() {
        this.player_turn = this.#other_player(this.player_turn);
    }

    #board_checkers_to_player(board_checkers) {
        if (board_checkers === CHECKERS.PLAYER1) return this.player1;
        if (board_checkers === CHECKERS.PLAYER2) return this.player2;

        //TODO: add the checkers for kings!!
        console.log('warning: in board_checkers_to_player null returned for '+ board_checkers+ '.');
        return null;
    }

    game_move(player, move_lst) {
        //TODO: handle burning.

        // basic validate for move_lst 
        if (move_lst.length < 2) {
            console.log(`error: move list must contain at list 2 positions. ${move_lst}`);
            return -1;
        }
            
        // check it is the turn of player
        if (player !== this.player_turn) {
            console.log(`this is ${this.player_turn.name} turn, ${player.name} please wait for your turn`);
            return;
        }
        
        const solder_position = move_lst[0];

        // check the pices belong to the player.
        if (this.#board_checkers_to_player(this.board.board[solder_position]) !== this.player_turn) {
            console.log(`the pices is not belong to player ${this.player_turn.name}.`);
            return -1;
        }

        /**
         * check the move is legal.
         * directions, steps. eatting.
         * and update the board.
         */
        const move_result = this.is_lagal_step(move_lst);
        if (move_result !== 0) {
            console.log(`game_move(): error: ${move_result}`);
            return -1;
        }

        //update the screen
        this.screen.update_pices(this.board.board);

        this.next_turn();
    }

    is_legal_move(move_lst) {
        const first_position = move_lst[0];
        const player = this.#board_checkers_to_player(this.board.board[first_position]);

    }

    #position_for_player(player) {
        if (player === this.player1) return this.board.player1_position;
        if (player === this.player2) return this.board.player2_position;
        console.log(`error: ${this.#position_for_player.name} get wrone player: ${player}`);
    }

    //witch side he atac.
    #direction_for_player(player) {
        return POSITION.OPPSITE(this.#position_for_player(player));
    }

    is_lagal_step(move_lst, is_king = false) {

        // convert the list to int.
        move_lst = move_lst.map(str_number => parseInt(str_number, 10));
        
        let from_index = move_lst[0];
        let first_step_index = move_lst[1];
        // TODO: handle kings.
        const player = this.#board_checkers_to_player(this.board.board[from_index]);

        // validate there is a player.
        if (player === null) {
            console.log(`error: is_lagal_step func gets 'from_index' without checkres.`)
            return {error: `error: is_lagal_step func gets 'from_index' without checkres`}
        }
        
        // king handle.
        if (is_king) {
            console.log('error: is_lagal_step func dosnt handel kings.');
            return {error: 'error: is_lagal_step func dosnt handel kings.'}
        }

        // regular pices.
        let posible_steps_dict = this.posible_steps_from_index(from_index);
        const direction = this.#direction_for_player(player);
        if (direction === POSITION.UP) {
            
            // regular step
            const posibale_steps = [posible_steps_dict.UP_LEFT, posible_steps_dict.UP_RIGHT];
            if (posibale_steps.includes(first_step_index) && move_lst.length === 2) {
                this.board.move(from_index, first_step_index);
                console.log(`player: ${player.name} move the pices (${from_index}->${first_step_index})`);
                return 0;
            }

            // eatting step
            const copy_board = [...this.board.board];
            for (let move_index = 1; move_index < move_lst.length; move_index++) {
                first_step_index = move_lst[move_index];
                posible_steps_dict = this.posible_steps_from_index(from_index);
                const posibale_steps = move_index === 1 ?  [posible_steps_dict[STEPS.TWO_TIMES_UP_LEFT], posible_steps_dict[STEPS.TWO_TIMES_UP_RIGHT] ] : 
                                                            [
                                                                posible_steps_dict[STEPS.TWO_TIMES_UP_LEFT], 
                                                                posible_steps_dict[STEPS.TWO_TIMES_UP_RIGHT],
                                                                posible_steps_dict[STEPS.TWO_TIMES_DOWN_LEFT],
                                                                posible_steps_dict[STEPS.TWO_TIMES_DOWN_RIGHT]
                                                            ]
                
                if (posibale_steps.includes(first_step_index)) {
                    
                    // validate there is anamy we pass it.
                    const pass_square = from_index - (from_index - first_step_index)/2 ;
                    if (this.#board_checkers_to_player(this.board.board[pass_square]) !== this.#other_player(player)) {
                        console.log(`error: move from (${from_index}) to (${first_step_index}) without eatting in (${pass_square}) is not legal.\ncancle the moves.`);
                        this.board.board = copy_board;
                        return -1;
                    
                    } else {
                        this.board.move(pass_square, first_step_index);
                        this.board.move(from_index, first_step_index);
                        console.log(`player: ${player.name} move the pices (${from_index}->${first_step_index}) and eat (${pass_square})`);
                    }

                } else {
                    console.log(`error: move from (${from_index}) to (${first_step_index}) is not legal. \ncancle the moves.`);
                    this.board.board = copy_board;
                    return -1;
                }

                from_index = first_step_index;
            }
            
            return 0;

        } else {
            // DOWN direction.

             // regular step
             const posibale_steps = [posible_steps_dict.DOWN_LEFT, posible_steps_dict.DOWN_RIGHT]
             if (posibale_steps.includes(first_step_index) && move_lst.length === 2) {
                this.board.move(from_index, first_step_index);
                console.log(`player: ${player.name} move the pices (${from_index}->${first_step_index})`);
                return 0;
            }

            // eatting
            const copy_board = [...this.board.board];
            for (let move_index = 1; move_index < move_lst.length; move_index++) {

                first_step_index = move_lst[move_index];
                posible_steps_dict = this.posible_steps_from_index(from_index);
                const posibale_steps = move_index === 1 ?  [posible_steps_dict[STEPS.TWO_TIMES_DOWN_LEFT], posible_steps_dict[STEPS.TWO_TIMES_DOWN_RIGHT] ] : 
                                                            [
                                                                posible_steps_dict[STEPS.TWO_TIMES_UP_LEFT], 
                                                                posible_steps_dict[STEPS.TWO_TIMES_UP_RIGHT],
                                                                posible_steps_dict[STEPS.TWO_TIMES_DOWN_LEFT],
                                                                posible_steps_dict[STEPS.TWO_TIMES_DOWN_RIGHT]
                                                            ]
                
                if (posibale_steps.includes(first_step_index)) {
                    
                    // validate there is anamy we pass it.
                    const pass_square = Math.min(from_index, first_step_index) + Math.abs((from_index - first_step_index)/2) ;
                    if (this.#board_checkers_to_player(this.board.board[pass_square]) !== this.#other_player(player)) {
                        console.log(`error: move from (${from_index}) to (${first_step_index}) without eatting in (${pass_square}) is not legal.\ncancle the moves.`);
                        this.board.board = copy_board;
                        return -1;
                    
                    } else {
                        this.board.move(pass_square, first_step_index);
                        this.board.move(from_index, first_step_index);
                        console.log(`player: ${player.name} move the pices (${from_index}->${first_step_index}) and eat (${pass_square})`);
                    }

                } else {
                    console.log(`error: move from (${from_index}) to (${first_step_index}) is not legal. \ncancle the moves.`);
                    this.board.board = copy_board;
                    return -1;
                }

                from_index = first_step_index;
            }

        }
       
        return 0;
    }

    posible_steps_from_index(index){
        const cordinats = Board.index_to_cordinats(index);

        const up_row = cordinats[0] - 1;
        const down_row = cordinats[0] + 1;
        const left_col = cordinats[1] - 1;
        const right_col = cordinats[1] + 1;

        const two_up_row = cordinats[0] - 2;
        const two_down_row = cordinats[0] + 2;
        const two_left_col = cordinats[1] - 2;
        const two_right_col = cordinats[1] + 2;

        // steps
        const up_left = Board.cordinats_to_index(up_row, left_col);
        const up_right = Board.cordinats_to_index(up_row, right_col);
        const down_left = Board.cordinats_to_index(down_row, left_col);
        const down_right = Board.cordinats_to_index(down_row, right_col);
        
        const two_up_left = Board.cordinats_to_index(two_up_row, two_left_col);
        const two_up_right = Board.cordinats_to_index(two_up_row, two_right_col);
        const two_down_left = Board.cordinats_to_index(two_down_row, two_left_col);
        const two_down_right = Board.cordinats_to_index(two_down_row, two_right_col);
        
        
        const steps ={
            [STEPS.UP_LEFT] : up_left,
            [STEPS.UP_RIGHT]: up_right,
            [STEPS.DOWN_LEFT] : down_left, 
            [STEPS.DOWN_RIGHT]: down_right,
            [STEPS.TWO_TIMES_UP_LEFT] : two_up_left,
            [STEPS.TWO_TIMES_UP_RIGHT] : two_up_right,
            [STEPS.TWO_TIMES_DOWN_LEFT] : two_down_left,
            [STEPS.TWO_TIMES_DOWN_RIGHT] : two_down_right,
        }

        // clean all the squares that not empty.
        for (const key in steps) {
            const index = steps[key];
            
            if (this.board.board[index] !== CHECKERS.EMPTY) {
                steps[key] = null;
            }
        } 
        return steps;
    }

}


const board = new Board();
board.print()
// board.move(2,22);
// board.move(0,10);
// board.move(9,16);

// board.update_gui();
// console.log(board_obj)

    
// screen.update_pices(board.board);

const player1 = new player('gilad');
const player2 = new player('sapir');

const game = new Game(player1, player2, board);
// board.move(2, 45);
// board.move(4, 29);
// board.move(6, 16);
// game.game_move(player1, [16, 25]);


// board.move(6, 20);
// game.game_move(player1, [15, 22]);

// game.game_move(player2, [54,36,22,4,18]);
// game.game_move(player1, [9, 27]);
// game.game_move(player2, [63, 54]);
// game.game_move(player1, [0, 9]);

// game.game_move(player2, [52, 38, 20, 2, 16]);

// console.log(POSITION.DOWN);
// console.log(POSITION.OPPSITE);

// console.log(game.posible_steps_from_index(10));



class dom {

    
    // tas record enum

    static t_ts     = 0;
    static t_price  = 1;
    static t_qty    = 2;
    static t_side   = 3;
    static t_len    = 4;
    
    // depth record enum

    static d_ts     = 0;
    static d_cmd    = 1;
    static d_flags  = 2;
    static d_price  = 3;
    static d_qty    = 4;
    static d_len    = 5;


    // depth record command enum
    
    static dc_none      = 0;
    static dc_clear     = 1;
    static dc_add_bid   = 2;
    static dc_add_ask   = 3;
    static dc_mod_bid   = 4;
    static dc_mod_ask   = 5;
    static dc_del_bid   = 6;
    static dc_del_ask   = 7;

    // side

    static side_bid     = 0;
    static side_ask     = 1;

    // symbol and state

    symbol              = null;
    friendly_symbol     = null;
    
    multiplier          = null;
    tick_size           = null;
    tick_value          = null;
    is_bond             = null;
    bond_adj            = null;
    price_precision     = null;

    it                  = null;
    ts                  = null;
    
    max_price           = null; // price literal
    min_price           = null; // price literal
    session_high        = null;
    session_low         = null;
    
    records             = null;
    
    best_bid            = null; // price index
    best_ask            = null; // price index
    max_lob_qty         = null;
    last_price          = null; // price index
    
    prev_center_price   = null; // price index

    max_depth           = null;

    profile_col         = null;
    price_col           = null;
    trade_col           = null;
    ask_depth_col       = null;
    bid_depth_col       = null;
    bid_print_col       = null;
    ask_print_col       = null;

    dirty_col           = null;
    dirty_profile_col   = null;

    ltq_price           = null; // price index
    ltq_qty             = null;
    ltq_prev_price      = null; // price index
    ltq_prev_update     = null;

    poc_qty             = null;

    num_prices          = null;
    price_text_arr      = null;

    // trade manager

    tm = null;

    // dom graphics

    canvas                  = null;
    canvas_height           = null;
    ctx                     = null;
    container               = null;
    dom_height              = null;

    row_height              = null;
    row_width               = null;
    row_offset              = null;

    grid_adjustment         = null;

    text_margin             = null;

    profile_cell_width      = null;
    profile_cell_offset     = null;

    price_char_width        = null;
    price_cell_width        = null;
    price_cell_offset       = null;

    trade_cell_width        = null;
    bid_trade_cell_offset   = null;
    ask_trade_cell_offset   = null;

    depth_cell_width        = null;
    bid_depth_cell_offset   = null;
    ask_depth_cell_offset   = null;

    print_cell_width        = null;
    print_cell_offset       = null;
    bid_print_cell_offset   = null;
    ask_print_cell_offset   = null;

    ltq_cell_width          = null;
    ltq_cell_offset         = null;

    // style and color

    default_line_width          = null;
    font                        = null;

    grid_color                  = null;
    center_line_color           = null;
    default_cell_color          = null;

    profile_bar_color           = null;

    default_cell_color          = null;

    trade_cell_active_color     = null;
    trade_cell_cancelled_color  = null;
    trae_cell_filled_color      = null;

    inside_price_color          = null;
    price_text_color            = null;
    
    bid_depth_cell_color        = null;
    bid_depth_qty_color         = null;
    bid_print_text_color        = null;
    
    ask_depth_cell_color        = null;
    ask_depth_qty_color         = null;
    ask_print_text_color        = null;
    
    ltq_cell_color_up           = null;
    ltq_cell_color_unch         = null;
    ltq_cell_color_down         = null;
    ltq_text_color              = null;

    session_high_color          = null;
    session_low_color           = null;


    constructor(
        symbol,
        records,
        sym_config,
        dom_config
    ) {

        this.symbol             = symbol;
        this.friendly_symbol    = sym_config["friendly_symbol"];
        this.it                 = 0;
        this.ts                 = 0;
        this.multiplier         = sym_config["multiplier"];
        this.tick_size          = sym_config["tick_size"];
        this.tick_value         = sym_config["tick_value"];
        this.records            = records;
        this.max_depth          = dom_config["depth"]["max_depth"];

        this.initialize_adjustments();
        this.initialize_dimensions(dom_config);
        this.initialize_offsets();
        this.initialize_price_range();
        this.prune_depth();
        this.initialize_state();
        this.initialize_style_and_context(dom_config);
        this.initialize_canvas();
        this.initialize_trade_manager();

        if (this.records)

            this.ts = this.records[0][dom.t_ts];


    }


    initialize_adjustments() {

        const sym_root = this.symbol.substring(0,2);

        // for accurate bond price strings

        this.is_bond = ["ZB", "ZN", "ZF", "ZT"].includes(sym_root);

        if (this.is_bond)

            this.bond_adj           =   sym_root === "ZB" ?  0 : 
                                        sym_root === "ZN" ?  1 :
                                        sym_root === "ZF" ?  1 :
                                        sym_root === "ZT" ?  0 :
                                        null;   // invalid

        this.price_precision    = this.tick_size.split(".")[1].length;
        this.tick_size          = parseFloat(this.tick_size);
        this.multiplier         = parseFloat(this.multiplier);


    }


    initialize_dimensions(dom_config) {

        this.grid_adjustment        = dom_config["style"]["default_line_width"];

        this.text_margin            = dom_config["dimensions"]["text_margin"];

        this.dom_height             = dom_config["dimensions"]["dom_height"];
        this.row_height             = dom_config["dimensions"]["row_height"];
        this.row_width              = dom_config["dimensions"]["row_width"];

        this.profile_cell_width     = dom_config["dimensions"]["profile_cell_width"];
        this.price_cell_width       = dom_config["dimensions"]["price_cell_width"];
        this.trade_cell_width       = dom_config["dimensions"]["trade_cell_width"];
        this.depth_cell_width       = dom_config["dimensions"]["depth_cell_width"];
        this.print_cell_width       = dom_config["dimensions"]["print_cell_width"];
        this.ltq_cell_width         = dom_config["dimensions"]["ltq_cell_width"];

    }


    initialize_offsets() {

        // x-offsets of each cell

        this.row_offset             = this.grid_adjustment;
        this.profile_cell_offset    = 0;
        this.price_cell_offset      = this.profile_cell_offset      + this.profile_cell_width;
        this.bid_trade_cell_offset  = this.price_cell_offset        + this.price_cell_width;
        this.bid_depth_cell_offset  = this.bid_trade_cell_offset    + this.trade_cell_width;
        this.bid_print_cell_offset  = this.bid_depth_cell_offset    + this.depth_cell_width;
        this.ask_print_cell_offset  = this.bid_print_cell_offset    + this.print_cell_width;
        this.ask_depth_cell_offset  = this.ask_print_cell_offset    + this.print_cell_width;
        this.ask_trade_cell_offset  = this.ask_depth_cell_offset    + this.depth_cell_width;
        this.ltq_cell_offset        = this.ask_trade_cell_offset    + this.trade_cell_width;

    }


    initialize_price_range() {

        // normalize prices and find max/min price

        this.max_price = Number.MIN_SAFE_INTEGER;
        this.min_price = Number.MAX_SAFE_INTEGER;

        for (const rec of this.records) {

            if (rec.length == dom.t_len) {

                const price = rec[dom.t_price] * this.multiplier;

                rec[dom.t_price] = price;

                this.max_price = this.max_price > price ? this.max_price : price;
                this.min_price = this.min_price < price ? this.min_price : price;

            } else

                rec[dom.d_price] = rec[dom.d_price] * this.multiplier;

        }

        // set last_price == first price of day

        for (const rec of this.records) {

            if (rec.length == dom.t_len) {

                this.last_price = Math.round((this.max_price - rec[dom.t_price]) / this.tick_size);
                
                break;

            }

        }

        this.max_price = this.max_price + (this.max_depth * this.tick_size);
        this.min_price = this.min_price - (this.max_depth * this.tick_size);
        this.num_prices = Math.round((this.max_price - this.min_price) / this.tick_size + 1);

        // fill price text array with all prices here to avoid dynamic allocations

        this.price_char_width   = this.max_price.toFixed(this.price_precision).length;
        this.price_text_arr     = new Array(this.num_prices);

        var price               = 0.0;

        if (this.is_bond) {

            for (let i = 0; i < this.num_prices; i++) {

                price = this.max_price - i * this.tick_size;

                var price_int   = price | 0;
                var price_frac  = price - price_int;
                var num_32      = price_frac * 32;
                var int_32      = num_32 | 0;
                var rem_32      = num_32 - int_32;
                var rem_256     = rem_32 * 8;
                var last_digit  =   rem_256 == 2 ? 2 :                      // for ZF
                                    rem_256 > 0 ? rem_256 + this.bond_adj : // for ZN, ZF, ZT
                                    0;

                var bond_price  =   String(price_int) + "'" + 
                                    String(int_32).padStart(2, "0") + "'" + 
                                    String(last_digit);

                this.price_text_arr[i] = bond_price;

            }

        } else {

            for (let i = 0; i < this.num_prices; i++) {

                price                   = this.max_price - i * this.tick_size;
                this.price_text_arr[i]  = String(price.toFixed(this.price_precision)).padStart(this.price_char_width);
    
            }

        }


    }


    prune_depth() {

        this.records = this.records.filter( 
            rec => {
                return  rec.length == dom.t_len ||
                        (   rec[dom.d_price] >= this.min_price &&
                            rec[dom.d_price] <= this.max_price
                        );
            }
        );

    }


    initialize_state() {
        

        if (!this.profile_col) {

            this.profile_col        = Array(this.num_prices).fill(0);
            this.price_col          = Array(this.num_prices).fill(0.0);
            this.trade_col          = Array(this.num_prices).fill(0);
            this.bid_depth_col      = Array(this.num_prices).fill(0);
            this.ask_depth_col      = Array(this.num_prices).fill(0);
            this.bid_print_col      = Array(this.num_prices).fill(0);
            this.ask_print_col      = Array(this.num_prices).fill(0);
            this.dirty_col          = Array(this.num_prices).fill(false);
            this.dirty_profile_col  = Array(this.num_prices).fill(false);
            
        } else {

            this.profile_col.fill(0);
            this.price_col.fill(0.0);
            this.trade_col.fill(0);
            this.bid_depth_col.fill(0);
            this.ask_depth_col.fill(0);
            this.bid_print_col.fill(0);
            this.ask_print_col.fill(0);
            this.dirty_col.fill(false);
            this.dirty_profile_col.fill(false);

        }
        
        this.best_bid       = this.num_prices;
        this.best_ask       = 0;
        this.session_high   = this.num_prices;
        this.session_low    = 0;
        this.ltq_price      = null;
        this.ltq_qty        = null;
        this.ltq_prev_price = null;
        this.poc_qty        = -1;
        this.max_lob_qty    = 1;
        this.last_price     = null;

    }


    initialize_style_and_context(dom_config) {

        this.font                       = dom_config["style"]["font"];
        this.default_line_width         = dom_config["style"]["default_line_width"];
        this.default_text_color         = dom_config["colors"]["default_text_color"];
        this.grid_color                 = dom_config["colors"]["grid_color"];
        this.center_line_color          = dom_config["colors"]["center_line_color"];
        this.default_cell_color         = dom_config["colors"]["default_cell_color"];

        this.price_text_color           = dom_config["colors"]["price_text_color"];
        this.inside_price_color         = dom_config["colors"]["inside_price_color"]

        this.profile_bar_color          = dom_config["colors"]["profile_bar_color"];

        this.trade_cell_active_color    = dom_config["colors"]["trade_cell_active_color"];
        this.trade_cell_cancelled_color = dom_config["colors"]["trade_cell_cancelled_color"];
        this.trade_cell_filled_color    = dom_config["colors"]["trade_cell_filled_color"];

        this.bid_depth_cell_color       = dom_config["colors"]["bid_depth_cell_color"];
        this.bid_depth_qty_color        = dom_config["colors"]["bid_depth_qty_color"];
        this.bid_print_text_color       = dom_config["colors"]["bid_print_text_color"];

        this.ask_depth_cell_color       = dom_config["colors"]["ask_depth_cell_color"];
        this.ask_depth_qty_color        = dom_config["colors"]["ask_depth_qty_color"];
        this.ask_print_text_color       = dom_config["colors"]["ask_print_text_color"];

        this.ltq_cell_color_up          = dom_config["colors"]["ltq_cell_color_up"];
        this.ltq_cell_color_unch        = dom_config["colors"]["ltq_cell_color_unch"];
        this.ltq_cell_color_down        = dom_config["colors"]["ltq_cell_dolor_down"];
        this.ltq_text_color             = dom_config["colors"]["ltq_text_color"];
        
        this.session_high_color         = dom_config["colors"]["session_high_color"];
        this.session_low_color          = dom_config["colors"]["session_low_color"];

    }


    initialize_canvas() {

        // create canvas and append to DOM to allow for scrolling in container

        this.canvas         = document.createElement("canvas");
        this.canvas.id      = `${this.symbol}_dom`; 
        
        this.ctx                        = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled  = false;

        this.canvas_height  = this.num_prices * (this.row_height + this.row_offset);
        this.canvas.height  = this.canvas_height;
        this.canvas.width   = this.row_width;
        this.container      = document.getElementById(`${this.symbol}_dom_container`);

        this.container.appendChild(this.canvas);
        
        // initialize context with defaults

        this.ctx.lineWidth      = this.lineWidth;
        this.ctx.lineWidth      = 0;
        this.ctx.font           = this.font;

        this.redraw_canvas();

    }


    initialize_trade_manager() {

        this.tm             = new trade_manager(this);
        this.canvas.onclick = this.tm.set_order.bind(this.tm);

    }


    redraw_canvas() {
        
        // const t0 = performance.now();

        // fill background

        this.ctx.fillStyle = this.grid_color;

        this.ctx.fillRect(
            0, 0, 
            this.row_width, this.canvas_height
        );
        
        // color cells

        for (var i = 0; i < this.num_prices; i++) {

            var y = i * (this.row_height + this.row_offset);

            this.ctx.fillStyle = this.default_cell_color;

            this.ctx.fillRect(
                this.profile_cell_offset, 
                y,
                this.profile_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.price_cell_offset, 
                y,
                this.price_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.bid_trade_cell_offset, 
                y,
                this.trade_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.bid_print_cell_offset, 
                y, 
                this.print_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.ask_print_cell_offset, 
                y, 
                this.print_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.ask_trade_cell_offset, 
                y,
                this.trade_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.ltq_cell_offset, 
                y, 
                this.ltq_cell_width, 
                this.row_height
            );

            this.ctx.fillStyle = this.price_text_color;

            this.ctx.fillText(
                this.price_text_arr[i], 
                this.price_cell_offset + this.text_margin, 
                y + this.row_height - this.text_margin
            );

            this.ctx.fillStyle = this.bid_depth_cell_color;

            this.ctx.fillRect(
                this.bid_depth_cell_offset, 
                y, 
                this.depth_cell_width, 
                this.row_height
            );

            this.ctx.fillStyle = this.ask_depth_cell_color;

            this.ctx.fillRect(
                this.ask_depth_cell_offset, 
                y, 
                this.depth_cell_width, 
                this.row_height
            );

        }

        // console.debug(`${this.symbol}\tredraw_canvas\t${performance.now() - t0}`);


    }


    center_dom() {

        if (this.prev_center_price) {

            // clear surrounding cells to eliminate line, then dirty to redraw on next cycle.
            // just clearing the line doesn't work; the canvas doesn't draw precisely for some reason.

            const prev_y = this.prev_center_price * (this.row_height + this.row_offset) - this.row_offset;

            this.ctx.clearRect(
                this.profile_cell_offset,
                prev_y - (this.row_height + this.row_offset),
                this.row_width,
                this.row_height * 2
            );

            this.ctx.fillStyle = this.grid_color;

            this.ctx.fillRect(
                this.profile_cell_offset,
                prev_y - (this.row_height + this.row_offset),
                this.row_width,
                this.row_height * 2
            );

            this.dirty_col[this.prev_center_price]          = true;
            this.dirty_profile_col[this.prev_center_price]  = true;
                
            this.dirty_col[this.prev_center_price + 1]  = true;
            this.dirty_col[this.prev_center_price - 1]  = true;

            this.dirty_profile_col[this.prev_center_price + 1]  = true;
            this.dirty_profile_col[this.prev_center_price - 1]  = true;    

            
        }

        const y         = this.last_price * (this.row_height + this.row_offset) - this.row_offset;
        const offset    = Math.round(0.5 * this.dom_height);

        this.container.scrollTo(0, y - offset);

        this.ctx.beginPath()
        this.ctx.fillStyle = this.center_line_color;
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.row_width, y);
        this.ctx.stroke();

        this.prev_center_price = this.last_price;

    }


    clear_prints() {

        this.bid_print_col.fill(0);
        this.ask_print_col.fill(0);
        this.dirty_col.fill(true);

    }


    update(ts) {

        const t0 = performance.now();

        if (this.it >= this.records.length)

            return;

        var rec                 = this.records[this.it];
        var price               = null;
        var qty                 = null;
        var i                   = null;
        var side                = null;
        var high_trade          = this.num_prices;
        var low_trade           = 0;
        let prev_best_ask       = this.best_ask;
        let prev_best_bid       = this.best_bid;          

        var tas_processed       = 0;
        var depth_processed     = 0;

        this.ltq_prev_update    = this.ltq_price;

        while (rec[dom.t_ts] < ts && this.it < this.records.length) {

            rec     = this.records[this.it++];
            this.ts = rec[dom.t_ts];

            if (rec.length === dom.t_len) {

                // process tas record

                tas_processed += 1;

                price = rec[dom.t_price];
                qty   = rec[dom.t_qty];
                side  = rec[dom.t_side];

                i = Math.round((this.max_price - price) / this.tick_size);

                this.last_price = i;

                this.dirty_col[i]           = true;
                this.dirty_profile_col[i]   = true;

                // trades (this update)

                this.trade_col[i] += qty;
                
                high_trade  = i < high_trade ? i : high_trade;
                low_trade   = i > low_trade  ? i : low_trade;

                // session high/low

                this.session_high = i < this.session_high ? i : this.session_high;
                this.session_low  = i > this.session_low  ? i : this.session_low;

                // profile

                this.profile_col[i] += qty;
                
                if (this.profile_col[i] > this.poc_qty) {

                    this.dirty_profile_col.fill(true, this.session_high, this.session_low + 1);

                    this.poc_qty = this.profile_col[i];

                }

                // bid/ask print

                if (side === dom.side_bid)
        
                    this.bid_print_col[i] += qty;

                else

                    this.ask_print_col[i] += qty;

                // ltq

                if (i != this.ltq_price) {

                    this.ltq_qty = 0;
                    this.dirty_col[this.ltq_price] = true;

                }

                this.ltq_prev_price =  this.ltq_price;
                this.ltq_price      =  i;
                this.ltq_qty        += qty;


            } else {

                // process depth record

                depth_processed += 1;

                price = rec[dom.d_price];
                qty   = rec[dom.d_qty];
                i     = Math.round((this.max_price - price) / this.tick_size);

                switch (rec[dom.d_cmd]) {

                    case dom.dc_none:

                        break;

                    case dom.dc_clear:

                        this.bid_depth_col.fill(0);
                        this.ask_depth_col.fill(0);

                        this.max_lob_qty = 1;

                        break;

                        // i think this only happens at the start of the file,
                        // so no need to dirty anything?

                    case dom.dc_add_bid:

                        this.bid_depth_col[i]   = qty;
                        this.dirty_col[i]       = true;
                        
                        if (this.max_lob_qty < qty) {

                            this.max_lob_qty = qty;
                            this.dirty_col.fill(true);

                        }

                        if (this.ask_print_col[i] > 0)

                            this.ask_print_col[i] = 0;

                        if (i < this.best_bid)

                            this.best_bid = i;

                        break;

                    case dom.dc_add_ask:

                        this.ask_depth_col[i] = qty;
                        this.dirty_col[i]     = true;

                        if (this.max_lob_qty < qty) {

                            this.max_lob_qty = qty;
                            this.dirty_col.fill(true);

                        }

                        if (this.bid_print_col[i] > 0)

                            this.bid_print_col[i] = 0;

                        if (i > this.best_ask)

                            this.best_ask = i;

                        break;

                    case dom.dc_mod_bid:

                        var old_qty = this.bid_depth_col[i];

                        if (this.max_lob_qty < qty) {

                            this.max_lob_qty = qty;
                            this.dirty_col.fill(true);

                        }
                        
                        if (old_qty > this.max_lob_qty) {

                            this.max_lob_qty = Math.max(...this.bid_depth_qty, ...ask_depth_qty, qty);
                            this.dirty_col.fill(true);

                        }

                        this.bid_depth_col[i]   = qty;
                        this.dirty_col[i]       = true;

                        break;

                    case dom.dc_mod_ask:

                        var old_qty = this.ask_depth_col[i];

                        if (this.max_lob_qty < qty) {

                            this.max_lob_qty = qty;
                            this.dirty_col.fill(true);

                        }
                        
                        if (old_qty > this.max_lob_qty) {

                            this.max_lob_qty = Math.max(...this.bid_depth_qty, ...ask_depth_qty, qty);
                            this.dirty_col.fill(true);

                        }

                        this.ask_depth_col[i]   = qty;
                        this.dirty_col[i]       = true;

                        break;

                    case dom.dc_del_bid:

                        if (qty == this.max_lob_qty) {

                            this.max_lob_qty = Math.max(...bid_depth_qty, ...ask_depth_qty);
                            this.dirty_col.fill(true);
                        }

                        this.bid_depth_col[i]   = 0;
                        this.dirty_col[i]       = true;

                        if (i == this.best_bid) {

                            for (let j = i; j < this.bid_depth_col.length; ++j) {

                                if (this.bid_depth_col[j]) {
                                    
                                    this.best_bid = j;

                                    break;

                                }
                            
                            }

                        }

                        break;

                    case dom.dc_del_ask:

                        if (qty == this.max_lob_qty) {

                            this.max_lob_qty = Math.max(...bid_depth_qty, ...ask_depth_qty);
                            this.dirty_col.fill(true);
                        }

                        this.ask_depth_col[i]   = 0;
                        this.dirty_col[i]       = true;

                        if (i == this.best_ask) {

                            for (let j = i; j >= 0; --j) {

                                if (this.ask_depth_col[j]) {
                                    
                                    this.best_ask = j;

                                    break;

                                }
                            
                            }

                        }

                        break;

                    default:

                        break;

                }

            }

        }

        // console.debug(`${this.symbol}\t${tas_processed}\,\t${depth_processed}`);
        // console.debug(`${this.symbol}\tupdate\t${processed}\t${performance.now() - t0}`)

        this.dirty_col.fill(
                                true,
                                Math.min(this.best_ask, prev_best_ask),
                                Math.max(this.best_bid, prev_best_bid)
                            );

        // set visible range in which cells might be drawn

        const top_visible_price      = Math.floor(this.container.scrollTop / (this.row_height + this.row_offset));
        const bottom_visible_price   = Math.min(
                                                    top_visible_price + 
                                                    Math.ceil(this.dom_height / (this.row_height + this.row_offset)),
                                                    this.num_prices - 1
                                                );

        this.tm.update(high_trade, low_trade);
        this.tm.draw(top_visible_price, bottom_visible_price);

        this.draw(top_visible_price, bottom_visible_price);

    }


    draw(high_price, low_price) {

        const   t0          = performance.now();
        var     cells_drawn = 0;
        var     y           = 0;

        for (var i = high_price; i <= low_price; i++) {

            y = i * (this.row_height + this.row_offset);

            if (this.dirty_col[i]) {

                // price

                this.ctx.fillStyle =    i   >= this.best_ask && i <= this.best_bid ? 
                                            this.inside_price_color : 
                                            this.default_cell_color;

                this.ctx.fillRect(
                    this.price_cell_offset,
                    y,
                    this.price_cell_width,
                    this.row_height
                );

                this.ctx.fillStyle = this.price_text_color;

                this.ctx.fillText(
                    this.price_text_arr[i],
                    this.price_cell_offset + this.text_margin,
                    y + this.row_height - this.text_margin
                );

                cells_drawn += 1;

                // bid depth background

                this.ctx.fillStyle = this.bid_depth_cell_color;

                this.ctx.fillRect(
                    this.bid_depth_cell_offset,
                    y,
                    this.depth_cell_width,
                    this.row_height
                );
                
                var bid_depth_qty = this.bid_depth_col[i];

                if (bid_depth_qty > 0) {

                    // bid depth bar

                    var bid_depth_qty_width = Math.ceil(bid_depth_qty / this.max_lob_qty * this.depth_cell_width);

                    this.ctx.fillStyle = this.bid_depth_qty_color;
    
                    this.ctx.fillRect(
                        this.bid_depth_cell_offset,
                        y,
                        bid_depth_qty_width,
                        this.row_height
                    );
    
                    // bid depth text
    
                    this.ctx.fillStyle = this.default_text_color;

                    this.ctx.fillText(
                        itoa_arr[bid_depth_qty],
                        this.bid_depth_cell_offset + this.text_margin, 
                        y + this.row_height - this.text_margin
                    );

                }

                cells_drawn += 1;

                // ask print

                this.ctx.fillStyle = this.default_cell_color;

                this.ctx.fillRect(
                    this.ask_print_cell_offset,
                    y,
                    this.depth_cell_width,
                    this.row_height
                );

                if (this.ask_print_col[i] > 0) {

                    this.ctx.fillStyle = this.ask_print_text_color;

                    this.ctx.fillText(
                        itoa_arr[this.ask_print_col[i]],
                        this.ask_print_cell_offset + this.print_cell_width / 3,
                        y + this.row_height - this.text_margin
                    );

                }

                cells_drawn += 1;

                // bid print

                this.ctx.fillStyle = this.default_cell_color;

                this.ctx.fillRect(
                    this.bid_print_cell_offset,
                    y,
                    this.depth_cell_width,
                    this.row_height
                );

                if (this.bid_print_col[i] > 0) {

                    this.ctx.fillStyle = this.bid_print_text_color;

                    this.ctx.fillText(
                        itoa_arr[this.bid_print_col[i]],
                        this.bid_print_cell_offset + this.print_cell_width / 3,
                        y + this.row_height - this.text_margin
                    );

                }

                cells_drawn += 1;

                // ask depth background

                this.ctx.fillStyle = this.ask_depth_cell_color;

                this.ctx.fillRect(
                    this.ask_depth_cell_offset,
                    y,
                    this.depth_cell_width,
                    this.row_height
                );
                
                var ask_depth_qty = this.ask_depth_col[i];

                if (ask_depth_qty > 0) {

                    // bid depth bar

                    var ask_depth_qty_width = Math.ceil(ask_depth_qty / this.max_lob_qty * this.depth_cell_width);

                    this.ctx.fillStyle = this.ask_depth_qty_color;
    
                    this.ctx.fillRect(
                        this.ask_depth_cell_offset + (this.depth_cell_width - ask_depth_qty_width),
                        y,
                        ask_depth_qty_width,
                        this.row_height
                    );
    
                    // bid depth text
    
                    this.ctx.fillStyle = this.default_text_color;

                    this.ctx.fillText(
                        itoa_arr[ask_depth_qty],
                        this.ask_depth_cell_offset + this.text_margin, 
                        y + this.row_height - this.text_margin
                    );

                }

                cells_drawn += 1;

                // ltq

                if (i  == this.ltq_price) {

                    this.ctx.fillStyle =    this.ltq_price < this.ltq_prev_update ? this.ltq_cell_color_up :
                                            this.ltq_price > this.ltq_prev_update ? this.ltq_cell_color_down :
                                            this.ltq_cell_color_unch;

                    this.ctx.fillRect(
                        this.ltq_cell_offset,
                        y,
                        this.ltq_cell_width,
                        this.row_height
                    )

                    this.ctx.fillStyle = this.ltq_text_color;

                    this.ctx.fillText(
                        itoa_arr[this.ltq_qty],
                        this.ltq_cell_offset + this.ltq_cell_width / 3,
                        y + this.row_height - this.text_margin
                    );
                
                } else {

                    this.ctx.fillStyle = this.default_cell_color;

                    this.ctx.fillRect(
                        this.ltq_cell_offset,
                        y,
                        this.ltq_cell_width,
                        this.row_height
                    );

                }

                cells_drawn += 1;

            }

            if (this.dirty_profile_col[i]) {

                // single price marked profile dirty when it trades; all prices when poc changes

                const profile_bar_width = Math.ceil(this.profile_col[i] / this.poc_qty * this.profile_cell_width);

                this.ctx.fillStyle = this.profile_bar_color;

                this.ctx.fillRect(
                    this.profile_cell_offset,
                    y,
                    profile_bar_width,
                    this.row_height
                );

                this.ctx.fillStyle = this.default_cell_color;

                this.ctx.fillRect(
                    this.profile_cell_offset + profile_bar_width,
                    y,
                    this.profile_cell_width - profile_bar_width,
                    this.row_height
                );

                this.ctx.fillStyle = this.profile_text_color;

                this.ctx.fillText(
                    itoa_arr[this.profile_col[i]],
                    this.profile_cell_offset + this.text_margin, 
                    y + this.row_height - this.text_margin
                );

                cells_drawn += 1;

            }

            // clear dirty

            this.dirty_col[i]           = false;
            this.dirty_profile_col[i]   = false;

        }

        // console.debug(`${this.symbol}\tdraw:\t${cells_drawn}\t${performance.now() - t0}`);

    }


    reset_to_ts(ts) { 
    
        this.ts = ts;
        this.it = 0;

        this.redraw_canvas();
        this.initialize_state();

        this.dirty_col.fill(true);
        this.dirty_profile_col.fill(true);

        this.tm.reset();
    
    }


    get_ts() { return this.ts; }


}
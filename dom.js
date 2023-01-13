

class dom {

    
    // tas record enum

    static t_ts     = 0;
    static t_price  = 1;
    static t_qty    = 2;
    static t_side   = 3;
    static t_len    = 4;
    
    // depth record enum

    static d_ts         = 0;
    static d_cmd        = 1;
    static d_flags      = 2;
    static d_num_orders = 3;
    static d_price      = 4;
    static d_qty        = 5;
    static d_reserved   = 6;
    static d_len        = 7


    // depth record command enum
    
    static dc_none      = 0;
    static dc_clear     = 1;
    static dc_add_bid   = 2;
    static dc_add_ask   = 3;
    static dc_mod_bid   = 4;
    static dc_mod_ask   = 5;
    static dc_del_bid   = 6;
    static dc_del_ask   = 7;


    // symbol and state

    symbol                  = null;

    it                      = null;
    ts                      = null;
    
    max_price               = null;
    min_price               = null;
    session_high            = null;
    session_low             = null;
    
    records                 = null;
    
    best_bid                = null;
    best_ask                = null;
    last_price              = null;
    
    prev_center_line_y      = null;

    max_depth               = null;

    profile_col             = null;
    price_col               = null;
    ask_depth_col           = null;
    bid_depth_col           = null;
    bid_print_col           = null;
    ask_print_col           = null;
    ltq_price               = null;
    ltq_qty                 = null;
    ltq_prev_price          = null;
    ltq_prev_qty            = null;

    // dom graphics

    canvas                  = null;
    canvas_height           = null;
    ctx                     = null;
    container               = null;
    dom_height              = null;

    row_height              = null;
    row_width               = null;

    text_margin             = null;

    profile_cell_width      = null;
    profile_cell_offset     = null;

    price_precision         = null;
    price_char_width        = null;
    price_cell_width        = null;
    price_cell_offset       = null;

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

    default_line_width      = null;
    font                    = null;

    grid_color              = null;
    center_line_color       = null;
    default_cell_color      = null;

    price_text_color        = null;
    
    bid_depth_cell_color    = null;
    ask_depth_cell_color    = null;

    session_high_color      = null;
    session_low_color       = null;


    constructor(symbol, records, tick_size, dom_config) {

        this.symbol     = symbol;
        this.it         = 0;
        this.ts         = 0;
        this.tick_size  = tick_size;
        this.records    = records;
        this.best_bid   = Number.MIN_VALUE;
        this.best_ask   = Number.MAX_VALUE;
        this.max_depth  = dom_config["depth"]["max_depth"];

        this.initialize_dimensions(dom_config);
        this.initialize_offsets();
        this.initialize_price_range();
        this.prune_depth();
        this.initialize_cols();
        this.initialize_style_and_context(dom_config);
        this.initailize_canvas();

        if (records)
        
            this.ts = records[0][dom.t_ts];

    }


    initialize_dimensions(dom_config) {

        this.text_margin            = dom_config["dimensions"]["text_margin"];

        this.dom_height             = dom_config["dimensions"]["dom_height"];
        this.row_height             = dom_config["dimensions"]["row_height"];
        this.row_width              = dom_config["dimensions"]["row_width"];

        this.profile_cell_width     = dom_config["dimensions"]["profile_cell_width"];

        this.price_precision        = dom_config["dimensions"]["price_precision"];
        this.price_char_width       = dom_config["dimensions"]["price_char_width"];
        this.price_cell_width       = dom_config["dimensions"]["price_cell_width"];
        this.price_cell_color       = dom_config["style"]["price_cell_color"];

        this.depth_cell_width       = dom_config["dimensions"]["depth_cell_width"];

        this.print_cell_width       = dom_config["dimensions"]["print_cell_width"];
        
        this.ltq_cell_width         = dom_config["dimensions"]["ltq_cell_width"];

    }


    initialize_offsets() {

        // x-offsets of each cell

        this.profile_cell_offset    = 0;
        this.price_cell_offset      = this.profile_cell_offset + this.profile_cell_width;
        this.bid_depth_cell_offset  = this.price_cell_offset + this.price_cell_width;
        this.bid_print_cell_offset  = this.bid_depth_cell_offset + this.depth_cell_width;
        this.ask_print_cell_offset  = this.bid_print_cell_offset + this.print_cell_width;
        this.ask_depth_cell_offset  = this.ask_print_cell_offset + this.print_cell_width;
        this.ltq_cell_offset        = this.ask_depth_cell_offset + this.depth_cell_width;

    }


    initialize_price_range() {

        this.max_price = Number.MIN_SAFE_INTEGER;
        this.min_price = Number.MAX_SAFE_INTEGER;

        for (const rec of this.records) {

            if (rec.length == dom.t_len) {

                const price = rec[dom.t_price];

                this.max_price = this.max_price > price ? this.max_price : price;
                this.min_price = this.min_price < price ? this.min_price : price;

            }

        }

        // initialize last_price == first price

        for (const rec of this.records) {

            if (rec.length == dom.t_len) {

                this.last_price = rec[dom.t_price];
                
                break;

            }

        }

        this.max_price = this.max_price + this.max_depth;
        this.min_price = this.min_price - this.max_depth;

        this.num_prices = this.max_price - this.min_price;

    }


    prune_depth() {

        this.records = this.records.filter( 
            rec => {
                return  rec.length == dom.t_len ||
                        (   rec[dom.d_price] >= this.min_price &&
                            rec[dom.d_price] <= this.max_price
                        )
            }
        );

    }


    initialize_cols() {
        
        this.profile_col    = Array(this.num_prices).fill(0);
        this.price_col      = Array(this.num_prices).fill(0.0);
        this.bid_depth_col  = Array(this.num_prices).fill(0);
        this.ask_depth_col  = Array(this.num_prices).fill(0);
        this.bid_print_col  = Array(this.num_prices).fill(0);
        this.ask_print_col  = Array(this.num_prices).fill(0);
        this.dirty_col      = Array(this.num_prices).fill(false);

    }


    initialize_style_and_context(dom_config) {

        this.default_line_width     = dom_config["style"]["default_line_width"];

        this.font                   = dom_config["style"]["font"];

        this.grid_color             = dom_config["colors"]["grid_color"];
        this.center_line_color      = dom_config["colors"]["center_line_color"];
        this.default_cell_color     = dom_config["colors"]["default_cell_color"];

        this.bid_depth_cell_color   = dom_config["colors"]["bid_depth_cell_color"];
        this.ask_depth_cell_color   = dom_config["colors"]["ask_depth_cell_color"];

        this.price_text_color       = dom_config["colors"]["price_text_color"];
        
        this.session_high_color     = dom_config["colors"]["session_high_color"];
        this.session_low_color      = dom_config["colors"]["session_low_color"];

    }


    initailize_canvas() {

        // create canvas and append to DOM to allow for scrolling in container

        this.canvas     = document.createElement("canvas");
        this.canvas.id  = `${this.symbol}_dom`;
        this.ctx        = this.canvas.getContext("2d");

        this.canvas_height  = (this.num_prices + 1) * this.row_height;
        this.canvas.height  = this.canvas_height;
        this.canvas.width   = this.row_width;
        this.container      = document.getElementById(`${this.symbol}_dom_container`);

        this.container.appendChild(this.canvas);
        
        // initialize context with defaults

        this.ctx.lineWidth      = this.default_line_width;
        this.ctx.strokeStyle    = this.grid_color;
        this.ctx.font           = this.font;

        // outline canvas

        this.ctx.strokeRect(0, 0, this.row_width, this.canvas_height);

        // column lines

        [
            this.price_cell_offset,
            this.bid_depth_cell_offset,
            this.bid_print_cell_offset,
            this.ask_print_cell_offset,
            this.ask_depth_cell_offset,
            this.ltq_cell_offset
        ].forEach(
            offset => {
                
                this.ctx.moveTo(offset, 0);
                this.ctx.lineTo(offset, this.canvas_height);

            }
        );

        // add grid lines and color cells

        const t0 = performance.now();

        for (var i = 0; i <= this.num_prices; i += 1) {
        
            const y       = (i + 1) * this.row_height;
            const price   = (this.max_price - i) * this.tick_size;

            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.row_width, y);

            this.ctx.fillStyle = this.default_cell_color;

            this.ctx.fillRect(
                this.profile_cell_offset, 
                y - this.row_height, 
                this.profile_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.price_cell_offset, 
                y - this.row_height, 
                this.price_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.bid_print_cell_offset, 
                y - this.row_height, 
                this.print_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.ask_print_cell_offset, 
                y - this.row_height, 
                this.print_cell_width, 
                this.row_height
            );

            this.ctx.fillRect(
                this.ltq_cell_offset, 
                y - this.row_height, 
                this.ltq_cell_width, 
                this.row_height
            );

            this.ctx.fillStyle = this.price_text_color;

            this.ctx.fillText(
                String(price.toFixed(this.price_precision)).padStart(this.price_char_width), 
                this.price_cell_offset + this.text_margin, 
                y - this.text_margin
            );

            this.ctx.fillStyle = this.bid_depth_cell_color;

            this.ctx.fillRect(
                this.bid_depth_cell_offset, 
                y - this.row_height, 
                this.depth_cell_width, 
                this.row_height
            );

            this.ctx.fillStyle = this.ask_depth_cell_color;

            this.ctx.fillRect(
                this.ask_depth_cell_offset, 
                y - this.row_height, 
                this.depth_cell_width, 
                this.row_height
            );

        }

        this.ctx.stroke();

        console.log(`initial draw: ${performance.now() - t0}`);

    }


    center_dom() {

        const y         = (this.max_price - this.last_price) * this.row_height;
        const offset    = Math.round(0.5 * this.dom_height);

        this.container.scrollTo(0, y - offset);

        this.ctx.beginPath()
        this.ctx.strokeStyle = this.center_line_color;
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.row_width, y);
        this.ctx.stroke();

        if (this.prev_center_line_y) {

            this.ctx.beginPath();
            this.ctx.strokeStyle = this.grid_color;
            this.ctx.moveTo(0, this.prev_center_line_y);
            this.ctx.lineTo(this.row_width, this.prev_center_line_y);
            this.ctx.stroke();

        }

        this.prev_center_line_y = y;

    }


    clear_prints() {



    }


    update(ts) {

        const t0 = performance.now();

        if (this.it >= this.records.length)

            return;

        if (ts < this.ts) {

            this.reset_to_ts();

            return;

        }

        var rec = this.records[this.it];
        var processed = 0;

        while (rec[dom.t_ts] < ts && this.it < this.records.length) {

            rec     = this.records[this.it++];
            this.ts = rec[dom.t_ts];

            processed += 1;
            // ...

        }

        console.log(`processed ${processed}, in ${performance.now() - t0}`)

    }


    draw() {

        // ...

    }


    reset_to_ts() { 
    
        // 
    
    }


    get_ts() { return this.ts; }


}
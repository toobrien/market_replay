

class dom {

    
    // tas record enum

    static t_ts     = 0;
    static t_price  = 1;
    static t_qty    = 2;
    static t_side   = 3;
    static t_len    = 4;
    
    // depth record enum -- can probably modify this in the parser for better performance

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


    // dom specific members

    canvas                  = null;
    ctx                     = null;
    
    ts                      = 0;
    recors                  = null;

    row_height              = null;
    row_width               = null;

    text_margin             = null;

    default_line_width      = null;
    default_stroke_style    = null;
    default_font            = null;

    profile_cell_width      = null;
    profile_cell_offset     = null;
    profile_col             = null;

    price_precision         = null;
    price_char_width        = null;
    price_cell_width        = null;
    price_cell_color        = null;
    price_cell_offset       = null;
    price_col               = null;

    depth_cell_width        = null;
    bid_depth_cell_offset   = null;
    ask_depth_cell_offset   = null;
    bid_depth_col           = null;
    ask_depth_col           = null;

    print_cell_width        = null;
    print_cell_offset       = null;
    bid_print_cell_offset   = null;
    ask_print_cell_offset   = null;
    bid_print_col           = null;
    ask_print_col           = null;

    ltq_cell_width          = null;
    ltq_cell_offset         = null;
    ttq_cell_col            = null;

    best_bid                = null;
    best_ask                = null;


    constructor(symbol, records, tick_size, dom_config) {

        this.tick_size  = tick_size;
        this.records    = records;
        this.canvas     = document.getElementById(`${symbol}_dom`);
        this.ctx        = this.canvas.getContext("2d");
        this.best_bid   = Number.MIN_VALUE;
        this.best_ask   = Number.MAX_VALUE;

        this.initialize_dimensions(dom_config);
        this.initialize_offsets();
        this.initialize_price_range(dom_config["depth"]["max_depth"]);
        this.initialize_cols();
        this.initailize_canvas();

    }


    initialize_dimensions(dom_config) {

        this.text_margin            = dom_config["dimensions"]["text_margin"];

        this.default_line_width     = dom_config["style"]["line_width"];
        this.default_stroke_style   = dom_config["style"]["stroke_style"];
        this.default_font           = dom_config["style"]["font"];

        this.row_height             = dom_config["dimensions"]["row_height"];
        this.row_width              = dom_config["dimensions"]["row_width"];

        this.profile_cell_width     = dom_config["dimensions"]["profile_cell_width"];

        this.price_precision        = dom_config["dimensions"]["price_precision"];
        this.price_char_width       = dom_config["dimensions"]["price_width"];
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


    initialize_price_range(max_depth) {

        // need to rewrite this to use max_depth and depth, rather than trades

        const records = this.records();

        this.max_price = Number.MIN_VALUE;
        this.min_price = Number.MIN_VALUE;

        for (rec in records) {

            if (rec.length == t_len) {

                const price = rec[t_price];

                this.max_price = this.max_price > price ? this.max_price : price;
                this.min_price = this.min_price < price ? this.min_price : price;

            }

        }

        this.num_prices = (this.max_price - this.min_price) / this.tick_size;

    }


    initialize_cols() {
        
        this.profile_col    = Array.new(this.num_prices).fill(0.0);
        this.price_col      = Array.new(this.num_prices).fill(0.0);
        this.bid_depth_col  = Array.new(this.num_prices).fill(0.0);
        this.ask_depth_col  = Array.new(this.num_prices).fill(0.0);
        this.bid_print_col  = Array.new(this.num_prices).fill(0.0);
        this.ask_print_col  = Array.new(this.num_prices).fill(0.0);
        this.ltq_col        = Array.new(this.num_prices).fill(0.0);

    }


    initailize_canvas() {

        this.canvas_height  = (this.num_prices + 1) * this.row_height;
        this.canvas.width   = this.row_width;
        this.canvas.height  = this.canvas_height;

        this.ctx.lineWidth      = this.default_line_width;
        this.ctx.strokeStyle    = this.default_stroke_style;
        this.ctx.font           = this.default_font;
        
        // outline canvas

        this.ctx.strokeRect(0, 0, this.row_width, this.canvas_height);

        // column lines

        [
            this.price_cell_offset,
            this.bid_depth_cell_offset,
            this.bid_print_cell_ofsset,
            this.ask_print_cell_offset,
            this.ask_depth_cell_offset,
            this.ltq_cell_offset
        ].forEach(
            offset => {
                
                this.ctx.moveTo(offset, 0);
                this.ctx.lineTo(offset, this.canvas_height);
                this.ctx.stroke();

            }
        );

        // row lines + prices

        x = this.price_cell_offset;

        for (var i = 0; i <= this.num_prices; i += 1) {
        
            const y       = (i + 1) * this.row_height;
            const price   = this.max_price - i * this.tick_size;

            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.row_width, y);
            this.ctx.stroke();
        
            this.ctx.fillStyle = this.price_cell_color;
            this.ctx.fillRect(x, y - this.row_height, this.price_cell_width, this.row_height);

            this.ctx.fillStyle = this.default_stroke_style;
            this.ctx.fillText(
                String(price.toFixed(this.price_precision)).padStart(this.price_char_width), 
                x + this.text_margin, 
                y - this.text_margin
            );

        }

    }


    update(ts) {

        this.ts = ts;

    }


    draw() {

    }


}

// export { dom };
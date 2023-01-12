

class dom {


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

    price_precision         = null;
    price_char_width        = null;
    price_cell_width        = null;
    price_cell_color        = null;
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


    constructor(symbol, records, dom_config) {

        this.records                = records;

        this.canvas                 = document.getElementById(`${symbol}_dom`);
        this.ctx                    = this.canvas.getContext("2d");
        
        this.text_margin            = dom_config["dimensions"]["text_margin"];

        this.default_line_width     = dom_config["style"]["line_width"];
        this.default_stroke_style   = dom_config["style"]["stroke_style"];
        this.default_font           = dom_config["style"]["font"];

        this.row_height             =   dom_config["dimensions"]["row_height"];
        this.row_width              =   dom_config["dimensions"]["row_width"];

        this.profile_cell_width     = dom_config["dimensions"]["profile_cell_width"];

        this.price_precision        = dom_config["dimensions"]["price_precision"];
        this.price_char_width       = dom_config["dimensions"]["price_width"];
        this.price_cell_width       = dom_config["dimensions"]["price_cell_width"];
        this.price_cell_color       = dom_config["style"]["price_cell_color"];

        this.depth_cell_width       = dom_config["dimensions"]["depth_cell_width"];

        this.print_cell_width       = dom_config["dimensions"]["print_cell_width"];
        
        this.ltq_cell_width         = dom_config["dimensions"]["ltq_cell_width"];
        
        // where do these come from?

        this.max_price     = 76.25;
        this.min_price     = 73.50;
        this.tick_size     = 0.01;
        this.num_prices    = (this.max_price - this.min_price) / this.tick_size;
        this.canvas_height = (this.num_prices + 1) * this.row_height;
        
        // initialize canvas

        this.canvas.width    = this.row_width;
        this.canvas.height   = this.canvas_height;

        this.ctx.lineWidth   = this.default_line_width;
        this.ctx.strokeStyle = this.default_stroke_style;
        this.ctx.font        = this.default_font;
        
        // outline canvas

        this.ctx.strokeRect(0, 0, this.row_width, this.canvas_height);

        // column lines

        var x = 0;

        this.profile_cell_offset    = 0;
        this.price_cell_offset      = this.profile_cell_offset + this.profile_cell_width;
        this.bid_depth_cell_offset  = this.price_cell_offset + this.price_cell_width;
        this.bid_print_cell_offset  = this.bid_depth_cell_offset + this.depth_cell_width;
        this.ask_print_cell_offset  = this.bid_print_cell_offset + this.print_cell_width;
        this.ask_depth_cell_offset  = this.ask_print_cell_offset + this.print_cell_width;
        this.ltq_cell_offset        = this.ask_depth_cell_offset + this.depth_cell_width;

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
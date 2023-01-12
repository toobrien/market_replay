

class dom {


    canvas  = null;
    ctx     = null;
    
    ts = 0;

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


    constructor(symbol, dom_config) {

        canvas                 = document.getElementById(`${symbol}_dom`);
        ctx                    = canvas.getContext("2d");
        
        text_margin            = dom_config["dimensions"]["text_margin"];

        default_line_width     = dom_config["style"]["line_width"];
        default_stroke_style   = dom_config["style"]["stroke_style"];
        default_font           = dom_config["style"]["font"];

        row_height             = dom_config["dimensions"]["row_height"];
        row_width              = dom_config["dimensions"]["row_width"];

        profile_cell_width     = dom_config["dimensions"]["profile_cell_width"];

        price_precision        = dom_config["dimensions"]["price_precision"];
        price_char_width       = dom_config["dimensions"]["price_width"];
        price_cell_width       = dom_config["dimensions"]["price_cell_width"];
        price_cell_color       = dom_config["style"]["price_cell_color"];

        depth_cell_width       = dom_config["dimensions"]["depth_cell_width"];

        print_cell_width       = dom_config["dimensions"]["print_cell_width"];
        
        ltq_cell_width         = dom_config["dimensions"]["ltq_cell_width"];
        
        // where do these come from?

        max_price     = 76.25;
        min_price     = 73.50;
        tick_size     = 0.01;
        num_prices    = (max_price - min_price) / tick_size;
        canvas_height = (num_prices + 1) * row_height;
        
        // initialize canvas

        canvas.width    = row_width;
        canvas.height   = canvas_height;

        ctx.lineWidth   = default_line_width;
        ctx.strokeStyle = default_stroke_style;
        ctx.font        = default_font;
        
        // outline canvas

        ctx.strokeRect(0, 0, row_width, canvas_height);

        // column lines

        var x = 0;

        profile_cell_offset    = 0;
        price_cell_offset      = profile_cell_offset + profile_cell_width;
        bid_depth_cell_offset  = price_cell_offset + price_cell_width;
        bid_print_cell_offset  = bid_depth_cell_offset + depth_cell_width;
        ask_print_cell_offset  = bid_print_cell_offset + print_cell_width;
        ask_depth_cell_offset  = ask_print_cell_offset + print_cell_width;
        ltq_cell_offset        = ask_depth_cell_offset + depth_cell_width;

        [
            price_cell_offset,
            bid_depth_cell_offset,
            bid_print_cell_ofsset,
            ask_print_cell_offset,
            ask_depth_cell_offset,
            ltq_cell_offset
        ].forEach(
            offset => {
                
                ctx.moveTo(offset, 0);
                ctx.lineTo(offset, canvas_height);
                ctx.stroke();

            }
        );

        // row lines + prices

        x = price_cell_offset;

        for (var i = 0; i <= num_prices; i += 1) {
        
            const y       = (i + 1) * row_height;
            const price   = max_price - i * tick_size;

            ctx.moveTo(0, y);
            ctx.lineTo(row_width, y);
            ctx.stroke();
        
            ctx.fillStyle = price_cell_color;
            ctx.fillRect(x, y - row_height, price_cell_width, row_height);

            ctx.fillStyle = default_stroke_style;
            ctx.fillText(
                String(price.toFixed(price_precision)).padStart(price_char_width), 
                x + text_margin, 
                y - text_margin
            );

        }


    }


    update(ts) {

    }


    draw() {

    }


}

export { dom };
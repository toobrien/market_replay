
async function run() {

    const response      = await fetch('http://localhost:8080/dom_config');
    const dom_config    = await response.json(); 
    
    const canvas  = document.getElementById("dom_1");
    const ctx     = canvas.getContext("2d");
    
    const profile_cell_width    = dom_config["dimensions"]["profile_cell_width"]

    const price_precision       = dom_config["dimensions"]["price_precision"];
    const price_char_width      = dom_config["dimensions"]["price_width"];
    const price_cell_width      = dom_config["dimensions"]["price_cell_width"];
    const price_cell_color      = dom_config["style"]["price_cell_color"];

    const depth_cell_width      = dom_config["dimensions"]["depth_cell_width"];
    const print_cell_width      = dom_config["dimensions"]["print_cell_width"];
    const ltq_cell_width        = dom_config["dimensions"]["ltq_cell_width"];

    const row_height            = dom_config["dimensions"]["row_height"];
    const row_width             =   profile_cell_width + price_cell_width + 
                                    2 * depth_cell_width + 2 * print_cell_width + 
                                    ltq_cell_width;
    const text_margin           = dom_config["dimensions"]["text_margin"];
    
    const max_price   = 76.25;
    const min_price   = 73.50;
    const tick_size   = 0.01;
    const num_prices  = (max_price - min_price) / tick_size;
    const dom_height  = (num_prices + 1) * row_height;
    
    canvas.width    = row_width;
    canvas.height   = dom_height;

    const default_line_width    = dom_config["style"]["line_width"];
    const default_stroke_style  = dom_config["style"]["stroke_style"];
    const default_font          = dom_config["style"]["font"];

    ctx.lineWidth   = default_line_width;
    ctx.strokeStyle = default_stroke_style;
    ctx.font        = default_font;
    
    // outline

    ctx.strokeRect(0, 0, row_width, dom_height);

    // column lines

    var x = 0;

    [
        profile_cell_width,
        price_cell_width,
        depth_cell_width,
        print_cell_width,
        print_cell_width,
        depth_cell_width,
        ltq_cell_width
    ].forEach(
        cell_width => {
            x += cell_width;
            
            ctx.moveTo(x, 0);
            ctx.lineTo(x, dom_height);
            ctx.stroke();
        }
    );

    // row lines + prices

    x = profile_cell_width;

    for (var i = 0; i <= num_prices; i += 1) {
    
        const y       = (i + 1) * row_height;
        const price   = max_price - i * tick_size;
    
        ctx.moveTo(0, y);
        ctx.lineTo(row_width, y);
        ctx.stroke();
    
        ctx.fillStyle = price_cell_color;
        ctx.fillRect(x, y - row_height, price_cell_width, row_height);

        ctx.fillStyle = default_stroke_style;
        ctx.fillText(String(price.toFixed(price_precision)).padStart(price_char_width), x + text_margin, y - text_margin);

    }

}

run();


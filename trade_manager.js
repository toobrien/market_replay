

class order {


    static state_active     = 0;
    static state_cancelled  = 1;
    static state_filled     = 2;
    
    static type_mkt         = 0;
    static type_limit       = 1;
    static type_stop_mkt    = 2;

    static side_long        = 1;
    static side_short       = -1;

    id              = null;
    placed_ts       = null;
    filled_ts       = null;
    cancelled_ts    = null;
    price           = null;
    qty             = null;
    queue_pos       = null;
    side            = null;
    stale_cycles    = null;
    state           = null;
    type            = null;


}


class position {


    static state_open   = 0;
    static state_closed = 1;

    static side_long    = 1;
    static side_short   = -1;

    id          = null;
    closed_ts   = null;
    opened_ts   = null;
    price       = null;
    qty         = null;
    side        = null;
    state       = null;


}


class trade_manager {


    static num_stale_cycles = 10;    // for coloring filled/cancelled cells

    parent = null;

    ask_cell_range      = null;
    bid_cell_range      = null;
    next_id             = null;
    open_cell           = null;
    open_pnl            = null;
    orders              = null;
    position            = null;
    positions           = null;
    position_cell       = null;
    qty                 = null;
    realized_cell       = null;
    realized_pnl        = null;
    row_height_total    = null;
    tick_value          = null;
    trade_log           = null;


    constructor(parent) {

        this.parent             = parent;
        this.next_id            = 0;
        this.open_cell          = document.getElementById(`${this.parent.friendly_symbol}_open_cell`);
        this.open_pnl           = 0.0;
        this.orders             = new Array();
        this.position           = 0;
        this.positions          = new Array();
        this.position_cell      = document.getElementById(`${this.parent.friendly_symbol}_position_cell`);
        this.qty                = parseInt(document.getElementById("qty_select").value);
        this.realized_cell      = document.getElementById(`${this.parent.friendly_symbol}_realized_cell`);
        this.realized_pnl       = 0.0;
        this.row_height_total   = this.parent.row_height + this.parent.row_offset;
        this.tick_value         = this.parent.tick_value;
        this.trade_log          = document.getElementById("trade_log");

        this.ask_cell_range     = [
                                    this.parent.ask_depth_cell_offset,
                                    this.parent.ask_depth_cell_offset + this.parent.depth_cell_width
        ];
        this.bid_cell_range     = [
                                    this.parent.bid_depth_cell_offset,
                                    this.parent.bid_depth_cell_offset + this.parent.depth_cell_width
                                ];
        
        this.open_cell.innerHTML     = this.open_pnl;
        this.position_cell.innerHTML = this.position;
        this.realized_cell.innerHTML = this.realized_pnl;

    }


    set_order(e) {

        const price = (e.layerY / this.row_height_total) | 0;

        if (price < 0 || price >= this.parent.num_prices)

            // invalid price

            return;

        const is_bid_order = e.layerX > this.bid_cell_range[0] && e.layerX < this.bid_cell_range[1];
        const is_ask_order = e.layerX > this.ask_cell_range[0] && e.layerX < this.ask_cell_range[1];

        if (!(is_bid_order || is_ask_order))

            // no order submitted

            return;

        let o = null;

        for (let i = 0; i < this.orders.length; i++) {

            o = this.orders[i];

            if (
                    o.price == price && 
                    (
                        o.side == order.side_long  && is_bid_order || 
                        o.side == order.side_short && is_ask_order
                    ) &&
                    !o.state_cancelled &&
                    !o.state_filled
                ) {

                // cancel existing order and return
                
                o.state         = order.state_cancelled;
                o.cancelled_ts  = this.parent.ts;

                if (!e.shiftKey)

                    if (is_bid_order) this.cancel_orders(true, false) 
                    else this.cancel_orders(false, true);

                return;

            }

        }

        // create new order

        o = new order();

        const ask_depth_col = this.parent.ask_depth_col;
        const bid_depth_col = this.parent.bid_depth_col;

        const best_bid = this.parent.best_bid;
        const best_ask = this.parent.best_ask;

        o.id            = (this.next_id).toString().padStart(5, "0");
        o.placed_ts     = this.parent.ts;
        o.stale_cycles  = trade_manager.num_stale_cycles;
        o.state         = order.state_active;
        o.qty           = this.qty;
        o.side          = is_bid_order ? order.side_long : order.side_short;
        o.price         = price;

        if (is_bid_order) {

            o.type      =   price <= best_ask ? order.type_mkt      :
                            price >  best_ask ? order.type_limit    :
                            null; // invalid

            o.queue_pos = bid_depth_col[price];

            if (!e.shiftKey)

                this.cancel_orders(true, false);

        } else {
        
            o.type      =   price >= best_bid ? order.type_mkt     :
                            price <  best_bid ? order.type_limit   :
                            null; // invalid

            o.queue_pos = ask_depth_col[price];

            if (!e.shiftKey)

                this.cancel_orders(false, true);

        }

        this.orders.push(o);

        this.next_id += 1;

    }


    cancel_orders(cancel_bids, cancel_asks) {

        for (let o of this.orders) {

            if (
                o.state == order.state_active &&
                (
                    (o.side == order.side_long && cancel_bids) ||
                    (o.side == order.side_short && cancel_asks)
                )
            ) {

                o.state         = order.state_cancelled;
                o.cancelled_ts  = this.parent.ts;
            
            }

        }

    }


    update(high_trade, low_trade) {

        if (!this.orders)

            return;

        let bid_depth_col   = this.parent.bid_depth_col;
        let ask_depth_col   = this.parent.ask_depth_col;
        let dirty_col       = this.parent.dirty_col;
        let trade_col       = this.parent.trade_col;

        for (let i = 0; i < this.orders.length; i++) {

            let o = this.orders[i];

            switch(o.state) {

                case order.state_active:

                    if (o.type == order.type_mkt) {
                        
                        let j           = o.side == order.side_long ? this.parent.best_ask : this.parent.best_bid;
                        let depth_col   = o.side == order.side_long ? ask_depth_col : bid_depth_col;

                        while(o.qty > 0) {

                            let traded = Math.min(o.qty, depth_col[j]);

                            let pos = new position();

                            pos.id          = o.id;
                            pos.opened_ts   = this.parent.ts;
                            pos.price       = j;
                            pos.qty         = traded * o.side;
                            pos.side        = o.side;
                            pos.state       = position.state_open;

                            o.qty           = Math.max(0, o.qty - traded);

                            j = o.side == order.side_long ? j - 1 : j + 1;

                            this.merge_positions(pos);

                        }

                        o.state     = order.state_filled;
                        o.closed_ts = this.parent.ts;

                    } else if (o.type == order.type_limit) {

                        let traded = 0; // qty traded at limit price or better
                        
                        if (o.side == order.side_long) {
                        
                            for (let i = o.price; i <= low_trade; i++)
                        
                                traded += trade_col[i];

                            o.queue_pos = Math.min(o.queue_pos, bid_depth_col[o.price]);

                        } else {

                            for (let i = o.price; i >= high_trade; i--)

                                traded += trade_col[i];

                            o.queue_pos = Math.min(o.queue_pos, ask_depth_col[o.price]);

                        }

                        o.queue_pos -=  traded;

                        if (o.queue_pos < 0) {

                            // fill (or partial)

                            let remaining = Math.max(0, o.queue_pos + o.qty);

                            let pos = new position();

                            pos.id          = o.id;
                            pos.price       = o.price;
                            pos.qty         = (o.qty - remaining) * o.side;
                            pos.opened_ts   = this.parent.ts;
                            pos.side        = o.side;
                            pos.state       = position.state_open;

                            o.qty       = remaining;
                            o.state     = remaining > 0 ? order.state_active : order.state_filled;
                            o.closed_ts = o.state == order.state_filled ? this.parent.ts : null;
                            
                            this.merge_positions(pos);

                        }

                    }

                    break;

                case order.state_cancelled:
                case order.state_filled:

                    o.stale_cycles -= 1;

                    if (o.stale_cycles <= 0) {

                        this.orders = this.orders.filter(o_ => o_ !== o);

                        i--;

                        dirty_col[o.price] = true;

                    }

                    break;

                default:

                    // invalid

                    break;

            }

        }

        // clear trades for next cycle
        
        trade_col.fill(0, high_trade, low_trade);

        // update open pnl

        this.open_pnl = 0.0;

        for (let pos of this.positions)

            if (pos.state != position.closed)

                this.open_pnl += (pos.price - this.parent.last_price) * pos.qty * this.tick_value;

        this.open_cell.innerHTML = this.open_pnl;

    }


    merge_positions(pos) {

        for (let i = 0; i < this.positions.length; i++) {

            let pos_i = this.positions[i];

            if (pos.side != pos_i.side) {

                this.close_and_record_trade(pos, pos_i);

                if (pos_i.state == position.state_closed) {

                    this.positions = this.positions.filter(p_ => p_ != pos_i);

                    i--;
                
                }
                
                if (pos.state == position.state_closed)

                    break;

            }

        }

        // open position

        if (pos.state != position.state_closed) {

            const side_text     = pos.side == position.side_long ? "BUY" : "SELL";
            const price_text    = this.parent.price_text_arr[pos.price];
            const qty_text      = Math.abs(pos.qty);

            trade_log.innerHTML =   `${this.parent.friendly_symbol}`    +
                                    `\torder_id: ${pos.id}`             +
                                    `\t${side_text}`                    +
                                    `\tqty: ${qty_text}`                +
                                    `\tprice: ${price_text}\n`          +
                                    trade_log.innerHTML;

            this.positions.push(pos);

        }

        // update position cell

        this.position = 0;

        for (let pos of this.positions)

            if (pos.state != position.state_closed)

                this.position += pos.qty;

        this.position_cell.innerHTML = this.position;

    }


    close_and_record_trade(new_pos, old_pos) {

        let open_price  = old_pos.price;
        let close_price = new_pos.price;
        let closed_ts   = this.parent.ts;
        let qty_traded  = null;
        let trade_side  = old_pos.side;
        let order_side  = new_pos.side;
        let new_abs_qty = Math.abs(new_pos.qty);
        let old_abs_qty = Math.abs(old_pos.qty);

        // close position
        
        if (new_abs_qty == old_abs_qty) {

            qty_traded          = new_abs_qty;

            new_pos.closed_ts   = closed_ts;
            new_pos.qty         = 0;
            new_pos.state       = position.state_closed;

            old_pos.closed_ts   = closed_ts;
            old_pos.qty         = 0;
            old_pos.state       = position.state_closed;

        } else if (new_abs_qty < old_abs_qty) {

            qty_traded          = new_abs_qty;

            old_pos.qty         += new_pos.qty;

            new_pos.closed_ts   = closed_ts;
            new_pos.qty         = 0;
            new_pos.state       = position.state_closed;

        } else {

            qty_traded          = old_abs_qty;

            new_pos.qty         += old_pos.qty;

            old_pos.closed_ts   = closed_ts;
            old_pos.qty         = 0;
            old_pos.state       = position.state_closed;

        }

        // close position

        let pnl = (open_price - close_price) * qty_traded * trade_side * this.tick_value;

        this.realized_pnl += pnl;

        let side_text   = order_side == position.side_long ? "BUY" : "SELL";
        let price_text  = this.parent.price_text_arr[close_price];

        trade_log.innerHTML =   `${this.parent.friendly_symbol}`    +
                                `\torder_id: ${new_pos.id}`         +
                                `\t${side_text}`                    +
                                `\tqty: ${qty_traded}`              +
                                `\tprice: ${price_text}`            +
                                `\tpnl: ${pnl}\n`                   +
                                trade_log.innerHTML;

        // update realized cell

        this.realized_cell.innerHTML = this.realized_pnl;
    
    }

    
    // called from parent.update, after this.update
    
    draw(high_price, low_price) {

        // redraw dirty rows:
        //   - they might have been cleared by a re-center
        //   - filled/cancelled orders need to be redrawn after stale cycles run out
        
        const dirty_col = this.parent.dirty_col;
        const ctx = this.parent.ctx;

        ctx.fillStyle = this.parent.default_cell_color;

        let y = null;
        let x = null;

        for (let i = high_price; i <= low_price; i++) {

            if (dirty_col[i]) {

                y = i * this.row_height_total;

                ctx.fillRect(
                    this.parent.bid_trade_cell_offset,
                    y,
                    this.parent.depth_cell_width,
                    this.parent.row_height
                );

                ctx.fillRect(
                    this.parent.ask_trade_cell_offset,
                    y,
                    this.parent.depth_cell_width,
                    this.parent.row_height
                );

            }

        }


        // redraw all open orders each cycle

        for (let o of this.orders) {

            y = o.price * this.row_height_total
            x = o.side == order.side_long ? this.parent.bid_trade_cell_offset : this.parent.ask_trade_cell_offset;

            const color = o.state == order.state_active    ? this.parent.trade_cell_active_color    :
                          o.state == order.state_cancelled ? this.parent.trade_cell_cancelled_color :
                          this.parent.trade_cell_filled_color;

            ctx.fillStyle = color;

            ctx.fillRect(
                x,
                y,
                this.parent.trade_cell_width,
                this.parent.row_height
            );

            ctx.fillStyle = this.parent.default_text_color;

            ctx.fillText(
                itoa_arr[o.qty],
                x + this.parent.text_margin, 
                y + this.parent.row_height - this.parent.text_margin
            );

        }

    }


    reset() {

        this.open_pnl       = 0.0
        this.orders         = new Array();
        this.position       = 0;
        this.positions      = new Array();
        this.realized_pnl   = 0.0;

    }


}


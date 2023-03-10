

class dom_manager {


    // sc_to_unix_us = microseconds between 1899-12-30 00:00:00 UTC and 1971-01-01 00:00:00 UTC
    // utc_offset_us is the user-selected offset from app_config

    sc_to_unix_us       = null;
    utc_offset_us       = null;

    doms                = null;
    update_ms           = null;
    ts                  = null;
    multiplier          = null;
    interval_us         = null;
    date                = null;
    loop                = null;

    latest_date_div     = null;

    timestamp_input     = null;
    timestamp_button    = null;

    total_open_cell     = null;
    total_realized_cell = null;

    qty_select          = null;

    speed_input         = null;
    speed_button        = null;
    speed_1_button      = null;
    speed_10_button     = null;
    speed_25_button     = null;
    speed_50_button     = null;
    speed_100_button    = null;
    speed_250_button    = null;


    constructor(doms, update_ms, utc_offset) {

        this.doms               = doms;
        this.update_ms          = update_ms;

        this.date               = new Date();
        
        this.sc_to_unix_us      = 2.2091328e15;
        this.utc_offset_us      = parseInt(utc_offset) * 3.6e9;

        this.ts                 = Math.min(...(this.doms.map(d => { return d.get_ts(); })));
        this.multiplier         = 1.0;
        this.interval_us        = this.multiplier * update_ms * 1000;
        this.loop               = null;
        
        this.play_button                    = document.getElementById("play_button");
        this.play_button.innerHTML          = "play";
        this.play_button.onclick            = this.run.bind(this);

        this.latest_date_div                = document.getElementById("latest_date_div");
        this.latest_date_div.innerHTML      = this.ts_to_date_string(this.ts);

        this.total_open_cell                = document.getElementById("total_open_cell");
        this.total_realized_cell            = document.getElementById("total_realized_cell");

        this.timestamp_input                = document.getElementById("timestamp_input");
        this.timestamp_button               = document.getElementById("timestamp_button");
        this.timestamp_button.onclick       = this.set_ts.bind(this);

        this.qty_select                     = document.getElementById("qty_select");
        this.qty_select.onchange            = this.set_qty.bind(this);

        this.speed_input                    = document.getElementById("speed_input");
        this.speed_input.value              = this.multiplier.toFixed(1);

        this.update_speed_button            = document.getElementById("speed_button");
        this.update_speed_button.onclick    = this.set_multiplier.bind(this);

        this.speed_1_button                 = document.getElementById("speed_1_button");
        this.speed_1_button.onclick         = this.set_multiplier_from_button.bind(this);
        
        this.speed_10_button                = document.getElementById("speed_10_button");
        this.speed_10_button.onclick        = this.set_multiplier_from_button.bind(this);

        this.speed_25_button                = document.getElementById("speed_25_button");
        this.speed_25_button.onclick        = this.set_multiplier_from_button.bind(this);

        this.speed_50_button                = document.getElementById("speed_50_button");
        this.speed_50_button.onclick        = this.set_multiplier_from_button.bind(this);

        this.speed_100_button                = document.getElementById("speed_100_button");
        this.speed_100_button.onclick        = this.set_multiplier_from_button.bind(this);

        this.speed_250_button                = document.getElementById("speed_250_button");
        this.speed_250_button.onclick        = this.set_multiplier_from_button.bind(this);

    }


    set_ts() {

        const ts = this.date_string_to_ts(this.timestamp_input.value);

        if (ts < this.ts) {

            for (const dom of this.doms)

                dom.reset_to_ts(ts);

        }

        this.ts = ts;

    }


    // ts is in local time
    // ds is in user-selected UTC offset

    ts_to_date_string(ts) {

        const us = (ts % 1000).toString().padStart(3, "0");
        const ms = (ts - this.sc_to_unix_us + this.utc_offset_us) / 1000;
        
        this.date.setTime(ms);

        const year          = this.date.getFullYear();
        const month         = (this.date.getMonth() + 1).toString().padStart(2, '0');
        const day           = this.date.getDate().toString().padStart(2, '0');

        const hour          = this.date.getHours().toString().padStart(2, '0');
        const minute        = this.date.getMinutes().toString().padStart(2, '0');
        const second        = this.date.getSeconds().toString().padStart(2, '0');
        const millisecond   = this.date.getMilliseconds().toString().padStart(3, '0')

        var ds = `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}${us}`;

        return ds;
    
    }


    // ds is in user-selected UTC offset
    // ts is in local time

    date_string_to_ts(ds) {

        const   year            = atoi(ds, 0, 4);
        const   month           = atoi(ds, 5, 7);
        const   day             = atoi(ds, 8, 10)
        const   hours           = atoi(ds, 11, 13);
        const   minutes         = atoi(ds, 14, 16);
        const   seconds         = atoi(ds, 17, 19);
        const   milliseconds    = atoi(ds, 20, 23);
        const   us              = atoi(ds, 23, 26);
        
        this.date.setFullYear(year);
        this.date.setMonth(month - 1);
        this.date.setDate(day);
        this.date.setHours(hours);
        this.date.setMinutes(minutes);
        this.date.setSeconds(seconds);
        this.date.setMilliseconds(milliseconds);

        var ts = this.date.getTime() * 1000 + us + this.sc_to_unix_us - this.utc_offset_us;

        return ts;
        
    }


    set_multiplier_from_button(e) {

        const new_multiplier    = parseFloat(e.target.innerHTML);

        this.multiplier         = new_multiplier;
        this.interval_us        = this.update_ms * 1000 * new_multiplier;

        this.speed_input.value  = new_multiplier;

    }


    set_multiplier() {

        const new_multiplier = parseFloat(this.speed_input.value);

        if (isNaN(new_multiplier)) {

            window.alert("new speed must be a valid floating point number or integer");

            return;

        }
        
        const new_interval_us = Math.trunc(this.update_ms * 1000 * new_multiplier);

        if (new_interval_us < 1) {

            window.alert("new speed is sub-microsecond; not supported");

            return;

        }

        this.multiplier = new_multiplier;
        this.interval_us = new_interval_us;

    }


    set_qty(e) {

        let qty = parseInt(e.target.value);

        for (let d of this.doms)

            d.tm.qty = qty;

    }


    run() {

        this.play_button.innerHTML  = "pause";
        this.play_button.onclick    = this.stop.bind(this);

        this.loop = setInterval(
            () => {
                
                this.ts = this.ts + this.interval_us;

                let total_open_pnl     = 0;
                let total_realized_pnl = 0;

                for (let d of this.doms) {

                    d.update(this.ts);

                    total_open_pnl     += d.tm.open_pnl;
                    total_realized_pnl += d.tm.realized_pnl;

                }

                this.latest_date_div.innerHTML = this.ts_to_date_string(this.ts);

                this.total_open_cell.innerHTML      = total_open_pnl;
                this.total_realized_cell.innerHTML  = total_realized_pnl;

            },
            this.update_ms
        );

    }

    stop() {

        this.play_button.innerHTML  = "play";
        this.play_button.onclick    = this.run.bind(this);

        clearInterval(this.loop);

        this.loop = null;

    }


}
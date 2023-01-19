

class dom_manager {


    // microseconds between 1899-12-30 and 1970-01-01 UTC
    
    static sc_to_unix_us    = 2209132800000000;

    doms                    = null;
    update_ms               = null;
    utc_offset              = null;
    ts                      = null;
    multiplier              = null;
    interval_us             = null;
    date                    = null;
    loop                    = null;

    latest_date_div         = null;

    timestamp_input         = null;
    timestamp_button        = null;

    speed_input             = null;
    speed_button            = null;


    constructor(doms, update_ms, utc_offset) {

        this.doms           = doms;
        this.update_ms      = update_ms;
        this.utc_offset     = parseInt(utc_offset);
        this.ts             = Math.min(...(this.doms.map(d => { return d.get_ts(); })));
        this.multiplier     = 1.0;
        this.interval_us    = this.multiplier * update_ms * 1000;
        this.date           = new Date();
        this.loop           = null;
        
        this.play_button                    = document.getElementById("play_button");
        this.play_button.innerHTML          = "play";
        this.play_button.onclick            = this.run.bind(this);

        this.latest_date_div                = document.getElementById("latest_date_div");
        this.latest_date_div.innerHTML      = this.ts_to_date_string(this.ts);

        this.timestamp_input                = document.getElementById("timestamp_input");
        this.timestamp_button               = document.getElementById("timestamp_button");
        this.timestamp_button.onclick       = this.set_ts.bind(this);

        this.speed_input                    = document.getElementById("speed_input");
        this.update_speed_button            = document.getElementById("speed_button");
        this.update_speed_button.onclick    = this.set_multiplier.bind(this);

        this.speed_input.value = this.multiplier.toFixed(1);

    }


    set_ts() {

        const ts = this.date_string_to_ts(this.timestamp_input.value);

        if (ts < this.ts) {

            for (const dom of this.doms)

                dom.reset_to_ts(ts);

        }

        this.ts = ts;

    }


    ts_to_date_string(ts) {

        const   us    = (ts % 1000).toString().padStart(3, "0");
        const   ms    = (ts - dom_manager.sc_to_unix_us) / 1000;
        
        this.date.setTime(ms);
        
        this.date.setUTCHours(this.date.getUTCHours() + this.utc_offset);
        
        var ds = this.date.toISOString();

        ds = ds.slice(0,-1) + us + "Z"

        return ds;
    
    }


    date_string_to_ts(ds) {

        const   year            = atoi(ds, 0, 4);
        const   month           = atoi(ds, 5, 7);
        const   day             = atoi(ds, 8, 10)
        const   hours           = atoi(ds, 11, 13);
        const   minutes         = atoi(ds, 14, 16);
        const   seconds         = atoi(ds, 17, 19);
        const   milliseconds    = atoi(ds, 20, 23);
        const   us              = atoi(ds, 23, 26);
        
        this.date.setUTCFullYear(year);
        this.date.setUTCMonth(month - 1);
        this.date.setUTCDate(day);
        this.date.setUTCHours(hours - this.utc_offset);
        this.date.setUTCMinutes(minutes);
        this.date.setUTCSeconds(seconds);
        this.date.setUTCMilliseconds(milliseconds);

        var ts = this.date.getTime() * 1000;
        
        ts = ts + dom_manager.sc_to_unix_us + us;

        return ts;
        
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


    run() {

        this.play_button.innerHTML  = "pause";
        this.play_button.onclick    = this.stop.bind(this);

        this.loop = setInterval(
            () => {
                
                this.ts = this.ts + this.interval_us;

                this.doms.forEach(d => { d.update(this.ts); });

                this.latest_date_div.innerHTML = this.ts_to_date_string(this.ts);

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


class dom_manager {

    
    doms        = null;
    ts          = null;
    multiplier  = null;

    constructor(doms, update_ms) {

        this.doms           = doms;
        this.update_ms      = update_ms;
        this.ts             = Math.min(...(doms.map(d => { return d.get_ts(); })));
        this.multiplier     = 1;
        this.interval       = this.multiplier * update_ms;
        this.loop           = null;
        this.play_button    = document.getElementById("play_button");
        
        this.play_button.innerHTML  = "play";
        this.play_button.onclick    = this.run.bind(this);

    }

    
    set_multiplier(multiplier) { 
        this.multiplier = multiplier;
        this.interval   = this.update_ms * multiplier;
    }


    set_ts(ts) { 
        
        // ...

    }


    run() {

        this.play_button.innerHTML  = "pause";
        this.play_button.onclick    = this.stop.bind(this);

        this.loop = setInterval(
            () => {
                
                this.ts = this.ts + this.interval;
                this.doms.forEach(d => { d.update(this.ts); });

            },
            this.interval
        );

    }

    stop() {

        this.play_button.innerHTML  = "play";
        this.play_button.onclick    = this.run.bind(this);

        clearInterval(this.loop);

        this.loop = null;

    }


}
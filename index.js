

var dm = null;


async function run() {

    var   res           = await fetch(`http://${server}/dom_config`);
    const dom_config    = await res.json();

    res             = await fetch(`http://${server}/symbol_data`);
    var symbol_data = await res.json();

    const doms = [];

    /*
    // test without data

    symbol_data = {
        "CLG23_FUT_CME": {
            "records":      [],
            "tick_size":    0.01
        "CLG23-CLH23.FUT_SPREAD.CME": {
            "records":      [],
            "tick_size":    0.01
        }
    }
    */

    for (var sym in symbol_data)
        
        doms.push(
            new dom(
                sym,
                symbol_data[sym]["records"],
                symbol_data[sym]["tick_size"],
                dom_config
            )
        );

    document.addEventListener(
        "keydown", 
        e => {

            if (e.key === center_dom_key) {

                for (const dom of doms)

                    dom.center_dom();

            } else if (e.key === clear_prints_key) {

                for (const dom of doms)

                    dom.clear_prints()

            }

        }
    );

    // start simulation

    dm = new dom_manager(doms, update_ms);

    document.getElementById("loading_screen").style.display = "none";
    document.getElementById("main_screen").style.display    = "inline";

}


run();


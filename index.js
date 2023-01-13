//import { dom } from "./dom.js";


async function run(server) {

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
        },
        "CLH23-CLJ23.FUT_SPREAD.CME": {
            "records":      [],
            "tick_size":    0.01,
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
        
    
    dm = new dom_manager(doms);

    dm.run();

}


run(server);


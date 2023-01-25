

var dm      = null;
var loaded  = 0;
var to_load = null;


function load_log(msg) {

    document.getElementById("loading_screen").innerHTML += msg;

}


async function init() {

    // get config

    let   res           = await fetch(`http://${server}/dom_config`);
    const dom_config    = await res.json();

    res                 = await fetch(`http://${server}/symbols`);
    var symbols         = await res.json();

    // retrieve, parse, and sequence records

    const symbol_data   = {};
    const promises      = [];

    to_load = Object.keys(symbols).length * 2;

    const t0 = performance.now();

    let i = 0;

    for (var sym in symbols) {

        const records = parse_symbol_records(sym);

        symbol_data[sym]                = {};
        symbol_data[sym]["records"]     = i++;
        symbol_data[sym]["config"]      = symbols[sym];

        promises.push(records);
        
    }

    let resolved = await Promise.all(promises);

    for (var sym in symbols)

        symbol_data[sym]["records"] = resolved[symbol_data[sym]["records"]];

    load_log(`<br>all parsed:&ensp;${performance.now() - t0} ms<br><br>`);

    // initialize doms

    const doms = [];

    for (var sym in symbol_data) {

        doms.push(
            new dom(
                sym,
                symbol_data[sym]["records"],
                symbol_data[sym]["config"],
                dom_config
            )
        );

    }

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

    dm = new dom_manager(doms, update_ms, utc_offset);

    setTimeout(
        () => {

            document.getElementById("loading_screen").style.display = "none";
            document.getElementById("main_screen").style.display    = "inline";

        },
        1000
    );

}


init();


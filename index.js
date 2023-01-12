import { dom } from "./dom.js";


async function run(host, port) {

    const server_url   = `http://${host}:${port}`;

    var   res           = await fetch(`${server_url}/dom_config`);
    const dom_config    = await res.json();
    
    /*

    const t0 = performance.now()

    res                 = await fetch(`${server_url}/symbol_data`);
    const symbol_data   = await res.json();
   
    console.log(`/symbol_data: ${performance.now() - t0} ms elapsed`);

    */

    const doms = [];

    // test

    [
        "CLG23_FUT_CME",
        "CLG23-CLH23.FUT_SPREAD.CME",
        "CLH23-CLJ23.FUT_SPREAD.CME"
    ].forEach(
        sym => {
            doms.push(new dom(sym, dom_config));
        }
    )

}


run();


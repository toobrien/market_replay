from copy       import deepcopy
from flask      import Flask, Response, render_template, send_file
from flask_cors import CORS
from json       import dumps, loads
from re         import search
from sys        import argv


# CONFIG


app = Flask(__name__, static_folder = ".", static_url_path = "")
app.config["CACHE_TYPE"] = "null"
CORS(app)

watchlists      = loads(open("./watchlists.json", "r").read())
dom_config      = loads(open("./dom_config.json", "r").read())
app_config      = loads(open("./app_config.json", "r").read())
sym_config      = loads(open("./sym_config.json", "r").read())

dom_config["dimensions"]["dom_width"] = dom_config["dimensions"]["profile_cell_width"]      + \
                                        dom_config["dimensions"]["price_cell_width"]        + \
                                        dom_config["dimensions"]["trade_cell_width"] * 2    + \
                                        dom_config["dimensions"]["depth_cell_width"] * 2    + \
                                        dom_config["dimensions"]["print_cell_width"] * 2    + \
                                        dom_config["dimensions"]["ltq_cell_width"]          + \
                                        dom_config["dimensions"]["scroll_bar_width"]

dom_config["dimensions"]["row_width"] = dom_config["dimensions"]["dom_width"] - \
                                        dom_config["dimensions"]["scroll_bar_width"]

SC_ROOT             = app_config["sc_root"]
SYMBOLS             = {}
DATE                = None


# ROUTES


@app.route("/dom_config", methods = [ "GET" ])
def get_dom_config():

    return Response(dumps(dom_config))


@app.route("/symbols")
def get_symbols():

    return Response(dumps(SYMBOLS))


@app.route("/symbol_depth/<symbol>")
def get_symbol_depth(symbol):

    return send_file(f"{SC_ROOT}/Data/MarketDepthData/{symbol}.{DATE}.depth")


@app.route("/symbol_trades/<symbol>")
def get_symbol_trades(symbol):

    return send_file(f"{SC_ROOT}/Data/{symbol}.scid")


@app.route("/")
def get_root():

    return render_template(
                            "index.html",
                            symbols             = SYMBOLS,
                            friendly_symbols    = [ config["friendly_symbol"] for sym, config in SYMBOLS.items() ],
                            dom_height          = dom_config["dimensions"]["dom_height"],
                            dom_width           = dom_config["dimensions"]["dom_width"],
                            server              = f"{app_config['hostname']}:{app_config['port']}",
                            center_dom_key      = app_config["center_dom_key"],
                            clear_prints_key    = app_config["clear_prints_key"],
                            cancel_orders_key   = app_config["cancel_orders_key"],
                            update_ms           = app_config["update_ms"],
                            utc_offset          = app_config["utc_offset"]
                        )


# MAIN


if __name__ == "__main__":


    if argv[1] == "watchlist":

        syms = watchlists[argv[2]]
    
    else:
        
        syms = argv[1:-1]

    DATE = argv[-1]

    for sym in syms:

        for key, config in sym_config.items():

            cfg     =  deepcopy(config)
            exchange = cfg["exchange"]
            friendly = None

            if search(f"^{key}.*_FUT_{exchange}", sym):

                # cme, cfe spread

                friendly = sym.split("_")[0]

            elif search(f"^{key}.*\.FUT_SPREAD\.{exchange}", sym):

                # cme spread

                friendly = sym.split(".")[0]

            elif search(f"^{key}.*-{exchange}", sym):

                # eurex and cfe

                friendly = sym.split("-")[0]

            if friendly:

                cfg["friendly_symbol"] = friendly
                
                SYMBOLS[sym] = cfg

                break
    
    app.run(
        host = app_config["hostname"],
        port = app_config["port"]
    )
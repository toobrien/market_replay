from flask      import Flask, Response, render_template
from flask_cors import CORS
from json       import dumps, loads
from time       import time
from sym_it     import SymIt
from sys        import argv


app = Flask(__name__, static_folder = ".", static_url_path = "")
app.config["CACHE_TYPE"] = "null"
CORS(app)


watchlists      = loads(open("./watchlists.json", "r").read())
dom_config      = loads(open("./dom_config.json", "r").read())
app_config      = loads(open("./app_config.json", "r").read())
sym_config      = loads(open("./sym_config.json", "r").read())
symbol_data     = {}

dom_config["dimensions"]["dom_width"] = dom_config["dimensions"]["profile_cell_width"]      + \
                                        dom_config["dimensions"]["price_cell_width"]        + \
                                        dom_config["dimensions"]["depth_cell_width"] * 2    + \
                                        dom_config["dimensions"]["print_cell_width"] * 2    + \
                                        dom_config["dimensions"]["ltq_cell_width"]          + \
                                        dom_config["dimensions"]["scroll_bar_width"]

dom_config["dimensions"]["row_width"] = dom_config["dimensions"]["dom_width"] - \
                                        dom_config["dimensions"]["scroll_bar_width"]


@app.route("/dom_config", methods = [ "GET" ])
def get_dom_config():

    return Response(dumps(dom_config), mimetype = "application/json")


@app.route("/symbol_data")
def get_symbol_data():

    return Response(dumps(symbol_data), mimetype = "application/json")


@app.route("/")
def get_root():

    return render_template(
                            "index.html",
                            symbols             = [ symbol for symbol, _ in symbol_data.items() ],
                            dom_height          = dom_config["dimensions"]["dom_height"],
                            dom_width           = dom_config["dimensions"]["dom_width"],
                            server              = f"{app_config['hostname']}:{app_config['port']}",
                            center_dom_key      = app_config["center_dom_key"],
                            clear_prints_key    = app_config["clear_prints_key"],
                            update_ms           = app_config["update_ms"],
                            utc_offset          = app_config["utc_offset"]
                        )


if __name__ == "__main__":

    t0 = time()

    syms = None

    if argv[1] == "watchlist":

        syms = watchlists[argv[2]]
    
    else:
        
        syms = argv[1:-1]

    date = argv[-1]

    for sym in syms:

        t1 = time()

        res = {
            "tick_size":    None,
            "records":      None
        }

        # this method won't work for all spreads -- replace with regex later

        for key, multiplier in sym_config.items():

            if key in sym:

                res["tick_size"] = multiplier

        res["records"] = SymIt(sym, date).all()

        # make friendlier names
        
        sym = sym.split(".")[0] if "." in sym else sym
        sym = sym.split("_")[0] if "_" in sym else sym

        symbol_data[sym] = res

        print(f"{sym:30s}\t{len(res['records'])}\t{time() - t1:0.2f}")

    print(f"loaded all symbols:\t\t{time() - t0:0.2f}")
    print("server ready")

    app.run(
        host = app_config["hostname"],
        port = app_config["port"]
    )
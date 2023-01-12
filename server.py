from flask      import Flask, Response, render_template
from flask_cors import CORS
from json       import dumps, loads
from time       import time
from sym_it     import SymIt
from sys        import argv


app = Flask(__name__, static_folder = ".", static_url_path = "")
app.config["CACHE_TYPE"] = "null"
CORS(app)


watchlists  = loads(open("./watchlists.json", "r").read())
dom_config  = loads(open("./dom_config.json", "r").read())
config      = loads(open("./config.json", "r").read())
symbol_data = {}


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
                            symbols     = [ symbol for symbol, _ in symbol_data.items() ],
                            dom_height  = dom_config["dimensions"]["dom_height"],
                            dom_width   = dom_config["dimensions"]["dom_width"],
                            server      = f"{config['hostname']}:{config['port']}"
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

        recs = SymIt(sym, "2023-01-11").all()

        symbol_data[sym] = recs

        print(f"{sym:30s}\t{len(recs)}\t{time() - t1:0.2f}")

    print(f"{time() - t0:0.2f}")

    app.run(
        host = config["hostname"],
        port = config["port"]
    )
from flask      import Flask, Response
from flask_cors import CORS
from json       import loads
from time       import time
from sym_it     import SymIt


app = Flask(__name__)
CORS(app)

watchlists  = loads(open("./watchlists.json", "r").read())
dom_config  = open("./dom_config.json", "r").read()
symbol_data = {}

@app.route("/dom_config", methods = [ "GET" ])
def get_dom_config():

    return Response(dom_config, mimetype = "application/json")


@app.route("/symbol_data")
def get_symbol_data():

    return Response(symbol_data, mimetype = "application/json")


if __name__ == "__main__":

    t0 = time()
    
    # syms = watchlists["CL"]
    syms = []

    for sym in syms:

        t1 = time()

        recs = SymIt(sym, "2023-01-11").all()

        symbol_data[sym] = recs

        print(f"{sym:30s}\t{len(recs)}\t{time() - t1:0.2f}")

    print(f"{time() - t0:0.2f}")

    app.run(port = 8080)
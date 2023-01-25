from datetime   import datetime
from numpy      import datetime64, timedelta64
from sym_it     import SymIt
from sys        import argv

SC_EPOCH    = datetime64("1899-12-30")
CL          = SymIt("CLG23_FUT_CME", "2023-01-11")
PRECISION   = 1000000


def print_ts(ts):

    return (SC_EPOCH + timedelta64(ts, "us")).astype(datetime).strftime("%Y-%m-%d %H:%M:%S.%f")


def scan(start, end):

    subset = CL[start:end]

    last_ts  = subset[0][0]
    cur_ts   = None
    start_ts = last_ts

    print(f"start: {last_ts}")

    for rec in subset[1:]:

        cur_ts  = rec[0]
        t       = "depth" if len(rec) == 7 else "trade"

        print(f"{t}\t{cur_ts}\t{(cur_ts - last_ts) / PRECISION: 0.3f}")

        last_ts = cur_ts

    print(f"end:\t{cur_ts}")
    print(f"total duration:\t{cur_ts - start_ts / PRECISION: 0.3f}")


if __name__ == "__main__":
        
    mode = argv[1]

    if mode == "scan":

        scan(int(argv[2]), int(argv[3]))

    elif mode == "all":
    
        last_rec = None
        cur_rec  = None

        for rec in CL:

            if not last_rec:

                last_rec = rec

                print(f"start\t{last_rec[0]}")

                continue

            last_ts = last_rec[0]
            cur_ts  = rec[0]

            t = "depth" if len(rec) == 7 else "trade"

            #if len(rec) != len(last_rec):

            print(f"{t}\t{cur_ts}\t{print_ts(cur_ts)}\t{(cur_ts - last_ts) / PRECISION: 0.3f}")

            last_rec    = rec
            cur_rec     = rec

        print(f"end\t{cur_rec[0]}")

    elif mode == "raw_depth_all":

        CL.synchronize(True)

        recs = CL.lob_recs

        start_ts    = recs[0][0]
        last_ts     = start_ts
        cur_ts      = None

        for rec in CL.lob_recs[1:]:

            cur_ts      = rec[0]
            duration    = (cur_ts - last_ts) / PRECISION

            if duration > 10:

                print(f"{cur_ts}\t{print_ts(cur_ts)}\t{duration: 0.3f}")

            last_ts = cur_ts

        print(f"total duration:\t{cur_ts - start_ts / PRECISION: 0.3f}")

    elif mode == "raw_trade_all":

        CL.synchronize(True)

        recs = CL.tas_recs

        start_ts    = recs[0][0]
        last_ts     = start_ts
        cur_ts      = None

        for rec in CL.lob_recs[1:]:

            cur_ts      = rec[0]
            duration    = (cur_ts - last_ts) / PRECISION

            print(f"{cur_ts}\t{print_ts(cur_ts)}\t{duration: 0.3f}")

            last_ts = cur_ts

        print(f"total duration:\t{cur_ts - start_ts / PRECISION: 0.3f}")
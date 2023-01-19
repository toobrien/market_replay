
async function parse_symbol_records(symbol) {

    const t0 = performance.now();

    const   depth_recs  = parse_depth(symbol);
    const   trade_recs  = parse_trades(symbol);

    let     results     = await Promise.all([ depth_recs, trade_recs ]);

    let     seq         = synchronize(results[0], results[1]);

    console.log(`${symbol}\t${performance.now() - t0} ms total`);

    return seq;

}


// https://www.sierrachart.com/index.php?page=doc/MarketDepthDataFileFormat.html 

const DEPTH_HEADER_BYTE_LEN = 64;
const DEPTH_RECORD_BYTE_LEN = 24;
const DEPTH_RECORD_LEN      = 5;

async function parse_depth(symbol) {

    let t0  = performance.now();

    let     buf         = await (await fetch(`http://${server}/symbol_depth/${symbol}`)).arrayBuffer();
    const   view        = new DataView(buf);

    const   num_recs    = (view.byteLength - DEPTH_HEADER_BYTE_LEN) / DEPTH_RECORD_BYTE_LEN;

    const   recs        = Array.from(Array(num_recs), () => new Array(DEPTH_RECORD_LEN));
    let     i           = 0;
    let     offset      = DEPTH_HEADER_BYTE_LEN;

    while (offset < view.byteLength) {

        let rec = recs[i++];

        rec[0]  = Number(view.getBigUint64(offset, true));  // timestamp
        rec[1]  = view.getUint8(offset + 8, true);          // command
        rec[2]  = view.getUint8(offset + 9, true);          // flags
        rec[3]  = view.getFloat32(offset + 12, true);       // price
        rec[4]  = view.getUint32(offset + 16, true);        // qty

        // skip reserved u_int32

        offset += DEPTH_RECORD_BYTE_LEN;

    }

    console.log(`${symbol}\tdepth\t${i} recs\t${performance.now() - t0} ms`);

    return recs;

}


// format: https://www.sierrachart.com/index.php?page=doc/IntradayDataFileFormat.html

const TRADES_HEADER_BYTE_LEN    = 56;
const TRADE_RECORD_BYTE_LEN     = 40;
const TRADE_RECORD_LEN          = 4;

async function parse_trades(symbol) {

    let t0  = performance.now();

    let     buf         = await (await fetch(`http://${server}/symbol_trades/${symbol}`)).arrayBuffer();
    const   view        = new DataView(buf);

    const   num_recs    = (view.byteLength - TRADES_HEADER_BYTE_LEN) / TRADE_RECORD_BYTE_LEN;

    const   recs        = Array.from(Array(num_recs), () => new Array(TRADE_RECORD_LEN));
    let     i           = 0;
    let     offset      = TRADES_HEADER_BYTE_LEN;
    let     bid_vol     = 0;
    let     ask_vol     = 0;

    while (offset < view.byteLength) {

        let rec = recs[i++];

        rec[0]  = Number(view.getBigUint64(offset, true));  // timestamp
        rec[1]  = view.getFloat32(offset + 20, true);       // price
        rec[2]  = view.getUint32(offset + 28, true);        // qty

        bid_vol = view.getUint32(offset + 32, true);
        ask_vol = view.getUint32(offset + 36, true);

        rec[3]  = bid_vol > 0 ? 0 : 1;          // side (0 = at bid, 1 = at ask)

        offset += TRADE_RECORD_BYTE_LEN;

    }

    console.log(`${symbol}\ttrades\t${i} recs\t${performance.now() - t0} ms`);

    return recs;

}


function synchronize(depth_recs, trade_recs) {

    recs = new Array();

    let i           = 0;
    let init_ts     = depth_recs[0][0];
    let j           = trade_recs.findIndex(rec => rec[0] > init_ts);
    let depth_rec   = null;
    let trade_rec   = null;
    

    while (i < depth_recs.length && j < trade_recs.length) {

        depth_rec = depth_recs[i];
        trade_rec = trade_recs[j];

        if (depth_rec[0] < trade_rec[0]) {

            recs.push(depth_rec);
            i++

        } else {

            recs.push(trade_rec);
            j++;

        }

    }

    while (i < depth_recs.length)

        recs.push(depth_recs[i++])
        

    return recs;

}
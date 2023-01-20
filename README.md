# Market Replay

This program lets you view the market for a set of symbols on a given day. To run:

`python server.py [ <symbols> | <watchlist> ] YYYY-MM-DD`

E.g.

`python server.py CLG23_FUT_CME CLH23_FUT_CME CLG23_FUT_CME 2023-01-11`

You can also configure watchlist for commonly used symbols.

After the server starts, visit it in your browser. By default:

`http://localhost:8080`

To load new symbols, or data for a new day, stop the server and re-run it with the appropriate symbols and date on the command line.

# Controls

The interface is straightforward. Once loading has finished, click `play` to begin. Click the button again to pause. Select a speed multiplier to speed up or slow down the replay. You can set values 1 = 1x speed, 0.5 = half speed, 100 = 100x speed, and so on. After selecting a new speed, you have to click `set speed` for your choice to take effect.

A timestamp updates in real time, indicating the latest record read. To reset the timestamp to an earlier time, you can copy and paste (pause first) or just type one in. Then click `set timestamp` and the replay will restart from that point. You may want to pause first.

You can scroll the DOMs up and down using the mouse wheel. You can recenter the dom with a keystroke, `q` by default. You can clear the recent prints with another key, `w` by default. These keys can be changed in `app_config.json`.

# App Configuration

Most of the configuration pertains to Sierra Chart itself, which generates the data that the application needs to run. But before we get to that, the app has a few configuration files of its own:

`app_config.json`

 - `sc_root`: the base directory of your sierra chart install.
 - `hostname`: default server name; no reason to change from `localhost` really.
 - `port`: the port that your server listens on.
 - `center_dom_key`: the key that centers the doms when pressed.
 - `clear_prints_key`: the key that clears the recent trades columns in the center of the dom when pressed.
 - `update_ms`: the graphics will update 100 times per second, by default (10 ms). increase for smoother animation, decrease for better performance.
 - `utc_offset`: set to whatever time you want to see in the timestamps. `0` will put the app in UTC time.

 Next, `dom_config.json` controls the look of the application. `dom_height` is probably the main one you want to make sure is right so that the DOMs fit on your screen, vertically.

 `sym_config.json` is important. You have to put the root of any symbol you use in here, along with its tick size. See the default file for some examples. Spreads don't need any special configuration; "CL" is enough for CL spreads, etc.

# Sierra Chart Configuration

For the app to work properly, Sierra Chart needs to record both tick and depth data. To record tick data, follow these instructions:

https://www.sierrachart.com/index.php?page=doc/TickbyTickDataConfiguration.php

To record depth data, follow these instructions:

https://www.sierrachart.com/index.php?page=doc/StudiesReference.php&ID=375#DownloadingOfHistoricalMarketDepthData

Note that while the tick data is quite reliable, the market depth data sometimes gets misordered or missing records and needs to be redownloaded. If you see weird behavior on the DOM, such as bids and asks not updating, it might be a bug; but more likely the file is corrupt. To re-download data there are two important steps:

1. Make sure that Sierra Chart is configured to download the maximum 30 days of stored depth data by following these instructions: https://www.sierrachart.com/index.php?page=doc/SierraChartServerSettings.php#MaximumHistoricalMarketDepthDaysToDownload

2. Right-click on an intraday chart for the symbol, from a point prior to the missing file, and initiate a depth re-download: click `Download Depth Data from Realtime`. (See step 8 on the first depth data link in this section, above, for more info).

Sometimes market depth data just doesn't want to download. But if you follow these steps, you should be able to get good files most of the time.

As you might have guessed, you need to have charts open for symbols in order for SC to download intraday and market depth data. I will update this guide later if I find an efficient way to ensure that depth and intraday data is kept up-to-date and clean for a large number of symbols.

If you have any questions in the meantime, please let me know!
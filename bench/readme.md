# Benchmarks

All apps employ two global middlewares with `req` mutations, an empty `GET` route handler for `favicon.ico` and a `GET` handler for the `/users/:id`, returning a `User: ${id}` string response.


Start the app for `dylan`
```sh
$ FRAMEWORK=polka node benchmarks/app.js
```

Start the app for `polka`
```sh
$ FRAMEWORK=polka node benchmarks/app.js
```

Start the app for `express`
```sh
$ FRAMEWORK=express node benchmarks/app.js
```

Results are taken after 1 warm-up run. The tool used for the benchmarks is `wrk` which can be installed using homebrew. Once installed run this command for your benchmark:
```sh
$ wrk -t8 -c100 -d30s http://localhost:3000/user/123
```

## Node v10.15.1 LTS

```
#=> DYLAN
Thread Stats    Avg     Stdev     Max   +/- Stdev
    Latency     2.53ms  358.85us  11.20ms   87.75%
    Req/Sec     4.77k   311.12     5.08k    89.11%
  117636 requests in 3.10s, 12.12MB read
Requests/sec:  37929.50
Transfer/sec:      3.91MB

#=> POLKA
Thread Stats    Avg     Stdev     Max   +/- Stdev
    Latency     2.66ms  489.23us  11.57ms   87.25%
    Req/Sec     4.53k   816.01    11.60k    95.47%
  109491 requests in 3.10s, 11.28MB read
Requests/sec:  35314.10
Transfer/sec:      3.64MB

#=> EXPRESS
Thread Stats    Avg     Stdev     Max   +/- Stdev
    Latency     3.90ms  485.22us   8.49ms   86.56%
    Req/Sec     3.08k   165.01     3.25k    86.29%
  76078 requests in 3.10s, 9.50MB read
Requests/sec:  24524.19
Transfer/sec:      3.06MB
```

# ISSUE 1: SERVER START UP ERROR

## ACTION I TOOK

I ran 'npx run dev' from the terminal

## ERROR

```
npm error could not determine executable to run
npm error A complete log of this run can be found in: C:\Users\Kennedy\AppData\Local\npm-cache\_logs\2026-10-06T14_24_05_465Z-debug-0.log
```


## LOG FILE

```
0 verbose cli C:\Program Files\nodejs\node.exe C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js
1 info using npm@10.9.4
2 info using node@v22.21.0
3 silly config load:file:C:\Program Files\nodejs\node_modules\npm\npmrc
4 silly config load:file:C:\Users\Kennedy\Projects\ghost-ai\.npmrc
5 silly config load:file:C:\Users\Kennedy\.npmrc
6 silly config load:file:C:\Users\Kennedy\AppData\Roaming\npm\etc\npmrc
7 verbose title npm exec run dev
8 verbose argv "exec" "--" "run" "dev"
9 verbose logfile logs-max:10 dir:C:\Users\Kennedy\AppData\Local\npm-cache\_logs\2026-10-06T14_24_05_465Z-
10 verbose logfile C:\Users\Kennedy\AppData\Local\npm-cache\_logs\2026-10-06T14_24_05_465Z-debug-0.log
11 silly logfile start cleaning logs, removing 1 files
12 silly packumentCache heap:4345298944 maxSize:1086324736 maxEntrySize:543162368
13 silly logfile done cleaning log files
14 http fetch GET 200 https://registry.npmjs.org/run 1258ms (cache revalidated)
15 verbose stack Error: could not determine executable to run
15 verbose stack     at getBinFromManifest (C:\Program Files\nodejs\node_modules\npm\node_modules\libnpmexec\lib\get-bin-from-manifest.js:17:23)
15 verbose stack     at exec (C:\Program Files\nodejs\node_modules\npm\node_modules\libnpmexec\lib\index.js:202:15)
15 verbose stack     at async Npm.exec (C:\Program Files\nodejs\node_modules\npm\lib\npm.js:207:9)
15 verbose stack     at async module.exports (C:\Program Files\nodejs\node_modules\npm\lib\cli\entry.js:74:5)
16 verbose pkgid run@2.1.7
17 error could not determine executable to run
18 verbose cwd C:\Users\Kennedy\Projects\ghost-ai
19 verbose os Windows_NT 10.0.26200
20 verbose node v22.21.0
21 verbose npm  v10.9.4
22 verbose exit 1
23 verbose code 1
24 error A complete log of this run can be found in: C:\Users\Kennedy\AppData\Local\npm-cache\_logs\2026-10-06T14_24_05_465Z-debug-0.log

```
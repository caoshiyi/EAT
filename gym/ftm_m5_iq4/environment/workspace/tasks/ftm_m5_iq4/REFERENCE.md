# Reference numbers on this M5 Pro (the eval's speed suite, greedy; tok/s)

| | starting code, UD-IQ4_XS | other GGUF implementation (branch `m5/gguf`), UD-Q4_K_XL | another engine, UD-Q4_K_XL, bf16 KV, every draft row verified | the same engine, defaults (int8 KV, learned verify subset) |
|---|---|---|---|---|
| decode, short prompt | 34.3 | 32.3 | 23.8 | 30.8 |
| prefill ~4K | 451 | 620 | 666 | 670 |
| prefill ~32K | 456 | 609 | 941 | 877 |
| prefill ~128K | 442 | 519 | 882 | 627 |
| prefill ~250K | 425 | 501 | 763 | 677 |
| decode after ~128K | 31.1 | 20.7 | 25.0 | 31.2 |
| decode after ~250K | 31.4 | 24.5 | 21.8 | 27.8 |
| peak wired memory | ~40 GiB | 39.6 GiB | 39.1 GiB | 37.9 GiB |

Column three is that engine with `--kv-format bf16 --verify-rows all`; column four with its defaults.

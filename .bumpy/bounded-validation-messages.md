---
"@discordkit/core": patch
---

`boundedInteger`, `boundedString` and `boundedArray` now describe themselves accurately when validation fails. These messages surface directly to end users in bots that forward validation errors, where the previous text was actively misleading.

Each message reported `issue.received.length` rather than `issue.received`. For `boundedInteger` that printed the number of characters in the input, so a rejected value of `99` reported "received has value: 2". For `boundedString` and `boundedArray` it was worse: valibot already sets `received` to the length for length-based checks, so `.length` measured that number's string form and reported `1` for every input regardless of size.

An upper bound of `0` was dropped from the message, because the bound was interpolated behind a truthiness check (`req.max ?`) while the schema itself uses `typeof req.max === "number"`. `boundedInteger({ min: -5, max: 0 })` enforced the maximum but never mentioned it.

The stated lower bound for `boundedString` and `boundedArray` also disagreed with the schema, claiming `>= 0` while both actually default to a minimum length of `1`.

Also adds the missing space in `>= 1 && <= 10` (previously `>= 1&& <= 10`) and corrects "legnth" to "length".

Reported by the team building [inbou](https://github.com/discordkit/inbou). No API or runtime behaviour changes — only the error text.

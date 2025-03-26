---
title: Using grep's -o and grep-format for clean output
date: 2023-10-15
slug: using-grepformat-in-grep
category: CLI, Bash, Text Processing
keywords: grep, text processing, command line, bash
---

Today I learned about a super handy grep feature - the combination of `-o` (only-matching) and `--grep-format` to create cleaner, more structured output.

Instead of getting the entire line with the match highlighted (grep's default), you can extract just the parts you want.

For example, to extract all IP addresses from a log file:

```bash
grep -E -o '([0-9]{1,3}\.){3}[0-9]{1,3}' logfile.txt
```

But the real power comes when you use capture groups with `--grep-format`:

```bash
grep -E -o 'user=(.*) status=(.*)' logfile.txt --grep-format='User: \1, Status: \2'
```

If your log contains lines like `user=admin status=active`, this transforms them into `User: admin, Status: active`.

This is especially useful for quickly extracting structured data from logs or config files without having to use more complex tools like awk or sed.

You can also extract specific fields from multiple files:

```bash
grep -E -o 'ERROR.*: (.*)' --include="*.log" --grep-format='\1' --recursive /var/log/
```

This shows just the error messages without the "ERROR: " prefix from all log files.

Quick tip to remember: `-o` extracts only the match, and `--grep-format` lets you reformat using `\1`, `\2` etc. for capture groups. 
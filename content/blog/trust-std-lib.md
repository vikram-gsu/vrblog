---
title: "Trust the Standard Library"
date: "2026-02-03"
readTime: "2 min"
excerpt: "Trust the Standard Library especially when writing code in high level languages like Python"
tags:
  - programming
  - best-practices
  - opinion
featured: false
image: ""
---

The concepts and considerations of an algorithm vary based on the usage of high level languages like Python vs a low level one like C/C++.

## Here's an example

> Problem: Check if a list contains duplicates

A simple Python implementation could look like:

```py
class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        return len(nums) != len(set(nums))
```

For longer lists however, it's theoretically better if we exit the loop as soon as we find the duplicate. So, a better approach would be:

```py
class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        s = set()
        for n in nums:
            if n in s:
                return True
            s.add(n)
        return False
```

Looking at a high level, I assumed the second solution would be faster. However, the first one was considerably faster. Here are the leetcode metrics for the first and second solutions respectively:
**First Solution:**

![First Solution](/assets/blog/leet/contains_duplicates_1.png)

**Second Solution:**

![Second Solution](/assets/blog/leet/contains_duplicates_2.png)

This is because the standard library is implemented in highly optimized C. Writing it explicitly in Python bytecode causes a delay. Even implementing the same program in C++ is slower than the python one liner version - shows how efficient the standard library is.

"""Generates content/tracker/agenda.yaml: what to do on each day of the 8-week plan.

Most tracks follow a weekly rhythm. The 15-day sprint (Oct 27 to Nov 10) overrides it:
LeetCode 75 by Nov 6, the Stanford Algorithms lectures, a system design lab and server work
(Sundays off), Xu's book a chapter a day, and harness/experiments paused.
"""
import json
import re
import sys
from datetime import date, timedelta

START = date(2026, 10, 23)
END = date(2026, 12, 20)
SPRINT_START = date(2026, 10, 27)
SPRINT_END = date(2026, 11, 10)
OUT = sys.argv[1]

RASBT = "https://github.com/rasbt/LLMs-from-scratch/tree/main"
# Paced for understanding: read, type out and run the code, do the exercises. No skimming.
LLM = [
    ("Ch 1 · Understanding large language models", None),
    ("Appendix A · A.1–A.4 PyTorch tensors and autograd", None),
    ("Appendix A · A.5–A.9 Multilayer nets, data loaders, training loop, GPU", None),
    ("Ch 2 · 2.1–2.4 Word embeddings, tokenizing, token IDs, special tokens", None),
    ("Ch 2 · 2.5–2.8 Byte pair encoding, sliding-window sampling, token + positional embeddings", None),
    ("Ch 3 · 3.1–3.4 Why attention; simple self-attention; trainable weights", None),
    ("Ch 3 · 3.5–3.6 Causal attention, dropout, multi-head attention", None),
    ("Ch 4 · 4.1–4.3 GPT architecture, layer norm, GELU feed-forward", None),
    ("Ch 4 · 4.4–4.7 Shortcut connections, transformer block, assemble GPT, generate text", None),
    ("Bonus · Add a KV cache to your GPT model", f"{RASBT}/ch04/03_kv-cache"),
    ("Ch 5 · 5.1 Evaluating generative models (loss, perplexity)", None),
    ("Ch 5 · 5.2 Training the LLM", None),
    ("Ch 5 · 5.3 Decoding: temperature and top-k sampling", None),
    ("Ch 5 · 5.4–5.5 Save/load weights, load OpenAI GPT-2 weights", None),
    ("Ch 6 · 6.1–6.4 Classification fine-tuning: dataset, loaders, init", None),
    ("Ch 6 · 6.5–6.8 Classification head, loss/accuracy, train, spam classifier", None),
    ("Ch 7 · 7.1–7.4 Instruction data, batching, data loaders", None),
    ("Ch 7 · 7.5–7.6 Load pretrained model, instruction fine-tune", None),
    ("Ch 7 · 7.7–7.9 Extract responses, evaluate with an LLM judge", None),
    ("Appendix D · LR warmup, cosine decay, gradient clipping", None),
    ("Appendix E · Parameter-efficient fine-tuning with LoRA", None),
]

# Section names follow the 1st edition; you're already into Transactions.
DDIA = [
    "Transactions · ACID; single- vs multi-object operations",
    "Transactions · Weak isolation: read committed, snapshot isolation, lost updates",
    "Transactions · Write skew, phantoms; serializability (serial, 2PL, SSI)",
    "Trouble with Distributed Systems · Faults, partial failures, unreliable networks",
    "Trouble with Distributed Systems · Unreliable clocks",
    "Trouble with Distributed Systems · Knowledge, truth and lies (quorums, fencing)",
    "Consistency & Consensus · Consistency guarantees, linearizability",
    "Consistency & Consensus · Ordering guarantees, total order broadcast",
    "Consistency & Consensus · Distributed transactions, 2PC",
    "Consistency & Consensus · Fault-tolerant consensus, coordination services",
    "Batch Processing · Unix tools, MapReduce and distributed filesystems",
    "Batch Processing · Beyond MapReduce: dataflow engines, graphs",
    "Stream Processing · Transmitting event streams (brokers, logs)",
    "Stream Processing · Databases and streams (CDC, event sourcing), processing",
    "Future of Data Systems · Data integration, unbundling databases",
    "Future of Data Systems · Aiming for correctness, doing the right thing",
]

# One session per item. A chapter a day (Sundays off) from Oct 27 to Nov 10, then done.
XU = [
    ["Ch 1 · Scale from zero to millions of users", "Ch 2 · Back-of-the-envelope estimation"],
    ["Ch 3 · A framework for system design interviews"],
    ["Ch 4 · Design a rate limiter"],
    ["Ch 5 · Design consistent hashing"],
    ["Ch 6 · Design a key-value store"],
    ["Ch 7 · Design a unique ID generator", "Ch 8 · Design a URL shortener"],
    ["Ch 9 · Design a web crawler"],
    ["Ch 10 · Design a notification system"],
    ["Ch 11 · Design a news feed system"],
    ["Ch 12 · Design a chat system"],
    ["Ch 13 · Design a search autocomplete system"],
    ["Ch 14 · Design YouTube"],
    ["Ch 15 · Design Google Drive", "Ch 16 · The learning continues"],
]
XU_DAILY = (date(2026, 10, 27), date(2026, 11, 10))

# LeetCode 75 study plan, in its topic order.
LC75 = [
    (1768, "Merge Strings Alternately"), (1071, "Greatest Common Divisor of Strings"),
    (1431, "Kids With the Greatest Number of Candies"), (605, "Can Place Flowers"),
    (345, "Reverse Vowels of a String"), (151, "Reverse Words in a String"),
    (238, "Product of Array Except Self"), (334, "Increasing Triplet Subsequence"),
    (443, "String Compression"),
    (283, "Move Zeroes"), (392, "Is Subsequence"), (11, "Container With Most Water"),
    (1679, "Max Number of K-Sum Pairs"),
    (643, "Maximum Average Subarray I"),
    (1456, "Maximum Number of Vowels in a Substring of Given Length"),
    (1004, "Max Consecutive Ones III"),
    (1493, "Longest Subarray of 1's After Deleting One Element"),
    (1732, "Find the Highest Altitude"), (724, "Find Pivot Index"),
    (2215, "Find the Difference of Two Arrays"), (1207, "Unique Number of Occurrences"),
    (1657, "Determine if Two Strings Are Close"), (2352, "Equal Row and Column Pairs"),
    (2390, "Removing Stars From a String"), (735, "Asteroid Collision"), (394, "Decode String"),
    (933, "Number of Recent Calls"), (649, "Dota2 Senate"),
    (2095, "Delete the Middle Node of a Linked List"), (328, "Odd Even Linked List"),
    (206, "Reverse Linked List"), (2130, "Maximum Twin Sum of a Linked List"),
    (104, "Maximum Depth of Binary Tree"), (872, "Leaf-Similar Trees"),
    (1448, "Count Good Nodes in Binary Tree"), (437, "Path Sum III"),
    (1372, "Longest ZigZag Path in a Binary Tree"), (236, "Lowest Common Ancestor of a Binary Tree"),
    (199, "Binary Tree Right Side View"), (1161, "Maximum Level Sum of a Binary Tree"),
    (700, "Search in a Binary Search Tree"), (450, "Delete Node in a BST"),
    (841, "Keys and Rooms"), (547, "Number of Provinces"),
    (1466, "Reorder Routes to Make All Paths Lead to the City Zero"), (399, "Evaluate Division"),
    (1926, "Nearest Exit from Entrance in Maze"), (994, "Rotting Oranges"),
    (215, "Kth Largest Element in an Array"), (2336, "Smallest Number in Infinite Set"),
    (2542, "Maximum Subsequence Score"), (2462, "Total Cost to Hire K Workers"),
    (374, "Guess Number Higher or Lower"), (2300, "Successful Pairs of Spells and Potions"),
    (162, "Find Peak Element"), (875, "Koko Eating Bananas"),
    (17, "Letter Combinations of a Phone Number"), (216, "Combination Sum III"),
    (1137, "N-th Tribonacci Number"), (746, "Min Cost Climbing Stairs"),
    (198, "House Robber"), (790, "Domino and Tromino Tiling"),
    (62, "Unique Paths"), (1143, "Longest Common Subsequence"),
    (714, "Best Time to Buy and Sell Stock with Transaction Fee"), (72, "Edit Distance"),
    (338, "Counting Bits"), (136, "Single Number"),
    (1318, "Minimum Flips to Make a OR b Equal to c"),
    (208, "Implement Trie (Prefix Tree)"), (1268, "Search Suggestions System"),
    (435, "Non-overlapping Intervals"), (452, "Minimum Number of Arrows to Burst Balloons"),
    (739, "Daily Temperatures"), (901, "Online Stock Span"),
]

HARNESS = [
    "Study: how agent harnesses work (agent loop, tools, permissions); sketch your design",
    "Agent loop from scratch: messages, tool calls, stop conditions, no framework",
    "Tool registry: JSON schemas, validation, sandboxed execution in Docker",
    "Permission layer: allow / deny / ask, with 'ask' routed to WhatsApp",
    "Memory and context: persist conversations, compact when long",
    "Observability: trace every step to JSONL, a tiny viewer page",
    "Evals: a handful of scripted tasks, run and score them; refactor and publish the repo",
]

PAPERS = [
    ("Attention Is All You Need (Vaswani et al., 2017)", "https://arxiv.org/abs/1706.03762"),
    ("Building effective agents (Anthropic, 2024)", "https://www.anthropic.com/engineering/building-effective-agents"),
    ("ReAct: Synergizing Reasoning and Acting in LMs (Yao et al., 2022)", "https://arxiv.org/abs/2210.03629"),
    ("GPT-2: Language Models are Unsupervised Multitask Learners (Radford et al., 2019)", "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"),
    ("Raft: In Search of an Understandable Consensus Algorithm (Ongaro & Ousterhout, 2014)", "https://raft.github.io/raft.pdf"),
    ("InstructGPT: Training LMs to follow instructions (Ouyang et al., 2022)", "https://arxiv.org/abs/2203.02155"),
    ("Effective context engineering for AI agents (Anthropic, 2025)", "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"),
    ("LoRA: Low-Rank Adaptation of LLMs (Hu et al., 2021)", "https://arxiv.org/abs/2106.09685"),
]




# LeetCode 75: what was actually done on past days, then how many problems each later day gets
# (in study-plan order, skipping ones already done).
LC75_DONE = {
    "2026-10-23": [1768, 1071],
    "2026-10-26": [1431, 605, 345, 151],
    "2026-10-27": [238, 283, 392],
}
LC75_DAYS = {
    "2026-10-28": 8,  # rest of array/string, two pointers, sliding window
    "2026-10-29": 6,  # prefix sum, hash map/set
    "2026-10-30": 7,  # stack, queue, linked list
    "2026-10-31": 6,  # linked list, binary tree DFS
    "2026-11-01": 6,  # binary tree DFS/BFS, BST
    "2026-11-02": 6,  # graph DFS/BFS
    "2026-11-03": 6,  # heap, binary search
    "2026-11-04": 7,  # binary search, backtracking, 1D DP
    "2026-11-05": 6,  # DP, counting bits
    "2026-11-06": 8,  # bits, trie, intervals, monotonic stack
}
REDO = ("Redo the problems you starred (stuck past 25 min)", None)
MOCK = ("Timed mock: 2 unseen mediums in 45 min", None)
# Blind 75 problems that LeetCode 75 skips.
BLIND_SPRINT = {
    "2026-11-07": [(1, "Two Sum"), (217, "Contains Duplicate"), (347, "Top K Frequent Elements"),
                   (128, "Longest Consecutive Sequence"), (15, "3Sum"),
                   (3, "Longest Substring Without Repeating Characters")],
    "2026-11-08": [(76, "Minimum Window Substring"), (20, "Valid Parentheses"), (23, "Merge k Sorted Lists"),
                   (146, "LRU Cache"), (297, "Serialize and Deserialize Binary Tree"),
                   (98, "Validate Binary Search Tree")],
    "2026-11-09": [(200, "Number of Islands"), (207, "Course Schedule"), (133, "Clone Graph"),
                   (417, "Pacific Atlantic Water Flow"), (322, "Coin Change"),
                   (300, "Longest Increasing Subsequence")],
    "2026-11-10": [(139, "Word Break"), (33, "Search in Rotated Sorted Array"), (56, "Merge Intervals"),
                   (57, "Insert Interval"), (295, "Find Median from Data Stream"), (53, "Maximum Subarray")],
}
# The rest of Blind 75 (premium-only ones left out), 1–2 per weekday after the sprint.
BLIND_AFTER = [
    [(121, "Best Time to Buy and Sell Stock")],
    [(152, "Maximum Product Subarray"), (153, "Find Minimum in Rotated Sorted Array")], [(55, "Jump Game")],
    [(73, "Set Matrix Zeroes")], [(54, "Spiral Matrix")], [(48, "Rotate Image")],
    [(242, "Valid Anagram"), (49, "Group Anagrams")], [(125, "Valid Palindrome")],
    [(424, "Longest Repeating Character Replacement")], [(5, "Longest Palindromic Substring")],
    [(647, "Palindromic Substrings")],
    [(191, "Number of 1 Bits"), (190, "Reverse Bits")], [(268, "Missing Number"), (371, "Sum of Two Integers")],
    [(70, "Climbing Stairs"), (213, "House Robber II")], [(91, "Decode Ways")], [(377, "Combination Sum IV")],
    [(141, "Linked List Cycle"), (21, "Merge Two Sorted Lists")], [(19, "Remove Nth Node From End of List")],
    [(143, "Reorder List")],
    [(100, "Same Tree"), (226, "Invert Binary Tree")], [(102, "Binary Tree Level Order Traversal")],
    [(572, "Subtree of Another Tree")], [(105, "Construct Binary Tree from Preorder and Inorder Traversal")],
    [(230, "Kth Smallest Element in a BST"), (235, "Lowest Common Ancestor of a Binary Search Tree")],
    [(124, "Binary Tree Maximum Path Sum")],
    [(211, "Design Add and Search Words Data Structure")], [(79, "Word Search")], [(212, "Word Search II")],
]

# Stanford Algorithms 1 (Roughgarden), first video of each section. Optional/Advanced videos skipped.
PLAYLIST = "PLXFMmlk03Dt7Q0xr1PIAriY5623cKiH7V"
LECTURES = {
    # Sections 1–5 were done early, on Oct 26 (see log.yaml). Every other day from here.
    "2026-10-28": [("Sec 8 · Linear-time selection", "nFw6x7DoYbs"),
                   ("Sec 9 · Graphs and minimum cuts", "4Ih3UhVuEtw")],
    "2026-10-30": [("Sec 10 · Graph search: BFS, DFS, topological sort, SCCs", "SW6jwg7WS48")],
    "2026-11-01": [("Sec 11 · Dijkstra's shortest paths", "jRlNVmRjdRk"),
                   ("Sec 12 · Heaps", "cMrQxxrKg8I")],
    "2026-11-03": [("Sec 13 · Balanced search trees", "IbNZ-x1I2IM")],
    "2026-11-05": [("Sec 14 · Hash tables", "Qu183GFHbZQ"),
                   ("Sec 15 · Universal hashing", "MWq8BvRR950"),
                   ("Sec 16 · Bloom filters", "zYlxP7F3Z3c")],
}

BREAKSCALE = "https://breakscale.tech"
HANDBOOK = "https://handbook.modular.com"
GENAI_SDI = "https://bytebytego.com/courses/genai-system-design-interview"
VIDUR = "https://github.com/microsoft/vidur"
# Sundays off. The GenAI SDI book arrives Fri 10/30.
SD_LAB = {
    "2026-10-28": [("Breakscale: rebuild Xu Ch 1 (LB, app, cache, DB + replica); push load until p99 breaks, note the numbers", BREAKSCALE)],
    "2026-10-29": [("LLM Inference Handbook · foundations: prefill vs decode, TTFT, tokens/sec, KV cache", HANDBOOK)],
    "2026-10-30": [("Lab: llama.cpp/Ollama server on the box; load test at 1, 4, 16 concurrent users; chart TTFT and tokens/sec", None)],
    "2026-10-31": [("GenAI System Design Interview Ch 1 · the framework", GENAI_SDI)],
    "2026-11-02": [("LLM Inference Handbook · batching (static vs continuous), PagedAttention", HANDBOOK),
                   ("Design: an LLM inference API (streaming, rate limits, multi-tenant)", None)],
    "2026-11-03": [("Breakscale: retry storms, circuit breakers, backpressure, applied to an LLM gateway", BREAKSCALE)],
    "2026-11-04": [("GenAI System Design Interview · the chatbot chapter; then design it yourself in 45 min", GENAI_SDI)],
    "2026-11-05": [("GenAI System Design Interview · the RAG chapter", GENAI_SDI)],
    "2026-11-06": [("Lab: small RAG service on the server with pgvector; retrieval vs generation latency", None)],
    "2026-11-07": [("Vidur: estimate a serving setup by hand, then find the cheapest config that meets a latency SLO", VIDUR)],
    "2026-11-09": [("Mock: URL shortener, 45 min, written up", None),
                   ("Mock: an LLM-powered support agent, 45 min, written up", None)],
    "2026-11-10": [("Mock: RAG over company docs, 45 min", None),
                   ("Mock: an inference batching system for a single GPU, 45 min", None)],
}

# Daily during the sprint (Sundays off), then back to Tue/Thu.
AGENTS = [
    "Server: inventory the machine (CPU, RAM, disk, GPU?); install Ubuntu Server 24.04 LTS, SSH keys only",
    "Server: DHCP reservation; harden it (ufw, unattended-upgrades, no password SSH); add Tailscale",
    "Server: Docker + compose; Ollama + a small model (tomorrow's lab uses it)",
    "Server: a hello service you can reach from your phone over Tailscale; Claude API key in place",
    "Agent: a minimal agent loop on the server against the Claude API, one tool",
    "WhatsApp: run scripts/setup-whatsapp.sh so the tracker bot is live",
    "WhatsApp: receive webhooks on the server via Tailscale Funnel",
    "Approvals: agent asks yes/no on WhatsApp before a gated tool call",
    "Browser: Playwright on the server; headless navigate a showtimes page",
    "Movie agent v0: find showtimes for a movie + theater (read-only)",
    "Movie agent: look up coupons and card offers, compare total price",
    "Movie agent: propose a booking plan and ask for approval on WhatsApp",
    "Movie agent: drive checkout up to the payment page, stop there (dry run)",
    "Reliability: retries, timeouts, structured logs for every run",
    "Demo + write-up: blog post on what worked and what didn't",
]

# One-off additions on top of the generated days.
EXTRA = {
    "2026-10-28": {"ddia": [("Carried over from Tue: Transactions · isolation, durability; "
                             "single- vs multi-object operations", None)]},
    "2026-10-30": {"blogs-papers": [("Carried over from Sun: Attention Is All You Need (Vaswani et al., 2017)",
                                     "https://arxiv.org/abs/1706.03762")]},
    "2026-11-11": {"agent-harnesses": [("Carried over from Sat 10/24: Study how agent harnesses work "
                                        "(agent loop, tools, permissions); sketch your design", None)]},
}

# Weekly rhythm outside the sprint (0 = Monday).
WEEKLY = {
    "llm-from-scratch": {0, 2, 4}, "ddia": {1, 3}, "system-design-xu": {5}, "blogs-papers": {6},
    "agents": {1, 3}, "agent-harnesses": {5}, "experiments": {6},
}
# Reading keeps its rhythm through the sprint; these change during it.
SPRINT_DAILY = {"agents"}  # except Sundays, and from Oct 28 (Oct 27's moved a day)
SPRINT_PAUSED = {"agent-harnesses", "experiments"}


def slug(title: str) -> str:
    s = title.lower().replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def item(title, link=None):
    return {"title": title, **({"link": link} if link else {})}


def problem(n, title):
    return item(f"{n}. {title}", f"https://leetcode.com/problems/{slug(title)}/")


def leetcode_plan():
    """date -> items. LC75 by LC75_DONE/LC75_DAYS, Blind 75 in the sprint's last days, then 1–2 a weekday."""
    by_number = dict(LC75)
    days = {d: [problem(n, by_number[n]) for n in ns] for d, ns in LC75_DONE.items()}
    done = {n for ns in LC75_DONE.values() for n in ns}
    left = [p for p in LC75 if p[0] not in done]
    i = 0
    for d, count in LC75_DAYS.items():
        days[d] = [problem(*p) for p in left[i:i + count]]
        i += count
    assert i == len(left), f"LC75_DAYS covers {i} of {len(left)}"
    for d, problems in BLIND_SPRINT.items():
        days[d] = [item(*REDO)] + [problem(*p) for p in problems] + [item(*MOCK)]
    rest = list(BLIND_AFTER)
    d = SPRINT_END + timedelta(days=1)
    while d <= END:
        if d.weekday() < 5:
            days[d.isoformat()] = [problem(*p) for p in rest.pop(0)] if rest else [
                item("Review: redo two starred problems, timed")]
        d += timedelta(days=1)
    assert not rest, f"{len(rest)} Blind 75 days unscheduled"
    return days


def main():
    in_sprint = lambda d: SPRINT_START <= d <= SPRINT_END
    queues = {
        "llm-from-scratch": [[item(t, l)] for t, l in LLM],
        "ddia": [[item(t)] for t in DDIA],
        "system-design-xu": [[item(t) for t in pair] for pair in XU],
        "blogs-papers": [[item(t, l)] for t, l in PAPERS],
        "agents": [[item(t)] for t in AGENTS],
        "agent-harnesses": [[item(t)] for t in HARNESS],
        "experiments": [],
    }
    # Used once a track's list runs out before the plan ends.
    fillers = {
        "llm-from-scratch": "Review: re-run chapter code, redo skipped exercises",
        "system-design-xu": "Review: redo two designs from memory, timed",
        "blogs-papers": "Open slot: whatever is worth reading this week",
        "agents": "Extend the movie agent, or start the next agent idea",
        "agent-harnesses": "Polish: fix the rough edges the evals found",
        "experiments": "Catch-up buffer: finish anything missed this week, else free experiment",
    }
    dated = {
        "algorithms-lectures": {d: [item(t, f"https://www.youtube.com/watch?v={v}&list={PLAYLIST}") for t, v in vs]
                                for d, vs in LECTURES.items()},
        "leetcode": leetcode_plan(),
        "system-design-lab": {d: [item(t, l) for t, l in vs] for d, vs in SD_LAB.items()},
    }

    def scheduled(task, d):
        if task == "system-design-xu" and XU_DAILY[0] <= d <= XU_DAILY[1]:
            return d.weekday() != 6
        if in_sprint(d) and task in SPRINT_DAILY:
            return d.weekday() != 6 and d > SPRINT_START
        if in_sprint(d) and task in SPRINT_PAUSED:
            return False
        return d.weekday() in WEEKLY[task]

    order = ["llm-from-scratch", "ddia", "system-design-xu", "blogs-papers", "algorithms-lectures",
             "leetcode", "system-design-lab", "agents", "agent-harnesses", "experiments"]
    lines = [
        "# What to do on each day of the plan, generated by scripts/gen-agenda.py.",
        "# Each date maps task ids (from plan.yaml) to a list of {title, link?}.",
        "# A task is scheduled on a day exactly when it has items here.",
        "days:",
    ]
    d = START
    while d <= END:
        iso = d.isoformat()
        todays = {}
        for task in order:
            if task in dated:
                items = dated[task].get(iso, [])
            elif scheduled(task, d):
                q = queues[task]
                items = q.pop(0) if q else [item(fillers[task])]
            else:
                items = []
            items = items + [item(t, l) for t, l in EXTRA.get(iso, {}).get(task, [])]
            if items:
                todays[task] = items
        lines.append(f'  "{iso}":' + ("" if todays else " {}"))
        for task, items in todays.items():
            lines.append(f"    {task}:")
            for it in items:
                lines.append(f"      - {json.dumps(it, ensure_ascii=False)}")
        d += timedelta(days=1)
    leftovers = {t: len(q) for t, q in queues.items() if q}
    assert not leftovers, f"unscheduled items: {leftovers}"
    open(OUT, "w").write("\n".join(lines) + "\n")


main()

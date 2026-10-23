"""Generates content/tracker/agenda.yaml: what to do on each day of the 8-week plan."""
import json
import re
import sys
from datetime import date, timedelta

START = date(2026, 10, 23)
END = date(2026, 12, 20)
OUT = sys.argv[1]

LLM = [
    "Ch 1 · Understanding large language models",
    "Appendix A · A.1–A.4 PyTorch tensors and autograd",
    "Appendix A · A.5–A.9 Multilayer nets, data loaders, training loop, GPU",
    "Ch 2 · 2.1–2.4 Word embeddings, tokenizing, token IDs, special tokens",
    "Ch 2 · 2.5–2.6 Byte pair encoding, sliding-window data sampling",
    "Ch 2 · 2.7–2.8 Token embeddings and positional encodings",
    "Ch 3 · 3.1–3.3 Why attention; simple self-attention",
    "Ch 3 · 3.4 Self-attention with trainable weights",
    "Ch 3 · 3.5 Causal attention and dropout",
    "Ch 3 · 3.6 Multi-head attention",
    "Ch 4 · 4.1–4.3 GPT architecture, layer norm, GELU feed-forward",
    "Ch 4 · 4.4–4.5 Shortcut connections, the transformer block",
    "Ch 4 · 4.6–4.7 Assemble the GPT model, generate text",
    "Ch 5 · 5.1 Evaluating generative models (loss, perplexity)",
    "Ch 5 · 5.2 Training the LLM",
    "Ch 5 · 5.3 Decoding: temperature and top-k sampling",
    "Ch 5 · 5.4–5.5 Save/load weights, load OpenAI GPT-2 weights",
    "Ch 6 · 6.1–6.4 Classification fine-tuning: dataset, loaders, init",
    "Ch 6 · 6.5–6.8 Classification head, loss/accuracy, train, spam classifier",
    "Ch 7 · 7.1–7.4 Instruction data, batching, data loaders",
    "Ch 7 · 7.5–7.6 Load pretrained model, instruction fine-tune",
    "Ch 7 · 7.7–7.9 Extract responses, evaluate with an LLM judge",
    "Appendix D · LR warmup, cosine decay, gradient clipping",
    "Appendix E · Parameter-efficient fine-tuning with LoRA",
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

XU = [
    ["Ch 1 · Scale from zero to millions of users", "Ch 2 · Back-of-the-envelope estimation"],
    ["Ch 3 · A framework for system design interviews", "Ch 4 · Design a rate limiter"],
    ["Ch 5 · Design consistent hashing", "Ch 6 · Design a key-value store"],
    ["Ch 7 · Design a unique ID generator", "Ch 8 · Design a URL shortener"],
    ["Ch 9 · Design a web crawler", "Ch 10 · Design a notification system"],
    ["Ch 11 · Design a news feed system", "Ch 12 · Design a chat system"],
    ["Ch 13 · Design a search autocomplete system", "Ch 14 · Design YouTube"],
    ["Ch 15 · Design Google Drive", "Ch 16 · The learning continues (review weak spots)"],
]

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
# Harder ones get a day to themselves; everything else is paired.
SOLO = {399, 790, 72}

AGENTS = [
    "Server: inventory the machine (CPU, RAM, disk, GPU?); pick Ubuntu Server 24.04 LTS",
    "Server: install Ubuntu, SSH keys only, DHCP reservation on the router",
    "Server: harden it (ufw, unattended-upgrades, no password SSH); add Tailscale",
    "Server: Docker + compose; run a hello service you can reach from your phone",
    "Server: Ollama + a small model on CPU; benchmark tokens/sec; set up Claude API key",
    "Agent: run your harness loop on the server against the Claude API, one tool",
    "WhatsApp: Cloud API test number (or Twilio sandbox); receive a webhook via Tailscale Funnel",
    "WhatsApp: tracker bot, 'ddia 45 ch8' commits a line to log.yaml",
    "Approvals: agent asks yes/no on WhatsApp before a gated tool call",
    "Browser: Playwright on the server; headless navigate a showtimes page",
    "Movie agent v0: find showtimes for a movie + theater (read-only)",
    "Movie agent: look up coupons and card offers, compare total price",
    "Movie agent: propose a booking plan and ask for approval on WhatsApp",
    "Movie agent: drive checkout up to the payment page, stop there (dry run)",
    "Reliability: retries, timeouts, structured logs for every run",
    "Demo + write-up: blog post on what worked and what didn't",
]

HARNESS = [
    "Study: how agent harnesses work (agent loop, tools, permissions); sketch your design",
    "Agent loop from scratch: messages, tool calls, stop conditions, no framework",
    "Tool registry: JSON schemas, validation, sandboxed execution in Docker",
    "Permission layer: allow / deny / ask, with 'ask' routed to WhatsApp",
    "Memory and context: persist conversations, compact when long",
    "Observability: trace every step to JSONL, a tiny viewer page",
    "Evals: a handful of scripted tasks, run and score them",
    "Refactor + publish the harness repo",
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


def slug(title: str) -> str:
    s = title.lower().replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def leetcode_days():
    days, i = [], 0
    while i < len(LC75):
        cur = LC75[i]
        nxt = LC75[i + 1] if i + 1 < len(LC75) else None
        if cur[0] in SOLO or nxt is None or nxt[0] in SOLO:
            days.append([cur]); i += 1
        else:
            days.append([cur, nxt]); i += 2
    return days


def item(title, link=None):
    return {"title": title, **({"link": link} if link else {})}


def main():
    queues = {
        "llm-from-scratch": [[item(t)] for t in LLM],
        "ddia": [[item(t)] for t in DDIA],
        "system-design-xu": [[item(t) for t in pair] for pair in XU],
        "blogs-papers": [[item(t, l)] for t, l in PAPERS],
        "leetcode": [
            [item(f"{n}. {t}", f"https://leetcode.com/problems/{slug(t)}/") for n, t in day]
            for day in leetcode_days()
        ],
        "agents": [[item(t)] for t in AGENTS],
        "agent-harnesses": [[item(t)] for t in HARNESS],
        "experiments": [],
    }
    # Used once a track's list runs out before the plan ends.
    fillers = {
        "llm-from-scratch": "Review: re-run chapter code, redo skipped exercises",
        "system-design-xu": "Review: redo two designs from memory, timed",
        "blogs-papers": "Open slot: whatever is worth reading this week",
        "agent-harnesses": "Polish: fix the rough edges the evals found",
        "experiments": "Catch-up buffer: finish anything missed this week, else free experiment",
    }
    schedule = {
        "llm-from-scratch": {0, 2, 4}, "ddia": {1, 3}, "system-design-xu": {5},
        "blogs-papers": {6}, "leetcode": {0, 1, 2, 3, 4}, "agents": {1, 3},
        "agent-harnesses": {5}, "experiments": {6},
    }
    lines = [
        "# What to do on each day of the plan, generated from the study lists.",
        "# Edit freely: each date maps task ids (from plan.yaml) to a list of {title, link?}.",
        "days:",
    ]
    d = START
    while d <= END:
        todays = [
            (t, queues[t].pop(0) if queues[t] else [item(fillers[t])])
            for t in queues
            if d.weekday() in schedule[t]
        ]
        lines.append(f'  "{d.isoformat()}":')
        for task, items in todays:
            lines.append(f"    {task}:")
            for it in items:
                lines.append(f"      - {json.dumps(it, ensure_ascii=False)}")
        d += timedelta(days=1)
    leftovers = {t: len(q) for t, q in queues.items() if q}
    assert not leftovers, f"unscheduled items: {leftovers}"
    open(OUT, "w").write("\n".join(lines) + "\n")
    print(f"{len(LC75)} LeetCode problems over {len(leetcode_days())} days")


main()

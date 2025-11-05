export interface BlogPost {
  id: number;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string[];
  featured: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Understanding Python Decorators: A Deep Dive",
    date: "2024-11-01",
    readTime: "8 min",
    excerpt: "Decorators are one of Python's most powerful features, yet they remain mysterious to many developers. Let's demystify them with practical examples.",
    content: `Decorators are one of Python's most powerful features, yet they remain mysterious to many developers. At their core, decorators are simply functions that modify the behavior of other functions or classes.

## What is a Decorator?

A decorator is a design pattern in Python that allows you to modify or extend the behavior of functions or methods without permanently modifying them. They use the @ symbol and are placed above the function definition.

\`\`\`python
def my_decorator(func):
    def wrapper():
        print("Before function call")
        func()
        print("After function call")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")
\`\`\`

## Why Use Decorators?

Decorators are incredibly useful for:
- Logging function calls
- Measuring execution time
- Input validation
- Caching results
- Authentication and authorization

## Practical Example: Timing Functions

Here's a real-world example of a decorator that measures execution time:

\`\`\`python
import time
from functools import wraps

def timing_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timing_decorator
def slow_function():
    time.sleep(2)
    return "Done!"
\`\`\`

Decorators are essential for writing clean, reusable Python code. Master them and you'll unlock a new level of Pythonic elegance.`,
    tags: ["python", "tutorial", "design-patterns"],
    featured: true
  },
  {
    id: 2,
    title: "The Art of Writing Readable Code",
    date: "2024-10-28",
    readTime: "6 min",
    excerpt: "Code is read far more often than it's written. Here's how to make your code a joy to read for your future self and your teammates.",
    content: `We've all been there: opening a file we wrote six months ago and having absolutely no idea what it does. Or worse, inheriting someone else's cryptic codebase that reads like an encrypted message.

## Code is Communication

The primary purpose of code isn't to tell the computer what to do—compilers are great at understanding terrible code. The real purpose is to communicate your intentions to other humans (including future you).

## Principles of Readable Code

### 1. Names Matter
Choose descriptive, unambiguous names:

\`\`\`javascript
// Bad
const d = new Date();
const x = getUserData();

// Good
const currentDate = new Date();
const activeUserProfile = getUserData();
\`\`\`

### 2. Functions Should Do One Thing
If you can't name a function without using "and" or "or", it's doing too much.

### 3. Comments Explain Why, Not What
Your code should explain what it does. Comments should explain why you made certain decisions.

\`\`\`javascript
// Bad comment
// Increment counter by 1
counter++;

// Good comment
// We start at index 1 because the API response includes a header row
for (let i = 1; i < data.length; i++) {
\`\`\`

## The Boy Scout Rule

Leave code cleaner than you found it. Every time you touch a file, make one small improvement. These micro-improvements compound over time.

Remember: code quality is not about perfection. It's about clear communication and maintainability.`,
    tags: ["programming", "best-practices", "opinion"],
    featured: false
  },
  {
    id: 3,
    title: "My Journey from Bootcamp to Senior Engineer",
    date: "2024-10-15",
    readTime: "10 min",
    excerpt: "Five years ago, I couldn't write a for loop. Today, I'm leading a team of engineers. Here's what I learned along the way.",
    content: `Five years ago, I walked into a coding bootcamp with zero programming experience. I had spent the previous decade in comedy and photography, and the idea of becoming a software engineer seemed absurd. Today, I'm a senior engineer at a tech company, leading a team and architecting systems used by millions.

This isn't a humblebrag. It's a story about persistence, learning to learn, and the non-linear path to mastery.

## The Bootcamp Reality Check

Bootcamps promise to turn you into a developer in 12 weeks. The reality? They give you just enough knowledge to be dangerous and—more importantly—enough foundation to keep learning.

I graduated bootcamp barely understanding async/await. I couldn't explain closures. I copy-pasted code from Stack Overflow without understanding it.

## Year One: The Struggle

My first job was humbling. I spent entire days trying to understand code reviews. I asked "stupid" questions constantly. I felt like an impostor.

Here's what saved me:
- **Building things outside work**: Side projects where I could fail privately
- **Reading code**: I spent hours reading open-source codebases
- **Finding mentors**: Senior engineers who actually wanted to help

## Year Three: The Breakthrough

Something shifted around year three. I could solve problems I once thought impossible. I started seeing patterns. I began mentoring junior developers.

The difference wasn't intelligence—it was accumulated experience and pattern recognition.

## What I'd Tell My Past Self

1. **Impostor syndrome never fully goes away**: Even senior engineers Google basic syntax
2. **Depth > Breadth**: Master fundamentals before chasing the latest framework
3. **Teaching is learning**: Writing tutorials solidified my understanding more than any course
4. **The journey is non-linear**: You'll plateau, regress, then suddenly leap forward

If you're early in your journey: keep going. The struggle is part of the process. The confusion is temporary. The growth is real.`,
    tags: ["career", "personal", "coding-journey"],
    featured: true
  }
];

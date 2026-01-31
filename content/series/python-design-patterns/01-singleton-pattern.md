---
title: "The Singleton Pattern"
date: "2024-10-01"
readTime: "10 min"
excerpt: "Learn how to ensure a class has only one instance while providing a global access point to it."
---

The Singleton pattern ensures a class has only one instance and provides a global point of access to it. While often considered an anti-pattern in some contexts, it has legitimate use cases in Python.

## When to Use Singleton

- Database connections
- Configuration managers
- Logging systems
- Cache implementations

## Python Implementation

Here's the classic implementation using a metaclass:

```python
class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        self.connection = self._create_connection()
    
    def _create_connection(self):
        return "Database Connection"
```

## Modern Alternative: Module-Level Singleton

In Python, modules are singletons by nature. A simpler approach:

```python
# database.py
class _Database:
    def __init__(self):
        self.connection = "Database Connection"

# Module-level instance
db = _Database()
```

## Thread-Safe Implementation

For multi-threaded applications:

```python
import threading

class ThreadSafeSingleton(type):
    _instances = {}
    _lock = threading.Lock()
    
    def __call__(cls, *args, **kwargs):
        with cls._lock:
            if cls not in cls._instances:
                cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]
```

Understanding when and how to use Singleton appropriately is key to writing maintainable Python code.

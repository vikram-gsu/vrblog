---
title: "The Factory Pattern"
date: "2024-10-08"
readTime: "12 min"
excerpt: "Master the Factory pattern to create objects without specifying their exact classes."
---

The Factory pattern provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.

## The Problem

Imagine you're building a document processing system that needs to handle multiple file formats:

```python
# Without Factory - tightly coupled code
def process_document(file_path):
    if file_path.endswith('.pdf'):
        doc = PDFDocument(file_path)
    elif file_path.endswith('.docx'):
        doc = WordDocument(file_path)
    elif file_path.endswith('.txt'):
        doc = TextDocument(file_path)
    # Adding new format requires modifying this function
```

## Simple Factory

```python
class DocumentFactory:
    @staticmethod
    def create_document(file_path: str) -> Document:
        if file_path.endswith('.pdf'):
            return PDFDocument(file_path)
        elif file_path.endswith('.docx'):
            return WordDocument(file_path)
        elif file_path.endswith('.txt'):
            return TextDocument(file_path)
        raise ValueError(f"Unknown document type: {file_path}")
```

## Factory Method Pattern

The more flexible approach using inheritance:

```python
from abc import ABC, abstractmethod

class DocumentCreator(ABC):
    @abstractmethod
    def create_document(self) -> Document:
        pass
    
    def process(self, file_path: str):
        doc = self.create_document()
        doc.load(file_path)
        return doc.extract_text()

class PDFCreator(DocumentCreator):
    def create_document(self) -> Document:
        return PDFDocument()

class WordCreator(DocumentCreator):
    def create_document(self) -> Document:
        return WordDocument()
```

## Abstract Factory

For creating families of related objects:

```python
class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button:
        pass
    
    @abstractmethod
    def create_checkbox(self) -> Checkbox:
        pass

class MaterialUIFactory(UIFactory):
    def create_button(self) -> Button:
        return MaterialButton()
    
    def create_checkbox(self) -> Checkbox:
        return MaterialCheckbox()
```

The Factory pattern keeps your code flexible and open for extension while closed for modification.

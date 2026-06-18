"""Populate the database with demo content.

Idempotent: safe to run multiple times. Creates categories, a couple of demo
users (including an admin) and a set of well-formed Markdown articles, each with
an initial revision so the edit-history feature has data to show.

Usage:
    python manage.py seed
    python manage.py seed --flush   # wipe articles/categories first
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.articles.models import Article, Category, Revision

User = get_user_model()

CATEGORIES = [
    ("Web Development", "Building for the web — markup, styling and frameworks.", "#6366f1"),
    ("Programming Languages", "General-purpose and domain-specific languages.", "#10b981"),
    ("Tools & Infrastructure", "The tooling that powers modern software delivery.", "#f59e0b"),
    ("Databases", "Storing, querying and scaling data.", "#ef4444"),
]

ARTICLES = [
    {
        "title": "HTML",
        "category": "Web Development",
        "summary": "The standard markup language for documents designed to be displayed in a web browser.",
        "content": """# HTML

**HTML** (HyperText Markup Language) is the standard markup language for
documents designed to be displayed in a web browser. It describes the
*structure* of a page using a system of elements and attributes.

## Elements

An HTML document is a tree of **elements**, written with tags:

```html
<article>
  <h1>Hello, world</h1>
  <p>This is a paragraph with a <a href="/wiki/css">link</a>.</p>
</article>
```

## Semantics

Modern HTML emphasizes *semantic* elements such as `<header>`, `<nav>`,
`<main>`, `<article>` and `<footer>`. Semantic markup improves accessibility
and helps search engines understand content.

HTML is almost always used together with [CSS](/wiki/css) for presentation and
[JavaScript](/wiki/javascript) for behavior.
""",
    },
    {
        "title": "CSS",
        "category": "Web Development",
        "summary": "A style sheet language used to describe the presentation of a document written in HTML.",
        "content": """# CSS

**CSS** (Cascading Style Sheets) is a style sheet language used to describe the
presentation of a document written in [HTML](/wiki/html). CSS controls layout,
color, typography and responsiveness.

## The cascade

When multiple rules match an element, the **cascade** decides which wins based
on origin, specificity and order:

```css
.button {
  background: #6366f1;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
```

## Modern layout

Flexbox and Grid replaced float-based hacks for layout, while custom properties
(`--variables`) and media queries make responsive, themeable designs
straightforward.
""",
    },
    {
        "title": "JavaScript",
        "category": "Programming Languages",
        "summary": "A high-level language that, alongside HTML and CSS, is a core technology of the web.",
        "content": """# JavaScript

**JavaScript** is a high-level, dynamically typed language that — alongside
[HTML](/wiki/html) and [CSS](/wiki/css) — is one of the three core technologies
of the World Wide Web.

## Everywhere

Originally built to run in browsers, JavaScript now runs on servers (Node.js),
on the desktop and on embedded devices.

```js
const greet = (name) => `Hello, ${name}!`;
console.log(greet("world"));
```

## Ecosystem

Tools like [Vite](/wiki/vite) and libraries like [React](/wiki/react) define
the modern front-end developer experience. [TypeScript](/wiki/typescript) adds
optional static typing on top of JavaScript.
""",
    },
    {
        "title": "TypeScript",
        "category": "Programming Languages",
        "summary": "A strongly typed programming language that builds on JavaScript.",
        "content": """# TypeScript

**TypeScript** is a strongly typed superset of [JavaScript](/wiki/javascript)
developed by Microsoft. It compiles to plain JavaScript and adds optional static
types, catching whole classes of bugs before code ever runs.

## Why types?

```ts
interface User {
  id: number;
  name: string;
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}
```

Editors use the type information to provide accurate autocompletion, inline
documentation and safe refactoring. TypeScript pairs especially well with
[React](/wiki/react) and [Vite](/wiki/vite).
""",
    },
    {
        "title": "Python",
        "category": "Programming Languages",
        "summary": "A high-level, general-purpose language emphasizing readability.",
        "content": """# Python

**Python** is a high-level, general-purpose programming language emphasizing
code readability with significant indentation.

## Batteries included

Python ships with a large standard library and has a vast ecosystem for web
development, data science, automation and machine learning.

```python
def fibonacci(n: int) -> list[int]:
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result
```

[Django](/wiki/django) is one of the most popular web frameworks written in
Python.
""",
    },
    {
        "title": "Django",
        "category": "Web Development",
        "summary": "A high-level Python web framework that encourages rapid, clean development.",
        "content": """# Django

**Django** is a high-level [Python](/wiki/python) web framework that encourages
rapid development and clean, pragmatic design. It follows the
*batteries-included* philosophy.

## Features

- An object-relational mapper (ORM)
- A powerful automatic admin interface
- Robust security defaults (CSRF, XSS, SQL-injection protection)
- A mature ecosystem, including the **Django REST Framework**

```python
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
```

This very encyclopedia is built with Django and DRF on the backend, backed by
[PostgreSQL](/wiki/postgresql) and [Redis](/wiki/redis).
""",
    },
    {
        "title": "React",
        "category": "Web Development",
        "summary": "A JavaScript library for building user interfaces with components.",
        "content": """# React

**React** is a [JavaScript](/wiki/javascript) library for building user
interfaces from reusable, composable **components**.

## Declarative UI

You describe what the UI should look like for a given state, and React keeps the
DOM in sync:

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

React is typically paired with [TypeScript](/wiki/typescript) for safety and a
build tool like [Vite](/wiki/vite) for a fast developer experience. The frontend
of this site is a React + Vite + TypeScript single-page application.
""",
    },
    {
        "title": "Vite",
        "category": "Tools & Infrastructure",
        "summary": "A fast, modern build tool and development server for the web.",
        "content": """# Vite

**Vite** is a modern front-end build tool that delivers a famously fast
development experience by serving source files over native ES modules during
development and bundling with Rollup for production.

## Why it's fast

- Instant server start (no bundling in dev)
- Lightning-fast Hot Module Replacement (HMR)
- Optimized production builds out of the box

```bash
npm create vite@latest my-app -- --template react-ts
```

Vite is the recommended tooling for [React](/wiki/react) and
[TypeScript](/wiki/typescript) projects.
""",
    },
    {
        "title": "Git",
        "category": "Tools & Infrastructure",
        "summary": "A distributed version control system for tracking changes in source code.",
        "content": """# Git

**Git** is a distributed version control system for tracking changes in source
code during software development. It was created by Linus Torvalds in 2005.

## Core ideas

Git stores history as a series of **commits**, each a snapshot of the project.
Branching and merging are cheap and fast, enabling parallel work.

```bash
git switch -c feature/login
git add .
git commit -m "Add login form"
```

## GitHub

**GitHub** is an online service for hosting Git repositories, adding pull
requests, issues and CI/CD on top of Git.
""",
    },
    {
        "title": "PostgreSQL",
        "category": "Databases",
        "summary": "A powerful, open-source object-relational database system.",
        "content": """# PostgreSQL

**PostgreSQL** (often *Postgres*) is a powerful, open-source object-relational
database system with over 30 years of active development and a strong reputation
for reliability and correctness.

## Highlights

- Full ACID compliance
- Rich data types including JSONB and arrays
- **Full-text search** built in
- Extensions like PostGIS and `pg_trgm`

```sql
SELECT title, ts_rank(search, query) AS rank
FROM articles, to_tsquery('django') query
WHERE search @@ query
ORDER BY rank DESC;
```

This encyclopedia uses PostgreSQL's full-text search to power its search bar.
""",
    },
    {
        "title": "Redis",
        "category": "Databases",
        "summary": "An in-memory data store used as a database, cache and message broker.",
        "content": """# Redis

**Redis** is an open-source, in-memory data structure store used as a database,
cache and message broker. Because it keeps data in memory, reads and writes are
extremely fast.

## Common uses

- **Caching** expensive query results
- Session storage
- Rate limiting
- Real-time leaderboards and counters

This encyclopedia uses Redis to cache aggregate site statistics, keeping the
home page snappy without hammering [PostgreSQL](/wiki/postgresql).
""",
    },
    {
        "title": "REST API",
        "category": "Web Development",
        "summary": "An architectural style for designing networked applications over HTTP.",
        "content": """# REST API

A **REST API** (Representational State Transfer) is an architectural style for
designing networked applications. It uses standard HTTP verbs to operate on
*resources* identified by URLs.

## Verbs and resources

| Method | Purpose            |
|--------|--------------------|
| GET    | Read a resource    |
| POST   | Create a resource  |
| PUT    | Replace a resource |
| PATCH  | Update a resource  |
| DELETE | Remove a resource  |

The backend of this site exposes a REST API built with
[Django](/wiki/django) REST Framework, documented automatically with OpenAPI.
""",
    },
]


class Command(BaseCommand):
    help = "Seed the database with demo categories, users and articles."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing articles and categories before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options) -> None:
        if options["flush"]:
            Revision.objects.all().delete()
            Article.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING("Flushed existing content."))

        admin = self._ensure_user(
            "admin",
            "admin@wikiverse.dev",
            "adminpass123",
            staff=True,
            superuser=True,
            bio="Maintainer of Wikiverse.",
        )
        editor = self._ensure_user(
            "ada",
            "ada@wikiverse.dev",
            "adapass123",
            bio="Writes about programming and the web.",
        )

        categories: dict[str, Category] = {}
        for name, description, color in CATEGORIES:
            cat, _ = Category.objects.get_or_create(
                name=name, defaults={"description": description, "color": color}
            )
            categories[name] = cat
        self.stdout.write(self.style.SUCCESS(f"Categories: {len(categories)}"))

        created = 0
        for i, data in enumerate(ARTICLES):
            author = admin if i % 2 == 0 else editor
            article, made = Article.objects.get_or_create(
                title=data["title"],
                defaults={
                    "summary": data["summary"],
                    "content": data["content"],
                    "category": categories.get(data["category"]),
                    "author": author,
                    "last_editor": author,
                },
            )
            if made:
                Revision.objects.create(
                    article=article,
                    editor=author,
                    title=article.title,
                    summary=article.summary,
                    content=article.content,
                    comment="Created the article",
                )
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Articles created: {created} (total {Article.objects.count()})")
        )
        self.stdout.write(self.style.SUCCESS("Seed complete. Admin login: admin / adminpass123"))

    def _ensure_user(
        self,
        username: str,
        email: str,
        password: str,
        *,
        staff: bool = False,
        superuser: bool = False,
        bio: str = "",
    ) -> User:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": staff,
                "is_superuser": superuser,
                "bio": bio,
            },
        )
        if created:
            user.set_password(password)
            user.save()
        return user

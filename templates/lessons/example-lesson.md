---
title: Verify via side effects, not green checkmarks
type: lesson
tags: [lesson, verification, example]
confidence: high
created: 2026-01-01
updated: 2026-01-01
sources: [session-example]
---

# Lesson: Verify via side effects, not green checkmarks

> **For future Claude:** An example "lesson" page — performance memory distilled from real work. Lessons are the highest-value layer: reusable strategies that make the next task start smarter. Replace this with your own.

## What went wrong
A pipeline showed success (green UI, no errors) while doing nothing useful — a fallback/sample path was serving responses instead of the real integration. Caught only via an independent side effect (an API quota that was never being deducted).

## The lesson
- A green UI is not proof. **Confirm via an independent side effect** — quota/credit deduction, network calls, provider dashboards, logs.
- When a fallback mode exists, toggle it off and test the real path explicitly.

## How to apply
Whenever wiring an external integration, verify the live path independently before calling it done — and state *how* you verified.

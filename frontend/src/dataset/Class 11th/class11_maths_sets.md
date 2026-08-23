# Class 11 Mathematics — Chapter: Sets

**Class:** 11
**Subject:** Mathematics
**NCERT Book:** Ganita Prakash / Mathematics Part-1
**Topic Tag:** sets

---

## What is a Set?

A **set** is a well-defined collection of distinct objects. "Well-defined" means it must be clear whether something belongs to the set or not — no ambiguity.

**Examples of sets:** the set of vowels in English, the set of natural numbers less than 10, the set of all students in Class 11 who play cricket.

**Not a set:** "the collection of intelligent students in a class" — this is not well-defined because "intelligent" is subjective.

### Notation
- Sets are usually denoted by capital letters: A, B, C
- Elements are denoted by lowercase letters: a, b, c
- If `x` is an element of set A: **x ∈ A** (x belongs to A)
- If `x` is not an element of set A: **x ∉ A**

### Representing a Set

**1. Roster/Listing method** — elements listed inside curly brackets:
```
A = {1, 2, 3, 4, 5}
V = {a, e, i, o, u}
```

**2. Set-builder method** — a rule describing the elements:
```
A = {x : x is a natural number and x < 6}
```
Read as "A is the set of all x such that x is a natural number and x is less than 6."

---

## Types of Sets

| Type | Definition | Example |
|---|---|---|
| **Empty Set (∅ or {})** | A set with no elements | {x : x is a day starting with 'Z'} |
| **Finite Set** | Countable number of elements | {1, 2, 3} |
| **Infinite Set** | Uncountable elements | Set of natural numbers N |
| **Singleton Set** | Exactly one element | {5} |
| **Equal Sets** | Same elements (order doesn't matter) | {1,2,3} = {3,1,2} |
| **Subset (A ⊆ B)** | Every element of A is in B | {1,2} ⊆ {1,2,3} |
| **Power Set P(A)** | Set of all subsets of A | If A = {1,2}, P(A) = {∅, {1}, {2}, {1,2}} |
| **Universal Set (U)** | Set containing all objects under consideration | All students in a school |

### Important formula — Power Set size
If a set has `n` elements, its power set has **2ⁿ** elements.

**Example:** A = {1, 2, 3} has 3 elements → P(A) has 2³ = 8 subsets.

---

## Venn Diagrams

Sets are visually represented using **Venn diagrams** — a rectangle represents the universal set U, and circles inside represent individual sets.

```
        Universal Set (U)
   ┌─────────────────────────┐
   │      ┌───────┐          │
   │      │   A   │          │
   │      │  ┌────┼───┐      │
   │      │  │ A∩B│ B │      │
   │      └──┼────┘   │      │
   │         └────────┘      │
   └─────────────────────────┘
```
The overlapping region represents elements common to both A and B (intersection).

---

## Operations on Sets

### 1. Union (A ∪ B)
All elements that are in A, or B, or both.
```
A = {1, 2, 3}, B = {3, 4, 5}
A ∪ B = {1, 2, 3, 4, 5}
```

### 2. Intersection (A ∩ B)
Elements common to both A and B.
```
A ∩ B = {3}
```

### 3. Difference (A − B)
Elements in A but NOT in B.
```
A − B = {1, 2}
B − A = {4, 5}
```

### 4. Complement (A′ or Aᶜ)
Elements in the Universal Set U that are NOT in A.
```
If U = {1,2,3,4,5,6,7,8,9,10} and A = {1,2,3}
A′ = {4,5,6,7,8,9,10}
```

---

## Important Laws (frequently asked in exams)

**Commutative Law**
```
A ∪ B = B ∪ A
A ∩ B = B ∩ A
```

**Associative Law**
```
(A ∪ B) ∪ C = A ∪ (B ∪ C)
(A ∩ B) ∩ C = A ∩ (B ∩ C)
```

**De Morgan's Laws** (very important, frequently tested)
```
(A ∪ B)′ = A′ ∩ B′
(A ∩ B)′ = A′ ∪ B′
```

**Distributive Law**
```
A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)
A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)
```

---

## Formula for Number of Elements (very important for exams)

For two sets:
```
n(A ∪ B) = n(A) + n(B) − n(A ∩ B)
```

For three sets:
```
n(A ∪ B ∪ C) = n(A) + n(B) + n(C) − n(A∩B) − n(B∩C) − n(A∩C) + n(A∩B∩C)
```

---

## Worked Example

**Question:** In a class of 50 students, 30 play cricket, 25 play football, and 10 play both. How many students play neither?

**Solution:**
```
n(Cricket ∪ Football) = n(Cricket) + n(Football) − n(Both)
                       = 30 + 25 − 10
                       = 45

Students playing neither = Total − n(Cricket ∪ Football)
                          = 50 − 45
                          = 5
```

---

## Practice Questions

1. If A = {2, 4, 6, 8} and B = {4, 8, 12, 16}, find A ∪ B and A ∩ B.
2. Write the set {x : x is an integer, −3 ≤ x < 4} in roster form.
3. If n(A) = 20, n(B) = 30, and n(A ∩ B) = 10, find n(A ∪ B).
4. Prove De Morgan's Law (A ∪ B)′ = A′ ∩ B′ using a Venn diagram for any two sets A and B of your choice.
5. In a survey of 100 people, 60 like tea, 50 like coffee, and 20 like both. How many like neither tea nor coffee?

---

## Common Mistakes Students Make
1. Confusing **⊆** (subset) with **∈** (belongs to) — a set can be a subset of another set, but an element belongs to a set, these are different relationships.
2. Forgetting that the empty set **∅** is a subset of every set, including itself.
3. Mixing up **union** (combine everything) with **intersection** (only common elements) — a good memory trick: **U**nion sounds like "**U**nite everything," **∩** looks like a bowl that "catches" only the common part.
4. In the n(A∪B) formula, forgetting to subtract the intersection — this causes double-counting of common elements.

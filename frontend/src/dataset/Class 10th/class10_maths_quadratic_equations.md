# Class 10 Mathematics — Chapter: Quadratic Equations

**Class:** 10
**Subject:** Mathematics
**NCERT Book:** Mathematics / Ganit
**Topic Tag:** quadratic-equations

---

## What is a Quadratic Equation?

A **quadratic equation** is a polynomial equation of degree 2, in the standard form:

```
ax² + bx + c = 0
```
where `a ≠ 0`, and a, b, c are real numbers.

**Examples:**
```
2x² + 5x - 3 = 0    (a=2, b=5, c=-3)
x² - 4 = 0           (a=1, b=0, c=-4)
```

**Not quadratic:** `3x - 5 = 0` (this is linear, degree 1, no x² term)

---

## Methods to Solve Quadratic Equations

### Method 1: Factorization

Split the middle term (bx) into two terms whose product equals `a×c` and whose sum equals `b`.

**Example:** Solve x² + 5x + 6 = 0
```
We need two numbers whose product = 6 and sum = 5
Those numbers are 2 and 3

x² + 2x + 3x + 6 = 0
x(x + 2) + 3(x + 2) = 0
(x + 2)(x + 3) = 0

So x = -2 or x = -3
```

### Method 2: Completing the Square

Rearrange the equation so the left side becomes a perfect square.

**Example:** Solve x² + 6x + 5 = 0
```
x² + 6x = -5
x² + 6x + 9 = -5 + 9    (added 9, which is (6/2)², to complete the square)
(x + 3)² = 4
x + 3 = ±2
x = -1 or x = -5
```

### Method 3: Quadratic Formula (most commonly used, MUST memorize)

For `ax² + bx + c = 0`:

```
        -b ± √(b² - 4ac)
x  =    ─────────────────
              2a
```

**Example:** Solve 2x² - 7x + 3 = 0 (a=2, b=-7, c=3)
```
x = [7 ± √(49 - 24)] / 4
x = [7 ± √25] / 4
x = [7 ± 5] / 4

x = 12/4 = 3   or   x = 2/4 = 0.5
```

---

## The Discriminant (D) — Very Important Concept

```
D = b² - 4ac
```

The discriminant tells us the **nature of the roots** without fully solving the equation:

| Value of D | Nature of Roots |
|---|---|
| D > 0 | Two distinct real roots |
| D = 0 | Two equal real roots (repeated root) |
| D < 0 | No real roots (roots are imaginary) |

**Example:** Check the nature of roots of x² - 4x + 4 = 0
```
D = (-4)² - 4(1)(4) = 16 - 16 = 0
Since D = 0, the equation has two equal real roots.
```

---

## Visualizing Quadratic Equations — The Parabola

A quadratic equation `y = ax² + bx + c` when plotted forms a **parabola**.

```
        y
        │      *
        │    *   *
        │   *     *
        │  *       *
────────┼─*─────────*────── x
        │*           *
        │
```

- If `a > 0`, the parabola opens **upward** (like a U shape).
- If `a < 0`, the parabola opens **downward** (like an inverted U).
- The points where the parabola crosses the x-axis are the **real roots** of the equation.
- If the parabola doesn't touch the x-axis at all, the equation has **no real roots** (D < 0).
- If the parabola just touches the x-axis at one point (vertex on the x-axis), the equation has **equal roots** (D = 0).

---

## Sum and Product of Roots (useful shortcut)

For `ax² + bx + c = 0`, if the roots are α and β:

```
Sum of roots (α + β) = -b/a
Product of roots (α × β) = c/a
```

**Example:** For 2x² - 7x + 3 = 0
```
Sum = -(-7)/2 = 7/2 = 3.5   (matches 3 + 0.5 = 3.5 from earlier example ✓)
Product = 3/2 = 1.5          (matches 3 × 0.5 = 1.5 ✓)
```

---

## Worked Word Problem

**Question:** The product of two consecutive positive integers is 306. Find the integers.

**Solution:**
```
Let the integers be x and (x+1)
x(x+1) = 306
x² + x - 306 = 0

Using the quadratic formula:
x = [-1 ± √(1 + 1224)] / 2
x = [-1 ± √1225] / 2
x = [-1 ± 35] / 2

x = 34/2 = 17   or   x = -36/2 = -18 (rejected, since we need positive integers)

So the integers are 17 and 18.
```

---

## Practice Questions

1. Solve by factorization: x² - 7x + 12 = 0
2. Solve using the quadratic formula: 3x² + 5x - 2 = 0
3. Find the discriminant and nature of roots of 4x² - 4x + 1 = 0
4. Find k such that the equation x² + kx + 9 = 0 has equal roots.
5. A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less for the journey. Find the speed of the train. (Hint: set up a quadratic equation using speed and time.)

---

## Common Mistakes Students Make
1. Forgetting the **±** sign in the quadratic formula, which loses one of the two roots.
2. Sign errors when substituting negative values of b, c into the formula — e.g., if b = -7, then `-b` becomes `+7`, and `-4ac` needs careful sign handling if c is negative.
3. Confusing the **discriminant condition** — students often forget D=0 means equal roots (not "no roots").
4. Not checking whether a word-problem answer makes physical sense (e.g., rejecting negative values for time, speed, or length in real-world problems).

# Chapter 3: Control Flow & Loops in JavaScript

**Language:** JavaScript
**Topic Tag:** flow-of-control
**Level:** Beginner

---

## Why Control Flow Matters

By default, a program runs line by line, top to bottom. Control flow lets your program **make decisions** (if/else) and **repeat actions** (loops) instead of just running once, straight through.

---

## 1. Conditional Statements (if / else if / else)

### Basic Syntax

```javascript
if (condition) {
    // runs if condition is true
} else if (anotherCondition) {
    // runs if the first condition was false, but this one is true
} else {
    // runs if none of the above were true
}
```

### Example

```javascript
let marks = 75;

if (marks >= 90) {
    console.log("Grade: A");
} else if (marks >= 75) {
    console.log("Grade: B");
} else {
    console.log("Grade: C");
}
// Output: Grade: B
```

### Key Points
- Conditions must evaluate to `true` or `false`. In JavaScript, values like `0`, `""` (empty string), `null`, `undefined`, and `NaN` are treated as "falsy" — everything else is "truthy."
- Curly braces `{}` are optional for single-line blocks, but **always use them** to avoid bugs.
- Comparison operators: `===` (strictly equal), `!==` (strictly not equal), `>`, `<`, `>=`, `<=`.

### Common Mistake — `==` vs `===`
```javascript
// RISKY — == does "loose" comparison, allows type conversion
if (marks == "75") {   // true, even though one is a number and one is a string!
    console.log("Grade: B");
}

// CORRECT — === checks both value AND type, no surprises
if (marks === 75) {
    console.log("Grade: B");
}
```
Always prefer `===` over `==` in JavaScript — it avoids confusing bugs caused by automatic type conversion.

---

## 2. The `for` Loop

Use a `for` loop when you know **how many times** you want something to repeat.

### Syntax

```javascript
for (initialization; condition; update) {
    // code to repeat
}
```

### Example

```javascript
for (let i = 1; i <= 5; i++) {
    console.log(i);
}
// Output: 1 2 3 4 5
```

### Breaking It Down
- **Initialization** (`let i = 1`): runs once, at the very start.
- **Condition** (`i <= 5`): checked *before* every loop run.
- **Update** (`i++`): runs *after* every loop body execution.

---

## 3. The `while` Loop

Use a `while` loop when you don't know exactly how many times you'll repeat — just the condition to keep going.

### Syntax

```javascript
while (condition) {
    // code to repeat
}
```

### Example

```javascript
let count = 1;
while (count <= 5) {
    console.log(count);
    count++;
}
// Output: 1 2 3 4 5
```

### Important Warning: Infinite Loops
```javascript
// WRONG — infinite loop, count never changes
let count = 1;
while (count <= 5) {
    console.log(count);
    // forgot count++ here!
}
```
Always make sure something inside the loop moves the condition toward becoming false.

---

## 4. The `do-while` Loop

Runs the body **at least once**, since the condition is checked *after* the first run.

```javascript
let count = 1;
do {
    console.log(count);
    count++;
} while (count <= 5);
```

---

## 5. `break` and `continue`

### `break` — exits the loop immediately

```javascript
for (let i = 1; i <= 10; i++) {
    if (i === 5) {
        break;
    }
    console.log(i);
}
// Output: 1 2 3 4
```

### `continue` — skips just this one iteration

```javascript
for (let i = 1; i <= 5; i++) {
    if (i === 3) {
        continue;
    }
    console.log(i);
}
// Output: 1 2 4 5
```

### Memory Trick
- `break` = "break out of the whole loop, I'm done."
- `continue` = "skip this one round, but keep going."

---

## 6. Nested Loops

```javascript
for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 3; j++) {
        console.log(i + "," + j);
    }
}
// Output:
// 1,1  1,2  1,3
// 2,1  2,2  2,3
// 3,1  3,2  3,3
```

---

## 7. JavaScript vs Python vs C++ — Key Differences

| Concept | Python | C++ | JavaScript |
|---|---|---|---|
| Curly braces | Not used | Required `{ }` | Required `{ }` |
| Semicolons | Not needed | Required | Recommended (optional but risky to skip) |
| Variable declaration | No keyword needed | Must declare type | `let`, `const`, or `var` |
| Equality check | `==` | `==` | `===` (preferred), `==` (risky) |

---

## Common Beginner Mistakes (Summary)

1. **Using `==` instead of `===`** — causes unexpected type-conversion bugs.
2. **Forgetting `let`/`const` when declaring variables** — can accidentally create global variables.
3. **Forgetting to update the loop variable** in a `while` loop — causes infinite loops.
4. **Off-by-one errors** — using `<` instead of `<=` (or vice versa).
5. **Forgetting curly braces** for multi-line if/loop bodies.
6. **Mixing up `break` and `continue`**.

---

## Practice Problem (for the platform's mini-project)

**Build a Simple Calculator using a while loop** (as referenced in the "Smart Calculator" mini-project):

```javascript
let total = 0;
let count = 1;

while (count <= 5) {
    total = total + count;
    console.log("Step " + count + ": Current sum is " + total);
    count++;
}

console.log("Final total: " + total);
```
This mirrors the same "Smart Calculator" logic structure used in the Python and C++ versions of this chapter, reinforcing the same concept across languages.

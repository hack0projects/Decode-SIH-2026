# Chapter 3: Control Flow & Loops in C++

**Language:** C++
**Topic Tag:** flow-of-control
**Level:** Beginner

---

## Why Control Flow Matters

By default, a program runs line by line, top to bottom. Control flow lets your program **make decisions** (if/else) and **repeat actions** (loops) instead of just running once, straight through. This is what makes a program feel "smart" instead of just a list of instructions.

---

## 1. Conditional Statements (if / else if / else)

Conditionals let the program choose which block of code to run based on whether something is true or false.

### Basic Syntax

```cpp
if (condition) {
    // runs if condition is true
} else if (anotherCondition) {
    // runs if the first condition was false, but this one is true
} else {
    // runs if none of the above were true
}
```

### Example

```cpp
int marks = 75;

if (marks >= 90) {
    cout << "Grade: A";
} else if (marks >= 75) {
    cout << "Grade: B";
} else {
    cout << "Grade: C";
}
// Output: Grade: B
```

### Key Points
- Conditions must evaluate to a boolean (`true`/`false`). In C++, any non-zero number is treated as `true`, and `0` is treated as `false`.
- Curly braces `{}` are optional for single-line blocks, but **always use them** — this prevents a very common bug where a second line accidentally falls outside the `if`.
- Comparison operators: `==` (equal to), `!=` (not equal), `>`, `<`, `>=`, `<=`.

### Common Mistake
```cpp
// WRONG — using = instead of == accidentally assigns instead of comparing
if (marks = 90) {   // this ASSIGNS 90 to marks, always true!
    cout << "Grade: A";
}

// CORRECT
if (marks == 90) {
    cout << "Grade: A";
}
```
This is one of the most common beginner bugs in C++ because `=` and `==` look similar but do very different things.

---

## 2. The `for` Loop

Use a `for` loop when you know **how many times** you want something to repeat.

### Syntax

```cpp
for (initialization; condition; update) {
    // code to repeat
}
```

### Example

```cpp
for (int i = 1; i <= 5; i++) {
    cout << i << " ";
}
// Output: 1 2 3 4 5
```

### Breaking It Down
- **Initialization** (`int i = 1`): runs once, at the very start.
- **Condition** (`i <= 5`): checked *before* every loop run. If false, the loop stops.
- **Update** (`i++`): runs *after* every loop body execution.

Think of it like a repeat calculator: start value → check if it should continue → do the work → update the counter → check again.

---

## 3. The `while` Loop

Use a `while` loop when you don't know exactly how many times you'll repeat — you just know the **condition** under which you should keep going.

### Syntax

```cpp
while (condition) {
    // code to repeat
}
```

### Example

```cpp
int count = 1;
while (count <= 5) {
    cout << count << " ";
    count++;
}
// Output: 1 2 3 4 5
```

### Important Warning: Infinite Loops
If you forget to update the variable inside the loop, the condition never becomes false, and the loop runs forever.

```cpp
// WRONG — infinite loop, count never changes
int count = 1;
while (count <= 5) {
    cout << count << " ";
    // forgot count++ here!
}
```
Always double-check that something inside the loop moves you closer to the condition becoming false.

---

## 4. The `do-while` Loop (C++ specific — worth knowing)

Unlike `for` and `while`, a `do-while` loop always runs the body **at least once**, because the condition is checked *after* the first run.

```cpp
int count = 1;
do {
    cout << count << " ";
    count++;
} while (count <= 5);
```

Useful for situations like "ask the user for input, then keep asking until they give a valid answer" — you always need to ask at least once.

---

## 5. `break` and `continue`

These give you extra control inside a loop.

### `break` — exits the loop immediately

```cpp
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break;  // stops the loop completely when i is 5
    }
    cout << i << " ";
}
// Output: 1 2 3 4
```

### `continue` — skips just this one iteration, loop keeps going

```cpp
for (int i = 1; i <= 5; i++) {
    if (i == 3) {
        continue;  // skips printing 3, but loop continues
    }
    cout << i << " ";
}
// Output: 1 2 4 5
```

### Memory Trick
- `break` = "break out of the whole loop, I'm done."
- `continue` = "skip this one round, but keep going."

---

## 6. Nested Loops

A loop inside another loop — useful for grids, tables, patterns.

```cpp
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        cout << i << "," << j << "  ";
    }
    cout << endl;
}
// Output:
// 1,1  1,2  1,3
// 2,1  2,2  2,3
// 3,1  3,2  3,3
```
The inner loop completes **all** of its iterations for every single iteration of the outer loop.

---

## 7. C++ vs Python — Key Differences Worth Knowing

Since some students may be coming from Python:

| Concept | Python | C++ |
|---|---|---|
| Curly braces | Not used, indentation matters | Required `{ }` to define blocks |
| Semicolons | Not needed | Required at end of each statement |
| Variable types | Not declared explicitly | Must declare type (`int`, `float`, etc.) |
| `do-while` loop | Doesn't exist | Exists |
| Equality check | `==` | `==` (same) |

---

## Common Beginner Mistakes (Summary)

1. **Using `=` instead of `==`** in conditions — causes accidental assignment instead of comparison.
2. **Forgetting semicolons** at the end of statements — C++ will throw a compile error.
3. **Forgetting to update the loop variable** in a `while` loop — causes infinite loops.
4. **Off-by-one errors** — using `<` instead of `<=` (or vice versa), causing the loop to run one time too few or too many.
5. **Forgetting curly braces** for multi-line if/loop bodies — leads to only the first line being treated as part of the block.
6. **Mixing up `break` and `continue`** — remember break = stop everything, continue = skip just this once.

---

## Practice Problem (for the platform's mini-project)

**Build a Simple Calculator using a while loop** (as referenced in the "Smart Calculator" mini-project):

```cpp
#include <iostream>
using namespace std;

int main() {
    int total = 0;
    int count = 1;

    while (count <= 5) {
        total = total + count;
        cout << "Step " << count << ": Current sum is " << total << endl;
        count++;
    }

    cout << "Final total: " << total << endl;
    return 0;
}
```
This mirrors the same "Smart Calculator" logic structure used in the Python version of this chapter, so the same concept can be reinforced across languages.

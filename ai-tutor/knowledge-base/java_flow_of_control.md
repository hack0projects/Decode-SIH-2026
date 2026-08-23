# Chapter 3: Control Flow & Loops in Java

**Language:** Java
**Topic Tag:** flow-of-control
**Level:** Beginner

---

## Why Control Flow Matters

By default, a program runs line by line, top to bottom. Control flow lets your program **make decisions** (if/else) and **repeat actions** (loops) instead of just running once, straight through.

---

## 1. Conditional Statements (if / else if / else)

### Basic Syntax

```java
if (condition) {
    // runs if condition is true
} else if (anotherCondition) {
    // runs if the first condition was false, but this one is true
} else {
    // runs if none of the above were true
}
```

### Example

```java
int marks = 75;

if (marks >= 90) {
    System.out.println("Grade: A");
} else if (marks >= 75) {
    System.out.println("Grade: B");
} else {
    System.out.println("Grade: C");
}
// Output: Grade: B
```

### Key Points
- Conditions must evaluate to a `boolean` (`true`/`false`). Unlike C++, Java does **not** treat numbers as true/false — you cannot write `if (marks)`, it must be an actual boolean expression.
- Curly braces `{}` are optional for single-line blocks, but **always use them**.
- Comparison operators: `==` (equal to), `!=` (not equal), `>`, `<`, `>=`, `<=`.

### Common Mistake
```java
// WRONG — using = instead of == accidentally assigns instead of comparing
if (marks = 90) {   // this is actually a COMPILE ERROR in Java (good thing!)
    System.out.println("Grade: A");
}

// CORRECT
if (marks == 90) {
    System.out.println("Grade: A");
}
```
Good news: unlike C++, Java will refuse to compile this particular mistake because `marks = 90` doesn't produce a boolean value — Java catches this bug for you at compile time.

---

## 2. The `for` Loop

### Syntax

```java
for (initialization; condition; update) {
    // code to repeat
}
```

### Example

```java
for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}
// Output: 1 2 3 4 5
```

---

## 3. The `while` Loop

### Syntax

```java
while (condition) {
    // code to repeat
}
```

### Example

```java
int count = 1;
while (count <= 5) {
    System.out.println(count);
    count++;
}
// Output: 1 2 3 4 5
```

### Important Warning: Infinite Loops
```java
// WRONG — infinite loop, count never changes
int count = 1;
while (count <= 5) {
    System.out.println(count);
    // forgot count++ here!
}
```

---

## 4. The `do-while` Loop

Runs the body **at least once**, since the condition is checked *after* the first run.

```java
int count = 1;
do {
    System.out.println(count);
    count++;
} while (count <= 5);
```

---

## 5. `break` and `continue`

### `break` — exits the loop immediately

```java
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break;
    }
    System.out.println(i);
}
// Output: 1 2 3 4
```

### `continue` — skips just this one iteration

```java
for (int i = 1; i <= 5; i++) {
    if (i == 3) {
        continue;
    }
    System.out.println(i);
}
// Output: 1 2 4 5
```

### Memory Trick
- `break` = "break out of the whole loop, I'm done."
- `continue` = "skip this one round, but keep going."

---

## 6. Nested Loops

```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        System.out.print(i + "," + j + "  ");
    }
    System.out.println();
}
// Output:
// 1,1  1,2  1,3
// 2,1  2,2  2,3
// 3,1  3,2  3,3
```

---

## 7. Java vs C++ vs Python — Key Differences

| Concept | Python | C++ | Java |
|---|---|---|---|
| Curly braces | Not used | Required `{ }` | Required `{ }` |
| Semicolons | Not needed | Required | Required |
| Variable types | Not declared explicitly | Must declare type | Must declare type |
| Entry point | Top-level script | `int main()` | `public static void main(String[] args)` |
| `marks = 90` inside `if` | Would work (bug) | Would compile (dangerous bug) | Will NOT compile (safer) |

---

## Common Beginner Mistakes (Summary)

1. **Forgetting semicolons** — Java will throw a compile error.
2. **Forgetting to update the loop variable** in a `while` loop — causes infinite loops.
3. **Off-by-one errors** — using `<` instead of `<=` (or vice versa).
4. **Forgetting curly braces** for multi-line if/loop bodies.
5. **Mixing up `break` and `continue`**.
6. **Forgetting that every Java program needs a class and a `main` method** to run — unlike Python or JavaScript, you can't just write loose statements at the top level of a file.

---

## Practice Problem (for the platform's mini-project)

**Build a Simple Calculator using a while loop** (as referenced in the "Smart Calculator" mini-project):

```java
public class SmartCalculator {
    public static void main(String[] args) {
        int total = 0;
        int count = 1;

        while (count <= 5) {
            total = total + count;
            System.out.println("Step " + count + ": Current sum is " + total);
            count++;
        }

        System.out.println("Final total: " + total);
    }
}
```
This mirrors the same "Smart Calculator" logic structure used in the Python, C++, and JavaScript versions of this chapter, reinforcing the same concept across languages.

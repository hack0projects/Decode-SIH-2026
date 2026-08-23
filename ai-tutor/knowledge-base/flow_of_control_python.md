# Flow of Control in Python — Loops and Conditionals

## Introduction

When a Python program runs, it normally executes statements one after another, from top to bottom. This is called sequential flow. But often, we need our program to make decisions or repeat actions. This is where "flow of control" statements come in — they let us change the normal order in which instructions run.

There are two main types of flow control covered here: conditional statements (which let the program choose between different paths) and loops (which let the program repeat a set of instructions multiple times).

## Conditional Statements

Conditional statements let a program make decisions based on whether something is true or false.

### The if statement

The simplest form checks a condition, and runs a block of code only if that condition is true.

Example:
```
age = 20
if age >= 18:
    print("You are eligible to vote")
```

Here, the condition `age >= 18` is checked. Since 20 is greater than or equal to 18, the message is printed.

### The if-else statement

Sometimes we want to do one thing if a condition is true, and something else if it is false.

Example:
```
age = 15
if age >= 18:
    print("You are eligible to vote")
else:
    print("You are not eligible to vote yet")
```

### The if-elif-else statement

When there are multiple conditions to check, we use elif (short for "else if").

Example:
```
marks = 75
if marks >= 90:
    print("Grade A")
elif marks >= 75:
    print("Grade B")
elif marks >= 60:
    print("Grade C")
else:
    print("Grade D")
```

Python checks each condition in order, and runs the first block whose condition is true. If none match, the else block runs.

## Loops

Loops let us repeat a block of code multiple times, without writing it out again and again.

### The for loop

A for loop is used when we know how many times we want to repeat something, or when we want to go through each item in a sequence (like a list or a range of numbers).

Example:
```
for i in range(5):
    print(i)
```

This prints the numbers 0, 1, 2, 3, 4. The `range(5)` generates numbers from 0 up to (but not including) 5.

A for loop can also go through a list directly:
```
fruits = ["apple", "banana", "mango"]
for fruit in fruits:
    print(fruit)
```

### The while loop

A while loop repeats a block of code as long as a condition remains true. It is used when we don't know in advance exactly how many times we need to repeat something.

Example:
```
count = 0
while count < 5:
    print(count)
    count = count + 1
```

This also prints 0 through 4, but notice that we had to manually increase `count` inside the loop. If we forget to do this, the condition `count < 5` would stay true forever, and the loop would never stop — this is called an infinite loop, and it is one of the most common beginner mistakes.

### The break statement

Sometimes we want to stop a loop early, before it naturally finishes. The break statement immediately exits the loop.

Example:
```
for i in range(10):
    if i == 5:
        break
    print(i)
```

This prints 0, 1, 2, 3, 4, and then stops — as soon as i equals 5, the loop ends immediately, even though range(10) would normally go all the way to 9.

### The continue statement

The continue statement skips the rest of the current loop cycle and moves to the next one, without exiting the loop entirely.

Example:
```
for i in range(5):
    if i == 2:
        continue
    print(i)
```

This prints 0, 1, 3, 4 — the number 2 is skipped, but the loop continues running afterward.

## Common Mistakes Beginners Make

1. **Forgetting the colon (:) at the end of an if, for, or while line.** Python requires this to mark the start of a block of code.
2. **Incorrect indentation.** Python uses indentation (spaces at the start of a line) to know which lines belong inside a loop or conditional block. Mixing tabs and spaces, or inconsistent spacing, causes errors.
3. **Writing an infinite while loop** by forgetting to update the variable being checked in the condition.
4. **Confusing = (assignment) with == (comparison).** Using a single = inside a condition (like `if age = 18:`) is a common error — it should be `if age == 18:`.
5. **Off-by-one errors** — for example, expecting `range(5)` to include the number 5, when it actually stops at 4.

## Summary

Flow of control statements — conditionals (if, elif, else) and loops (for, while, break, continue) — allow a Python program to make decisions and repeat actions, instead of just running in a single straight line from top to bottom. Mastering these is a fundamental step in learning to program, since almost every real program relies on some combination of decision-making and repetition.

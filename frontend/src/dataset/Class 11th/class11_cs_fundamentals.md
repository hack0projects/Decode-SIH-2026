# Class 11 Computer Science — Chapter: Computer Systems & Programming Fundamentals

**Class:** 11
**Subject:** Computer Science
**NCERT Book:** Computer Science
**Topic Tag:** cs-fundamentals
**Note:** This content is DETAILED, not summarized, per curriculum requirements for CS.

---

## 1. Basic Computer Organization

A computer system has three fundamental units that work together:

### Central Processing Unit (CPU)
The "brain" of the computer, consisting of:
- **Arithmetic Logic Unit (ALU):** performs all arithmetic (add, subtract, multiply, divide) and logical operations (comparisons like <, >, =).
- **Control Unit (CU):** directs the operation of the processor — tells other parts of the computer system what to do and when, coordinating the fetch-decode-execute cycle.
- **Memory Unit (registers):** small, extremely fast storage locations inside the CPU used to hold data temporarily during processing.

### Memory Types
- **Primary Memory:**
  - **RAM (Random Access Memory):** volatile (data lost when power is off), used for temporary working storage while programs run.
  - **ROM (Read Only Memory):** non-volatile, stores permanent instructions like the BIOS/firmware needed to start the computer.
- **Secondary Memory:** non-volatile, long-term storage — hard disks, SSDs, pen drives. Slower than RAM but retains data without power.
- **Cache Memory:** very fast, small memory between CPU and RAM, stores frequently accessed data to speed up processing.

### Memory Hierarchy (fastest to slowest, smallest to largest capacity)
```
Registers → Cache → RAM → Secondary Storage (SSD/HDD)
(fastest, smallest)              (slowest, largest)
```

---

## 2. Number Systems (highly examined topic)

Computers internally use the **binary system** (base 2), but humans commonly use decimal, and programmers often use octal and hexadecimal for convenience.

| System | Base | Digits Used |
|---|---|---|
| Binary | 2 | 0, 1 |
| Octal | 8 | 0–7 |
| Decimal | 10 | 0–9 |
| Hexadecimal | 16 | 0–9, A–F |

### Conversion: Decimal to Binary
Divide repeatedly by 2, read remainders bottom to top.

```
Convert 25 to binary:
25 ÷ 2 = 12 remainder 1
12 ÷ 2 = 6  remainder 0
6  ÷ 2 = 3  remainder 0
3  ÷ 2 = 1  remainder 1
1  ÷ 2 = 0  remainder 1

Reading bottom to top: 25 (decimal) = 11001 (binary)
```

### Conversion: Binary to Decimal
Multiply each digit by 2 raised to its position power (from right, starting at 0), sum the results.

```
Convert 1101 to decimal:
1×2³ + 1×2² + 0×2¹ + 1×2⁰
= 8 + 4 + 0 + 1
= 13
```

### Conversion: Decimal to Hexadecimal
Divide repeatedly by 16, using letters A–F for remainders 10–15.

```
Convert 254 to hex:
254 ÷ 16 = 15 remainder 14 (E)
15  ÷ 16 = 0  remainder 15 (F)

Reading bottom to top: 254 (decimal) = FE (hex)
```

---

## 3. Boolean Algebra and Logic Gates

Boolean algebra deals with binary variables (True/False, 1/0) and logical operations.

### Basic Logic Gates

| Gate | Symbol | Rule | Truth Table |
|---|---|---|---|
| AND | A·B | Output is 1 only if both inputs are 1 | 0·0=0, 0·1=0, 1·0=0, 1·1=1 |
| OR | A+B | Output is 1 if at least one input is 1 | 0+0=0, 0+1=1, 1+0=1, 1+1=1 |
| NOT | A' | Inverts the input | 0'=1, 1'=0 |

### Important Boolean Laws
```
Idempotent Law:     A + A = A,     A · A = A
Complement Law:     A + A' = 1,    A · A' = 0
De Morgan's Law:    (A+B)' = A'·B',    (A·B)' = A'+B'
```

---

## 4. Introduction to Python (Programming Basics)

Python is a high-level, interpreted, general-purpose programming language used widely for its readability.

### Basic Syntax
```python
print("Hello, World!")

# Variables in Python are dynamically typed — no need to declare type
age = 15
name = "Aarav"
height = 5.6
is_student = True
```

### Data Types
```python
int      → whole numbers (e.g., 10, -5)
float    → decimal numbers (e.g., 3.14)
str      → text (e.g., "hello")
bool     → True or False
list     → ordered, changeable collection [1, 2, 3]
tuple    → ordered, unchangeable collection (1, 2, 3)
dict     → key-value pairs {"name": "Aarav", "age": 15}
```

### Operators
```python
Arithmetic: +  -  *  /  //  %  **
Comparison: ==  !=  >  <  >=  <=
Logical:    and  or  not
```

**Important — integer division vs float division:**
```python
print(7 / 2)   # Output: 3.5 (float division)
print(7 // 2)  # Output: 3   (floor/integer division)
print(7 % 2)   # Output: 1   (modulus — the remainder)
```

### Input/Output
```python
name = input("Enter your name: ")  # input() always returns a string
age = int(input("Enter your age: "))  # must convert explicitly for numbers
print("Hello,", name, "you are", age, "years old")
```

---

## 5. Flowcharts and Algorithms

An **algorithm** is a step-by-step procedure to solve a problem. A **flowchart** is its visual representation.

### Common Flowchart Symbols
```
Oval        → Start/End
Rectangle   → Process/Action
Diamond     → Decision (Yes/No)
Parallelogram → Input/Output
Arrow       → Flow direction
```

### Example Algorithm — Check if a number is even or odd
```
Step 1: Start
Step 2: Input a number N
Step 3: If N % 2 == 0, print "Even"
Step 4: Else, print "Odd"
Step 5: End
```

---

## Practice Questions

1. Convert the decimal number 100 to binary and hexadecimal.
2. Draw the truth table for (A AND B) OR (NOT C).
3. What is the difference between RAM and ROM? Give two points each.
4. Write a Python program to input two numbers and print their sum, difference, and product.
5. Draw a flowchart to find the largest of three numbers.

---

## Common Mistakes Students Make
1. Confusing `/` (float division) with `//` (integer division) in Python — a very common exam and coding error.
2. Sign errors in binary-to-decimal conversion — forgetting the positional value starts at 2⁰, not 2¹.
3. Mixing up AND gate logic (needs BOTH true) with OR gate logic (needs AT LEAST ONE true).
4. Forgetting that `input()` in Python always returns a string, even if the user types a number — must explicitly convert using `int()` or `float()`.

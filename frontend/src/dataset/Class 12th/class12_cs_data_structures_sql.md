# Class 12 Computer Science — Chapter: Data Structures & Database Management (SQL)

**Class:** 12
**Subject:** Computer Science
**NCERT Book:** Computer Science
**Topic Tag:** cs-data-structures-sql
**Note:** This content is DETAILED, not summarized, per curriculum requirements for CS.

---

## Part A: Data Structures — Stack and Queue

### What is a Data Structure?
A data structure is a way of organizing and storing data so it can be accessed and modified efficiently. Class 12 focuses heavily on two linear data structures: **Stack** and **Queue**, both often implemented using Python **lists**.

---

## 1. Stack

A stack works on the principle of **LIFO — Last In, First Out**. Think of a stack of plates: the last plate placed on top is the first one removed.

### Key Operations
- **Push** — add an element to the top of the stack
- **Pop** — remove the top element from the stack
- **Peek/Top** — view the top element without removing it
- **isEmpty** — check if the stack has no elements

### Stack Implementation Using Python List
```python
stack = []

# Push operation
stack.append(10)
stack.append(20)
stack.append(30)
print(stack)  # [10, 20, 30]

# Pop operation
top_element = stack.pop()
print(top_element)  # 30 (removed from the top)
print(stack)         # [10, 20]

# Peek operation
print(stack[-1])  # 20 (view top without removing)

# isEmpty check
print(len(stack) == 0)  # False
```

### Real-World Applications of Stack
- Undo/Redo functionality in text editors
- Browser back button history
- Function call management (call stack) in programming languages
- Checking balanced parentheses in an expression

### Worked Example — Checking Balanced Parentheses
```python
def is_balanced(expression):
    stack = []
    for char in expression:
        if char == '(':
            stack.append(char)
        elif char == ')':
            if len(stack) == 0:
                return False
            stack.pop()
    return len(stack) == 0

print(is_balanced("(a+b)*(c-d)"))  # True
print(is_balanced("(a+b*(c-d)"))   # False (unmatched)
```

---

## 2. Queue

A queue works on the principle of **FIFO — First In, First Out**. Think of a queue at a ticket counter: the first person in line is served first.

### Key Operations
- **Enqueue** — add an element to the rear (end) of the queue
- **Dequeue** — remove an element from the front of the queue
- **isEmpty** — check if the queue has no elements

### Queue Implementation Using Python List
```python
queue = []

# Enqueue operation
queue.append(10)
queue.append(20)
queue.append(30)
print(queue)  # [10, 20, 30]

# Dequeue operation
front_element = queue.pop(0)  # removes from the FRONT (index 0)
print(front_element)  # 10
print(queue)           # [20, 30]
```

**Important distinction from Stack:** In a stack, `pop()` removes from the end. In a queue, dequeue must remove from index 0 (the front) — this is the single most common source of confusion between the two structures for students.

### Real-World Applications of Queue
- Print job scheduling (first document sent prints first)
- CPU task scheduling
- Handling requests in a web server (first request received, first served)

---

## Part B: Database Management with SQL

### What is a Database?
A **database** is an organized collection of related data. **DBMS (Database Management System)** is software used to create, manage, and query databases. MySQL is the DBMS commonly taught in the NCERT curriculum.

### Basic Terminology
| Term | Meaning |
|---|---|
| Table/Relation | A collection of related data organized in rows and columns |
| Row/Tuple | A single record in a table |
| Column/Attribute | A field describing a property of the data (e.g., Name, Age) |
| Primary Key | A column (or set of columns) that uniquely identifies each row |
| Foreign Key | A column that references the Primary Key of another table, creating a relationship |

---

## SQL Commands (Structured Query Language)

### Data Definition Language (DDL) — defines structure

**CREATE TABLE**
```sql
CREATE TABLE Student (
    RollNo INT PRIMARY KEY,
    Name VARCHAR(50),
    Age INT,
    Marks DECIMAL(5,2)
);
```

**ALTER TABLE** — modify existing table structure
```sql
ALTER TABLE Student ADD Email VARCHAR(100);
```

**DROP TABLE** — delete an entire table
```sql
DROP TABLE Student;
```

### Data Manipulation Language (DML) — manipulates data

**INSERT** — add new records
```sql
INSERT INTO Student (RollNo, Name, Age, Marks)
VALUES (1, 'Aarav', 15, 88.5);
```

**UPDATE** — modify existing records
```sql
UPDATE Student
SET Marks = 92.0
WHERE RollNo = 1;
```

**DELETE** — remove records
```sql
DELETE FROM Student
WHERE RollNo = 1;
```

### SELECT — retrieving data (most important, heavily tested)

**Basic SELECT**
```sql
SELECT * FROM Student;              -- all columns, all rows
SELECT Name, Marks FROM Student;    -- specific columns
```

**WHERE clause — filtering rows**
```sql
SELECT * FROM Student WHERE Age > 15;
SELECT * FROM Student WHERE Marks >= 90 AND Age < 16;
```

**ORDER BY — sorting results**
```sql
SELECT * FROM Student ORDER BY Marks DESC;  -- highest marks first
SELECT * FROM Student ORDER BY Name ASC;    -- alphabetical
```

**GROUP BY and Aggregate Functions**
```sql
SELECT COUNT(*) FROM Student;               -- total number of students
SELECT AVG(Marks) FROM Student;             -- average marks
SELECT MAX(Marks), MIN(Marks) FROM Student; -- highest and lowest marks

SELECT Age, COUNT(*) FROM Student GROUP BY Age;
-- groups students by age and counts how many students are in each age group
```

**DISTINCT — removing duplicates**
```sql
SELECT DISTINCT Age FROM Student;  -- lists each unique age only once
```

---

## Worked Example — Combining Concepts

**Question:** Given a `Student` table, write a query to find the names of students who scored more than 85 marks, sorted by marks in descending order.

**Solution:**
```sql
SELECT Name, Marks FROM Student
WHERE Marks > 85
ORDER BY Marks DESC;
```

---

## Practice Questions

1. Write Python code to implement a stack that stores at most 5 elements, and prints "Stack Overflow" if a push is attempted beyond that.
2. Trace the output of a queue after these operations: enqueue(5), enqueue(10), dequeue(), enqueue(15), dequeue().
3. Write an SQL query to create a table `Employee` with columns EmpID (primary key), Name, Salary, and Department.
4. Write an SQL query to find the average salary of employees in the "Sales" department.
5. What is the key difference between DELETE and DROP in SQL?

---

## Common Mistakes Students Make
1. Using `.pop()` (removes from end) instead of `.pop(0)` (removes from front) when implementing a queue — this silently turns a queue into a stack-like behavior, a very common bug.
2. Forgetting the `WHERE` clause in `UPDATE` or `DELETE` statements — this affects ALL rows in the table, not just the intended one, which can be catastrophic on real data.
3. Confusing `DELETE` (removes rows, keeps table structure, can be filtered with WHERE) with `DROP` (removes the entire table structure permanently).
4. Forgetting that SQL string values need single quotes (`'Aarav'`), while numeric values don't.

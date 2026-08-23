# Class 12 Mathematics — Chapter: Matrices

**Class:** 12
**Subject:** Mathematics
**NCERT Book:** Mathematics Part-1
**Topic Tag:** matrices

---

## What is a Matrix?

A **matrix** is a rectangular arrangement of numbers, symbols, or expressions, arranged in rows and columns.

```
      Column1 Column2 Column3
Row1 [  2      3       5   ]
Row2 [  1      0       4   ]
```

This is a matrix of **order 2×3** (read "2 by 3") — meaning 2 rows and 3 columns.

### Notation
A matrix is generally denoted by a capital letter:
```
A = [aᵢⱼ]  where i = row number, j = column number
```

---

## Order of a Matrix

If a matrix has `m` rows and `n` columns, its order is **m × n**.

**Total elements in a matrix = m × n**

```
Example: A 3×2 matrix has 3 rows, 2 columns, and 3×2 = 6 elements total.
```

---

## Types of Matrices

| Type | Definition | Example |
|---|---|---|
| **Row Matrix** | Only 1 row | [1 2 3] |
| **Column Matrix** | Only 1 column | [1; 2; 3] |
| **Square Matrix** | Rows = Columns | 3×3, 2×2 |
| **Zero/Null Matrix** | All elements are 0 | [0 0; 0 0] |
| **Diagonal Matrix** | Square matrix, non-diagonal elements = 0 | [5 0; 0 3] |
| **Scalar Matrix** | Diagonal matrix with all diagonal elements equal | [4 0; 0 4] |
| **Identity Matrix (I)** | Diagonal matrix with all diagonal elements = 1 | [1 0; 0 1] |
| **Symmetric Matrix** | A = A' (transpose equals itself) | [1 2; 2 3] |

---

## Matrix Operations

### 1. Addition/Subtraction
Only possible when both matrices have the **same order**. Add/subtract corresponding elements.

```
A = [1 2]     B = [3 1]
    [3 4]         [2 0]

A + B = [1+3  2+1] = [4 3]
        [3+2  4+0]   [5 4]
```

### 2. Scalar Multiplication
Multiply every element by the scalar (number).

```
3 × [1 2] = [3 6]
    [3 4]   [9 12]
```

### 3. Matrix Multiplication
**Important rule:** Multiplication A×B is only possible when the number of **columns in A equals the number of rows in B**.

If A is m×n and B is n×p, then A×B is a matrix of order **m×p**.

```
A = [1 2]    B = [5 6]
    [3 4]        [7 8]

A × B = [(1×5+2×7)  (1×6+2×8)]   =  [19  22]
        [(3×5+4×7)  (3×6+4×8)]      [43  50]
```

**Key point:** Matrix multiplication is **NOT commutative** — generally A×B ≠ B×A.

---

## Transpose of a Matrix

The transpose of matrix A (written A' or Aᵀ) is obtained by **interchanging rows and columns**.

```
A = [1 2 3]        A' = [1 4]
    [4 5 6]             [2 5]
                         [3 6]
```

### Properties of Transpose
```
(A')' = A
(A + B)' = A' + B'
(kA)' = kA'
(AB)' = B'A'
```

---

## Symmetric and Skew-Symmetric Matrices

- **Symmetric Matrix:** A = A'
- **Skew-Symmetric Matrix:** A' = −A (all diagonal elements must be 0)

**Important theorem:** Every square matrix can be expressed as the sum of a symmetric and a skew-symmetric matrix:
```
A = ½(A + A') + ½(A − A')
    [symmetric]   [skew-symmetric]
```

---

## Worked Example

**Question:** If A = [1 2; 3 4] and B = [2 0; 1 3], find AB and BA. Verify AB ≠ BA.

**Solution:**
```
AB = [1×2+2×1  1×0+2×3] = [4  6]
     [3×2+4×1  3×0+4×3]   [10 12]

BA = [2×1+0×3  2×2+0×4] = [2  4]
     [1×1+3×3  1×2+3×4]   [10 14]
```
Since AB ≠ BA, matrix multiplication is confirmed to not be commutative here.

---

## Practice Questions

1. If A = [2 −1; 3 4] and B = [1 2; 0 5], find A + B and A − B.
2. Find the transpose of A = [1 2 3; 4 5 6].
3. If A is a 2×3 matrix and B is a 3×4 matrix, what is the order of AB? Can BA be computed?
4. Express A = [3 5; 1 −1] as the sum of a symmetric and a skew-symmetric matrix.
5. Find x and y if [x+y  2; 5  x−y] = [7  2; 5  1].

---

## Common Mistakes Students Make
1. Trying to multiply matrices without checking if the **columns of the first = rows of the second** — this is the most common exam mistake.
2. Assuming matrix multiplication is commutative like normal number multiplication (AB ≠ BA in general).
3. Forgetting that only matrices of the **same order** can be added or subtracted.
4. Sign errors when finding the skew-symmetric part (½(A − A')) — students forget the negative sign application.

# Chapter 3: Structure of a Web Page — Tags, Attributes & Basic Styling

**Language:** HTML/CSS
**Topic Tag:** web-structure
**Level:** Beginner

---

## Why This Chapter Is Different

Unlike Python, C++, or Java, HTML is not a programming language with loops and conditions — it's a **markup language**. It describes the *structure* of a web page (what's a heading, what's a paragraph, what's a button), while CSS describes *how it looks* (colors, spacing, fonts). Think of HTML as the skeleton of a page, and CSS as the skin and clothes.

---

## 1. Basic HTML Document Structure

Every HTML page follows the same skeleton:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
```

### Breaking It Down
- `<!DOCTYPE html>` — tells the browser "this is a modern HTML5 page."
- `<html>...</html>` — wraps the entire page content.
- `<head>...</head>` — contains information *about* the page (title, styles, links) — nothing here is directly visible on the page itself.
- `<body>...</body>` — contains everything that's actually visible: text, images, buttons, etc.

---

## 2. Tags — The Building Blocks

A **tag** defines a piece of content. Most tags come in pairs: an opening tag and a closing tag.

```html
<h1>This is a heading</h1>
<p>This is a paragraph.</p>
```

- `<h1>` to `<h6>` — headings, `<h1>` being the largest/most important, `<h6>` the smallest.
- `<p>` — paragraph of text.
- `<a href="...">link text</a>` — a clickable link.
- `<img src="..." alt="...">` — displays an image. Notice this tag has **no closing tag** — it's "self-closing."
- `<button>Click Me</button>` — a clickable button.
- `<div>...</div>` — a generic container, used to group content together.

### Common Mistake
```html
<!-- WRONG — forgetting to close a tag -->
<p>This is a paragraph
<p>This is another paragraph</p>

<!-- CORRECT — every opening tag needs a matching closing tag -->
<p>This is a paragraph</p>
<p>This is another paragraph</p>
```
Unclosed tags can cause the browser to render the page incorrectly, with content nesting in unexpected ways.

---

## 3. Attributes — Extra Information on a Tag

An **attribute** adds extra detail to a tag. It goes inside the opening tag, as a `name="value"` pair.

```html
<a href="https://example.com" target="_blank">Visit Site</a>
<img src="photo.jpg" alt="A description of the photo" width="300">
```

- `href` — tells a link *where* to go.
- `src` — tells an image *where* to load from.
- `alt` — describes the image for screen readers (important for accessibility!).
- `id` and `class` — used to identify or group elements, especially useful when applying CSS styles.

### Key Points
- Attribute values almost always go inside quotes: `"..."`.
- A tag can have multiple attributes: `<img src="cat.jpg" alt="A cat" width="200" height="150">`.

---

## 4. Introduction to CSS — Styling the Page

CSS (Cascading Style Sheets) controls how HTML elements look — color, size, spacing, layout.

### Three Ways to Add CSS

**1. Inline (on a single tag) — least recommended, but simplest to understand first:**
```html
<p style="color: blue; font-size: 20px;">This text is blue and large.</p>
```

**2. Internal (inside the `<head>`):**
```html
<head>
    <style>
        p {
            color: blue;
            font-size: 20px;
        }
    </style>
</head>
```

**3. External (in a separate `.css` file, linked to the HTML) — best practice for real projects:**
```html
<head>
    <link rel="stylesheet" href="styles.css">
</head>
```
```css
/* styles.css */
p {
    color: blue;
    font-size: 20px;
}
```

### CSS Syntax Structure
```css
selector {
    property: value;
}
```
- **Selector**: which element(s) to style (e.g., `p`, `.classname`, `#idname`).
- **Property**: what aspect to change (`color`, `font-size`, `margin`, `background-color`).
- **Value**: what to set it to.

---

## 5. Selecting Elements — Tag, Class, and ID Selectors

```css
/* Tag selector — styles ALL <p> tags on the page */
p {
    color: black;
}

/* Class selector — styles any element with class="highlight" */
.highlight {
    background-color: yellow;
}

/* ID selector — styles the ONE element with id="main-title" */
#main-title {
    font-size: 32px;
}
```
```html
<p class="highlight">This paragraph is highlighted.</p>
<h1 id="main-title">The Main Title</h1>
```

### Memory Trick
- **Tag selector** = "style every element of this type."
- **Class selector** (`.`) = "style this reusable group" — a class can be used on many elements.
- **ID selector** (`#`) = "style this one specific element" — an ID should only be used once per page.

---

## 6. The Box Model — How Spacing Works

Every HTML element is treated as a rectangular box, made up of four layers:

```
┌─────────────────────────────┐
│           margin             │  ← space OUTSIDE the border
│  ┌─────────────────────┐    │
│  │        border         │   │  ← the visible edge
│  │  ┌─────────────────┐  │   │
│  │  │     padding      │  │   │  ← space INSIDE the border
│  │  │  ┌───────────┐   │  │   │
│  │  │  │  content  │   │  │   │  ← the actual text/image
│  │  │  └───────────┘   │  │   │
│  │  └─────────────────┘  │   │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

```css
div {
    padding: 10px;   /* space between content and border */
    border: 2px solid black;
    margin: 20px;     /* space outside the border, pushing other elements away */
}
```

---

## 7. Common Beginner Mistakes (Summary)

1. **Forgetting to close tags** — leads to broken/misrendered layouts.
2. **Forgetting quotes around attribute values** — `<img src=photo.jpg>` can cause issues; always use `src="photo.jpg"`.
3. **Confusing class (`.`) and ID (`#`) selectors in CSS** — remember: class for groups, ID for one unique element.
4. **Forgetting the semicolon `;` at the end of a CSS property** — breaks the next property in that same rule.
5. **Mixing up margin and padding** — margin pushes things away from *outside* the border, padding pushes content away from *inside* the border.
6. **Missing `alt` attribute on images** — important not just for good practice, but for accessibility (screen readers depend on it).

---

## Practice Problem (for the platform's mini-project)

**Build a Simple Personal Profile Card** (as referenced in the "Student Portfolio Website" mini-project):

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Profile</title>
    <style>
        .profile-card {
            border: 2px solid #333;
            padding: 20px;
            width: 250px;
            text-align: center;
        }
        .profile-card h2 {
            color: darkblue;
        }
        .profile-card p {
            color: gray;
        }
    </style>
</head>
<body>
    <div class="profile-card">
        <h2>Aarav Sharma</h2>
        <p>Class 8 Student | Learning Python & Web Basics</p>
    </div>
</body>
</html>
```
This mirrors the "build something visible" project style used in the Python and C++ chapters, adapted for how HTML/CSS actually works — structure first, then style.

# CodeSeekho AI — Backend API Documentation
**Backend by:** Kritika (Member 4)
**Base URL (local testing):** `http://localhost:3000`

---

## 1. `/run-code` — Student ka code run karwana

**Method:** `POST`
**URL:** `/run-code`

### Request Body (jo bhejna hai):
```json
{
  "code": "print('Hello World')",
  "language": "python3",
  "studentName": "Kritika"
}
```

**Supported languages (JDoodle names use karo):**
| Chahiye | `language` value |
|---|---|
| Python | `python3` |
| JavaScript | `nodejs` |
| C++ | `cpp17` |
| Java | `java` |

### Response (jo wapas milega):
```json
{
  "output": "Hello World",
  "success": true,
  "hasError": false
}
```

- `output` — code ka actual result / error message (dono isi field mein aate hain)
- `success` — backend ne request process kar li (true/false)
- `hasError` — `true` agar output mein koi error/traceback mila (frontend isse decide kar sakta hai AI hint dikhana hai ya nahi)

### Kya save hota hai:
Har request `attempts` table (Supabase) mein automatically save ho jaati hai — student ka naam, code, language, success/fail.

---

## 2. `/ask-tutor` — AI se hint/explanation lena

**Method:** `POST`
**URL:** `/ask-tutor`

### Request Body:
```json
{
  "question": "print function kya karta hai?",
  "studentName": "Kritika"
}
```

### Response:
```json
{
  "answer": "AI ka jawab yahan aayega",
  "success": true
}
```

**Status:** Krishna (Member 1) ke real Dify AI se connected hai — live answers aate hain.

---

## 3. `/translate` — Regional language translation

**Method:** `POST`
**URL:** `/translate`

### Request Body:
```json
{
  "text": "Hello, how are you?",
  "targetLanguage": "Hindi",
  "studentName": "Kritika"
}
```

### Response:
```json
{
  "translatedText": "translated text yahan aayega",
  "success": true
}
```

**Status:** ⚠️ Abhi placeholder hai (fake response) — Anshita (Member 2) ka real Bhashini API connect hone ke baad yeh live ho jayega. Format wahi rahega, bas response real ho jayega.

---

## 4. `/test-db` — Database connection check (debugging ke liye)

**Method:** `GET`
**URL:** `/test-db`

Frontend ko iski zaroorat nahi, sirf backend testing ke liye hai.

---

## Notes for Frontend Integration

- Sabhi POST routes ko **JSON body** ke saath call karna hai, header mein `Content-Type: application/json` set karna
- Agar koi route fail ho, response mein `"success": false` aur `"error"` field milega
- Local testing ke liye `http://localhost:3000` use karo abhi; jab backend deploy hoga (Render/Railway), URL update kar diya jayega

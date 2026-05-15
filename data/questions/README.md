# data/questions/

Drop your scraped ACT question files here. The app loads every `.json` file in this folder automatically at startup.

---

## Expected format

Each file must be either:

**A) A JSON array** (this is what `act_scraper.py` produces):
```json
[
  {
    "source": "preparing_for_act_2024_2025",
    "section": "ENGLISH",
    "number": 1,
    "stem": "Full question text here",
    "choices": {
      "A": "First choice",
      "B": "Second choice",
      "C": "Third choice",
      "D": "Fourth choice"
    },
    "correct_answer": "B",
    "explanation": "Optional explanation shown after answering.",
    "passage_ref": null
  }
]
```

**B) An object with a `questions` array**:
```json
{
  "questions": [ ... same structure as above ... ]
}
```

---

## Field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `source` | string | yes | Name of the source PDF or dataset |
| `section` | string | yes | `ENGLISH`, `MATHEMATICS`, `READING`, or `SCIENCE` |
| `number` | number | yes | Question number within the section |
| `stem` | string | yes | The full question text |
| `choices` | object | yes | Keys are letters (`A`/`B`/`C`/`D` or `F`/`G`/`H`/`J`), values are answer text |
| `correct_answer` | string or null | yes | The correct letter. Questions with `null` are skipped. |
| `explanation` | string | no | Shown to the user after they answer |
| `passage_ref` | string or null | no | e.g. `"Passage I"` — informational only |

---

## Naming

Files are loaded in alphabetical order. Prefix with `_` to skip a file (e.g. `_old_test.json`).

Suggested naming:
```
act_questions.json           ← your main scraper output
preparing_for_act_2024.json  ← one file per source test
practice_test_2.json
```

---

## After dropping files in

Restart the dev server (`npm run dev`) and the app will pick them up automatically.
The question counts per section appear in the section tabs.

---

## Sample file

`sample_questions.json` contains 6 example questions (one per section + a few extras).
You can delete it once you have your real data.

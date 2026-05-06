# Tasawuf Battle Loop — System Design Blueprint

## 1) Core Identity

**Genre:** Decision-based spiritual roguelike (turn-based loop).  
**Bukan quiz:** pemain tidak menjawab teori, tapi membaca keadaan batin lalu memilih **aksi/ability** paling tepat.

Tone:
- Mystical
- Calm
- Introspective
- RPG-like
- Slightly abstract but playable

---

## 2) Primary Loop (Single Resource Model)

### Resource
- **Tasawuf Level**: `0..100`
- Start: `50`

### Win/Lose
- **WIN (Ma'rifat achieved):** `Tasawuf Level >= 100`
- **LOSE (Return to nafs state):** `Tasawuf Level <= 0`

### Turn Structure
1. **Narrative Event Trigger**
   - Sistem generate 1 situasi hidup/batin (1–3 kalimat).
   - Event tidak memuat jawaban eksplisit.
2. **Skill Choice System**
   - Tampilkan 4 skill acak dari pool.
   - Tepat 1 skill adalah “truly effective match”.
   - 3 skill lain bersifat misleading tapi tetap plausible.
3. **Resolution**
   - Pilihan tepat: `+20 Tasawuf Level`
   - Pilihan kurang tepat: `-10 Tasawuf Level`
4. **Loop Continues**
   - Generate event baru.
   - Randomize 4 skill baru.

---

## 3) Event Design Grammar

Setiap event memiliki struktur berikut:

1. **Context Trigger** (apa yang terjadi)  
2. **Inner Tension** (tarik-menarik batin yang muncul)  
3. **Hidden Direction** (jenis respon paling tepat, tanpa mengatakannya terang-terangan)

Contoh style:
> Setelah dipuji panjang lebar, dadamu terasa ringan tapi juga haus validasi berikutnya. Di satu sisi ingin bersyukur, di sisi lain kamu mulai meremehkan orang lain diam-diam.

Tag event (untuk mapping skill):
- `ANGER`
- `PRIDE_SUBTLE`
- `DOUBT`
- `LAZINESS`
- `SHOW_OFF`
- `DESIRE`
- `ENVY`
- `GRIEF`
- `RITUAL_DRYNESS`
- `SOCIAL_PRESSURE`
- `SELF_BLAME`
- `DISTRACTION`

---

## 4) Skill Pool Architecture (RPG Ability Flavor)

> Skill ditulis seperti ability, bukan jawaban teori.

### Core Skill Pool (12)

1. **Aqua Wudhu Flow** — reset reactivity, grounding body-mind
2. **Nafs Suppression Protocol** — tahan impuls sesaat
3. **Ego Disintegration Field** — larutkan kebutuhan merasa lebih tinggi
4. **Truth Awakening Pulse** — aktifkan kejernihan niat
5. **Sabr Fortress Stance** — stabilisasi saat tertekan
6. **Ikhlas Veil Sever** — potong motif pamer tersembunyi
7. **Shukr Resonance Wave** — transmute nikmat jadi syukur sadar
8. **Tawakkal Anchor** — lepaskan kontrol berlebih pada hasil
9. **Muhasabah Mirror Scan** — audit diri tanpa drama
10. **Dzikir Echo Spiral** — tenangkan noise pikiran berulang
11. **Rahmah Outflow Burst** — ubah defensif jadi welas asih
12. **Niyyah Recalibration Matrix** — set ulang orientasi tindakan

### Balance Rules
- Setiap skill memiliki **dominant counter-tag** (1 utama) + **secondary utility** (1 ringan).
- Misleading skills harus punya overlap tema agar terlihat masuk akal.
- Jangan menampilkan 4 skill yang semuanya cocok sempurna atau semuanya jelas salah.

---

## 5) Correct Skill Mapping Logic

### Mapping Table (contoh inti)
- `PRIDE_SUBTLE` -> **Ego Disintegration Field**
- `SHOW_OFF` -> **Ikhlas Veil Sever**
- `ANGER` -> **Sabr Fortress Stance** atau **Dzikir Echo Spiral** (pilih 1 sebagai hard-counter per event)
- `DOUBT` -> **Truth Awakening Pulse**
- `DESIRE` -> **Nafs Suppression Protocol**
- `ENVY` -> **Shukr Resonance Wave**
- `GRIEF` -> **Tawakkal Anchor** atau **Rahmah Outflow Burst** (event-specific)
- `RITUAL_DRYNESS` -> **Niyyah Recalibration Matrix**
- `SELF_BLAME` -> **Muhasabah Mirror Scan**
- `DISTRACTION` -> **Dzikir Echo Spiral**

### Deterministic Generation Rule
Untuk setiap event:
- pilih `correctSkill` berdasarkan primary tag,
- pilih 3 `decoySkills` dari:
  - secondary tag family,
  - emotional-neighbor tag,
  - one wildcard spiritual-sounding skill.

Dengan ini, pilihan tetap terasa “abu-abu manusiawi”, tapi sistem tetap punya evaluasi tegas.

---

## 6) Difficulty Scaling (Roguelike Progression)

### Tiering by Turn Index
- **Tier 1 (Turn 1–5):** tag tunggal, konflik jelas
- **Tier 2 (Turn 6–10):** tag campuran (mis. `PRIDE_SUBTLE + SHOW_OFF`)
- **Tier 3 (Turn 11–15):** noisy events (emosi berlapis + social pressure)
- **Tier 4 (Turn 16+):** paradox events (aksi baik dengan motif keliru)

### Scaling Dimensions
1. **Narrative Ambiguity** naik
2. **Decoy Quality** naik (lebih plausible)
3. **Skill Similarity** naik
4. **Punishment Streak** opsional:
   - salah 2x beruntun -> event berikutnya lebih “blur”
   - benar 3x beruntun -> berikan “Clarity Hint” singkat

---

## 7) Boss Variant System

Setiap 5 turn, bisa muncul **Inner Boss Event** (tanpa HP tradisional).

### Boss 1: The Perfumed Ego
- Tema: amal diboncengi kebutuhan dipuji.
- Durasi: 3 turn phase.
- Win Boss Rule: benar minimal 2/3 pilihan.
- Reward: +15 bonus Tasawuf Level.

### Boss 2: The Whispering Doubt
- Tema: keraguan spiritual yang terlihat rasional.
- Gimmick: 2 skill decoy sangat mirip fungsi.

### Boss 3: The Golden Distraction
- Tema: sibuk kebaikan teknis, hilang kehadiran hati.
- Gimmick: semua opsi terdengar “baik”, tapi hanya 1 tepat konteks.

Boss gagal tidak langsung game over, tetapi memberi penalti tambahan `-10` sekali.

---

## 8) Data Schema (Implementation-Friendly)

```ts
interface EventCard {
  id: string;
  tier: 1 | 2 | 3 | 4;
  tags: string[];           // primary tag di index 0
  text: string;             // 1-3 kalimat
  correctSkillId: string;
}

interface Skill {
  id: string;
  name: string;
  counterTags: string[];    // urutan prioritas
  description: string;
  rarity: "common" | "rare";
}

interface GameState {
  turn: number;
  tasawufLevel: number;     // 0..100
  streakCorrect: number;
  streakWrong: number;
  history: { eventId: string; chosenSkillId: string; correct: boolean }[];
}
```

Resolution:

```ts
if (chosenSkillId === event.correctSkillId) {
  tasawufLevel += 20;
  streakCorrect += 1;
  streakWrong = 0;
} else {
  tasawufLevel -= 10;
  streakWrong += 1;
  streakCorrect = 0;
}

tasawufLevel = Math.max(0, Math.min(100, tasawufLevel));
```

---

## 9) Content Pipeline for 100+ Events

Target minimal:
- 12 tag x 10 event per tag = **120 events**.

Template produksi cepat:
1. Tulis 10 real-life triggers per tag.
2. Tambah 2 kalimat inner tension.
3. Set `primaryTag`.
4. Tentukan `correctSkillId` dari mapping.
5. Generate 3 decoy by rule.
6. QA pass: pastikan event tidak menyebut jawaban.

Quality checklist:
- [ ] 1–3 kalimat
- [ ] natural & manusiawi
- [ ] tidak menggurui
- [ ] bukan pertanyaan ujian
- [ ] exactly 1 effective skill

---

## 10) UX Notes (Web Turn-Based)

Per turn UI:
- Panel kiri: narrative event
- Panel kanan: 4 skill cards (ability art + one-line flavor)
- Footer: Tasawuf meter + turn counter + state label

Feedback copy:
- Correct: “Hatimu menemukan arah yang tepat.”
- Wrong: “Langkahmu baik, namun belum menyentuh akar.”

Gunakan feedback yang lembut; hindari nuansa menghukum keras.

---

## 11) Example Turn

**Event:**
“Kamu membantu seseorang, lalu diam-diam terus mengecek apakah orang lain memperhatikan. Saat tak ada yang memuji, semangatmu turun.”

**4 Skill Options:**
1. Ikhlas Veil Sever ✅ (correct)
2. Rahmah Outflow Burst
3. Sabr Fortress Stance
4. Tawakkal Anchor

**Result:**
- pilih #1 -> `+20`
- lainnya -> `-10`

---

## 12) Future Expansion

- Relic system: “Tasbih of Stillness” (sekali batal penalti)
- Branching path: khalwat / khidmah / ilmu
- Meta unlock skill cosmetics
- Daily seed challenge untuk replayability

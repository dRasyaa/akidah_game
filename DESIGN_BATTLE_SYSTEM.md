# Tasawuf RPG Battle System - Game Design Blueprint

## 1) Core Loop

1. **Pre-Battle Narrative Event**: pemain menerima konteks jiwa musuh (konflik batin, ujian, trigger).
2. **Intent Phase**: pemain memilih 1 skill utama + 1 niat (modifier kecil).
3. **Action Phase**: skill dieksekusi ke atribut `Ego`, `Nafs`, `Calm`.
4. **Enemy Reaction Phase**: enemy AI memperbarui state jiwa dan memilih aksi phase.
5. **Resolution Phase**: cek combo chain, phase shift, dan win condition transformasi.

Win condition utama: bukan HP nol, tapi **Stabilized Soul** (`Ego <= 20`, `Nafs <= 20`, `Calm >= 80`) selama 2 turn berturut-turut.

---

## 2) Attribute Model

Skala atribut: `0 - 100`

- **Ego**: dorongan merasa diri pusat.
- **Nafs**: impuls keinginan reaktif.
- **Calm**: kejernihan dan stabilitas batin.

Derived metrics:

- `Turmoil = (Ego + Nafs) - Calm`
- `Harmony = Calm - abs(Ego - Nafs)/2`

Interpretasi:

- `Turmoil` tinggi => musuh agresif dan sulit diprediksi.
- `Harmony` tinggi => mudah masuk fase Balance/Calm Awakening.

---

## 3) Enemy Phase State Machine

### Phase Definitions

1. **Ego Surge**
   - Trigger: `Ego >= 70` dan `Ego > Nafs`
   - Efek: skill musuh lebih menyasar merendahkan Calm pemain.

2. **Nafs Dominance**
   - Trigger: `Nafs >= 70` dan `Nafs >= Ego`
   - Efek: multi-hit impulsif, chance debuff fokus pemain.

3. **Calm Awakening**
   - Trigger: `Calm >= 65` dan `Ego <= 45` dan `Nafs <= 45`
   - Efek: musuh dapat self-purify, membuka peluang convert state.

4. **Balance**
   - Trigger: selisih antar atribut kecil (`max-min <= 20`)
   - Efek: musuh adaptif, tidak terlalu ekstrem.

---

## 4) Enemy AI Rules (Auto-Reactive)

Setiap akhir turn, lakukan update natural:

```text
if Nafs > 60: Ego += 8
if Ego > 60: Calm -= 10
if Calm > 60:
  Ego -= 7
  Nafs -= 7

Clamp all values to [0, 100]
```

Tambahkan dinamika agar "hidup":

- Noise ringan per turn: `rand(-2..+2)` pada 1 atribut acak.
- Memory 3 turn terakhir pemain:
  - Jika pemain spam skill penekan Ego, musuh beradaptasi (resist EgoDown +20% 2 turn).
  - Jika pemain variasi antar stage, musuh kehilangan adaptasi (resist reset).

---

## 5) Player Skill Framework (per Stage)

## Syariat (Basic Ritual Actions)

1. **Ablution Guard**
   - Ego -8, Nafs -6, Calm +10
   - Cost rendah, fondasi combo pembuka.

2. **Takbir Resonance**
   - Ego -10, Calm +6
   - Bonus +20% efek jika dipakai setelah Ablution Guard.

3. **Sujud Anchor**
   - Nafs -12, Calm +8
   - Jika enemy di Nafs Dominance: tambahan Nafs -6.

## Tarekat (Self-Discipline Combat)

1. **Nafs Bind Sigil**
   - Nafs -16, Ego -4
   - Menaikkan resist pemain terhadap debuff impuls.

2. **Istiqamah Pulse**
   - Calm +14
   - Stack buff "Steadfast" (max 3), tiap stack +5% keberhasilan combo.

3. **Mujahadah Strike**
   - Ego -12, Nafs -10, Calm -2
   - High impact, tapi ada tradeoff fokus.

## Hakikat (Insight & Inner Truth)

1. **Veil Rend**
   - Menurunkan atribut tertinggi musuh -18.
   - Jika Turmoil > 40, turunkan tambahan -6.

2. **Mirror of Reality**
   - Menyamakan Ego dan Nafs ke nilai rata-rata (pembalikan ekstrem).
   - Calm +8.

3. **Truth Awakening**
   - Calm +18, Ego -8
   - Jika musuh di Ego Surge, langsung paksa ke Balance (1 turn).

## Ma'rifat (Unity State)

1. **Presence Merge**
   - Konversi 20% total (Ego+Nafs) menjadi Calm.

2. **Ego Collapse**
   - Ego -22
   - Jika Calm >= 70, tambahan Nafs -10.

3. **Unity Horizon**
   - Finisher transformasi.
   - Syarat: combo chain >= 4 dan Harmony musuh >= 40.
   - Efek: set state ke Calm Awakening + lock 1 turn.

---

## 6) Combo System Logic

Gunakan tag pada skill:

- `Purify` (Syariat)
- `Discipline` (Tarekat)
- `Insight` (Hakikat)
- `Unity` (Ma'rifat)

Rule chain:

- Combo aktif jika 2-5 turn berurutan mengikuti urutan naik stage (boleh skip 1 stage sekali).
- Multiplier efek debuff enemy:
  - Chain 2: +10%
  - Chain 3: +20%
  - Chain 4: +35%
  - Chain 5: +50% + trigger “Soul Breakthrough”

Special chain examples:

1. **Ritual to Discipline**: Ablution Guard -> Nafs Bind Sigil
   - Bonus: Nafs tambahan -8.

2. **Discipline to Insight**: Istiqamah Pulse -> Veil Rend
   - Bonus: hilangkan adaptasi resist enemy.

3. **Full Path Chain**: Syariat -> Tarekat -> Hakikat -> Ma'rifat
   - Bonus: satu kali ignore phase immunity.

---

## 7) Boss Fight Design (per Stage)

## Stage 1 Boss - "The Loud Self" (Syariat)
- Start: Ego 75, Nafs 55, Calm 25 (Ego Surge)
- Fokus pemain: belajar stabilisasi dasar.
- Gimmick: setiap 3 turn, boss cast "Self-Justification" (Ego +12).

## Stage 2 Boss - "The Burning Desire" (Tarekat)
- Start: Ego 48, Nafs 82, Calm 20 (Nafs Dominance)
- Gimmick: nafs burst multi-action saat Nafs > 75.
- Counter ideal: Nafs Bind Sigil + Istiqamah Pulse loop.

## Stage 3 Boss - "The Veiled Mind" (Hakikat)
- Start: Ego 62, Nafs 62, Calm 38 (Balance tidak stabil)
- Gimmick: swap Ego<->Nafs acak; ilusi mengubah prioritas target skill.
- Counter ideal: Mirror of Reality + Truth Awakening.

## Stage 4 Boss - "The Final Separation" (Ma'rifat)
- Start: Ego 68, Nafs 68, Calm 68 (Transcendent Balance)
- Gimmick: phase cycling tiap turn; kebal 1 tipe chain berulang.
- Win: aktifkan Unity Horizon setelah Full Path Chain.

---

## 8) Narrative Event Before Battle (Templates)

Gunakan format 3 beat cepat (10-20 detik):

1. **Trigger**: "Ia dihina di depan banyak orang."  
2. **Inner Voice**: "Aku harus membuktikan diriku lebih tinggi."  
3. **Distortion Reveal**: Ego naik, Calm retak.

Template lain:

- Godaan kesenangan instan -> Nafs spike.
- Kehilangan makna -> Calm drop.
- Momen hening dzikir -> Calm rise pembuka fase Balance.

---

## 9) Progression Design

- Syariat: unlock 3 skill dasar + 1 slot niat.
- Tarekat: unlock discipline buff, combo tutorial, adaptasi enemy dikenalkan.
- Hakikat: unlock skill manipulasi state (redistribute, force phase).
- Ma'rifat: unlock finisher transformasi + win condition advanced.

Meta growth:

- **Soul Lens Tree**: upgrade efek calm conversion, resist ego backlash, chain retention.
- **Encounter Mutation**: enemy archetype sama tapi pattern fase berbeda tiap run.

---

## 10) Implementation Notes (Web Turn System)

Data schema minimum:

```json
{
  "enemy": {"ego": 70, "nafs": 50, "calm": 30, "phase": "EGO_SURGE"},
  "player": {"stage": "TAREKAT", "combo": 2, "buffs": ["STEADFAST_1"]},
  "battle": {"turn": 5, "history": ["ABLU_GUARD", "NAFS_BIND"]}
}
```

Tick order:
1) Player action  
2) Immediate skill effects  
3) Combo resolution  
4) Enemy AI natural rules  
5) Enemy action  
6) Phase recalculation  
7) Win/Lose/Transform check


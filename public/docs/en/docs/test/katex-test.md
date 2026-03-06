# 🧪 KaTeX Full Feature Test

> Used to verify that KaTeX correctly loads all extensions (mhchem / physics / mathtools, etc.)

---

## ✅ Inline Formulas

Einstein's mass-energy equation:
$E = mc^2$

Euler's formula:
$e^{i\pi} + 1 = 0$

Fraction test:
$\frac{a+b}{c+d}$

Root test:
$\sqrt{2},\ \sqrt[n]{x}$

---

## ✅ Block Formulas

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

---

## ✅ Matrices (mathtools)

### Basic Matrix

$$
\begin{matrix}
1 & 2 \\
3 & 4
\end{matrix}
$$

### Parentheses Matrix

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

### Bracket Matrix

$$
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

### Determinant

$$
\begin{vmatrix}
a & b \\
c & d
\end{vmatrix}
$$

---

## ✅ Alignment Environment (ams)

$$
\begin{aligned}
a^2 + b^2 &= c^2 \\
e^{i\theta} &= \cos\theta + i\sin\theta
\end{aligned}
$$

---

## ✅ Piecewise Function

$$
f(x) =
\begin{cases}
x^2 & x \ge 0 \\
-x & x < 0
\end{cases}
$$

---

## ✅ Chemical Formulas (mhchem)

Water:

$$
\ce{H2O}
$$

Combustion reaction:

$$
\ce{CH4 + 2O2 -> CO2 + 2H2O}
$$

Reversible reaction:

$$
\ce{A <=> B}
$$

Ions:

$$
\ce{Na+ + Cl- -> NaCl}
$$

---

## ✅ Physics Macro Test

Derivative:

$$
\dv{y}{x}
$$

Partial derivative:

$$
\pdv{f}{x}
$$

Second derivative:

$$
\dv[2]{y}{x}
$$

Absolute value:

$$
\abs{x}
$$

Norm:

$$
\norm{\vec{v}}
$$

Expectation value:

$$
\expval{A}
$$

Auto-scaling parentheses:

$$
\qty(\frac{a}{b})
$$

---

## ✅ mathtools Extensions

Multi-line alignment:

$$
\begin{aligned}
\max_x \quad & x^2 + 2x \\
\text{s.t.}\quad & x \ge 0
\end{aligned}
$$

With label:

$$
\underbrace{a+b+\cdots+z}_{26}
$$

---

## ✅ Common Mathematical Symbols

Greek letters:

$$
\alpha,\ \beta,\ \gamma,\ \Gamma,\ \Delta,\ \Omega
$$

Relation symbols:

$$
\le,\ \ge,\ \neq,\ \approx,\ \equiv
$$

Set symbols:

$$
\in,\ \notin,\ \subset,\ \supset,\ \cup,\ \cap
$$

Arrows:

$$
\rightarrow,\ \Rightarrow,\ \leftrightarrow,\ \mapsto
$$

---

## 🚨 Extreme Stress Test (Very Important)

> If this section renders correctly, it means KaTeX is basically fully functional

$$
\pdv{ }{t}\qty(
\int_{V} \rho(\vb{r},t)\, dV
) =
- \oint_{S} \rho \vb{v} \cdot d\vb{S}
$$

$$
\ce{^{235}_{92}U + ^1_0n -> ^{236}_{92}U -> ^{141}_{56}Ba + ^{92}_{36}Kr + 3^1_0n}
$$

$$
\begin{aligned}
\mathcal{L} &= \frac{1}{2} m \dot{x}^2 - V(x) \\
\hat{H}\psi &= i\hbar \pdv{\psi}{t}
\end{aligned}
$$

---

## ✅ Rendering Checklist

- [ ] Inline formulas work correctly
- [ ] Block formulas are centered
- [ ] Matrix alignment is correct
- [ ] mhchem works correctly
- [ ] Physics macros work correctly
- [ ] Alignment environment works correctly
- [ ] No overflow on mobile
- [ ] Visible in dark mode

---

# 🎉 If All Pass

👉 Your KaTeX configuration is already **complete**